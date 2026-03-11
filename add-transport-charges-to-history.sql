-- Add transport_charges column to history_events table
ALTER TABLE history_events 
ADD COLUMN IF NOT EXISTS transport_charges DECIMAL(10,2);

-- Add comment to document the column
COMMENT ON COLUMN history_events.transport_charges IS 'Transportation charges for issue or return events';
