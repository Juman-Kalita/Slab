-- COMPLETE SETUP SCRIPT FOR SLABRENT PRO
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- STEP 1: Create users table for admin and employees
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true
);

-- ============================================
-- STEP 2: Create activity log table
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 3: Insert default admin user
-- Username: solvix
-- Password: sahil123
-- ============================================
INSERT INTO users (username, password_hash, role, full_name, is_active)
VALUES ('solvix', 'sahil123', 'admin', 'Admin User', true)
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- STEP 4: Add employee_id to history_events
-- ============================================
ALTER TABLE history_events ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES users(id);

-- ============================================
-- STEP 5: Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_history_events_employee ON history_events(employee_id);

-- ============================================
-- STEP 6: Verify setup
-- ============================================
SELECT 
  'Setup Complete!' as status,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
  COUNT(*) FILTER (WHERE role = 'employee') as employee_count
FROM users;

-- Show the admin user
SELECT 
  username,
  role,
  full_name,
  is_active,
  created_at
FROM users 
WHERE username = 'solvix';
