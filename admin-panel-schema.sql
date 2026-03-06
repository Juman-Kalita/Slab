-- Admin Panel Database Schema

-- Create users table for admin and employees
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

-- Create activity log table to track all actions
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'customer', 'material', 'payment', 'inventory', etc.
  entity_id TEXT,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (password: sahil123)
-- Note: In production, use proper password hashing (bcrypt)
-- For now, using simple hash for demonstration
INSERT INTO users (username, password_hash, role, full_name, is_active)
VALUES ('solvix', 'sahil123', 'admin', 'Admin User', true)
ON CONFLICT (username) DO NOTHING;

-- Add employee_id column to track who performed actions
ALTER TABLE history_events ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES users(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_history_events_employee ON history_events(employee_id);

-- Add comments
COMMENT ON TABLE users IS 'Admin and employee user accounts';
COMMENT ON TABLE activity_log IS 'Audit log of all system activities';
COMMENT ON COLUMN history_events.employee_id IS 'Employee who performed this action';
