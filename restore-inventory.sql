-- Restore Original Inventory
-- Run this in your Supabase SQL Editor to restore all inventory to original values

-- Clear existing inventory first (optional)
-- DELETE FROM inventory;

-- Insert/Update inventory for all material types
INSERT INTO inventory (material_type_id, quantity)
VALUES
  -- PLATES
  ('plate-3x2', 7500),
  ('plate-3x1', 956),
  ('plate-2x1', 248),
  ('change-plate-3x2', 1461),
  ('change-plate-3x1', 1),
  
  -- PROPS
  ('props-2x2', 2937),
  ('props-2x2.5', 650),
  ('props-2x3', 1243),
  ('props-2x3.5', 225),
  ('props-2x4', 287),
  
  -- SPAN
  ('box-span', 512),
  ('zig-zag-span', 224),
  
  -- H FRAME
  ('h-frame-with-ladder', 134),
  ('h-frame-without-ladder', 190),
  ('h-frame-1m', 20),
  ('cbp-small', 40),
  ('cbp', 50),
  ('planks', 365),
  ('base-wheels', 33),
  ('base-jack', 1218),
  
  -- SCAFFOLDING
  ('vertical-3m', 637),
  ('vertical-2.5m', 514),
  ('vertical-2m', 470),
  ('vertical-1.5m', 547),
  ('vertical-1m', 307),
  ('vertical-0.5m', 91),
  ('ledger-2m', 71),
  ('ledger-1.5m', 153),
  ('ledger-1.2m', 4686),
  ('ledger-1m', 1034),
  ('joint-pins', 1282),
  ('planks-scaffolding', 0),
  ('base-jack-scaffolding', 0),
  ('stirrup-head', 1201),
  ('base-wheels-scaffolding', 0),
  
  -- BRACING PIPE
  ('bracing-pipe-20ft', 154),
  ('bracing-pipe-10ft', 0),
  ('coupler', 591),
  
  -- C CHANNEL
  ('c-channel-3-5m', 0),
  ('c-channel-3-6m', 16),
  ('c-channel-4-3m', 0),
  ('c-channel-4-5m', 11),
  ('c-channel-4-6m', 0),
  
  -- I-SECTION
  ('i-section-5-3m', 25),
  ('i-section-5-6m', 0),
  
  -- ROUND COLUMN
  ('round-column-9', 0),
  ('round-column-12', 2),
  ('round-column-18', 2),
  
  -- EXTRA
  ('tie-rod', 0),
  ('tie-channel-2', 0),
  ('tie-channel-4', 0),
  ('anchor-nut', 0),
  
  -- CONCRETING
  ('electric-mixer', 3),
  ('wheel-barrow', 0),
  ('concreting-tray', 1),
  ('material-lift', 0)
ON CONFLICT (material_type_id) 
DO UPDATE SET quantity = EXCLUDED.quantity;

-- Verify the restoration
SELECT 
  material_type_id,
  quantity,
  'Restored' as status
FROM inventory
ORDER BY material_type_id;

-- Summary
SELECT 
  COUNT(*) as total_material_types,
  SUM(quantity) as total_items_in_stock
FROM inventory;
