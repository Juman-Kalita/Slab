# Grace Period Logic for Additional Materials

## Overview
When issuing additional materials to an existing site, the rent calculation depends on whether the materials are issued before or after the site's grace period end date.

## Implementation Details

### Grace Period End Date Lock
- The grace period end date is set when the FIRST materials are issued to a site
- This date is locked to the site and applies to ALL materials at that site
- The grace period end date does NOT change when additional materials are issued

### Rent Calculation for Additional Materials

#### Scenario 1: Materials Issued BEFORE Grace Period End Date
When new materials are issued to a site BEFORE the grace period end date:
- Calculate rent from the NEW material issue date to the SITE's grace period end date
- Formula: `rentCharge = quantity × rentPerDay × daysUntilGraceEnd`
- Example:
  - Site grace period ends: March 20, 2026
  - New materials issued: March 15, 2026
  - Days to charge: 5 days (March 15 to March 20)
  - Rent: quantity × rentPerDay × 5

#### Scenario 2: Materials Issued AFTER Grace Period End Date
When new materials are issued to a site AFTER the grace period end date:
- NO grace period applies to these materials
- Calculate rent per day from the issue date onwards
- Charge for minimum 1 day (the issue day itself)
- Formula: `rentCharge = quantity × rentPerDay × 1`
- Additional rent will accumulate daily as calculated in `calculateSiteRent()`
- Example:
  - Site grace period ended: March 20, 2026
  - New materials issued: March 25, 2026
  - Initial charge: quantity × rentPerDay × 1 day
  - Daily charges continue accumulating from March 25 onwards

### Backward Compatibility
For sites without a `gracePeriodEndDate` (older sites):
- Falls back to original logic
- Uses material type's grace period days
- Calculates based on days since original site issue date

## Code Location
- File: `src/lib/rental-store.ts`
- Function: `issueMaterials()` (lines 268-293)
- Logic: Checks if `site.gracePeriodEndDate` exists and compares new material issue date

## Related Functions
- `calculateSiteRent()`: Calculates ongoing daily charges after grace period
- `issueMaterials()`: Handles initial rent calculation when materials are issued

## User Impact
- Materials issued within grace period: Charged only until grace period ends
- Materials issued after grace period: Charged immediately with daily rate
- Transparent and predictable billing based on timing of material issues
