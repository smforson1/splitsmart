const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/groups - Create new group
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const result = await db.query(
      'INSERT INTO groups (name) VALUES ($1) RETURNING *',
      [name.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// GET /api/groups - Get all groups with member count
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        g.id, 
        g.name, 
        g.created_at,
        g.updated_at,
        COUNT(m.id)::int as member_count
      FROM groups g
      LEFT JOIN members m ON g.id = m.group_id
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// GET /api/groups/:id - Get group details with members
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get group details
    const groupResult = await db.query(
      'SELECT * FROM groups WHERE id = $1',
      [id]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get members
    const membersResult = await db.query(
      'SELECT * FROM members WHERE group_id = $1 ORDER BY created_at ASC',
      [id]
    );

    const group = groupResult.rows[0];
    group.members = membersResult.rows;

    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// PUT /api/groups/:id - Update group name
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const result = await db.query(
      'UPDATE groups SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [name.trim(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// POST /api/groups/:id/members - Add member to group
router.post('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Member name is required' });
    }

    // Check if group exists
    const groupCheck = await db.query(
      'SELECT id FROM groups WHERE id = $1',
      [id]
    );

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const result = await db.query(
      'INSERT INTO members (group_id, name) VALUES ($1, $2) RETURNING *',
      [id, name.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// DELETE /api/groups/:id - Delete group (cascade)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM groups WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

module.exports = router;
