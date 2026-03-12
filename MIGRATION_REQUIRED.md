# Database Migration Required

## Error: "Failed to issue materials"

If you're seeing a 400 error when trying to issue materials, it's because the database schema needs to be updated with the new columns.

## Solution

Run the SQL migration file in your Supabase SQL Editor:

### File: `migration-contacts-and-grace-period.sql`

This migration adds:
1. **contacts** column (JSONB) to `customers` table - replaces `spare_contact_no`
2. **grace_period_end_date** column (DATE) to `sites` table - for custom grace periods

### Steps:

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `migration-contacts-and-grace-period.sql`
5. Click **Run** or press `Ctrl+Enter`

### What the migration does:

**For Customers Table:**
- Adds `contacts` JSONB column for multiple contacts
- Migrates existing `spare_contact_no` data to new format
- Removes old `spare_contact_no` column

**For Sites Table:**
- Adds `grace_period_end_date` DATE column
- Creates index for better performance
- Allows custom grace period end dates per site

### Verification:

After running the migration, the query at the end will show you the new columns:

```
table_name | column_name            | data_type | is_nullable
-----------+------------------------+-----------+------------
customers  | contacts               | jsonb     | YES
sites      | grace_period_end_date  | date      | YES
```

The `spare_contact_no` column should no longer appear in the results.

### Backward Compatibility:

- Existing customers without contacts will work fine (contacts is optional)
- Existing sites without grace_period_end_date will use material type grace period (backward compatible)
- No data loss - spare contact numbers are migrated to the new format

## After Migration:

Once the migration is complete, refresh your application and try issuing materials again. The error should be resolved.

## Rollback (if needed):

If you need to rollback the changes:

```sql
-- Rollback contacts change
ALTER TABLE customers ADD COLUMN spare_contact_no TEXT;
UPDATE customers 
SET spare_contact_no = contacts->0->>'number'
WHERE contacts IS NOT NULL;
ALTER TABLE customers DROP COLUMN contacts;

-- Rollback grace period change
DROP INDEX IF EXISTS idx_sites_grace_period_end_date;
ALTER TABLE sites DROP COLUMN grace_period_end_date;
```
