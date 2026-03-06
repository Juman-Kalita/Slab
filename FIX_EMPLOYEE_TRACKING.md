# Fix Employee Activity Tracking

## Issue
Employee actions (payments, material issues, returns) are not showing in the Employee Activity dialog.

## Root Cause
The `history_events` table is missing the `employee_id` column that was added in the code but not yet applied to the database.

## Solution

### Step 1: Run Database Migration

You need to add the `employee_id` column to the `history_events` table in your Supabase database.

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste this SQL:

```sql
-- Add employee_id column to history_events table
ALTER TABLE history_events
ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES users(id);

-- Add index for faster queries by employee
CREATE INDEX IF NOT EXISTS idx_history_events_employee_id ON history_events(employee_id);

-- Add comment to document the column
COMMENT ON COLUMN history_events.employee_id IS 'ID of the employee who performed this action';
```

5. Click "Run" to execute the migration
6. You should see "Success. No rows returned"

**Option B: Using SQL File**

If you have command-line access to your database:

```bash
psql -h <your-supabase-host> -U postgres -d postgres -f add-employee-id-to-history-events.sql
```

### Step 2: Verify the Migration

After running the migration, verify it worked:

1. In Supabase SQL Editor, run:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'history_events' 
AND column_name = 'employee_id';
```

2. You should see:
   - column_name: employee_id
   - data_type: uuid

### Step 3: Test Employee Tracking

1. **Login as an employee** (not admin)
   - Use employee credentials created in the admin panel

2. **Perform some actions**:
   - Issue materials to a customer
   - Record a payment
   - Process a material return

3. **Login as admin**
   - Go to Admin Dashboard → Employees tab
   - Find the employee you just used
   - Click the "View Activity" button (eye icon)

4. **Verify the activity shows**:
   - Total Actions should increase
   - Materials Issued / Payments Collected / Returns Processed should show counts
   - The activity table should show all actions with timestamps

## What Changed

### Code Updates (Already Done)
- ✅ Updated `HistoryEvent` interface to include `employeeId`
- ✅ Updated database transformers to handle `employee_id`
- ✅ Updated `issueMaterials()`, `recordPayment()`, `recordReturn()` to accept employeeId
- ✅ Updated all action dialogs to pass current user ID
- ✅ Created `getEmployeeHistoryEvents()` function to fetch employee activities
- ✅ Updated `EmployeeActivityDialog` to use the new function

### Database Migration (Needs to be Run)
- ⚠️ **REQUIRED**: Add `employee_id` column to `history_events` table

## Important Notes

1. **Old Records**: History events created before this migration will have NULL employee_id (this is expected and OK)

2. **New Records**: All new actions performed after the migration will have employee_id populated

3. **Admin vs Employee**:
   - Admin actions are tracked in `activity_log` table
   - Employee actions are tracked in `history_events` table with employee_id

4. **Testing**: Make sure to test with a fresh employee login after running the migration

## Troubleshooting

### Issue: Still not showing activities after migration

**Check 1**: Verify employee_id is being saved
```sql
SELECT id, date, action, employee_id 
FROM history_events 
WHERE employee_id IS NOT NULL 
ORDER BY date DESC 
LIMIT 10;
```

**Check 2**: Verify the employee ID matches
```sql
-- Get employee ID
SELECT id, username FROM users WHERE role = 'employee';

-- Check if that ID exists in history_events
SELECT COUNT(*) FROM history_events WHERE employee_id = '<employee-id-here>';
```

**Check 3**: Check browser console for errors
- Open browser DevTools (F12)
- Go to Console tab
- Look for any red error messages when opening the activity dialog

### Issue: Migration fails with "column already exists"

This means the column was already added. You can verify with:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'history_events';
```

If employee_id is listed, the migration is already done.

### Issue: "Cannot add foreign key constraint"

This might happen if the users table doesn't exist. Verify:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'users';
```

If users table doesn't exist, you need to run the admin panel schema first:
```bash
# Run this first
psql -f admin-panel-schema.sql

# Then run the employee tracking migration
psql -f add-employee-id-to-history-events.sql
```

## Summary

The code is ready and working. You just need to run the database migration to add the `employee_id` column to the `history_events` table. Once that's done, all employee actions will be tracked and visible in the admin panel.
