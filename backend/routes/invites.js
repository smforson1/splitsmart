const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/invites - Get pending invites for current user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userEmail = req.user.email;

        const result = await db.query(`
      SELECT 
        gi.id,
        gi.group_id,
        g.name as group_name,
        gi.status,
        gi.created_at,
        u.email as invited_by_email
      FROM group_invites gi
      JOIN groups g ON gi.group_id = g.id
      LEFT JOIN auth.users u ON gi.invited_by_user_id = u.id
      WHERE gi.email = $1 AND gi.status = 'pending'
      ORDER BY gi.created_at DESC
    `, [userEmail]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching invites:', error);
        res.status(500).json({ error: 'Failed to fetch invites' });
    }
});

// POST /api/invites - Send an invite
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { groupId, email } = req.body;
        const inviterId = req.user.id;

        if (!groupId || !email) {
            return res.status(400).json({ error: 'GroupId and email are required' });
        }

        // Verify inviter is admin of the group
        const roleCheck = await db.query(
            'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2',
            [groupId, inviterId]
        );

        if (roleCheck.rows.length === 0 || roleCheck.rows[0].role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can send invites' });
        }

        // Check if user is already a member
        // We need to resolve email to user_id to check this efficiently, or check via group_invites uniqueness
        // First, check existing invites
        const existingInvite = await db.query(
            'SELECT id FROM group_invites WHERE group_id = $1 AND email = $2',
            [groupId, email]
        );

        if (existingInvite.rows.length > 0) {
            return res.status(400).json({ error: 'Invite already sent to this email' });
        }

        // Create Invite
        const inviteResult = await db.query(
            'INSERT INTO group_invites (group_id, email, invited_by_user_id) VALUES ($1, $2, $3) RETURNING *',
            [groupId, email, inviterId]
        );
        const invite = inviteResult.rows[0];

        // Attempt to notify the user if they exist in auth.users
        // Note: accessing auth.users requires privileges. If this fails, we just silently skip notification.
        try {
            const userLookup = await db.query('SELECT id FROM auth.users WHERE email = $1', [email]);
            if (userLookup.rows.length > 0) {
                const invitedUserId = userLookup.rows[0].id;

                // Create Notification
                await db.query(
                    `INSERT INTO notifications (user_id, type, payload) 
           VALUES ($1, 'invite', $2)`,
                    [invitedUserId, JSON.stringify({
                        inviteId: invite.id,
                        groupId: groupId,
                        inviterId: inviterId
                    })]
                );
            }
        } catch (err) {
            console.warn('Could not lookup user or create notification:', err.message);
        }

        res.status(201).json({ message: 'Invite sent successfully', invite });
    } catch (error) {
        console.error('Error sending invite:', error);
        res.status(500).json({ error: 'Failed to send invite' });
    }
});

// POST /api/invites/:id/accept - Accept invite
router.post('/:id/accept', authenticateToken, async (req, res) => {
    try {
        const inviteId = req.params.id;
        const userId = req.user.id;
        const userEmail = req.user.email;
        const userName = req.user.user_metadata?.name || userEmail.split('@')[0];

        // Verify invite exists and belongs to user
        const inviteCheck = await db.query(
            'SELECT * FROM group_invites WHERE id = $1 AND email = $2 AND status = \'pending\'',
            [inviteId, userEmail]
        );

        if (inviteCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Invite not found or invalid' });
        }

        const invite = inviteCheck.rows[0];
        const groupId = invite.group_id;

        // Start transaction (simulated with independent queries for now, ideally use BEGIN/COMMIT)

        // 1. Update invite status
        await db.query('UPDATE group_invites SET status = \'accepted\' WHERE id = $1', [inviteId]);

        // 2. Add to group_members (access)
        await db.query(
            'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, \'member\') ON CONFLICT DO NOTHING',
            [groupId, userId]
        );

        // 3. Add to members (logical member for expenses)
        // Check if a ghost member with similar name exists? NO, just create a new member linked to user.
        await db.query(
            'INSERT INTO members (group_id, name, user_id) VALUES ($1, $2, $3)',
            [groupId, userName, userId]
        );

        res.json({ success: true, message: 'Invite accepted' });
    } catch (error) {
        console.error('Error accepting invite:', error);
        res.status(500).json({ error: 'Failed to accept invite' });
    }
});

// POST /api/invites/:id/decline - Decline invite
router.post('/:id/decline', authenticateToken, async (req, res) => {
    try {
        const inviteId = req.params.id;
        const userEmail = req.user.email;

        const result = await db.query(
            'UPDATE group_invites SET status = \'declined\' WHERE id = $1 AND email = $2 RETURNING id',
            [inviteId, userEmail]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invite not found or invalid' });
        }

        res.json({ success: true, message: 'Invite declined' });
    } catch (error) {
        console.error('Error declining invite:', error);
        res.status(500).json({ error: 'Failed to decline invite' });
    }
});

module.exports = router;
