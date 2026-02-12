# Slab Rental Pricing Model

## Overview
This system implements a 20-day grace period pricing model with penalties for late payment.

## Pricing Rules

### Base Pricing
- **Rate**: ₹1,000 per slab
- **Grace Period**: 20 days from issue date
- **Calculation**: Based on initial number of slabs taken
- **Partial Payments**: Allowed - system tracks total paid vs total required

### Key Features

1. **Initial Charge**
   - Customer pays for ALL slabs taken initially
   - Full payment is due within 20 days
   - Returns before FULL payment do NOT reduce the amount owed
   - Partial payments are tracked and deducted from total

2. **Grace Period (Days 1-20)**
   - Customer has 20 days to pay the full amount
   - Amount due = Initial slabs × ₹1,000
   - No penalties during this period
   - Can make partial payments

3. **After Grace Period (Day 21+)**
   - **Penalty**: ₹100 per slab per day
   - Applies to all initially taken slabs
   - Continues until FULL payment is made
   - Partial payments reduce remaining balance

4. **After Full Payment**
   - Payment clears the debt when total paid ≥ total required
   - System resets with current slabs held
   - New 20-day cycle begins automatically
   - Returned slabs are no longer charged in new cycle

## Example Scenarios

### Scenario 1: Full Payment Within Grace Period
- Day 0: Customer takes 20 slabs
- Day 10: Returns 5 slabs (still holds 15)
- Day 15: Pays full ₹20,000
- **Base Amount**: 20 × ₹1,000 = ₹20,000
- **Penalty**: ₹0 (within grace period)
- **Total Required**: ₹20,000
- **Amount Paid**: ₹20,000
- **Result**: Fully paid ✓ New cycle starts with 15 slabs

### Scenario 2: Partial Payment Within Grace Period
- Day 0: Customer takes 20 slabs
- Day 10: Pays ₹10,000 (partial)
- Day 15: Returns 5 slabs (still holds 15)
- Day 18: Still owes ₹10,000 (20,000 - 10,000)
- **Base Amount**: 20 × ₹1,000 = ₹20,000
- **Penalty**: ₹0 (within grace period)
- **Total Required**: ₹20,000
- **Amount Paid**: ₹10,000
- **Remaining Due**: ₹10,000
- **Note**: Returns don't affect the ₹10,000 still owed

### Scenario 3: Payment After Grace Period
- Day 0: Customer takes 20 slabs
- Day 10: Pays ₹10,000 (partial)
- Day 15: Returns 5 slabs (still holds 15)
- Day 25: Wants to pay remaining (5 days late)
- **Base Amount**: 20 × ₹1,000 = ₹20,000
- **Penalty**: 20 slabs × ₹100 × 5 days = ₹10,000
- **Total Required**: ₹30,000
- **Amount Paid**: ₹10,000
- **Remaining Due**: ₹20,000
- **To Complete**: Must pay ₹20,000 more

### Scenario 4: Multiple Partial Payments
- Day 0: Customer takes 20 slabs
- Day 5: Pays ₹5,000
- Day 12: Pays ₹5,000
- Day 18: Pays ₹10,000 (total = ₹20,000)
- **Result**: Fully paid ✓ New cycle starts with current slabs held

## System Features

### Dashboard
- Shows grace period status (green = within period, red = overdue)
- Displays days overdue
- Breaks down base amount and penalty separately
- Shows total required, amount paid, and remaining due
- Indicates when fully paid and new cycle started

### Record Payment
- Select any customer with slabs
- Shows calculated amount breakdown:
  - Base amount
  - Penalty (if overdue)
  - Total required
  - Already paid
  - Remaining due
- Accepts partial payments
- Automatically starts new cycle when fully paid
- Updates transaction history

### Transaction History
- Tracks all issues, returns, and payments
- Shows amounts for payment records
- Maintains complete audit trail

## Technical Implementation

### Data Structure
```typescript
interface Customer {
  initialSlabs: number;  // Slabs taken at cycle start
  amountPaid: number;    // Total paid in current cycle
  issueDate: string;     // Start of current cycle
  slabsHeld: number;     // Current slabs with customer
  // ... other fields
}
```

### Calculation Logic
- Grace period: 20 days
- Base price: ₹1,000 per slab
- Penalty: ₹100 per slab per day after grace period
- Total required = base + penalty
- Remaining due = total required - amount paid
- Fully paid when: amount paid ≥ total required
- On full payment: Reset cycle with current slabs held
