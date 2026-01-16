-- Migration 05: Database Integrity Guard
-- This migration updates remaining foreign keys to be more robust against deletions.

-- 1. Groups Ownership
-- If a creator is deleted, keep the group but remove the link (admin role in group_members still permits management).
ALTER TABLE groups
DROP CONSTRAINT IF EXISTS groups_created_by_user_id_fkey,
ADD CONSTRAINT groups_created_by_user_id_fkey
FOREIGN KEY (created_by_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Recurring Expenses Payer
-- If the person who pays leaves, keep the configuration but set payer to NULL so others can take over.
ALTER TABLE recurring_expenses
DROP CONSTRAINT IF EXISTS recurring_expenses_paid_by_fkey,
ADD CONSTRAINT recurring_expenses_paid_by_fkey
FOREIGN KEY (paid_by) REFERENCES members(id) ON DELETE SET NULL;

-- 3. Comments Author
-- Preserve the conversation history even if the author's member record is removed.
ALTER TABLE comments
DROP CONSTRAINT IF EXISTS comments_member_id_fkey,
ADD CONSTRAINT comments_member_id_fkey
FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL;
