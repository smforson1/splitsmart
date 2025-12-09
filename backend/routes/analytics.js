const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/analytics/groups/:groupId/spending-by-category
router.get('/groups/:groupId/spending-by-category', authenticateToken, async (req, res) => {
    try {
        const { groupId } = req.params;

        const result = await db.query(`
      SELECT category, SUM(amount) as total
      FROM expenses
      WHERE group_id = $1
      GROUP BY category
      ORDER BY total DESC
    `, [groupId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching spending by category:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// GET /api/analytics/groups/:groupId/spending-trend
router.get('/groups/:groupId/spending-trend', authenticateToken, async (req, res) => {
    try {
        const { groupId } = req.params;

        // Aggregate by month (YYYY-MM)
        const result = await db.query(`
      SELECT TO_CHAR(date, 'YYYY-MM') as month, SUM(amount) as total
      FROM expenses
      WHERE group_id = $1
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `, [groupId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching spending trend:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
