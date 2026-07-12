-- Record the delivery vehicle/challan per transaction (per Issued history event)
-- instead of only once at the site level. Run this in the Supabase SQL editor.

ALTER TABLE history_events
  ADD COLUMN IF NOT EXISTS vehicle_no TEXT;

ALTER TABLE history_events
  ADD COLUMN IF NOT EXISTS challan_no TEXT;

COMMENT ON COLUMN history_events.vehicle_no IS 'Vehicle number used for this delivery (issue/return)';
COMMENT ON COLUMN history_events.challan_no IS 'Challan number for this delivery (issue/return)';
