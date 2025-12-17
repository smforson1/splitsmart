const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const logActivity = require('../utils/activityLogger');


// POST /api/settlements - Record a settlement/payment
router.post('/', authenticateToken, async (req, res) => {
  console.log('🔄 Settlement POST request received');
  console.log('Request body:', req.body);
  console.log('User from auth:', req.user?.id);
  
  try {
    const {
      group_id,
      from_member_id,
      to_member_id,
      amount,
      date,
      notes
    } = req.body;

    console.log('Extracted data:', { group_id, from_member_id, to_member_id, amount, date, notes });

    // Validation
    if (!group_id || !from_member_id || !to_member_id || !amount || !date) {
      console.log('❌ Missing required fields validation failed');
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { group_id, from_member_id, to_member_id, amount, date }
      });
    }

    if (amount <= 0) {
      console.log('❌ Amount validation failed:', amount);
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    if (from_member_id === to_member_id) {
      console.log('❌ Same member validation failed');
      return res.status(400).json({ error: 'Cannot settle with yourself' });
    }

    console.log('✅ All validations passed, inserting into database...');
    
    const result = await db.query(
      `INSERT INTO settlements (group_id, from_member_id, to_member_id, amount, date, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
      [group_id, from_member_id, to_member_id, amount, date, notes || null]
    );

    console.log('✅ Settlement inserted successfully:', result.rows[0]);

    const settlement = result.rows[0];

    // Notify the recipient if they are a registered user
    try {
      // Find the user_id associated with to_member_id
      const memberCheck = await db.query('SELECT user_id FROM members WHERE id = $1', [to_member_id]);
      if (memberCheck.rows.length > 0 && memberCheck.rows[0].user_id) {
        const recipientUserId = memberCheck.rows[0].user_id;

        await db.query(
          `INSERT INTO notifications (user_id, type, payload) 
           VALUES ($1, 'settlement_request', $2)`,
          [recipientUserId, JSON.stringify({
            settlementId: settlement.id,
            amount: amount,
            groupId: group_id,
            fromMemberId: from_member_id
          })]
        );
      }
    } catch (err) {
      console.warn('Failed to notify settlement recipient:', err.message);
    }

    res.status(201).json(settlement);
  } catch (error) {
    console.error('❌ Error creating settlement:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to create settlement',
      details: error.message,
      code: error.code
    });
  }
});

// PUT /api/settlements/:id/confirm - Confirm receipt of payment
router.put('/:id/confirm', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify that the settlement exists and the current user is the 'to_member' (payee)
    // We need to join with members table to check user_id
    const check = await db.query(`
      SELECT s.* 
      FROM settlements s
      JOIN members m ON s.to_member_id = m.id
      WHERE s.id = $1 AND m.user_id = $2
    `, [id, userId]);

    if (check.rows.length === 0) {
      return res.status(403).json({ error: 'Settlement not found or you are not authorized to confirm it' });
    }

    const result = await db.query(
      `UPDATE settlements SET status = 'confirmed' WHERE id = $1 RETURNING *`,
      [id]
    );

    // Optional: Notify the payer that it was confirmed
    const settlement = result.rows[0];
    try {
      const payerCheck = await db.query('SELECT user_id FROM members WHERE id = $1', [settlement.from_member_id]);
      if (payerCheck.rows.length > 0 && payerCheck.rows[0].user_id) {
        await db.query(
          `INSERT INTO notifications (user_id, type, payload) 
           VALUES ($1, 'settlement_confirmed', $2)`,
          [payerCheck.rows[0].user_id, JSON.stringify({
            settlementId: settlement.id,
            amount: settlement.amount
          })]
        );
      }
    } catch (err) {
      console.warn('Failed to notify payer:', err.message);
    }

    // Log activity (optional - don't fail if activities table doesn't exist)
    try {
      await logActivity({
        groupId: result.rows[0].group_id,
        actorId: result.rows[0].to_member_id, // The person who confirmed (received)
        actionType: 'SETTLEMENT_CONFIRMED',
        entityType: 'settlement',
        entityId: id,
        payload: { amount: result.rows[0].amount }
      });
    } catch (activityError) {
      console.warn('Failed to log activity:', activityError.message);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error confirming settlement:', error);
    res.status(500).json({ error: 'Failed to confirm settlement' });
  }
});

// GET /api/settlements - Get settlements for a group
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.query;

    if (!groupId) {
      return res.status(400).json({ error: 'groupId is required' });
    }

    const result = await db.query(
      `SELECT s.*,
              json_build_object('id', fm.id, 'name', fm.name) as from_member,
              json_build_object('id', tm.id, 'name', tm.name) as to_member
       FROM settlements s
       LEFT JOIN members fm ON s.from_member_id = fm.id
       LEFT JOIN members tm ON s.to_member_id = tm.id
       WHERE s.group_id = $1
       ORDER BY s.date DESC, s.created_at DESC`,
      [groupId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching settlements:', error);
    res.status(500).json({ error: 'Failed to fetch settlements' });
  }
});

module.exports = router;
