import { supabase } from './supabase';
import { dbToCustomer, customerToDb, siteToDb, materialToDb, historyEventToDb } from './supabase-transformers';
import type { Customer } from './rental-store';
import { MATERIAL_TYPES } from './rental-store';

// Fetch all customers with nested data
export async function getCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        sites (
          *,
          materials (*),
          history_events (*)
        )
      `)
      .order('created_date', { ascending: false });

    if (error) {
      console.error('Error fetching customers from Supabase:', error);
      // Return empty array if tables don't exist yet
      return [];
    }

    return (data || []).map(dbToCustomer);
  } catch (error) {
    console.error('Supabase connection error:', error);
    return [];
  }
}

// Create a new customer with site and materials
export async function createCustomerWithSite(
  customerData: {
    name: string;
    registrationName?: string;
    contactNo?: string;
    spareContactNo?: string;
    aadharPhoto?: string;
    address?: string;
    referral?: string;
  },
  siteData: {
    siteName: string;
    location: string;
    issueDate: string;
    originalRentCharge: number;
    originalIssueLC: number;
  },
  materials: Array<{
    materialTypeId: string;
    quantity: number;
    initialQuantity: number;
    issueDate: string;
    hasOwnLabor: boolean;
  }>,
  historyEvents: Array<{
    date: string;
    action: 'Issued' | 'Payment';
    materialTypeId?: string;
    quantity?: number;
    amount?: number;
    hasOwnLabor?: boolean;
    paymentMethod?: string;
  }>
): Promise<string> {
  // Insert customer
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert(customerToDb({
      name: customerData.name,
      registrationName: customerData.registrationName,
      contactNo: customerData.contactNo,
      spareContactNo: customerData.spareContactNo,
      aadharPhoto: customerData.aadharPhoto,
      address: customerData.address,
      referral: customerData.referral,
      createdDate: new Date().toISOString(),
      advanceDeposit: 0
    }))
    .select()
    .single();

  if (customerError) throw customerError;

  // Insert site
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .insert(siteToDb({
      siteName: siteData.siteName,
      location: siteData.location,
      issueDate: siteData.issueDate,
      amountPaid: 0,
      lastSettlementDate: null,
      originalRentCharge: siteData.originalRentCharge,
      originalIssueLC: siteData.originalIssueLC
    }, customer.id))
    .select()
    .single();

  if (siteError) throw siteError;

  // Insert materials
  const materialsToInsert = materials.map(m => materialToDb(m, site.id));
  const { error: materialsError } = await supabase
    .from('materials')
    .insert(materialsToInsert);

  if (materialsError) throw materialsError;

  // Insert history events
  const eventsToInsert = historyEvents.map(e => historyEventToDb(e, site.id));
  const { error: historyError } = await supabase
    .from('history_events')
    .insert(eventsToInsert);

  if (historyError) throw historyError;

  return customer.id;
}

// Add site to existing customer
export async function addSiteToCustomer(
  customerId: string,
  siteData: {
    siteName: string;
    location: string;
    issueDate: string;
    originalRentCharge: number;
    originalIssueLC: number;
    amountPaid?: number;
  },
  materials: Array<{
    materialTypeId: string;
    quantity: number;
    initialQuantity: number;
    issueDate: string;
    hasOwnLabor: boolean;
  }>,
  historyEvents: Array<{
    date: string;
    action: 'Issued' | 'Payment';
    materialTypeId?: string;
    quantity?: number;
    amount?: number;
    hasOwnLabor?: boolean;
    paymentMethod?: string;
  }>
): Promise<string> {
  // Insert site
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .insert(siteToDb({
      siteName: siteData.siteName,
      location: siteData.location,
      issueDate: siteData.issueDate,
      amountPaid: siteData.amountPaid || 0,
      lastSettlementDate: null,
      originalRentCharge: siteData.originalRentCharge,
      originalIssueLC: siteData.originalIssueLC
    }, customerId))
    .select()
    .single();

  if (siteError) throw siteError;

  // Insert materials
  const materialsToInsert = materials.map(m => materialToDb(m, site.id));
  const { error: materialsError } = await supabase
    .from('materials')
    .insert(materialsToInsert);

  if (materialsError) throw materialsError;

  // Insert history events
  const eventsToInsert = historyEvents.map(e => historyEventToDb(e, site.id));
  const { error: historyError } = await supabase
    .from('history_events')
    .insert(eventsToInsert);

  if (historyError) throw historyError;

  return site.id;
}

// Update material initial quantity
export async function updateMaterialInitialQuantity(
  siteId: string,
  materialTypeId: string,
  newInitialQuantity: number
): Promise<void> {
  const { error } = await supabase
    .from('materials')
    .update({ initial_quantity: newInitialQuantity })
    .eq('site_id', siteId)
    .eq('material_type_id', materialTypeId);

  if (error) throw error;
}

// Add material to existing site
export async function addMaterialToSite(
  siteId: string,
  material: {
    materialTypeId: string;
    quantity: number;
    initialQuantity: number;
    issueDate: string;
    hasOwnLabor: boolean;
  }
): Promise<void> {
  const { error } = await supabase
    .from('materials')
    .insert(materialToDb(material, siteId));

  if (error) throw error;
}

// Update site charges
export async function updateSiteCharges(
  siteId: string,
  rentCharge: number,
  issueLC: number
): Promise<void> {
  const { data: site } = await supabase
    .from('sites')
    .select('original_rent_charge, original_issue_lc')
    .eq('id', siteId)
    .single();

  const { error } = await supabase
    .from('sites')
    .update({
      original_rent_charge: (site?.original_rent_charge || 0) + rentCharge,
      original_issue_lc: (site?.original_issue_lc || 0) + issueLC
    })
    .eq('id', siteId);

  if (error) throw error;
}

// Add history event
export async function addHistoryEvent(
  siteId: string,
  event: {
    date: string;
    action: 'Issued' | 'Returned' | 'Payment';
    materialTypeId?: string;
    quantity?: number;
    amount?: number;
    hasOwnLabor?: boolean;
    quantityLost?: number;
    paymentMethod?: string;
    paymentScreenshot?: string;
    employeeId?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from('history_events')
    .insert(historyEventToDb(event, siteId));

  if (error) throw error;
}

// Update site payment
export async function updateSitePayment(
  siteId: string,
  amountPaid: number
): Promise<void> {
  const { error } = await supabase
    .from('sites')
    .update({ amount_paid: amountPaid })
    .eq('id', siteId);

  if (error) throw error;
}

// Update customer advance deposit
export async function updateCustomerAdvanceDeposit(
  customerId: string,
  advanceDeposit: number
): Promise<void> {
  const { error } = await supabase
    .from('customers')
    .update({ advance_deposit: advanceDeposit })
    .eq('id', customerId);

  if (error) throw error;
}

// Update site settlement
export async function updateSiteSettlement(
  siteId: string,
  lastSettlementDate: string
): Promise<void> {
  const { error } = await supabase
    .from('sites')
    .update({
      last_settlement_date: lastSettlementDate,
      amount_paid: 0,
      original_rent_charge: 0,
      original_issue_lc: 0
    })
    .eq('id', siteId);

  if (error) throw error;
}

// Reset material initial quantities
export async function resetMaterialInitialQuantities(siteId: string): Promise<void> {
  const { data: materials } = await supabase
    .from('materials')
    .select('id, quantity')
    .eq('site_id', siteId);

  if (!materials) return;

  for (const material of materials) {
    await supabase
      .from('materials')
      .update({ initial_quantity: material.quantity })
      .eq('id', material.id);
  }
}

// Inventory operations
export async function getInventory(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('material_type_id, quantity');

    if (error) {
      console.error('Error fetching inventory from Supabase:', error);
      // Return default inventory if table doesn't exist
      const defaultInventory: Record<string, number> = {};
      MATERIAL_TYPES.forEach(mt => {
        defaultInventory[mt.id] = mt.inventory;
      });
      return defaultInventory;
    }

    const inventory: Record<string, number> = {};
    (data || []).forEach(item => {
      inventory[item.material_type_id] = item.quantity;
    });

    // If inventory is empty, return default
    if (Object.keys(inventory).length === 0) {
      const defaultInventory: Record<string, number> = {};
      MATERIAL_TYPES.forEach(mt => {
        defaultInventory[mt.id] = mt.inventory;
      });
      return defaultInventory;
    }

    return inventory;
  } catch (error) {
    console.error('Supabase connection error:', error);
    // Return default inventory on error
    const defaultInventory: Record<string, number> = {};
    MATERIAL_TYPES.forEach(mt => {
      defaultInventory[mt.id] = mt.inventory;
    });
    return defaultInventory;
  }
}

export async function updateInventory(materialTypeId: string, quantity: number): Promise<void> {
  const { error } = await supabase
    .from('inventory')
    .upsert({
      material_type_id: materialTypeId,
      quantity: quantity
    });

  if (error) throw error;
}

export async function adjustInventory(materialTypeId: string, change: number): Promise<boolean> {
  // Get current inventory
  const { data: current, error: fetchError } = await supabase
    .from('inventory')
    .select('quantity')
    .eq('material_type_id', materialTypeId)
    .maybeSingle(); // Use maybeSingle instead of single to handle missing records

  if (fetchError) {
    console.error('Error fetching inventory:', fetchError);
    return false;
  }

  const currentQty = current?.quantity || 0;
  const newQty = currentQty + change;

  // Don't allow negative inventory
  if (newQty < 0) {
    console.warn(`Cannot adjust inventory for ${materialTypeId}: would result in negative quantity (${newQty})`);
    return false;
  }

  try {
    await updateInventory(materialTypeId, newQty);
    return true;
  } catch (error) {
    console.error('Error updating inventory:', error);
    return false;
  }
}

// Delete customer
export async function deleteCustomer(customerId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (error) {
      console.error('Error deleting customer:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    return false;
  }
}


// ============================================
// ADMIN PANEL - UPDATE FUNCTIONS
// ============================================

// Update customer basic information
export async function updateCustomer(
  customerId: string,
  updates: {
    name?: string;
    registrationName?: string;
    contactNo?: string;
    spareContactNo?: string;
    address?: string;
    referral?: string;
    aadharPhoto?: string;
  }
): Promise<boolean> {
  try {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.registrationName !== undefined) updateData.registration_name = updates.registrationName;
    if (updates.contactNo !== undefined) updateData.contact_no = updates.contactNo;
    if (updates.spareContactNo !== undefined) updateData.spare_contact_no = updates.spareContactNo;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.referral !== undefined) updateData.referral = updates.referral;
    if (updates.aadharPhoto !== undefined) updateData.aadhar_photo = updates.aadharPhoto;

    const { error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', customerId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating customer:', error);
    return false;
  }
}

// Update site information
export async function updateSite(
  siteId: string,
  updates: {
    siteName?: string;
    location?: string;
    issueDate?: string;
  }
): Promise<boolean> {
  try {
    const updateData: any = {};
    if (updates.siteName !== undefined) updateData.site_name = updates.siteName;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.issueDate !== undefined) updateData.issue_date = updates.issueDate;

    const { error } = await supabase
      .from('sites')
      .update(updateData)
      .eq('id', siteId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating site:', error);
    return false;
  }
}

// Update material quantity for a site
export async function updateMaterialQuantity(
  siteId: string,
  materialTypeId: string,
  newQuantity: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('materials')
      .update({ quantity: newQuantity })
      .eq('site_id', siteId)
      .eq('material_type_id', materialTypeId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating material quantity:', error);
    return false;
  }
}

// Delete site (and all related materials/history via cascade)
export async function deleteSite(siteId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', siteId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting site:', error);
    return false;
  }
}

// Update advance deposit
export async function updateAdvanceDeposit(
  customerId: string,
  newAmount: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('customers')
      .update({ advance_deposit: newAmount })
      .eq('id', customerId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating advance deposit:', error);
    return false;
  }
}

// Update payment record
export async function updatePaymentRecord(
  historyEventId: string,
  updates: {
    amount?: number;
    date?: string;
    paymentMethod?: string;
  }
): Promise<boolean> {
  try {
    const updateData: any = {};
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod;

    const { error } = await supabase
      .from('history_events')
      .update(updateData)
      .eq('id', historyEventId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating payment record:', error);
    return false;
  }
}

// Delete payment/history record
export async function deleteHistoryEvent(historyEventId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('history_events')
      .delete()
      .eq('id', historyEventId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting history event:', error);
    return false;
  }
}

// Set inventory to specific amount
export async function setInventory(
  materialTypeId: string,
  quantity: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('inventory')
      .upsert({
        material_type_id: materialTypeId,
        quantity: Math.max(0, quantity)
      }, {
        onConflict: 'material_type_id'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error setting inventory:', error);
    return false;
  }
}


