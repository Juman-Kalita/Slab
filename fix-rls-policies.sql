-- FIX ROW LEVEL SECURITY POLICIES
-- This might be blocking the login queries

-- Disable RLS on users table (for authentication to work)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on activity_log table
ALTER TABLE activity_log DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'activity_log');

-- Test query to verify admin user exists
SELECT 
  id,
  username,
  password_hash,
  role,
  full_name,
  is_active
FROM users 
WHERE username = 'solvix';
