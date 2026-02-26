# Inventory Restoration Guide

## Problem

When you delete a customer directly from the Supabase database (using the Table Editor), the materials that were issued to them are NOT automatically returned to inventory. This causes inventory discrepancies.

## What Happened

You deleted a customer who had materials issued to them:
- The customer record was deleted from the database
- The site and materials records were also deleted (cascade delete)
- BUT the inventory was not updated to add those materials back

## Solution Going Forward

**Never delete customers directly from the database!** Instead, use the app's delete function (which we just added).

### How to Delete a Customer Properly (Future)

The app now has a `deleteCustomer()` function that:
1. Finds all materials at all customer sites
2. Restores those materials back to inventory
3. Then deletes the customer

This function will be integrated into the UI in a future update.

## How to Fix Current Inventory

Since you already deleted the customer, you need to manually restore the inventory. Here are your options:

### Option 1: Reset All Inventory (Easiest)

1. Go to your app at `/setup`
2. Click "Initialize Inventory"
3. This will reset all inventory to default values

**Warning**: This will overwrite any current inventory counts!

### Option 2: Manual Restoration (If you know what was issued)

If you remember what materials were issued to the deleted customer, you can manually add them back:

1. Go to Supabase Dashboard → Table Editor → `inventory` table
2. Find each material that was issued
3. Add the quantity back to the `quantity` column

For example, if you issued:
- 50 Plates (3'x2') → Add 50 to the current quantity
- 20 Props (2mx2m) → Add 20 to the current quantity

### Option 3: Check History and Restore

If you have a backup or can see the deleted data:

1. Look at what materials were in the `materials` table for that customer
2. For each material, add the quantity back to inventory
3. Use the Supabase SQL Editor:

```sql
-- Example: Restore 50 Plates (3'x2')
UPDATE inventory 
SET quantity = quantity + 50 
WHERE material_type_id = 'plate-3x2';

-- Example: Restore 20 Props (2mx2m)
UPDATE inventory 
SET quantity = quantity + 20 
WHERE material_type_id = 'props-2x2';
```

## New Feature: Delete Customer Function

We've added a proper delete function to the codebase:

```typescript
// In rental-store.ts
export async function deleteCustomer(customerId: string): Promise<boolean>
```

This function:
- ✅ Restores all materials to inventory
- ✅ Deletes all sites and history
- ✅ Deletes the customer
- ✅ Logs what was restored

### Future UI Integration

In a future update, we'll add a "Delete Customer" button in the UI that uses this function properly.

## Prevention

To prevent this issue in the future:

1. **Never delete customers directly from Supabase Table Editor**
2. **Always use the app's delete function** (when we add the UI button)
3. **Make backups** before deleting important data
4. **Test deletions** on test data first

## Technical Details

### What the Delete Function Does

```typescript
// 1. Find customer
const customer = await getCustomer(customerId);

// 2. For each site
for (const site of customer.sites) {
  // 3. For each material at the site
  for (const material of site.materials) {
    // 4. Restore to inventory
    await updateInventory(material.materialTypeId, material.quantity);
  }
}

// 5. Delete customer (cascade deletes sites, materials, history)
await supabaseStore.deleteCustomer(customerId);
```

### Database Cascade

The Supabase schema has CASCADE DELETE set up:
- Deleting a customer → deletes all their sites
- Deleting a site → deletes all materials and history for that site

But CASCADE DELETE does NOT trigger inventory updates - that's why we need the app function!

## Files Modified

- `src/lib/rental-store.ts` - Added `deleteCustomer()` function
- `src/lib/supabase-store.ts` - Added database delete function

## Next Steps

1. ✅ Delete function added to codebase
2. ⏳ Add "Delete Customer" button to UI (future update)
3. ⏳ Add confirmation dialog before deletion
4. ⏳ Show what materials will be restored before deleting
