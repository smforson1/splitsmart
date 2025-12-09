-- Migration: Add Invites, Notifications, and Settlement Status

-- Table: group_invites
CREATE TABLE group_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  invited_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, email)
);

-- Table: notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- invite, settlement_request, settlement_confirmed
  payload JSONB NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Alter Table: settlements
ALTER TABLE settlements ADD COLUMN status VARCHAR(20) DEFAULT 'pending'; -- pending, confirmed, rejected

-- Indexes
CREATE INDEX idx_group_invites_email ON group_invites(email);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
-- Enable RLS (Row Level Security) helper functions if you are using Supabase directly from client, 
-- but we are likely using a service key or simple backend logic. 
-- For this setup, we assume the backend handles auth via the authenticated user ID.
