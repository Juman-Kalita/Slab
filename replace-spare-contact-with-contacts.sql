-- Replace spare_contact_no with contacts JSON column
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
