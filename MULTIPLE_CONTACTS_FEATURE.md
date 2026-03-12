# Multiple Contacts Feature

## Overview
Replaced the single "Spare Contact Number" field with a dynamic multiple contacts system that allows adding unlimited contacts, each with a name and phone number.

## Changes Made

### 1. Database Schema
- **File**: `replace-spare-contact-with-contacts.sql`
- Replaced `spare_contact_no` column with `contacts` JSONB column
- Migrated existing spare contact data to new format
- Format: `[{"name": "Contact Name", "number": "1234567890"}]`

### 2. Data Model Updates
- **File**: `src/lib/rental-store.ts`
  - Updated `Customer` interface to replace `spareContactNo` with `contacts` array
  - Updated `issueMaterials` function's `clientDetails` parameter

### 3. Database Transformers
- **File**: `src/lib/supabase-transformers.ts`
  - Updated `dbToCustomer` to parse contacts JSON from database
  - Updated `customerToDb` to stringify contacts array for database

### 4. Database Store Functions
- **File**: `src/lib/supabase-store.ts`
  - Updated `createCustomerWithSite` function signature
  - Updated `updateCustomer` function signature
  - Both now handle `contacts` array instead of `spareContactNo`

### 5. UI Components

#### IssueMaterialsDialog
- **File**: `src/components/IssueMaterialsDialog.tsx`
- Removed single "Spare Contact Number" field
- Added dynamic contacts section with:
  - "Add Contact" button with + icon
  - Two-column layout: Contact Name | Phone Number
  - Delete button for each contact row
  - Validation: 10-digit phone numbers only
  - Filters out incomplete contacts before submission

#### CustomerEditDialog
- **File**: `src/components/admin/CustomerEditDialog.tsx`
- Removed "Spare Contact" field
- Added dynamic "Additional Contacts" section
- Same UI pattern as IssueMaterialsDialog
- Saves valid contacts (name filled + 10-digit number)

#### CustomerManagement
- **File**: `src/components/admin/CustomerManagement.tsx`
- Updated contact display in customer list
- Shows all additional contacts below primary contact
- Format: "Name: Number" for each contact

## User Experience

### Adding Contacts
1. Primary contact number remains as required field
2. Click "+ Add Contact" button to add additional contacts
3. Enter contact name and 10-digit phone number
4. Click trash icon to remove a contact
5. Can add unlimited contacts

### Validation
- Primary contact: Required, must be 10 digits
- Additional contacts: Optional
- Each additional contact must have both name and valid 10-digit number to be saved
- Incomplete contacts are filtered out during save

### Display
- Primary contact shown prominently
- Additional contacts listed below with format: "Name: Number"
- Visible in customer management table and edit dialog

## Migration Notes

### Database Migration Required
Run the SQL migration file to update the database schema:
```sql
-- File: replace-spare-contact-with-contacts.sql
```

This will:
1. Add the new `contacts` JSONB column
2. Migrate existing spare contact data
3. Remove the old `spare_contact_no` column

### Backward Compatibility
- Existing customers with spare contact numbers will be migrated automatically
- The spare contact will be stored as first item in contacts array with name "Spare Contact"
- No data loss during migration

## Technical Details

### Data Structure
```typescript
interface Customer {
  // ... other fields
  contactNo?: string; // Primary contact (unchanged)
  contacts?: Array<{ 
    name: string; 
    number: string 
  }>; // New multiple contacts
}
```

### Database Storage
- Stored as JSONB in PostgreSQL
- Allows efficient querying and indexing
- Example: `[{"name":"John","number":"1234567890"},{"name":"Jane","number":"0987654321"}]`

### Form Handling
- Contacts stored in component state as array
- Added/removed dynamically with React state updates
- Filtered before submission to ensure data quality
- Only contacts with both name and valid 10-digit number are saved
