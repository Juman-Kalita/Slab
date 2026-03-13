-- Update material prices
-- Plates (3'x2') - LC&ULC: 2 -> 1.5
-- All types (3'x1') - Rent: 1 -> 1.25

-- Update Plates (3'x2') loading charge
UPDATE material_types 
SET loading_charge = 1.5
WHERE id = 'plate-3x2';

-- Update New Changed (3'x2') loading charge
UPDATE material_types 
SET loading_charge = 1.5
WHERE id = 'change-plate-3x2';

-- Update Plates (3'x1') rent per day
UPDATE material_types 
SET rent_per_day = 1.25
WHERE id = 'plate-3x1';

-- Update New Changed (3'x1') rent per day
UPDATE material_types 
SET rent_per_day = 1.25
WHERE id = 'change-plate-3x1';

-- Verify the updates
SELECT 
  id,
  name,
  size,
  rent_per_day,
  loading_charge
FROM material_types
WHERE id IN ('plate-3x2', 'change-plate-3x2', 'plate-3x1', 'change-plate-3x1')
ORDER BY id;
