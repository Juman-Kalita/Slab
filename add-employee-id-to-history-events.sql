-- Add employee_id column to history_events table
-- This tracks which employee performed each action

ALTER TABLE history_events
ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES users(id);

-- Add index for faster queries by employee
CREATE INDEX IF NOT EXISTS idx_history_events_employee_id ON history_events(employee_id);

-- Add comment to document the column
COMMENT ON COLUMN history_events.employee_id IS 'ID of the employee who performed this action';
