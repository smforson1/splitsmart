-- 1. Recurring Expenses Table
CREATE TABLE recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paid_by UUID REFERENCES members(id) ON DELETE CASCADE,
  category VARCHAR(50) DEFAULT 'General',
  split_details JSONB NOT NULL, -- To store how it should be split
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  last_generated DATE, -- When was the last real expense created?
  next_due DATE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Activity Logs Table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES members(id) ON DELETE SET NULL, -- Who did it?
  action_type VARCHAR(50) NOT NULL, -- 'CREATE_EXPENSE', 'SETTLEMENT_CONFIRMED', 'MEMBER_JOINED'
  entity_type VARCHAR(50), -- 'expense', 'settlement', 'member'
  entity_id UUID,
  payload JSONB, -- Store snapshot of data (e.g. amount, description) for display
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Comments Table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_recurring_next_due ON recurring_expenses(group_id, active);
CREATE INDEX idx_activities_group ON activities(group_id, created_at DESC);
CREATE INDEX idx_comments_expense ON comments(expense_id, created_at);
