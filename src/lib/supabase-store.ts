import { supabase } from './supabase';
import { dbToCustomer, customerToDb, siteToDb, materialToDb, historyEventToDb } from './supabase-transformers';
import type { Customer } from './rental-store';

// Fetch all customers with nested data
export async function getCustomers(): Promise<Customer[]> {
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
    console.error('Error fetching customers:', error);
    throw error;
  }

  return (data || []).map(dbToCustomer);
}

// Create a new customer with site and materials
export async function createCustomerWithSite(
  customerData: {
    name: string;
    registrationName?: string;
    contactNo?: string;
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

// Update material quantity
export async function updateMaterialQuantity(
  siteId: string,
  materialTypeId: string,
  newQuantity: number
): Promise<void> {
  const { error } = await supabase
    .from('materials')
    .update({ quantity: newQuantity })
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
  const { data, error } = await supabase
    .from('inventory')
    .select('material_type_id, quantity');

  if (error) throw error;

  const inventory: Record<string, number> = {};
  (data || []).forEach(item => {
    inventory[item.material_type_id] = item.quantity;
  });

  return inventory;
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
  const { data: current } = await supabase
    .from('inventory')
    .select('quantity')
    .eq('material_type_id', materialTypeId)
    .single();

  const currentQty = current?.quantity || 0;
  const newQty = currentQty + change;

  if (newQty < 0) return false;

  await updateInventory(materialTypeId, newQty);
  return true;
}
