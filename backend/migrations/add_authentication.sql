-- Migration: Add Authentication Support
-- Run this in your Supabase SQL Editor AFTER running the initial database_schema.sql

-- Add user reference to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user reference to members table (optional - for linking members to registered users)
ALTER TABLE members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create group_members junction table for user access control
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- 'admin' or 'member'
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);

-- For existing groups, you may want to assign them to a default user or handle manually
-- UPDATE groups SET created_by_user_id = 'your-user-id' WHERE created_by_user_id IS NULL;
