const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/balances/:groupId - Calculate balances with debt simplification
router.get('/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Get all expenses and splits for the group
    const expensesResult = await db.query(
      `SELECT e.id, e.amount, e.paid_by_member_id,
              es.member_id as split_member_id, es.amount_owed
       FROM expenses e
       LEFT JOIN expense_splits es ON e.id = es.expense_id
       WHERE e.group_id = $1`,
      [groupId]
    );

    // Get all settlements for the group
    const settlementsResult = await db.query(
      `SELECT from_member_id, to_member_id, amount
       FROM settlements
       WHERE group_id = $1`,
      [groupId]
    );

    // Get all members
    const membersResult = await db.query(
      'SELECT id, name FROM members WHERE group_id = $1',
      [groupId]
    );

    // Initialize balances for all members
    const balances = {};
    membersResult.rows.forEach(member => {
      balances[member.id] = { balance: 0, name: member.name };
    });

    // Calculate balances from expenses
    expensesResult.rows.forEach(row => {
      if (row.paid_by_member_id && balances[row.paid_by_member_id]) {
        // Person who paid gets credited
        balances[row.paid_by_member_id].balance += parseFloat(row.amount_owed || 0);
      }
      
      if (row.split_member_id && balances[row.split_member_id]) {
        // Person in split gets debited
        balances[row.split_member_id].balance -= parseFloat(row.amount_owed || 0);
      }
    });

    // Apply settlements
    settlementsResult.rows.forEach(settlement => {
      if (balances[settlement.from_member_id]) {
        balances[settlement.from_member_id].balance += parseFloat(settlement.amount);
      }
      if (balances[settlement.to_member_id]) {
        balances[settlement.to_member_id].balance -= parseFloat(settlement.amount);
      }
    });

    // Separate into creditors and debtors
    const creditors = [];
    const debtors = [];

    Object.keys(balances).forEach(memberId => {
      const balance = balances[memberId].balance;
      if (balance > 0.01) {
        creditors.push({
          member_id: memberId,
          name: balances[memberId].name,
          amount: balance
        });
      } else if (balance < -0.01) {
        debtors.push({
          member_id: memberId,
          name: balances[memberId].name,
          amount: -balance
        });
      }
    });

    // Simplify debts using greedy algorithm
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const simplifiedDebts = [];
    let i = 0, j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];

      const settleAmount = Math.min(creditor.amount, debtor.amount);

      simplifiedDebts.push({
        from_member_id: debtor.member_id,
        from_member_name: debtor.name,
        to_member_id: creditor.member_id,
        to_member_name: creditor.name,
        amount: parseFloat(settleAmount.toFixed(2))
      });

      creditor.amount -= settleAmount;
      debtor.amount -= settleAmount;

      if (creditor.amount < 0.01) i++;
      if (debtor.amount < 0.01) j++;
    }

    // Also return individual balances
    const memberBalances = Object.keys(balances).map(memberId => ({
      member_id: memberId,
      member_name: balances[memberId].name,
      balance: parseFloat(balances[memberId].balance.toFixed(2))
    }));

    res.json({
      balances: memberBalances,
      simplified_debts: simplifiedDebts
    });
  } catch (error) {
    console.error('Error calculating balances:', error);
    res.status(500).json({ error: 'Failed to calculate balances' });
  }
});

module.exports = router;
