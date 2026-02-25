# Site Summary Boxes Update

## What Changed

The three summary boxes (Total Issued, Total Returned, Currently Held) have been:
1. ✅ **Moved to the top** of each site card (right after site name and issue date)
2. ✅ **Total Issued box is now interactive** - Click to see detailed breakdown

## New Features

### Interactive "Total Issued" Box
- **Click the box** to see a popup with detailed breakdown
- Shows all issued materials with:
  - Material name and size
  - Quantity issued
  - Date of issue
- Scrollable list if many items
- Total at the bottom

### Visual Layout

```
┌─────────────────────────────────────────────────┐
│  Site Name                        Issue Date     │
│  Location                         [Invoice]      │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ TOTAL    │  │ TOTAL    │  │CURRENTLY │     │
│  │ ISSUED   │  │ RETURNED │  │  HELD    │     │
│  │   100    │  │    0     │  │   100    │     │
│  │ items    │  │  items   │  │  items   │     │
│  │ Click... │  │          │  │          │     │
│  └──────────┘  └──────────┘  └──────────┘     │
├─────────────────────────────────────────────────┤
│  [Shipping Details if any]                      │
│  [Financial Summary]                            │
│  [Payment History]                              │
│  [Materials Currently at Site]                  │
└─────────────────────────────────────────────────┘
```

## How to Use

1. **View Site Details:**
   - Click on any customer
   - Scroll to their sites

2. **See Summary:**
   - Three boxes are now at the top of each site card
   - Blue box = Total Issued
   - Green box = Total Returned
   - Orange box = Currently Held

3. **View Issued Details:**
   - Click on the blue "Total Issued" box
   - Popup shows breakdown of all issued materials
   - See what was issued and when
   - Scroll if many items

## Example Popup Content

When you click "Total Issued":

```
┌─────────────────────────────────────┐
│ Issued Materials Breakdown          │
├─────────────────────────────────────┤
│ Plates (3'x2')          50 items    │
│ 15 Feb 2026                         │
├─────────────────────────────────────┤
│ Props (2mx2m)           30 items    │
│ 20 Feb 2026                         │
├─────────────────────────────────────┤
│ H-Frame (With Ladder)   20 items    │
│ 25 Feb 2026                         │
├─────────────────────────────────────┤
│ Total:                  100 items   │
└─────────────────────────────────────┘
```

## Benefits

✅ **Quick Overview:** See summary immediately at top
✅ **Detailed Breakdown:** Click to see what was issued
✅ **Better Organization:** Most important info first
✅ **Easy to Scan:** Color-coded boxes
✅ **Historical Data:** See all issue dates

## Files Modified

- `src/pages/Dashboard.tsx` - Updated site card layout and added interactive popup

## Technical Details

- Uses Popover component for the detailed view
- Filters history for "Issued" events
- Shows material type, quantity, and date
- Scrollable for long lists
- Maintains total calculation
