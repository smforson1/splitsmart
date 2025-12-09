const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// POST /api/groups - Create new group
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, currency_code = 'USD' } = req.body;
    const userId = req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const result = await db.query(
      'INSERT INTO groups (name, created_by_user_id, currency_code) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), userId, currency_code]
    );

    const groupId = result.rows[0].id;

    // Add creator as admin member
    await db.query(
      'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)',
      [groupId, userId, 'admin']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// GET /api/groups - Get all groups for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(`
      SELECT 
        g.id, 
        g.name, 
        g.created_at,
        g.updated_at,
        COUNT(DISTINCT m.id)::int as member_count,
        gm.role
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN members m ON g.id = m.group_id
      WHERE gm.user_id = $1
      GROUP BY g.id, gm.role
      ORDER BY g.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// GET /api/groups/:id - Get group details with members
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user has access to this group
    const accessCheck = await db.query(
      'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this group' });
    }

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
    group.userRole = accessCheck.rows[0].role;

    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// PUT /api/groups/:id - Update group name
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Group name is required' });
    }

    // Check if user is admin
    const accessCheck = await db.query(
      'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (accessCheck.rows.length === 0 || accessCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update group details' });
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
router.post('/:id/members', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Member name is required' });
    }

    // Check if user has access to this group
    const accessCheck = await db.query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this group' });
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
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is admin
    const accessCheck = await db.query(
      'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (accessCheck.rows.length === 0 || accessCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete groups' });
    }

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
