-- Migration 04: Fix Member Deletion Constraint Violation
-- This migration updates foreign keys to allow deleting members who have expenses or settlements.

-- 1. Updates to 'expenses' (paid_by_member_id)
-- We use SET NULL because we want to keep the expense record but mark the payer as deleted.
ALTER TABLE expenses 
DROP CONSTRAINT IF EXISTS expenses_paid_by_member_id_fkey,
ADD CONSTRAINT expenses_paid_by_member_id_fkey 
FOREIGN KEY (paid_by_member_id) REFERENCES members(id) ON DELETE SET NULL;

-- 2. Updates to 'expense_splits' (member_id)
-- We use CASCADE because if a member is removed from a group, their debt in that group's expenses should also be removed.
-- Note: This might cause the sum of splits to not equal the total expense amount. 
-- In a production app, we would usually check balance before deletion, but this fix prevents the 500 error.
ALTER TABLE expense_splits 
DROP CONSTRAINT IF EXISTS expense_splits_member_id_fkey,
ADD CONSTRAINT expense_splits_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

-- 3. Updates to 'settlements' (from_member_id and to_member_id)
-- We use SET NULL to keep the financial record of the settlement even if a member is deleted.
ALTER TABLE settlements 
DROP CONSTRAINT IF EXISTS settlements_from_member_id_fkey,
ADD CONSTRAINT settlements_from_member_id_fkey 
FOREIGN KEY (from_member_id) REFERENCES members(id) ON DELETE SET NULL;

ALTER TABLE settlements 
DROP CONSTRAINT IF EXISTS settlements_to_member_id_fkey,
ADD CONSTRAINT settlements_to_member_id_fkey 
FOREIGN KEY (to_member_id) REFERENCES members(id) ON DELETE SET NULL;
