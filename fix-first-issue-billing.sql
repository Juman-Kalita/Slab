-- Fix billing for sites where materials were issued on the first day
-- Update originalRentCharge to use monthly rates instead of day-based calculation

-- This script recalculates the original rent charge for sites where:
-- 1. Materials were issued on the same date as the site creation (first issue)
-- 2. The charge was calculated using the old day-based formula

-- Note: You'll need to run this after updating the material monthly rates in the code
-- This is a one-time fix for existing data

-- Example: If a site has 10 Props (₹85/month each) issued on first day,
-- the originalRentCharge should be 10 × 85 = 850, not 10 × 2.83334 × 30 = 850.002

-- Manual steps needed:
-- 1. Identify sites where issue_date matches the first material issue date
-- 2. For each material issued on that date, calculate: quantity × monthlyRate
-- 3. Update the site's original_rent_charge with the new total

-- Since material types and their monthly rates are in the application code,
-- this needs to be done through the application or manually per site.

-- For your current site with 10 CBP items:
-- Old calculation: 10 × 2 × 30 = 600 (stored in database)
-- New calculation: 10 × 60 = 600 (correct!)

-- Actually, looking at your screenshot, the calculation IS correct (10 × ₹60 = ₹600)
-- But the total shows ₹15, which means there might be other issues.

-- Let me check what's in the summary boxes...
