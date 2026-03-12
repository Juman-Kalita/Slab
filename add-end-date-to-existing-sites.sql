-- Add grace period end date to existing sites
-- This script adds a grace period end date to sites that don't have one
-- It calculates the end date as issue_date + 30 days (you can adjust this)

-- Example: Update a specific site by ID
-- UPDATE sites 
-- SET grace_period_end_date = issue_date + INTERVAL '30 days'
-- WHERE id = 'your-site-id-here';

-- Or update ALL sites that don't have an end date
UPDATE sites 
SET grace_period_end_date = issue_date + INTERVAL '30 days'
WHERE grace_period_end_date IS NULL;

-- Verify the update
SELECT 
  id,
  site_name,
  issue_date,
  grace_period_end_date,
  (grace_period_end_date - issue_date) as grace_period_days
FROM sites
ORDER BY issue_date DESC;
