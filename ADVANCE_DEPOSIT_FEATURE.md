# Advance Deposit Feature

## Overview
The advance deposit system allows customers to pay more than their current dues, with the excess amount stored as a customer-level advance deposit that automatically applies to future transactions.

## How It Works

### 1. Recording Payments
When a customer makes a payment through the "Record Payment/Deposit" dialog:
- The system first checks if the customer has any existing advance deposit
- Existing advance is automatically applied to the site's dues
- The new payment amount is then applied
- Any excess payment (amount > remaining dues) is stored as customer advance deposit

### 2. Automatic Application
The advance deposit is automatically applied in two scenarios:

#### A. When Recording New Payments
- Existing advance deposit is applied first before the new payment
- Shown in the payment dialog with green highlighting
- Customer can see their current advance balance before making payment

#### B. When Issuing New Materials
- When materials are issued to an existing customer (new or existing site)
- The system automatically deducts from the customer's advance deposit
- Applied to cover rent charges and loading charges
- Customer sees a notification in the Issue Materials dialog showing their advance balance

### 3. Visual Indicators

#### Customer Detail Page
- Green highlighted box next to customer name shows advance deposit amount
- Only displayed when advance deposit > 0

#### Payment Dialog
- Shows current advance balance in green box
- Warns when payment will create excess with message about saving as advance
- Example: "Excess ₹4,000 will be saved as advance deposit for future use"

#### Issue Materials Dialog
- Shows notification when customer has advance deposit
- Indicates that advance will be automatically applied
- Example: "✓ Customer has advance deposit of ₹4,000 - This will be automatically applied to the new materials"

## Example Scenario

### Initial State
- Customer owes ₹1,000 for Site A
- Customer has no advance deposit

### Customer Pays ₹5,000
- ₹1,000 applied to Site A (fully paid)
- ₹4,000 stored as customer advance deposit

### Customer Issues Materials to Site B
- New materials cost ₹3,000 (rent + loading charges)
- System automatically applies ₹3,000 from advance deposit
- Site B shows ₹3,000 as "Amount Deposited"
- Customer advance deposit reduced to ₹1,000

### Customer Issues Materials to Site C
- New materials cost ₹2,000
- System automatically applies ₹1,000 from advance deposit
- Site C shows ₹1,000 as "Amount Deposited"
- Customer advance deposit reduced to ₹0
- Customer still owes ₹1,000 for Site C

## Benefits
1. **Flexibility**: Customers can pay in advance without worrying about exact amounts
2. **Convenience**: No need to calculate exact dues - just pay what's convenient
3. **Automatic**: System handles all the calculations and applications automatically
4. **Transparent**: Clear visual indicators show advance balance at all times
5. **Multi-site Support**: Advance deposit works across all customer sites

## Technical Implementation
- Stored at customer level in `Customer.advanceDeposit` field
- Applied in `recordPayment()` function before new payments
- Applied in `issueMaterials()` function when issuing to existing customers
- Persisted in localStorage with all customer data
