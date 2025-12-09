const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Get activity feed for a group
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { groupId } = req.query;
        if (!groupId) {
            return res.status(400).json({ error: 'GroupId is required' });
        }

        // Verify membership
        const membership = await db.query(
            'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
            [groupId, req.user.id]
        );

        if (membership.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized for this group' });
        }

        const activities = await db.query(`
      SELECT 
        a.*,
        m.name as actor_name
      FROM activities a
      LEFT JOIN members m ON a.actor_id = m.id
      WHERE a.group_id = $1
      ORDER BY a.created_at DESC
      LIMIT 50
    `, [groupId]);

        res.json(activities.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

module.exports = router;
