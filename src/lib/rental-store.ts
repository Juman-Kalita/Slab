import { differenceInDays } from "date-fns";

// Material Types Configuration
export interface MaterialType {
  id: string;
  name: string;
  size: string;
  rentPerDay: number;
  loadingCharge: number; // LC&ULC per item
  lostItemPenalty: number; // Rate in RS
  gracePeriodDays: number; // 20 or 30 days
}

export const MATERIAL_TYPES: MaterialType[] = [
  // Plates - 20 Days
  { id: "plate-3x2", name: "Plates", size: "3'x2'", rentPerDay: 2, loadingCharge: 2, lostItemPenalty: 1200, gracePeriodDays: 20 },
  { id: "plate-3x1", name: "Plates", size: "3'x1'", rentPerDay: 1, loadingCharge: 1, lostItemPenalty: 800, gracePeriodDays: 20 },
  { id: "plate-2x1", name: "Plates", size: "2'x1'", rentPerDay: 1, loadingCharge: 1, lostItemPenalty: 600, gracePeriodDays: 20 },
  
  // Change Plates - 20 Days
  { id: "change-plate-3x2", name: "Change Plates", size: "3'x2'", rentPerDay: 2, loadingCharge: 2, lostItemPenalty: 1200, gracePeriodDays: 20 },
  { id: "change-plate-3x1", name: "Change Plates", size: "3'x1'", rentPerDay: 1, loadingCharge: 1, lostItemPenalty: 800, gracePeriodDays: 20 },
  
  // Props - 30 Days
  { id: "props-2x2", name: "Props", size: "2mx2m", rentPerDay: 2.83, loadingCharge: 3, lostItemPenalty: 1440, gracePeriodDays: 30 },
  { id: "props-2x2.5", name: "Props", size: "2mx2.5m", rentPerDay: 3, loadingCharge: 3, lostItemPenalty: 1600, gracePeriodDays: 30 },
  { id: "props-2x3", name: "Props", size: "2mx3m", rentPerDay: 3.33, loadingCharge: 3, lostItemPenalty: 1760, gracePeriodDays: 30 },
  { id: "props-2x3.5", name: "Props", size: "2mx3.5m", rentPerDay: 3.66, loadingCharge: 3, lostItemPenalty: 1920, gracePeriodDays: 30 },
  { id: "props-2x4", name: "Props", size: "2mx4m", rentPerDay: 4, loadingCharge: 3, lostItemPenalty: 2000, gracePeriodDays: 30 },
  
  // Box Span - 30 Days
  { id: "box-span", name: "Box Span", size: "", rentPerDay: 4.16, loadingCharge: 3, lostItemPenalty: 2240, gracePeriodDays: 30 },
  
  // Zig-Zag Span - 30 Days
  { id: "zig-zag-span", name: "Zig-Zag Span", size: "", rentPerDay: 6, loadingCharge: 5, lostItemPenalty: 3200, gracePeriodDays: 30 },
  
  // Shikanja - 30 Days
  { id: "shikanja", name: "Shikanja", size: "", rentPerDay: 0.5, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30 },
  
  // Vertical - 30 Days
  { id: "vertical-3m", name: "Vertical", size: "3m", rentPerDay: 3, loadingCharge: 2, lostItemPenalty: 1120, gracePeriodDays: 30 },
  { id: "vertical-2.5m", name: "Vertical", size: "2.5m", rentPerDay: 2.5, loadingCharge: 2, lostItemPenalty: 933.33, gracePeriodDays: 30 },
  { id: "vertical-2m", name: "Vertical", size: "2m", rentPerDay: 2, loadingCharge: 2, lostItemPenalty: 746.66, gracePeriodDays: 30 },
  { id: "vertical-1.5m", name: "Vertical", size: "1.5m", rentPerDay: 1.5, loadingCharge: 2, lostItemPenalty: 560, gracePeriodDays: 30 },
  { id: "vertical-1m", name: "Vertical", size: "1m", rentPerDay: 1, loadingCharge: 2, lostItemPenalty: 373.33, gracePeriodDays: 30 },
  { id: "vertical-0.5m", name: "Vertical", size: "0.5m", rentPerDay: 0.5, loadingCharge: 2, lostItemPenalty: 186.66, gracePeriodDays: 30 },
  
  // Ledger - 30 Days
  { id: "ledger-2m", name: "Ledger", size: "2m", rentPerDay: 1.66, loadingCharge: 1, lostItemPenalty: 573.33, gracePeriodDays: 30 },
  { id: "ledger-1.5m", name: "Ledger", size: "1.5m", rentPerDay: 1.25, loadingCharge: 1, lostItemPenalty: 429.6, gracePeriodDays: 30 },
  { id: "ledger-1.2m", name: "Ledger", size: "1.2m", rentPerDay: 1, loadingCharge: 1, lostItemPenalty: 344, gracePeriodDays: 30 },
  { id: "ledger-1m", name: "Ledger", size: "1m", rentPerDay: 0.83, loadingCharge: 1, lostItemPenalty: 286.66, gracePeriodDays: 30 },
  
  // H-Frame - 30 Days
  { id: "h-frame-with-ladd", name: "H-Frame", size: "With Ladd.", rentPerDay: 5, loadingCharge: 5, lostItemPenalty: 2000, gracePeriodDays: 30 },
  { id: "h-frame-without-ladd", name: "H-Frame", size: "Without Ladd.", rentPerDay: 4, loadingCharge: 5, lostItemPenalty: 1760, gracePeriodDays: 30 },
  { id: "h-frame-1m", name: "H-Frame", size: "1m", rentPerDay: 3, loadingCharge: 4, lostItemPenalty: 0, gracePeriodDays: 30 },
  
  // Cross Bracing Pipe - 30 Days
  { id: "cross-bracing-pipe", name: "Cross Bracing Pipe", size: "", rentPerDay: 2, loadingCharge: 1, lostItemPenalty: 640, gracePeriodDays: 30 },
  { id: "cross-bracing-pipe-small", name: "Cross Bracing Pipe", size: "Small", rentPerDay: 2, loadingCharge: 1, lostItemPenalty: 560, gracePeriodDays: 30 },
  
  // Planks - 30 Days
  { id: "planks", name: "Planks", size: "", rentPerDay: 5, loadingCharge: 4, lostItemPenalty: 1600, gracePeriodDays: 30 },
  
  // Base Jack - 30 Days
  { id: "base-jack", name: "Base Jack", size: "", rentPerDay: 1, loadingCharge: 1, lostItemPenalty: 300, gracePeriodDays: 30 },
  { id: "base-jack-1", name: "Base Jack", size: "1'", rentPerDay: 0.5, loadingCharge: 1, lostItemPenalty: 300, gracePeriodDays: 30 },
  
  // Stirrup Head - 30 Days
  { id: "stirrup-head", name: "Stirrup Head", size: "", rentPerDay: 1, loadingCharge: 1, lostItemPenalty: 300, gracePeriodDays: 30 },
  { id: "stirrup-head-1", name: "Stirrup Head", size: "1'", rentPerDay: 0.5, loadingCharge: 1, lostItemPenalty: 300, gracePeriodDays: 30 },
  
  // Base Wheel - 30 Days
  { id: "base-wheel", name: "Base Wheel", size: "", rentPerDay: 2, loadingCharge: 1, lostItemPenalty: 0, gracePeriodDays: 30 },
  
  // Joint Pins - 30 Days
  { id: "joint-pins", name: "Joint Pins", size: "", rentPerDay: 0.33, loadingCharge: 0.5, lostItemPenalty: 80, gracePeriodDays: 30 },
  
  // Coupler - 30 Days
  { id: "coupler", name: "Coupler", size: "1.5\"/2\"", rentPerDay: 0.33, loadingCharge: 0.5, lostItemPenalty: 80, gracePeriodDays: 30 },
  
  // Tie Rod - 30 Days
  { id: "tie-rod-1.2m", name: "Tie Rod", size: "1.2m", rentPerDay: 0.83, loadingCharge: 1, lostItemPenalty: 0, gracePeriodDays: 30 },
  { id: "tie-rod-600mm", name: "Tie Rod", size: "600mm", rentPerDay: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30 },
  
  // Tie Rod Channel - 30 Days
  { id: "tie-rod-channel", name: "Tie Rod Channel", size: "", rentPerDay: 1.5, loadingCharge: 1, lostItemPenalty: 0, gracePeriodDays: 30 },
  
  // Anchor Nuts - 30 Days
  { id: "anchor-nuts", name: "Anchor Nuts", size: "", rentPerDay: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30 },
  
  // Bracing Pipes - 30 Days
  { id: "bracing-pipes-20ft", name: "Bracing Pipes", size: "20ft/6m", rentPerDay: 5, loadingCharge: 4, lostItemPenalty: 0, gracePeriodDays: 30 },
  { id: "bracing-pipes-10ft", name: "Bracing Pipes", size: "10ft/3m", rentPerDay: 2.5, loadingCharge: 2, lostItemPenalty: 0, gracePeriodDays: 30 },
];

// Types
export interface MaterialItem {
  materialTypeId: string;
  quantity: number;
  initialQuantity: number; // Original quantity issued (for 20-day charge)
  issueDate: string;
  hasOwnLabor: boolean; // If true, no LC&ULC charge
}

export interface ReturnRecord {
  date: string;
  materialTypeId: string;
  quantityReturned: number;
  quantityLost: number;
  hasOwnLabor: boolean; // For return LC&ULC
}

export interface HistoryEvent {
  date: string; // ISO string
  action: "Issued" | "Returned" | "Payment";
  materialTypeId?: string;
  quantity?: number;
  amount?: number; // For payment records
  hasOwnLabor?: boolean;
  quantityLost?: number;
}

export interface Customer {
  id: string;
  name: string;
  issueDate: string; // ISO string of first issue
  materials: MaterialItem[]; // All materials currently held
  amountPaid: number; // Total amount paid in current cycle
  lastSettlementDate: string | null; // Last time all charges were settled
  originalRentCharge: number; // Original 20-day rent charge (never changes until settlement)
  originalIssueLC: number; // Original issue loading charges (never changes until settlement)
  history: HistoryEvent[];
}

const STORAGE_KEY = "rental_customers";
const SESSION_KEY = "rental_session";

// Credentials
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

// Auth
export function login(username: string, password: string): boolean {
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    localStorage.setItem(SESSION_KEY, "true");
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn(): boolean {
  return localStorage.getItem(SESSION_KEY) === "true";
}

// Data access
export function getCustomers(): Customer[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  const customers: Customer[] = raw ? JSON.parse(raw) : [];
  
  // Migrate old data format to new format (if needed)
  return customers.map(c => ({
    ...c,
    materials: (c.materials ?? []).map(m => ({
      ...m,
      initialQuantity: m.initialQuantity ?? m.quantity
    })),
    amountPaid: c.amountPaid ?? 0,
    lastSettlementDate: c.lastSettlementDate ?? null,
    originalRentCharge: c.originalRentCharge ?? 0,
    originalIssueLC: c.originalIssueLC ?? 0,
  }));
}

function saveCustomers(customers: Customer[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

// Get material type by ID
export function getMaterialType(id: string): MaterialType | undefined {
  return MATERIAL_TYPES.find(m => m.id === id);
}

// Issue materials
export function issueMaterials(
  name: string, 
  materialTypeId: string, 
  quantity: number, 
  issueDate: string,
  hasOwnLabor: boolean
): void {
  const customers = getCustomers();
  const existing = customers.find((c) => c.name.toLowerCase() === name.toLowerCase());

  const event: HistoryEvent = { 
    date: issueDate, 
    action: "Issued", 
    materialTypeId,
    quantity,
    hasOwnLabor
  };

  const materialType = getMaterialType(materialTypeId);
  if (!materialType) return;
  
  const rentCharge = quantity * materialType.rentPerDay * materialType.gracePeriodDays;
  const issueLC = hasOwnLabor ? 0 : quantity * materialType.loadingCharge;

  if (existing) {
    // Add to existing customer
    const existingMaterial = existing.materials.find(m => m.materialTypeId === materialTypeId);
    if (existingMaterial) {
      existingMaterial.quantity += quantity;
      existingMaterial.initialQuantity += quantity;
    } else {
      existing.materials.push({
        materialTypeId,
        quantity,
        initialQuantity: quantity,
        issueDate,
        hasOwnLabor
      });
    }
    existing.history.push(event);
    // Add to original charges
    existing.originalRentCharge += rentCharge;
    existing.originalIssueLC += issueLC;
  } else {
    // Create new customer
    customers.push({
      id: crypto.randomUUID(),
      name,
      issueDate,
      materials: [{
        materialTypeId,
        quantity,
        initialQuantity: quantity,
        issueDate,
        hasOwnLabor
      }],
      amountPaid: 0,
      lastSettlementDate: null,
      originalRentCharge: rentCharge,
      originalIssueLC: issueLC,
      history: [event],
    });
  }

  saveCustomers(customers);
}

// Record return
export function recordReturn(
  customerId: string, 
  materialTypeId: string,
  quantityReturned: number,
  quantityLost: number,
  hasOwnLabor: boolean
): boolean {
  const customers = getCustomers();
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) return false;

  const material = customer.materials.find(m => m.materialTypeId === materialTypeId);
  if (!material || quantityReturned + quantityLost > material.quantity) return false;

  // Update quantity (but keep initialQuantity unchanged)
  material.quantity -= (quantityReturned + quantityLost);
  
  // Don't remove material even if quantity is 0 - we need initialQuantity for penalty calculation

  customer.history.push({
    date: new Date().toISOString(),
    action: "Returned",
    materialTypeId,
    quantity: quantityReturned,
    quantityLost,
    hasOwnLabor
  });

  saveCustomers(customers);
  return true;
}

// Calculations
const GRACE_PERIOD_DAYS = 20;
const PENALTY_PER_ITEM_PER_DAY = 10;

export function calculateRent(customer: Customer): { 
  days: number; 
  isWithinGracePeriod: boolean;
  daysOverdue: number;
  rentAmount: number;
  issueLoadingCharges: number;
  returnLoadingCharges: number;
  lostItemsPenalty: number;
  penaltyAmount: number;
  totalRequired: number;
  amountPaid: number;
  remainingDue: number;
  isFullyPaid: boolean;
  materialBreakdown: Array<{
    materialType: MaterialType;
    quantity: number;
    rentAmount: number;
    issueLoadingCharge: number;
  }>;
} {
  const days = differenceInDays(new Date(), new Date(customer.issueDate));
  const isWithinGracePeriod = days <= GRACE_PERIOD_DAYS;
  const daysOverdue = Math.max(0, days - GRACE_PERIOD_DAYS);
  
  let returnLoadingCharges = 0;
  let lostItemsPenalty = 0;
  const materialBreakdown: Array<any> = [];
  
  // Use stored original charges (never recalculate)
  const rentAmount = customer.originalRentCharge;
  const issueLoadingCharges = customer.originalIssueLC;
  
  // Build material breakdown for display
  customer.materials.forEach(material => {
    const materialType = getMaterialType(material.materialTypeId);
    if (!materialType) return;
    
    materialBreakdown.push({
      materialType,
      quantity: material.quantity,
      rentAmount: 0, // Not used anymore
      issueLoadingCharge: 0 // Not used anymore
    });
  });
  
  // Calculate return loading charges and lost items from history (only after last settlement)
  customer.history.forEach(event => {
    // Skip events before last settlement
    if (customer.lastSettlementDate && event.date <= customer.lastSettlementDate) {
      return;
    }
    
    if (event.action === "Returned" && event.materialTypeId) {
      const materialType = getMaterialType(event.materialTypeId);
      if (!materialType) return;
      
      // Return loading charges
      if (!event.hasOwnLabor && event.quantity) {
        returnLoadingCharges += event.quantity * materialType.loadingCharge;
      }
      
      // Lost items penalty
      if (event.quantityLost) {
        lostItemsPenalty += event.quantityLost * materialType.lostItemPenalty;
      }
    }
  });
  
  // Calculate total INITIAL items for penalty (not current items)
  // If materials array is empty or corrupted, calculate from history
  let totalInitialItems = customer.materials.reduce((sum, m) => sum + (m.initialQuantity || 0), 0);
  
  // Fallback: if no initialQuantity found, calculate from issued items in history
  if (totalInitialItems === 0) {
    totalInitialItems = customer.history
      .filter(h => h.action === "Issued")
      .reduce((sum, h) => sum + (h.quantity || 0), 0);
  }
  
  // Calculate penalty per material type based on its grace period
  // For now, use the maximum grace period from all materials (simplified approach)
  // This ensures we don't penalize too early if customer has mixed materials
  let maxGracePeriod = 20; // default
  customer.materials.forEach(m => {
    const mt = getMaterialType(m.materialTypeId);
    if (mt && mt.gracePeriodDays > maxGracePeriod) {
      maxGracePeriod = mt.gracePeriodDays;
    }
  });
  
  // If no materials left, check history for grace period
  if (customer.materials.length === 0) {
    customer.history.filter(h => h.action === "Issued").forEach(h => {
      if (h.materialTypeId) {
        const mt = getMaterialType(h.materialTypeId);
        if (mt && mt.gracePeriodDays > maxGracePeriod) {
          maxGracePeriod = mt.gracePeriodDays;
        }
      }
    });
  }
  
  const daysOverdueAdjusted = Math.max(0, days - maxGracePeriod);
  
  // Penalty only applies after grace period, calculated on INITIAL quantity
  const penaltyAmount = daysOverdueAdjusted * totalInitialItems * PENALTY_PER_ITEM_PER_DAY;
  
  // Calculate base charges (original rent + issue LC + late penalty)
  // Late penalty is part of the base amount owed, not "additional"
  const baseCharges = rentAmount + issueLoadingCharges + penaltyAmount;
  
  // Calculate unpaid portion of base charges
  const unpaidBase = Math.max(0, baseCharges - customer.amountPaid);
  
  // Calculate overpayment (if paid more than base charges)
  const overpayment = Math.max(0, customer.amountPaid - baseCharges);
  
  // New charges (return LC, lost items) - NOT including late penalty anymore
  const newCharges = returnLoadingCharges + lostItemsPenalty;
  
  // Apply overpayment to new charges
  const newChargesAfterOverpayment = Math.max(0, newCharges - overpayment);
  
  // Total required is unpaid base + new charges after overpayment
  const totalRequired = unpaidBase + newChargesAfterOverpayment;
  
  // Amount paid towards new charges (for display)
  const amountPaidTowardsNew = Math.min(overpayment, newCharges);
  
  const remainingDue = totalRequired;
  const isFullyPaid = remainingDue === 0 && customer.materials.length === 0;
  
  return { 
    days, 
    isWithinGracePeriod: days <= maxGracePeriod,
    daysOverdue: daysOverdueAdjusted,
    rentAmount,
    issueLoadingCharges,
    returnLoadingCharges,
    lostItemsPenalty,
    penaltyAmount,
    totalRequired,
    amountPaid: amountPaidTowardsNew,
    remainingDue,
    isFullyPaid,
    materialBreakdown
  };
}

// Record payment
export function recordPayment(customerId: string, amount: number): boolean {
  const customers = getCustomers();
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) return false;

  customer.amountPaid += amount;
  customer.history.push({
    date: new Date().toISOString(),
    action: "Payment",
    amount,
  });

  // Check if fully paid and all materials returned
  const rent = calculateRent(customer);
  if (rent.isFullyPaid) {
    // Mark settlement and reset cycle
    customer.lastSettlementDate = new Date().toISOString();
    customer.amountPaid = 0;
    customer.issueDate = new Date().toISOString();
    // Reset original charges to 0 (will be recalculated on next issue)
    customer.originalRentCharge = 0;
    customer.originalIssueLC = 0;
    // Reset initialQuantity for any remaining materials
    customer.materials.forEach(m => {
      m.initialQuantity = m.quantity;
    });
  }

  saveCustomers(customers);
  return true;
}

// Dashboard stats
export function getDashboardStats() {
  const customers = getCustomers();
  const active = customers.filter((c) => c.materials.length > 0);
  const totalItemsRented = customers.reduce((s, c) => {
    return s + c.materials.reduce((sum, m) => sum + m.quantity, 0);
  }, 0);
  const totalPendingAmount = customers.reduce((s, c) => {
    if (c.materials.length === 0) return s;
    return s + calculateRent(c).remainingDue;
  }, 0);

  return {
    totalCustomers: active.length,
    totalItemsRented,
    totalPendingAmount,
  };
}
