# Payment vs Deposit Feature

## What Changed

We've separated "Payment" and "Deposit" into two distinct features:

### 🏗️ Site Payment (Record Site Payment)
- **Purpose:** Pay for a specific site's charges
- **How it works:**
  1. Select customer
  2. Select which site to pay for
  3. Enter amount
  4. Amount is applied to that site's dues
  5. Any excess goes to customer's advance deposit

### 💰 Advance Deposit (Add Deposit)
- **Purpose:** Add money to customer's general deposit
- **How it works:**
  1. Select customer
  2. Enter any amount
  3. Money is stored as "Advance Deposit"
  4. Can be used for ANY site of that customer
  5. Automatically applied when issuing materials or making payments

## UI Changes

### Dashboard - Main View
**New Buttons:**
- "Record Site Payment" (blue outline) - For site-specific payments
- "Add Deposit" (green solid) - For general deposits

### Customer Detail View
**Prominent Deposit Display:**
- Large green card showing advance deposit amount
- Shows "Available for any site"
- Visible at top of customer page

**Action Buttons:**
- "Record Return" - Return materials
- "Record Site Payment" - Pay for specific site
- "Add Deposit" - Add to advance deposit (green button)
- "View Inventory" - Check stock

### Deposit Card Design
```
┌─────────────────────────────┐
│ 💰 ADVANCE DEPOSIT          │
│                             │
│    ₹50,000                  │
│                             │
│ Available for any site      │
└─────────────────────────────┘
```

## How Advance Deposit Works

### When Adding Deposit:
1. Customer deposits ₹10,000
2. Goes to "Advance Deposit" balance
3. Shows in green card on customer page

### When Issuing Materials:
1. System calculates charges (rent + LC)
2. Automatically uses advance deposit if available
3. Reduces deposit balance
4. Shows in payment history as "Advance Deposit"

### When Making Site Payment:
1. If customer has advance deposit
2. System uses it first for the site
3. Then applies the new payment
4. Any excess goes back to advance deposit

## Example Scenario

**Customer: Juman Kalita**

**Step 1: Add Deposit**
- Juman deposits ₹50,000
- Advance Deposit: ₹50,000

**Step 2: Issue Materials to Site A**
- Charges: ₹30,000
- System auto-uses ₹30,000 from deposit
- Advance Deposit: ₹20,000

**Step 3: Issue Materials to Site B**
- Charges: ₹25,000
- System auto-uses ₹20,000 from deposit
- Remaining due for Site B: ₹5,000
- Advance Deposit: ₹0

**Step 4: Make Site Payment for Site B**
- Pay ₹10,000 for Site B
- ₹5,000 clears Site B dues
- ₹5,000 goes to Advance Deposit
- Advance Deposit: ₹5,000

## Benefits

✅ **Clear Separation:** Payment vs Deposit are distinct
✅ **Flexibility:** Deposit can be used for any site
✅ **Visibility:** Large green card shows deposit clearly
✅ **Automatic:** Deposit auto-applies when needed
✅ **Tracking:** All transactions recorded in history

## Files Modified

1. `src/components/RecordDepositDialog.tsx` - NEW: Deposit dialog
2. `src/components/RecordPaymentDialog.tsx` - Updated: Site payment only
3. `src/pages/Dashboard.tsx` - Updated: Added deposit button and display

## Database

No changes needed! Uses existing `advance_deposit` field in customers table.
