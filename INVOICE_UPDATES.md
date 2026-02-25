# Invoice Generator Updates

## Changes Made

### 1. Company Branding
- Changed header from "MATERIAL RENTAL INVOICE" to "MATERIAL RENTAL PRO"
- Maintains professional appearance with company name

### 2. Grace Period Clarification
- Added note below status badge: "All materials at this site follow the original issue date"
- Shows the original site issue date for reference
- Helps customers understand why charges are calculated the way they are

### 3. Improved Financial Breakdown Labels
- "Rent Amount (Based on Grace Period)" - clearer than just "Rent Amount"
- "Issue Loading & Unloading Charges" - full description
- "Balance from Grace Period" - clearer than "Unpaid from Grace Period"
- "Return Loading & Unloading Charges" - full description
- "Lost/Damaged Items Penalty" - more descriptive

### 4. Updated Terms & Conditions
Added new terms to reflect the grace period logic:

**New Terms:**
- "Grace period is based on the ORIGINAL site issue date, not individual materials"
- "Materials added later follow the same grace period as the original site"
- "Custom loading charges may apply based on distance and circumstances"

**Existing Terms (Updated):**
- "Late payment penalty: ₹10 per item per day after grace period expires"
- "Returns before full payment do not reduce the amount owed for the grace period"
- "Lost items are charged at the penalty rate specified per material type"
- "Loading/Unloading charges apply unless customer provides own labor"

## Benefits

1. **Transparency**: Customers clearly understand that all materials follow the original site date
2. **Clarity**: Better labeling of charges makes invoices easier to understand
3. **Professionalism**: Updated branding and clear terms improve business image
4. **Legal Protection**: Clear terms about grace period logic prevent disputes

## Example Invoice Sections

### Status Badge (Within Grace Period)
```
[Green Badge: Within Grace Period]
Note: All materials at this site follow the original issue date (01 Jan 2024)
```

### Status Badge (Overdue)
```
[Red Badge: Overdue by 15 days]
Note: All materials at this site follow the original issue date (01 Jan 2024)
```

### Financial Breakdown Example
```
Rent Amount (Based on Grace Period)          ₹15,000
Issue Loading & Unloading Charges            ₹2,000
Late Penalty (15 days overdue)               ₹1,500
Subtotal                                     ₹18,500
Less: Amount Paid                            -₹10,000
Balance from Grace Period                    ₹8,500

Additional Charges:
Return Loading & Unloading Charges           ₹1,000
Lost/Damaged Items Penalty                   ₹500

TOTAL AMOUNT DUE: ₹10,000
```

## Files Modified

- `src/lib/invoice-generator.ts` - Updated invoice generation logic and layout

## Testing Recommendations

1. Generate invoice for site within grace period
2. Generate invoice for site past grace period
3. Generate invoice for site with materials added at different times
4. Verify all terms are visible and readable
5. Check that the note about original issue date appears correctly
