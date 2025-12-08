const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/groups/:groupId/members - Add member to group
router.post('/:groupId/members', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Member name is required' });
    }

    // Check if group exists
    const groupCheck = await db.query(
      'SELECT id FROM groups WHERE id = $1',
      [groupId]
    );

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const result = await db.query(
      'INSERT INTO members (group_id, name) VALUES ($1, $2) RETURNING *',
      [groupId, name.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// DELETE /api/members/:id - Remove member from group
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM members WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

module.exports = router;
