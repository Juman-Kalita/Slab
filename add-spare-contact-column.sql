-- Add spare_contact_no column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS spare_contact_no TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN customers.spare_contact_no IS 'Optional spare/alternate contact number for the customer';
