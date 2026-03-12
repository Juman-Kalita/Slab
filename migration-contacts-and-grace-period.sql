-- Combined migration for contacts and grace period end date features
-- Run this in your Supabase SQL Editor

-- 1. Replace spare_contact_no with contacts JSON column
-- This allows storing multiple contacts with names

-- Add new contacts column (JSONB for better querying)
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS contacts JSONB;

-- Migrate existing spare_contact_no data to contacts array
-- Only migrate if spare_contact_no has a value
UPDATE customers 
SET contacts = jsonb_build_array(
  jsonb_build_object(
    'name', 'Spare Contact',
    'number', spare_contact_no
  )
)
WHERE spare_contact_no IS NOT NULL AND spare_contact_no != '';

-- Drop the old spare_contact_no column
ALTER TABLE customers 
DROP COLUMN IF EXISTS spare_contact_no;

-- Add comment to document the column
COMMENT ON COLUMN customers.contacts IS 'Array of additional contacts with name and number: [{"name": "Contact Name", "number": "1234567890"}]';

-- 2. Add grace_period_end_date column to sites table
-- This allows setting a custom grace period end date instead of calculating from material type

ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS grace_period_end_date DATE;

-- Add comment to document the column
COMMENT ON COLUMN sites.grace_period_end_date IS 'Optional end date for grace period. If set, this date is used instead of calculating from material type grace period days. Issue date is the start, this is the end.';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_sites_grace_period_end_date ON sites(grace_period_end_date);

-- Verify changes
SELECT 
  'customers' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'customers' 
  AND column_name IN ('contacts', 'spare_contact_no')
UNION ALL
SELECT 
  'sites' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'sites' 
  AND column_name = 'grace_period_end_date';
