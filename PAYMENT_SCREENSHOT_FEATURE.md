# Payment Screenshot Upload Feature

## Overview
Added the ability to upload payment proof screenshots when recording deposits or payments using UPI or Bank Transfer methods.

## Features

### 1. Conditional Screenshot Upload
- Screenshot upload field only appears when payment method is "UPI" or "Bank Transfer"
- Supports all common image formats (jpg, png, etc.)
- Maximum file size: 2MB
- Images are converted to base64 and stored in the database

### 2. Affected Dialogs
- **Record Advance Deposit Dialog**: Upload screenshot when recording customer deposits
- **Record Site Payment Dialog**: Upload screenshot when recording site-specific payments

### 3. Database Changes
- Added `payment_screenshot` column to `history_events` table
- Stores base64-encoded image data
- Optional field (NULL allowed)

## Implementation Details

### Database Schema
```sql
ALTER TABLE history_events ADD COLUMN payment_screenshot TEXT;
```

### File Upload Process
1. User selects payment method (UPI or Bank Transfer)
2. File input field appears
3. User selects image file (max 2MB)
4. Image is converted to base64 format
5. Preview is shown to user
6. On submit, base64 string is stored in database

### Code Changes
- `RecordDepositDialog.tsx`: Added screenshot upload state and UI
- `RecordPaymentDialog.tsx`: Added screenshot upload state and UI
- `rental-store.ts`: Updated `recordPayment()` to accept `paymentScreenshot` parameter
- `supabase-store.ts`: Updated `addHistoryEvent()` to accept `paymentScreenshot`
- `supabase-transformers.ts`: Updated transformers to handle `paymentScreenshot`
- `HistoryEvent` interface: Added `paymentScreenshot?: string` field

## Migration

### For New Installations
- Use `supabase-setup-clean.sql` - already includes the `payment_screenshot` column

### For Existing Installations
- Run `add-payment-screenshot-column.sql` to add the column to your existing database

## Usage

### Recording Deposit with Screenshot
1. Click "Record Deposit" button
2. Select customer
3. Enter amount
4. Select payment method: "UPI" or "Bank Transfer"
5. Upload payment screenshot (optional but recommended)
6. Submit

### Recording Payment with Screenshot
1. Click "Record Payment" button
2. Select customer and site
3. Enter amount
4. Select payment method: "UPI" or "Bank Transfer"
5. Upload payment screenshot (optional but recommended)
6. Submit

## Benefits
- Proof of payment for audit purposes
- Reduces disputes with customers
- Better record keeping
- Easy verification of transactions
- Helps track digital payments

## Future Enhancements (Potential)
- Display screenshots in payment history
- Add screenshot to invoice PDF
- Compress images before storing
- Use Supabase Storage instead of base64 (for better performance with large volumes)
- Add ability to view/download screenshots from history

## Technical Notes
- Images are stored as base64 strings in TEXT column
- Base64 encoding increases storage size by ~33%
- For production with many transactions, consider migrating to Supabase Storage
- Current implementation is suitable for moderate usage
