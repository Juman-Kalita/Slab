# Grace Period Logic

## How Grace Period Works

The grace period is tied to the **ORIGINAL SITE ISSUE DATE**, not individual materials.

### Scenario 1: New Site
When you create a new site and issue materials:
- Grace period starts from the site issue date
- All materials get charged for the grace period (e.g., 30 days)
- Example: Issue 10 jacks on Jan 1st → charged for 30 days

### Scenario 2: Adding Materials to Existing Site (Within Grace Period)
When you add more materials to a site that's still within its grace period:
- New materials follow the ORIGINAL site issue date
- They are charged from the original date, not from when they were added
- Example:
  - Jan 1: Issue 10 jacks (30-day grace)
  - Jan 15: Add 5 more jacks to same site
  - The 5 new jacks are charged from Jan 1 (15 days already passed)
  - They will start daily rent on Jan 31 (same as original materials)

### Scenario 3: Adding Materials to Existing Site (After Grace Period)
When you add materials to a site that's past its grace period:
- New materials are charged per day from the original site issue date
- No new grace period is given
- Example:
  - Jan 1: Issue 10 jacks (30-day grace)
  - Feb 15: Add 5 more jacks (45 days after original issue)
  - The 5 new jacks are charged for 45 days immediately
  - They follow the same daily rent cycle as original materials

## Benefits

1. **Fair Pricing**: Customers don't get multiple grace periods by adding materials gradually
2. **Consistent Billing**: All materials at a site follow the same rental cycle
3. **Simplified Accounting**: One grace period per site, not per material
4. **Prevents Gaming**: Can't extend grace period by adding materials in small batches

## Technical Implementation

The rent calculation for new materials added to existing sites:

```typescript
const daysSinceOriginalIssue = differenceInDays(new Date(issueDate), new Date(site.issueDate));
const daysToCharge = Math.max(materialType.gracePeriodDays, daysSinceOriginalIssue);
const rentCharge = quantity * materialType.rentPerDay * daysToCharge;
```

- If within grace period: charges for grace period days
- If past grace period: charges for actual days since original issue

## Example Calculations

### Example 1: Adding Within Grace Period
- Original Issue: Jan 1, 10 jacks @ ₹50/day, 30-day grace
- Original Charge: 10 × ₹50 × 30 = ₹15,000
- Add Materials: Jan 20, 5 jacks
- Days Since Original: 19 days
- New Material Charge: 5 × ₹50 × 30 = ₹7,500 (still uses grace period)
- Total Site Charge: ₹22,500

### Example 2: Adding After Grace Period
- Original Issue: Jan 1, 10 jacks @ ₹50/day, 30-day grace
- Original Charge: 10 × ₹50 × 30 = ₹15,000
- Add Materials: Feb 15, 5 jacks
- Days Since Original: 45 days
- New Material Charge: 5 × ₹50 × 45 = ₹11,250 (charged for 45 days)
- Total Site Charge: ₹26,250

## Files Modified

- `src/lib/rental-store.ts` - Updated `issueMaterials()` function to calculate rent based on original site issue date when adding to existing sites
