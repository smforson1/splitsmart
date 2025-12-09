const express = require('express');
const router = express.Router({ mergeParams: true });
const supabase = require('../supabaseClient');

// GET /api/expenses/:expenseId/comments
router.get('/', async (req, res) => {
    try {
        const { expenseId } = req.params;

        // First verify user has access to this expense's group
        const { data: expense, error: expError } = await supabase
            .from('expenses')
            .select('group_id')
            .eq('id', expenseId)
            .single();

        if (expError || !expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        const userId = req.user.id;
        const { data: member, error: memberError } = await supabase
            .from('group_members')
            .select('id')
            .eq('group_id', expense.group_id)
            .eq('user_id', userId)
            .single();

        if (memberError || !member) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { data: comments, error } = await supabase
            .from('comments')
            .select(`
        id,
        text,
        created_at,
        member_id,
        members (
          id,
          name
        )
      `)
            .eq('expense_id', expenseId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/expenses/:expenseId/comments
router.post('/', async (req, res) => {
    try {
        const { expenseId } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        // Verify access and get member_id
        const { data: expense, error: expError } = await supabase
            .from('expenses')
            .select('group_id')
            .eq('id', expenseId)
            .single();

        if (expError || !expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        const userId = req.user.id;
        const { data: memberData, error: memberError } = await supabase
            .from('members') // Get the actual member record for this group/user
            .select('id')
            .eq('group_id', expense.group_id)
            .eq('user_id', userId)
            .single();

        if (memberError || !memberData) {
            return res.status(403).json({ error: 'Access denied - You must be a member of this group' });
        }

        const { data: comment, error } = await supabase
            .from('comments')
            .insert({
                expense_id: expenseId,
                member_id: memberData.id,
                text: text.trim()
            })
            .select(`
        id,
        text,
        created_at,
        member_id,
        members (
          id,
          name
        )
      `)
            .single();

        if (error) throw error;

        res.status(201).json(comment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
