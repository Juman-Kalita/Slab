# Grace Period End Date Feature

## Overview
Added a custom "End Date" field to explicitly define when the grace period ends, replacing the automatic calculation based on material type grace period days. This gives more flexibility in setting grace periods per site.

## Changes Made

### 1. Database Schema
- **File**: `add-grace-period-end-date.sql`
- Added `grace_period_end_date` DATE column to `sites` table
- Added index for better query performance
- Optional field - if not set, falls back to material type grace period calculation

### 2. Data Model Updates
- **File**: `src/lib/rental-store.ts`
  - Updated `Site` interface to include `gracePeriodEndDate?: string`
  - Updated `issueMaterials` function to accept `gracePeriodEndDate` parameter
  - Updated `calculateSiteRent` function to use `gracePeriodEndDate` if provided

### 3. Grace Period Calculation Logic
- **File**: `src/lib/rental-store.ts` - `calculateSiteRent` function
  - **If `gracePeriodEndDate` is set**:
    - Grace period = Issue Date to End Date
    - Days overdue = Days after End Date
    - Within grace period = Current date ≤ End Date
  - **If `gracePeriodEndDate` is NOT set** (backward compatibility):
    - Falls back to material type's `gracePeriodDays`
    - Calculates as before: Issue Date + grace period days

### 4. Database Transformers
- **File**: `src/lib/supabase-transformers.ts`
  - Updated `dbToSite` to map `grace_period_end_date` from database
  - Updated `siteToDb` to map `gracePeriodEndDate` to database

### 5. Database Store Functions
- **File**: `src/lib/supabase-store.ts`
  - Updated `createCustomerWithSite` function signature to accept `gracePeriodEndDate`
  - Updated `addSiteToCustomer` function signature to accept `gracePeriodEndDate`

### 6. UI Components

#### IssueMaterialsDialog
- **File**: `src/components/IssueMaterialsDialog.tsx`
- Added `gracePeriodEndDate` state variable
- Added "End Date (Grace Period End)" field next to Issue Date
- Two-column layout for Issue Date and End Date
- End Date field has `min` attribute set to Issue Date (prevents selecting date before issue)
- Helper text: "After this date, additional rent charges apply daily"
- Passes `gracePeriodEndDate` to `issueMaterials` function
- Resets field on form submission

### 7. Invoice Generator
- **File**: `src/lib/invoice-generator.ts`
- Updated Terms & Condition section
- **If site has `gracePeriodEndDate`**: Shows "Grace period ends: [formatted date]"
- **If no `gracePeriodEndDate`**: Shows "Grace period: X days from issue date" (backward compatibility)

## User Experience

### Setting Grace Period
1. When issuing materials, user sees two date fields:
   - **Issue Date (Grace Period Start)**: When materials are issued
   - **End Date (Grace Period End)**: When grace period ends (optional)

2. End Date field:
   - Optional - can be left blank
   - If blank, system uses material type's grace period days
   - Cannot be before Issue Date (validation)
   - Clear helper text explains what happens after this date

### Rent Calculation
- **During grace period** (Issue Date to End Date):
  - Only base rent for grace period is charged
  - No additional daily charges

- **After grace period** (After End Date):
  - Additional rent accumulates daily
  - Calculation: Daily rate × Quantity × Days after End Date
  - Shows as "Additional Rent (X days after grace period)" in invoice

### Invoice Display
- Terms section shows either:
  - "Grace period ends: 15 Mar 2026" (if End Date is set)
  - "Grace period: 30 days from issue date" (if End Date not set)

## Technical Details

### Data Structure
```typescript
interface Site {
  // ... other fields
  issueDate: string; // Grace period start
  gracePeriodEndDate?: string; // Grace period end (optional)
}
```

### Database Storage
- Column: `grace_period_end_date` (DATE type)
- Nullable - optional field
- Indexed for query performance

### Backward Compatibility
- Existing sites without `gracePeriodEndDate` continue to work
- System falls back to material type grace period calculation
- No data migration needed for existing sites
- New sites can optionally use the End Date feature

### Calculation Example
**Scenario 1: With End Date**
- Issue Date: March 1, 2026
- End Date: March 31, 2026
- Current Date: April 5, 2026
- Grace Period: 30 days (March 1-31)
- Days Overdue: 5 days (April 1-5)
- Additional Rent: Daily rate × Quantity × 5

**Scenario 2: Without End Date (Legacy)**
- Issue Date: March 1, 2026
- Material Type Grace Period: 30 days
- Current Date: April 5, 2026
- Grace Period: 30 days (calculated)
- Days Overdue: 5 days
- Additional Rent: Daily rate × Quantity × 5

## Benefits

1. **Flexibility**: Set custom grace periods per site, not tied to material type
2. **Clarity**: Explicit end date is clearer than "X days from issue"
3. **Business Logic**: Can negotiate different grace periods with different customers
4. **Backward Compatible**: Existing sites continue to work without changes
5. **User-Friendly**: Simple date picker interface, clear labels and helper text
