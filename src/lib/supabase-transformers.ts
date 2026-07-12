import type { Customer, Site, MaterialItem, HistoryEvent } from './rental-store';

// Transform database records to app format (snake_case -> camelCase)

export function dbToCustomer(dbCustomer: any): Customer {
  return {
    id: dbCustomer.id,
    name: dbCustomer.name,
    registrationName: dbCustomer.registration_name,
    contactNo: dbCustomer.contact_no,
    contacts: dbCustomer.contacts ? JSON.parse(dbCustomer.contacts) : undefined,
    aadharPhoto: dbCustomer.aadhar_photo,
    address: dbCustomer.address,
    referral: dbCustomer.referral,
    createdDate: dbCustomer.created_date,
    advanceDeposit: parseFloat(dbCustomer.advance_deposit || 0),
    sites: dbCustomer.sites?.map(dbToSite) || []
  };
}

export function dbToSite(dbSite: any): Site {
  return {
    id: dbSite.id,
    siteName: dbSite.site_name,
    location: dbSite.location,
    issueDate: dbSite.issue_date,
    gracePeriodEndDate: dbSite.grace_period_end_date,
    materials: dbSite.materials?.map(dbToMaterial) || [],
    amountPaid: parseFloat(dbSite.amount_paid || 0),
    lastSettlementDate: dbSite.last_settlement_date,
    originalRentCharge: parseFloat(dbSite.original_rent_charge || 0),
    originalIssueLC: parseFloat(dbSite.original_issue_lc || 0),
    history: dbSite.history_events?.map(dbToHistoryEvent) || [],
    vehicleNo: dbSite.vehicle_no,
    challanNo: dbSite.challan_no,
    totalDueOverride: dbSite.total_due_override ? parseFloat(dbSite.total_due_override) : undefined,
    useOverride: dbSite.use_override || false
  };
}

export function dbToMaterial(dbMaterial: any): MaterialItem {
  return {
    materialTypeId: dbMaterial.material_type_id,
    quantity: dbMaterial.quantity,
    initialQuantity: dbMaterial.initial_quantity,
    issueDate: dbMaterial.issue_date,
    hasOwnLabor: dbMaterial.has_own_labor
  };
}

export function dbToHistoryEvent(dbEvent: any): HistoryEvent {
  return {
    id: dbEvent.id,
    date: dbEvent.date,
    action: dbEvent.action,
    siteId: dbEvent.site_id,
    materialTypeId: dbEvent.material_type_id,
    quantity: dbEvent.quantity,
    amount: dbEvent.amount ? parseFloat(dbEvent.amount) : undefined,
    hasOwnLabor: dbEvent.has_own_labor,
    quantityLost: dbEvent.quantity_lost,
    paymentMethod: dbEvent.payment_method,
    paymentScreenshot: dbEvent.payment_screenshot,
    employeeId: dbEvent.employee_id,
    transportCharges: dbEvent.transport_charges ? parseFloat(dbEvent.transport_charges) : undefined,
    vehicleNo: dbEvent.vehicle_no ?? undefined,
    challanNo: dbEvent.challan_no ?? undefined
  };
}

// Transform app format to database format (camelCase -> snake_case)

// employee_id / user_id columns are UUIDs with a foreign key to `users`. Some
// sessions (e.g. the hardcoded admin fallback when offline) carry a non-UUID
// sentinel id. Sending that to the DB triggers a foreign-key / invalid-uuid
// error that aborts the whole insert, so coerce anything that isn't a valid
// UUID to null and let the row insert succeed without employee attribution.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function asUuidOrNull(value: unknown): string | null {
  return typeof value === 'string' && UUID_RE.test(value) ? value : null;
}

export function customerToDb(customer: Partial<Customer>): any {
  return {
    id: customer.id,
    name: customer.name,
    registration_name: customer.registrationName,
    contact_no: customer.contactNo,
    contacts: customer.contacts ? JSON.stringify(customer.contacts) : null,
    aadhar_photo: customer.aadharPhoto,
    address: customer.address,
    referral: customer.referral,
    created_date: customer.createdDate,
    advance_deposit: customer.advanceDeposit
  };
}

export function siteToDb(site: Partial<Site>, customerId: string): any {
  return {
    id: site.id,
    customer_id: customerId,
    site_name: site.siteName,
    location: site.location,
    issue_date: site.issueDate,
    grace_period_end_date: site.gracePeriodEndDate,
    amount_paid: site.amountPaid,
    last_settlement_date: site.lastSettlementDate,
    original_rent_charge: site.originalRentCharge,
    original_issue_lc: site.originalIssueLC,
    vehicle_no: site.vehicleNo,
    challan_no: site.challanNo
  };
}

export function materialToDb(material: Partial<MaterialItem>, siteId: string): any {
  return {
    site_id: siteId,
    material_type_id: material.materialTypeId,
    quantity: material.quantity,
    initial_quantity: material.initialQuantity,
    issue_date: material.issueDate,
    has_own_labor: material.hasOwnLabor
  };
}

export function historyEventToDb(event: Partial<HistoryEvent>, siteId: string): any {
  // IMPORTANT: emit `null` (never `undefined`) for absent fields. JSON.stringify
  // drops keys whose value is `undefined`, which makes the rows of a bulk insert
  // have differing key sets (e.g. an "Issued" row vs a "Payment" row). PostgREST
  // rejects that with PGRST102 "All object keys must match", causing a partial
  // failure where materials get inserted but the history event does not. Using a
  // complete, uniform key set on every row keeps bulk inserts valid.
  return {
    site_id: siteId,
    date: event.date ?? null,
    action: event.action ?? null,
    material_type_id: event.materialTypeId ?? null,
    quantity: event.quantity ?? null,
    amount: event.amount ?? null,
    has_own_labor: event.hasOwnLabor ?? null,
    quantity_lost: event.quantityLost ?? null,
    payment_method: event.paymentMethod ?? null,
    payment_screenshot: event.paymentScreenshot ?? null,
    employee_id: asUuidOrNull(event.employeeId),
    transport_charges: event.transportCharges ?? null,
    vehicle_no: event.vehicleNo ?? null,
    challan_no: event.challanNo ?? null
  };
}
