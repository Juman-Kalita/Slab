-- Add financial override columns to sites table
-- This allows admins to manually override calculated amounts

-- Add override columns
ALTER TABLE sites ADD COLUMN IF NOT EXISTS total_due_override DECIMAL(10,2);
ALTER TABLE sites ADD COLUMN IF NOT EXISTS use_override BOOLEAN DEFAULT false;

-- Add comments
COMMENT ON COLUMN sites.total_due_override IS 'Manual override for total due amount (when use_override is true)';
COMMENT ON COLUMN sites.use_override IS 'Whether to use override values instead of calculated amounts';

-- Verify columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sites' 
AND column_name IN ('total_due_override', 'use_override');
