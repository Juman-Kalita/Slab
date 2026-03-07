-- Verification Script: Run this in Supabase SQL Editor to check admin setup

-- 1. Check if users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
) AS users_table_exists;

-- 2. Check if admin user exists
SELECT 
  id,
  username,
  role,
  full_name,
  is_active,
  created_at
FROM users 
WHERE username = 'solvix';

-- 3. Count total users
SELECT COUNT(*) as total_users FROM users;

-- 4. Check activity_log table
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'activity_log'
) AS activity_log_exists;

-- If users table doesn't exist or admin user is missing, run the admin-panel-schema.sql file
