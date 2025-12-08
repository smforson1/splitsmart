const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/expenses - Create expense with splits
router.post('/', async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const {
      group_id,
      description,
      amount,
      category = 'other',
      date,
      paid_by_member_id,
      split_type,
      split_data,
      receipt_image_url
    } = req.body;

    // Validation
    if (!group_id || !description || !amount || !date || !paid_by_member_id || !split_type || !split_data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    await client.query('BEGIN');

    // Create expense
    const expenseResult = await client.query(
      `INSERT INTO expenses (group_id, description, amount, category, date, paid_by_member_id, receipt_image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [group_id, description, amount, category, date, paid_by_member_id, receipt_image_url || null]
    );

    const expense = expenseResult.rows[0];

    // Calculate splits
    let splits = [];
    
    if (split_type === 'equal') {
      // Equal split among specified members
      const memberIds = split_data;
      const splitAmount = (parseFloat(amount) / memberIds.length).toFixed(2);
      
      for (const memberId of memberIds) {
        splits.push({
          expense_id: expense.id,
          member_id: memberId,
          amount_owed: splitAmount
        });
      }
    } else if (split_type === 'custom') {
      // Custom split amounts
      const totalSplit = split_data.reduce((sum, s) => sum + parseFloat(s.amount), 0);
      
      if (Math.abs(totalSplit - parseFloat(amount)) > 0.01) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Split amounts must equal total amount' });
      }
      
      splits = split_data.map(s => ({
        expense_id: expense.id,
        member_id: s.member_id,
        amount_owed: s.amount
      }));
    }

    // Insert splits
    for (const split of splits) {
      await client.query(
        'INSERT INTO expense_splits (expense_id, member_id, amount_owed) VALUES ($1, $2, $3)',
        [split.expense_id, split.member_id, split.amount_owed]
      );
    }

    await client.query('COMMIT');

    // Fetch complete expense with splits
    const completeExpense = await db.query(
      `SELECT e.*, 
              json_agg(json_build_object('id', es.id, 'member_id', es.member_id, 'amount_owed', es.amount_owed, 'member_name', m.name)) as splits
       FROM expenses e
       LEFT JOIN expense_splits es ON e.id = es.expense_id
       LEFT JOIN members m ON es.member_id = m.id
       WHERE e.id = $1
       GROUP BY e.id`,
      [expense.id]
    );

    res.status(201).json(completeExpense.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  } finally {
    client.release();
  }
});

// GET /api/expenses - Get expenses with filters
router.get('/', async (req, res) => {
  try {
    const { groupId, category, startDate, endDate } = req.query;

    if (!groupId) {
      return res.status(400).json({ error: 'groupId is required' });
    }

    let query = `
      SELECT e.*,
             json_build_object('id', pm.id, 'name', pm.name) as paid_by,
             json_agg(json_build_object('id', es.id, 'member_id', es.member_id, 'member_name', m.name, 'amount_owed', es.amount_owed)) as splits
      FROM expenses e
      LEFT JOIN members pm ON e.paid_by_member_id = pm.id
      LEFT JOIN expense_splits es ON e.id = es.expense_id
      LEFT JOIN members m ON es.member_id = m.id
      WHERE e.group_id = $1
    `;

    const params = [groupId];
    let paramCount = 1;

    if (category) {
      paramCount++;
      query += ` AND e.category = $${paramCount}`;
      params.push(category);
    }

    if (startDate) {
      paramCount++;
      query += ` AND e.date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND e.date <= $${paramCount}`;
      params.push(endDate);
    }

    query += ' GROUP BY e.id, pm.id ORDER BY e.date DESC, e.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// GET /api/expenses/:id - Get single expense details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT e.*,
              json_build_object('id', pm.id, 'name', pm.name) as paid_by,
              json_agg(json_build_object('id', es.id, 'member_id', es.member_id, 'member_name', m.name, 'amount_owed', es.amount_owed)) as splits
       FROM expenses e
       LEFT JOIN members pm ON e.paid_by_member_id = pm.id
       LEFT JOIN expense_splits es ON e.id = es.expense_id
       LEFT JOIN members m ON es.member_id = m.id
       WHERE e.id = $1
       GROUP BY e.id, pm.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// PUT /api/expenses/:id - Update expense
router.put('/:id', async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const { id } = req.params;
    const {
      description,
      amount,
      category,
      date,
      paid_by_member_id,
      split_type,
      split_data
    } = req.body;

    await client.query('BEGIN');

    // Update expense
    const expenseResult = await client.query(
      `UPDATE expenses 
       SET description = $1, amount = $2, category = $3, date = $4, paid_by_member_id = $5, updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [description, amount, category, date, paid_by_member_id, id]
    );

    if (expenseResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Delete old splits
    await client.query('DELETE FROM expense_splits WHERE expense_id = $1', [id]);

    // Calculate new splits
    let splits = [];
    
    if (split_type === 'equal') {
      const memberIds = split_data;
      const splitAmount = (parseFloat(amount) / memberIds.length).toFixed(2);
      
      for (const memberId of memberIds) {
        splits.push({ member_id: memberId, amount_owed: splitAmount });
      }
    } else if (split_type === 'custom') {
      splits = split_data;
    }

    // Insert new splits
    for (const split of splits) {
      await client.query(
        'INSERT INTO expense_splits (expense_id, member_id, amount_owed) VALUES ($1, $2, $3)',
        [id, split.member_id, split.amount_owed]
      );
    }

    await client.query('COMMIT');

    // Fetch updated expense
    const result = await db.query(
      `SELECT e.*,
              json_agg(json_build_object('id', es.id, 'member_id', es.member_id, 'amount_owed', es.amount_owed)) as splits
       FROM expenses e
       LEFT JOIN expense_splits es ON e.id = es.expense_id
       WHERE e.id = $1
       GROUP BY e.id`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  } finally {
    client.release();
  }
});

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM expenses WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
