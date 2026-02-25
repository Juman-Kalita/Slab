import { supabase } from './supabase';
import { MATERIAL_TYPES } from './rental-store';

// Initialize inventory in Supabase from MATERIAL_TYPES
export async function initializeInventory() {
  const inventoryData = MATERIAL_TYPES.map(mt => ({
    material_type_id: mt.id,
    quantity: mt.inventory
  }));

  const { error } = await supabase
    .from('inventory')
    .upsert(inventoryData, {
      onConflict: 'material_type_id'
    });

  if (error) {
    console.error('Error initializing inventory:', error);
    throw error;
  }

  console.log('Inventory initialized successfully');
}

// Call this once to set up inventory
if (typeof window !== 'undefined') {
  // Only run in browser
  initializeInventory().catch(console.error);
}
