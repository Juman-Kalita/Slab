# Admin Customer Detail View Update

## Issue
The admin panel customer detail view is missing several features that exist in the employee dashboard:
- Top-level stats (TOTAL ISSUED, TOTAL RETURNED, CURRENTLY HELD) with clickable popovers
- Per-site stats (Total Issued, Total Returned, Currently Held) with clickable popovers  
- Detailed financial breakdown (Rent Amount, Loading Charges, Amount Deposited, Remaining Due as separate lines)
- Materials list with daily rates

## Solution
Replace the customer detail view in AdminDashboard.tsx with the complete customer detail view from Dashboard.tsx

## Files to Update
1. **Source**: `src/pages/Dashboard.tsx` - Lines ~150-750 (customer detail view when selectedCustomer is set)
2. **Target**: `src/pages/AdminDashboard.tsx` - Lines ~186-390 (current customer detail view)

## Steps
1. Copy the entire customer detail rendering section from Dashboard.tsx (the return statement when selectedCustomer exists)
2. Replace the corresponding section in AdminDashboard.tsx
3. Update the header to show "Admin Panel" instead of "Material Rental Pro"
4. Keep the Shield icon instead of HardHat icon
5. Ensure all imports are present (Popover, PopoverContent, PopoverTrigger, etc.)

## Key Sections to Copy
- Overall summary boxes with popovers (Total Issued, Total Returned, Currently Held)
- Sites list with detailed stats per site
- Per-site summary boxes with popovers
- Financial details section (Rent Amount, Loading Charges, Amount Deposited, Remaining Due)
- Materials list with quantities and daily rates
- All action buttons and dialogs

## Note
The customer detail views should be IDENTICAL between employee and admin dashboards, with only the header branding being different.
