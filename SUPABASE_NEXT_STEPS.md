# Supabase Integration - Next Steps

## What's Been Created ✅

1. **supabase-transformers.ts** - Data transformation helpers (DB ↔ App format)
2. **supabase-store.ts** - All Supabase data operations
3. **init-inventory.ts** - Script to initialize inventory in Supabase
4. **Database tables** - All tables created in Supabase

## What Needs to Be Done

The integration is 70% complete. Here's what remains:

### Critical: Update rental-store.ts

The `rental-store.ts` file needs to be updated to use Supabase instead of localStorage. Due to the file's size and complexity, this requires careful refactoring.

**Key changes needed:**

1. **Import Supabase functions**
```typescript
import * as SupabaseStore from './supabase-store';
```

2. **Make all functions async**
```typescript
// OLD
export function getCustomers(): Customer[] {

// NEW  
export async function getCustomers(): Promise<Customer[]> {
```

3. **Replace localStorage calls with Supabase**
```typescript
// OLD
const raw = localStorage.getItem(STORAGE_KEY);
return raw ? JSON.parse(raw) : [];

// NEW
return await SupabaseStore.getCustomers();
```

4. **Update issueMaterials() function**
- Check if customer exists
- If new: call `createCustomerWithSite()`
- If existing: call `addSiteToCustomer()`
- Update inventory with `adjustInventory()`

5. **Update recordReturn() function**
- Update material quantity with `updateMaterialQuantity()`
- Add history event with `addHistoryEvent()`
- Update inventory with `adjustInventory()`

6. **Update recordPayment() function**
- Update site payment with `updateSitePayment()`
- Update customer advance with `updateCustomerAdvanceDeposit()`
- Add history event with `addHistoryEvent()`
- Handle settlement with `updateSiteSettlement()` and `resetMaterialInitialQuantities()`

### Update All Components

Every component that uses rental-store functions needs to handle async operations:

#### Files to Update:
1. **Dashboard.tsx**
   - Add loading state
   - Use useEffect to fetch data
   - Handle errors

2. **IssueMaterialsDialog.tsx**
   - Make handleSubmit async
   - Add submitting state
   - Show loading indicator

3. **RecordMaterialReturnDialog.tsx**
   - Make handleSubmit async
   - Add submitting state

4. **RecordPaymentDialog.tsx**
   - Make handleSubmit async
   - Add submitting state

5. **AddSiteDialog.tsx**
   - Make handleSubmit async
   - Add submitting state

6. **InventoryDialog.tsx**
   - Load inventory async
   - Add loading state

### Initialize Inventory

Run this once after deployment:
```typescript
import { initializeInventory } from './lib/init-inventory';
await initializeInventory();
```

## Simplified Alternative Approach

If full migration is too complex, consider this hybrid approach:

### Option: Keep localStorage + Add Supabase Sync

1. Keep all existing localStorage code
2. Add a sync function that backs up to Supabase periodically
3. Add a restore function to load from Supabase
4. Simpler to implement, less risky

```typescript
// Sync localStorage to Supabase
export async function syncToSupabase() {
  const customers = getCustomers(); // from localStorage
  // Upload to Supabase
}

// Restore from Supabase to localStorage
export async function restoreFromSupabase() {
  const customers = await SupabaseStore.getCustomers();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}
```

## Recommended Next Session Plan

**Session 1: Core Data Layer (2-3 hours)**
1. Update rental-store.ts to use Supabase
2. Test basic operations (get, create, update)

**Session 2: Update Components (2-3 hours)**
1. Add async/await to all dialogs
2. Add loading states
3. Test user flows

**Session 3: Testing & Deployment (1-2 hours)**
1. Initialize inventory
2. Test all features
3. Deploy to Vercel
4. Add environment variables

## Quick Start Command for Next Session

Tell Kiro:
> "Continue Supabase integration. Update rental-store.ts to use the supabase-store functions. Start with getCustomers() and issueMaterials()."

## Important Notes

- The supabase-store.ts has all the database operations ready
- The transformers handle data conversion
- Main work is connecting rental-store.ts to supabase-store.ts
- All components need async/await updates

## Estimated Completion Time

- **With focused work**: 4-6 hours
- **With testing**: 6-8 hours total
- **Spread over**: 2-3 sessions

Good luck! The foundation is solid, just needs the final connections. 🚀
