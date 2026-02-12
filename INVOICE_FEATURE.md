# Invoice Generation Feature

## Overview
The system now includes professional PDF invoice generation for all customer transactions. Invoices are automatically generated and downloaded when recording payments, and can also be downloaded on-demand from the dashboard.

## Features

### Automatic Invoice Generation
- **On Payment**: When you record a payment, an invoice is automatically generated and downloaded
- **On-Demand**: Download invoices anytime from the customer list or detail view

### Invoice Contents

#### Header Information
- Company name: "SLAB RENTAL INVOICE"
- Invoice number (auto-generated): `INV-YYYYMMDD-XXX`
- Invoice date
- Issue date (when slabs were first issued)

#### Customer Details
- Customer name
- Customer ID
- Status badge (Within Grace Period / Overdue)

#### Itemized Breakdown
1. **Slabs Issued**
   - Quantity: Initial slabs taken
   - Rate: ₹1,000 per slab
   - Amount: Total base amount

2. **Late Payment Penalty** (if applicable)
   - Calculation: Days overdue × Slabs × ₹100/day
   - Highlighted in red

3. **Slab Status Table**
   - Initial slabs taken
   - Slabs returned
   - Slabs currently held

#### Payment Summary
- Subtotal (base amount)
- Penalty (if any)
- Total Required
- Amount Paid (in green)
- Balance Due (remaining amount)

#### Terms & Conditions
- Payment due within 20 days
- Late penalty details
- Return policy
- Cycle reset information

#### Footer
- Thank you message
- Generation timestamp

## How to Use

### Method 1: Download from Customer List
1. Go to Dashboard
2. Find the customer in the list
3. Click the download icon (📥) in the Actions column
4. Invoice PDF will be downloaded automatically

### Method 2: Download from Customer Details
1. Click on any customer to view details
2. Click "Download Invoice" button at the top
3. Invoice PDF will be downloaded automatically

### Method 3: Automatic on Payment
1. Click "Record Payment"
2. Select customer and enter amount
3. Click "Record Payment"
4. Invoice is automatically generated and downloaded
5. Success notification appears

## Invoice File Naming
Format: `Invoice_[InvoiceNumber]_[CustomerName].pdf`

Example: `Invoice_INV-20260212-456_Juman.pdf`

## Invoice Number Format
- Pattern: `INV-YYYYMMDD-XXX`
- YYYY: Year
- MM: Month
- DD: Day
- XXX: Random 3-digit number

Example: `INV-20260212-456`

## Technical Details

### Libraries Used
- **jsPDF**: PDF generation
- **jspdf-autotable**: Table formatting in PDFs

### Color Coding
- **Green**: Within grace period, amount paid
- **Red**: Overdue status, penalties
- **Blue**: Headers and primary elements
- **Gray**: Secondary information

### Invoice Sections
1. Company header with branding
2. Invoice metadata box (top right)
3. Customer billing information
4. Status badge
5. Itemized slab details table
6. Penalty breakdown (if applicable)
7. Slab status summary
8. Payment summary box
9. Terms and conditions
10. Footer with timestamp

## Benefits

### For Business Owner
- Professional documentation
- Easy record keeping
- Clear payment tracking
- Audit trail
- Customer transparency

### For Customers
- Clear breakdown of charges
- Transparent penalty calculation
- Payment history
- Professional documentation
- Easy to understand

## Future Enhancements (Potential)
- Email invoice directly to customer
- Bulk invoice generation
- Invoice history/archive
- Custom branding/logo
- Multiple payment methods tracking
- GST/Tax calculations
- Payment receipt generation
- Invoice templates customization

## Notes
- Invoices are generated client-side (no server required)
- PDFs are downloaded directly to browser's download folder
- No invoice data is stored (generated on-demand)
- Each invoice gets a unique number
- Invoices reflect real-time data at generation time
