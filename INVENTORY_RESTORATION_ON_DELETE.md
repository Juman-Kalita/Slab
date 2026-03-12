# Inventory Restoration on Deletion

## Overview
When a customer or site is deleted, all rented materials are automatically returned to inventory. This ensures inventory accuracy and prevents material loss.

## Features Implemented

### 1. Customer Deletion with Inventory Restoration
**Location**: `src/lib/rental-store.ts` - `deleteCustomer()` function

**Process**:
1. Finds the customer and all their sites
2. Loops through each site
3. Loops through each material at each site
4. Restores each material quantity back to inventory
5. Deletes the customer from database
6. Logs the total materials restored

**Confirmation Dialog Shows**:
- Customer name
- Number of sites to be deleted
- Number of materials to be restored to inventory
- Pending amount to be cleared
- Warning that action cannot be undone

**Example**:
```
Are you sure you want to delete customer "John Doe"?

This will:
- Delete 2 site(s)
- Return 150 material(s) to inventory
- Clear ₹5,000 pending amount

This action CANNOT be undone!
```

### 2. Site Deletion with Inventory Restoration
**Location**: `src/lib/rental-store.ts` - `deleteSite()` function

**Process**:
1. Finds the customer and specific site
2. Loops through each material at the site
3. Restores each material quantity back to inventory
4. Deletes the site from database
5. Logs the total materials restored

**Confirmation Dialog Shows**:
- Site name
- Number of materials to be restored to inventory
- Warning about history removal
- Warning that action cannot be undone

**Example**:
```
Are you sure you want to delete site "Construction Site A"?

This will:
- Return 75 material(s) to inventory
- Remove all history for this site

This action CANNOT be undone!
```

## Implementation Details

### Customer Deletion
**File**: `src/components/admin/CustomerManagement.tsx`

```typescript
const handleDelete = async (customer: Customer) => {
  // Shows detailed confirmation with material count
  // Calls deleteCustomer(customerId)
  // Logs activity
  // Refreshes customer list
}
```

### Site Deletion
**File**: `src/components/admin/CustomerEditDialog.tsx`

```typescript
const handleDeleteSite = async (siteId: string, siteName: string) => {
  // Shows detailed confirmation with material count
  // Calls deleteSite(customerId, siteId)
  // Logs activity
  // Refreshes customer data
}
```

### Inventory Update Function
**File**: `src/lib/rental-store.ts`

```typescript
async function updateInventory(materialTypeId: string, quantityChange: number)
```

- Positive `quantityChange`: Adds to inventory (restoration)
- Negative `quantityChange`: Removes from inventory (issuance)
- Updates Supabase inventory table
- Returns success/failure status

## User Experience

### Before Deletion
1. User clicks delete button (trash icon)
2. System calculates:
   - Total sites (for customer deletion)
   - Total materials to be restored
   - Pending amounts
3. Shows detailed confirmation dialog
4. User must confirm to proceed

### During Deletion
1. System restores materials to inventory one by one
2. Logs any restoration failures (but continues)
3. Deletes the customer/site from database
4. Logs the activity in admin activity log

### After Deletion
1. Shows success message with restoration count
2. Refreshes the list automatically
3. Inventory is updated immediately
4. Activity log shows the deletion with details

## Error Handling

### Restoration Failures
- If a material fails to restore, error is logged to console
- Deletion continues (doesn't rollback)
- Other materials are still restored
- User sees success message for overall operation

### Deletion Failures
- If database deletion fails, shows error message
- No changes are made
- Inventory is not affected
- User can retry

## Activity Logging

### Customer Deletion Log
```json
{
  "action": "delete_customer",
  "entity_type": "customer",
  "entity_id": "customer-uuid",
  "details": {
    "customerName": "John Doe",
    "sitesDeleted": 2,
    "materialsRestored": 150
  }
}
```

### Site Deletion Log
```json
{
  "action": "delete_site",
  "entity_type": "site",
  "entity_id": "site-uuid",
  "details": {
    "siteName": "Construction Site A",
    "materialsRestored": 75
  }
}
```

## Database Operations

### Customer Deletion
1. Restore inventory for all materials
2. Delete customer (CASCADE deletes sites, materials, history)

### Site Deletion
1. Restore inventory for all materials at site
2. Delete site (CASCADE deletes materials, history)

### Cascade Behavior
Database foreign keys with `ON DELETE CASCADE` automatically remove:
- Sites when customer is deleted
- Materials when site is deleted
- History events when site is deleted

## Benefits

1. **Inventory Accuracy**: Materials are never lost when customers/sites are deleted
2. **Transparency**: Users see exactly what will be restored before confirming
3. **Audit Trail**: All deletions are logged with restoration counts
4. **Safety**: Confirmation dialogs prevent accidental deletions
5. **Consistency**: Same restoration logic for both customer and site deletions

## Testing Checklist

- [ ] Delete customer with multiple sites - verify all materials restored
- [ ] Delete customer with no materials - verify no errors
- [ ] Delete single site - verify only that site's materials restored
- [ ] Check inventory counts before and after deletion
- [ ] Verify activity log entries are created
- [ ] Test deletion cancellation (no changes made)
- [ ] Verify cascade deletion of related records
