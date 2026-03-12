-- Add grace_period_end_date column to sites table
-- This allows setting a custom grace period end date instead of calculating from material type

ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS grace_period_end_date DATE;

-- Add comment to document the column
COMMENT ON COLUMN sites.grace_period_end_date IS 'Optional end date for grace period. If set, this date is used instead of calculating from material type grace period days. Issue date is the start, this is the end.';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_sites_grace_period_end_date ON sites(grace_period_end_date);
