const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// POST /api/settlements - Record a settlement/payment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      group_id,
      from_member_id,
      to_member_id,
      amount,
      date,
      notes
    } = req.body;

    // Validation
    if (!group_id || !from_member_id || !to_member_id || !amount || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    if (from_member_id === to_member_id) {
      return res.status(400).json({ error: 'Cannot settle with yourself' });
    }

    const result = await db.query(
      `INSERT INTO settlements (group_id, from_member_id, to_member_id, amount, date, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [group_id, from_member_id, to_member_id, amount, date, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating settlement:', error);
    res.status(500).json({ error: 'Failed to create settlement' });
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
