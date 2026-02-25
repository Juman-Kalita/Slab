# Supabase Implementation Guide

## Prerequisites ✅
- [x] Supabase project created
- [x] Database tables created
- [x] Environment variables set (.env.local)
- [x] @supabase/supabase-js installed
- [x] supabase.ts client configured

## Step-by-Step Implementation

### Step 1: Create Supabase Data Access Layer

Create `src/lib/supabase-store.ts` with these functions:

#### Core Functions to Implement:
1. **getCustomers()** - Fetch all customers with their sites, materials, and history
2. **createCustomer()** - Insert new customer
3. **updateCustomer()** - Update customer details
4. **issueMaterials()** - Create site, materials, and history records
5. **recordReturn()** - Update materials and create history
6. **recordPayment()** - Update site payment and create history
7. **getInventory()** - Fetch all inventory
8. **updateInventory()** - Update inventory quantities

#### Key Considerations:
- All functions must be `async`
- Use Supabase's `.select()`, `.insert()`, `.update()`, `.delete()`
- Handle nested data with joins: `.select('*, sites(*, materials(*), history_events(*))')`
- Transform snake_case (DB) ↔ camelCase (App)
- Add proper error handling with try/catch

### Step 2: Update rental-store.ts

Replace localStorage calls with Supabase calls:

```typescript
// OLD (localStorage)
export function getCustomers(): Customer[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

// NEW (Supabase)
export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*, sites(*, materials(*), history_events(*))');
  
  if (error) throw error;
  return transformToCustomers(data);
}
```

### Step 3: Update All Components

Add async/await to all data operations:

#### Dashboard.tsx
```typescript
// Add loading state
const [loading, setLoading] = useState(true);
const [customers, setCustomers] = useState<Customer[]>([]);

// Fetch data on mount
useEffect(() => {
  async function loadData() {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }
  loadData();
}, [refreshKey]);

// Show loading state
if (loading) return <div>Loading...</div>;
```

#### IssueMaterialsDialog.tsx
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  
  try {
    await issueMaterials(...);
    toast.success("Materials issued!");
    onSuccess();
  } catch (error) {
    toast.error("Failed to issue materials");
  } finally {
    setSubmitting(false);
  }
};
```

### Step 4: Data Transformation Helpers

Create helper functions to transform between DB and App formats:

```typescript
// src/lib/supabase-transformers.ts

export function dbToCustomer(dbCustomer: any): Customer {
  return {
    id: dbCustomer.id,
    name: dbCustomer.name,
    registrationName: dbCustomer.registration_name,
    contactNo: dbCustomer.contact_no,
    aadharPhoto: dbCustomer.aadhar_photo,
    address: dbCustomer.address,
    referral: dbCustomer.referral,
    createdDate: dbCustomer.created_date,
    advanceDeposit: parseFloat(dbCustomer.advance_deposit || 0),
    sites: dbCustomer.sites?.map(dbToSite) || []
  };
}

export function customerToDb(customer: Customer): any {
  return {
    id: customer.id,
    name: customer.name,
    registration_name: customer.registrationName,
    contact_no: customer.contactNo,
    aadhar_photo: customer.aadharPhoto,
    address: customer.address,
    referral: customer.referral,
    created_date: customer.createdDate,
    advance_deposit: customer.advanceDeposit
  };
}

// Similar functions for Site, Material, HistoryEvent
```

### Step 5: Handle Inventory Initialization

Create a script to initialize inventory in Supabase:

```typescript
// src/lib/init-inventory.ts
import { supabase } from './supabase';
import { MATERIAL_TYPES } from './rental-store';

export async function initializeInventory() {
  const inventoryData = MATERIAL_TYPES.map(mt => ({
    material_type_id: mt.id,
    quantity: mt.inventory
  }));

  const { error } = await supabase
    .from('inventory')
    .upsert(inventoryData);

  if (error) throw error;
}
```

### Step 6: Add Loading States to UI

Update all components with loading indicators:

```typescript
// Add to each dialog
const [submitting, setSubmitting] = useState(false);

// Disable buttons while submitting
<Button type="submit" disabled={submitting}>
  {submitting ? "Processing..." : "Submit"}
</Button>
```

### Step 7: Error Handling

Add comprehensive error handling:

```typescript
try {
  await someSupabaseOperation();
} catch (error) {
  console.error('Supabase error:', error);
  if (error.message.includes('duplicate')) {
    toast.error('Record already exists');
  } else if (error.message.includes('foreign key')) {
    toast.error('Related record not found');
  } else {
    toast.error('Operation failed. Please try again.');
  }
}
```

### Step 8: Testing Checklist

Test each operation:
- [ ] Login works
- [ ] Dashboard loads customers
- [ ] Issue materials creates records
- [ ] Record return updates materials
- [ ] Record payment updates site
- [ ] Inventory updates correctly
- [ ] Advance deposit works
- [ ] Payment methods are saved
- [ ] Multi-site support works
- [ ] Search and filters work
- [ ] Invoice generation works

### Step 9: Deploy to Vercel

1. Push code to GitHub
2. Go to Vercel dashboard
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy
5. Test production site

### Step 10: Data Migration (Optional)

If you have existing localStorage data:

```typescript
// src/lib/migrate-data.ts
export async function migrateLocalStorageToSupabase() {
  const localData = localStorage.getItem('rental_customers');
  if (!localData) return;

  const customers = JSON.parse(localData);
  
  for (const customer of customers) {
    await createCustomerInSupabase(customer);
  }
  
  console.log('Migration complete!');
}
```

## Common Issues & Solutions

### Issue 1: "Cannot read property of undefined"
**Solution:** Add null checks and optional chaining
```typescript
const sites = customer?.sites || [];
```

### Issue 2: "Row Level Security policy violation"
**Solution:** Check RLS policies in Supabase dashboard

### Issue 3: "Foreign key constraint violation"
**Solution:** Ensure parent records exist before creating child records

### Issue 4: "Data not refreshing"
**Solution:** Call `onSuccess()` callback to trigger refresh

## Performance Optimization

1. **Use select with specific columns** instead of `select('*')`
2. **Add indexes** on frequently queried columns
3. **Implement pagination** for large datasets
4. **Cache frequently accessed data** (like material types)
5. **Use Supabase real-time** for live updates (optional)

## Security Best Practices

1. **Never expose service_role key** in frontend
2. **Use RLS policies** to restrict data access
3. **Validate data** on both client and server
4. **Sanitize user inputs** before storing
5. **Use HTTPS** in production

## Next Steps After Implementation

1. Add user authentication (Supabase Auth)
2. Implement real-time updates
3. Add data export/backup features
4. Create admin dashboard
5. Add analytics and reporting

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Supabase JS Client: https://supabase.com/docs/reference/javascript
- React Query (for better data fetching): https://tanstack.com/query

## Estimated Timeline

- **Day 1**: Create supabase-store.ts (2-3 hours)
- **Day 2**: Update components with async (2-3 hours)
- **Day 3**: Testing and bug fixes (2-3 hours)
- **Day 4**: Deploy and verify (1 hour)

**Total: 7-10 hours of focused development**

## Ready to Start?

In your next session, tell Kiro:
"I want to implement Supabase integration following the SUPABASE_IMPLEMENTATION_GUIDE.md. Let's start with Step 1: Create supabase-store.ts"

Good luck! 🚀
