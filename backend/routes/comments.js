const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/expenses/:expenseId/comments
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { expenseId } = req.params;
        const userId = req.user.id;

        // 1. Verify user has access to the expense's group
        // We join expenses -> groups -> group_members
        const accessCheck = await db.query(`
            SELECT e.id 
            FROM expenses e
            JOIN group_members gm ON e.group_id = gm.group_id
            WHERE e.id = $1 AND gm.user_id = $2
        `, [expenseId, userId]);

        if (accessCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied or expense not found' });
        }

        // 2. Fetch comments with member details
        const comments = await db.query(`
            SELECT 
                c.id,
                c.text,
                c.created_at,
                c.member_id,
                json_build_object('id', m.id, 'name', m.name) as members
            FROM comments c
            JOIN members m ON c.member_id = m.id
            WHERE c.expense_id = $1
            ORDER BY c.created_at ASC
        `, [expenseId]);

        res.json(comments.rows);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/expenses/:expenseId/comments
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { expenseId } = req.params;
        const { text } = req.body;
        const userId = req.user.id;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        // 1. Verify access and get the user's member_id for this group
        const memberCheck = await db.query(`
            SELECT m.id AS member_id
            FROM expenses e
            JOIN members m ON e.group_id = m.group_id
            WHERE e.id = $1 AND m.user_id = $2
        `, [expenseId, userId]);

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied: You must be a member of this group' });
        }

        const memberId = memberCheck.rows[0].member_id;

        // 2. Insert Comment
        const newComment = await db.query(`
            INSERT INTO comments (expense_id, member_id, text)
            VALUES ($1, $2, $3)
            RETURNING id, text, created_at, member_id
        `, [expenseId, memberId, text.trim()]);

        // 3. Fetch full object for response (including member name) to match GET structure
        const result = await db.query(`
            SELECT 
                c.id,
                c.text,
                c.created_at,
                c.member_id,
                json_build_object('id', m.id, 'name', m.name) as members
            FROM comments c
            JOIN members m ON c.member_id = m.id
            WHERE c.id = $1
        `, [newComment.rows[0].id]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
