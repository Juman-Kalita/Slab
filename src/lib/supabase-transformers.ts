import type { Customer, Site, MaterialItem, HistoryEvent } from './rental-store';

// Transform database records to app format (snake_case -> camelCase)

export function dbToCustomer(dbCustomer: any): Customer {
  return {
    id: dbCustomer.id,
    name: dbCustomer.name,
    registrationName: dbCustomer.registration_name,
    contactNo: dbCustomer.contact_no,
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
    materials: dbSite.materials?.map(dbToMaterial) || [],
    amountPaid: parseFloat(dbSite.amount_paid || 0),
    lastSettlementDate: dbSite.last_settlement_date,
    originalRentCharge: parseFloat(dbSite.original_rent_charge || 0),
    originalIssueLC: parseFloat(dbSite.original_issue_lc || 0),
    history: dbSite.history_events?.map(dbToHistoryEvent) || []
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
    date: dbEvent.date,
    action: dbEvent.action,
    siteId: dbEvent.site_id,
    materialTypeId: dbEvent.material_type_id,
    quantity: dbEvent.quantity,
    amount: dbEvent.amount ? parseFloat(dbEvent.amount) : undefined,
    hasOwnLabor: dbEvent.has_own_labor,
    quantityLost: dbEvent.quantity_lost,
    paymentMethod: dbEvent.payment_method
  };
}

// Transform app format to database format (camelCase -> snake_case)

export function customerToDb(customer: Partial<Customer>): any {
  return {
    id: customer.id,
    name: customer.name,
    registration_name: customer.registrationName,
    contact_no: customer.contactNo,
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
    amount_paid: site.amountPaid,
    last_settlement_date: site.lastSettlementDate,
    original_rent_charge: site.originalRentCharge,
    original_issue_lc: site.originalIssueLC
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
  return {
    site_id: siteId,
    date: event.date,
    action: event.action,
    material_type_id: event.materialTypeId,
    quantity: event.quantity,
    amount: event.amount,
    has_own_labor: event.hasOwnLabor,
    quantity_lost: event.quantityLost,
    payment_method: event.paymentMethod
  };
}
