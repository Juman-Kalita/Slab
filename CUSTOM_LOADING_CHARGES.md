# Custom Loading Charges Feature

## Overview
You can now manually input custom loading/unloading charges when issuing materials or adding new sites. This is useful when charges vary based on distance, location, or special circumstances.

## How It Works

### When Issuing Materials
1. Open the "Issue Materials" dialog
2. Add materials to a site
3. For each material, you have three options:
   - **Default LC&ULC**: Leave "Own labor" unchecked and "Custom Loading Charge" empty
   - **No LC&ULC**: Check "Own labor (No LC&ULC)" checkbox
   - **Custom LC&ULC**: Leave "Own labor" unchecked and enter a custom amount in "Custom Loading Charge"

### When Adding a New Site
1. Open the "Add New Site" dialog (from customer detail page)
2. Add materials to the site
3. Same three options as above for each material

## Examples

### Example 1: Default Loading Charges
- Material: Jack 5 Ton (₹50/day, ₹100 LC&ULC per item)
- Quantity: 10 items
- Own labor: Unchecked
- Custom Loading Charge: Empty
- **Result**: ₹1,000 loading charges (10 × ₹100)

### Example 2: Custom Loading Charges (Long Distance)
- Material: Jack 5 Ton (₹50/day, ₹100 LC&ULC per item)
- Quantity: 10 items
- Own labor: Unchecked
- Custom Loading Charge: ₹2,500
- **Result**: ₹2,500 loading charges (custom amount)

### Example 3: No Loading Charges (Own Labor)
- Material: Jack 5 Ton (₹50/day, ₹100 LC&ULC per item)
- Quantity: 10 items
- Own labor: Checked
- Custom Loading Charge: N/A (hidden)
- **Result**: ₹0 loading charges

## UI Features

- The custom loading charge input field only appears when "Own labor" is unchecked
- The placeholder shows the default amount that would be charged
- Leave the field empty to use the default calculation
- Enter any amount to override the default

## Technical Details

- Custom loading charges are stored per material issuance
- The charge is applied at the time of issuing materials
- If no custom charge is provided, the system uses: `quantity × material.loadingCharge`
- If "Own labor" is checked, loading charges are always ₹0
- Custom charges can be any positive number (including 0)

## Use Cases

1. **Distance-based charges**: Sites far from the warehouse may require higher transportation costs
2. **Bulk discounts**: Large orders might get reduced loading charges
3. **Special arrangements**: Custom deals with specific customers
4. **Regional variations**: Different areas may have different labor costs
5. **Emergency deliveries**: Rush orders might incur additional charges
