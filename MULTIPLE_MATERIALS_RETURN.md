# Multiple Materials Return Feature

## Overview
Enhanced the Record Material Return dialog to support returning multiple different material types in a single transaction, similar to how the Issue Materials dialog works.

## Problem Solved
Previously, if a customer returned multiple material types at once (e.g., 10 slabs + 5 beams), you had to:
1. Open the return dialog
2. Select material type and enter quantity
3. Submit
4. Repeat steps 1-3 for each material type

This was time-consuming and inefficient for bulk returns.

## New Features

### 1. Multiple Material Lines
- Add multiple material types in a single return transaction
- Each material line has its own:
  - Material type selector
  - Quantity returned field
  - Quantity lost field
  - Own labor checkbox

### 2. Dynamic Material Management
- **Add Material Button**: Click to add more material lines
- **Remove Button**: Delete individual material lines (minimum 1 required)
- Each line is independent with its own settings

### 3. Smart Validation
- Validates each material line separately
- Checks that quantities don't exceed available stock
- Ensures at least one material has quantity > 0
- Prevents negative quantities

### 4. Batch Processing
- All materials are processed in a single submission
- Success message shows total items returned and count of material types
- Example: "Successfully recorded return of 15 items (3 lost) across 2 material type(s)"

## User Interface

### Material Line Card
Each material line appears in a card with:
- Material type dropdown (shows available materials with current quantities)
- Material info box (total held, return LC&ULC, lost item penalty)
- Quantity returned input
- Quantity lost input
- Own labor checkbox
- Remove button (if more than 1 line exists)

### Layout
```
┌─────────────────────────────────────────┐
│ Customer: [Selected Customer]          │
│ Site: [Selected Site]                  │
│ Return Date: [Date Picker]             │
│                                         │
│ Materials to Return    [+ Add Material] │
│                                         │
│ ┌─ Material 1 ──────────────────── [×] │
│ │ Material Type: [Dropdown]            │
│ │ [Info Box: held, LC&ULC, penalty]    │
│ │ Qty Returned: [__] Qty Lost: [__]    │
│ │ ☐ Customer brings own labor          │
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─ Material 2 ──────────────────── [×] │
│ │ Material Type: [Dropdown]            │
│ │ [Info Box: held, LC&ULC, penalty]    │
│ │ Qty Returned: [__] Qty Lost: [__]    │
│ │ ☐ Customer brings own labor          │
│ └─────────────────────────────────────┘│
│                                         │
│              [Cancel] [Record Return]   │
└─────────────────────────────────────────┘
```

## Usage Example

### Scenario: Customer returns multiple materials
Customer "ABC Construction" returns materials from "Site A":
- 10 Slabs (8 returned, 2 lost)
- 5 Beams (all 5 returned, none lost)
- Customer brings own labor for beams only

### Steps:
1. Click "Record Return" button
2. Select customer: "ABC Construction"
3. Select site: "Site A"
4. Select return date (defaults to today)
5. First material line:
   - Material Type: "Slab (6x4)"
   - Quantity Returned: 8
   - Quantity Lost: 2
   - Own Labor: Unchecked
6. Click "+ Add Material" button
7. Second material line:
   - Material Type: "Beam (10ft)"
   - Quantity Returned: 5
   - Quantity Lost: 0
   - Own Labor: Checked ✓
8. Click "Record Return"
9. Success: "Successfully recorded return of 13 items (2 lost) across 2 material type(s)"

## Technical Implementation

### Data Structure
```typescript
interface MaterialReturnLine {
  id: string;                    // Unique identifier for React keys
  materialTypeId: string;        // Selected material type
  quantityReturned: string;      // Number of items returned
  quantityLost: string;          // Number of items lost
  hasOwnLabor: boolean;          // Whether customer brings own labor
}
```

### Processing Flow
1. User fills out multiple material lines
2. On submit, validate all lines
3. Filter out empty lines (no material selected or all quantities zero)
4. For each valid line:
   - Call `recordReturn()` function
   - Update inventory
   - Add history event
   - Track success count
5. Show summary toast with totals

### Code Changes
- `RecordMaterialReturnDialog.tsx`: Complete rewrite to support material lines array
- Added `MaterialReturnLine` interface
- Added `addMaterialLine()`, `removeMaterialLine()`, `updateMaterialLine()` functions
- Updated form validation to handle multiple materials
- Enhanced success message to show totals

## Benefits

### Time Savings
- Record 5 material types in one transaction instead of 5 separate transactions
- Reduces clicks and form filling

### Better UX
- Matches the familiar pattern from Issue Materials dialog
- Consistent interface across the app
- Clear visual separation between material lines

### Accuracy
- All materials recorded with same return date
- Less chance of forgetting to record a material
- Batch operation reduces errors

### Flexibility
- Each material can have different settings (own labor, lost quantities)
- Easy to add or remove materials before submitting
- No minimum or maximum limit on material types

## Validation Rules

1. **At least one material**: Must have at least one material line with valid data
2. **Valid quantities**: Returned + Lost must be > 0 for each material
3. **Stock check**: Cannot return more than currently held at site
4. **No negatives**: Quantities cannot be negative
5. **Material selection**: Each line must have a material type selected

## Error Messages

- "Please select a customer and site" - Missing required fields
- "Please add at least one material to return" - No valid material lines
- "Quantities cannot be negative" - Invalid quantity entered
- "Each material must have returned or lost quantity greater than 0" - Empty line
- "[Material Name]: Cannot return more than X items" - Exceeds available stock

## Future Enhancements (Potential)

1. **Bulk Actions**: Select all materials at once with same settings
2. **Templates**: Save common return patterns
3. **Barcode Scanning**: Scan materials to auto-fill quantities
4. **Photo Upload**: Attach photos of returned materials
5. **Damage Notes**: Add notes about condition of returned items
6. **Auto-calculate**: Suggest quantities based on site history

## Compatibility

- Works with existing `recordReturn()` function (no backend changes needed)
- Compatible with all material types
- Supports pre-selected customer mode
- Works with return date selection feature
- Integrates with inventory restoration

## Testing Checklist

- [ ] Add multiple material lines
- [ ] Remove material lines
- [ ] Submit with valid data
- [ ] Try to exceed available quantity
- [ ] Submit with empty lines (should be filtered)
- [ ] Test own labor checkbox per material
- [ ] Verify inventory updates correctly
- [ ] Check history events are created
- [ ] Test with pre-selected customer
- [ ] Verify success message shows correct totals

