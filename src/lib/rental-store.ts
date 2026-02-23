import { differenceInDays } from "date-fns";

// Material Types Configuration
export interface MaterialType {
  id: string;
  category: string; // Category for grouping
  name: string;
  size: string;
  rentPerDay: number;
  loadingCharge: number; // LC&ULC per item
  lostItemPenalty: number; // Rate in RS
  gracePeriodDays: number; // 20 or 30 days
  inventory: number; // Available stock
}

export const MATERIAL_TYPES: MaterialType[] = [
  // PLATES Category - 30 Days
  { id: "plate-3x2", category: "Plates", name: "Plates", size: "3'x2'", rentPerDay: 2, loadingCharge: 2, lostItemPenalty: 1200, gracePeriodDays: 30, inventory: 7500 },
  { id: "plate-3x1", category: "Plates", name: "Plates", size: "3'x1'", rentPerDay: 1, loadingCharge: 1, lostItemPenalty: 800, gracePeriodDays: 30, inventory: 956 },
  { id: "plate-2x1", category: "Plates", name: "Plates", size: "2'x1'", rentPerDay: 1, loadingCharge: 1, lostItemPenalty: 600, gracePeriodDays: 30, inventory: 248 },
  { id: "change-plate-3x2", category: "Plates", name: "New Changed", size: "3'x2'", rentPerDay: 2, loadingCharge: 2, lostItemPenalty: 1200, gracePeriodDays: 30, inventory: 1461 },
  { id: "change-plate-3x1", category: "Plates", name: "New Changed", size: "3'x1'", rentPerDay: 1, loadingCharge: 1, lostItemPenalty: 800, gracePeriodDays: 30, inventory: 1 },
  
  // PROPS Category - 30 Days
  { id: "props-2x2", category: "Props", name: "Props", size: "2mx2m", rentPerDay: 2.83, loadingCharge: 3, lostItemPenalty: 1440, gracePeriodDays: 30, inventory: 2937 },
  { id: "props-2x2.5", category: "Props", name: "Props", size: "2mx2.5m", rentPerDay: 3, loadingCharge: 3, lostItemPenalty: 1600, gracePeriodDays: 30, inventory: 650 },
  { id: "props-2x3", category: "Props", name: "Props", size: "2mx3m", rentPerDay: 3.33, loadingCharge: 3, lostItemPenalty: 1760, gracePeriodDays: 30, inventory: 1243 },
  { id: "props-2x3.5", category: "Props", name: "Props", size: "2mx3.5m", rentPerDay: 3.66, loadingCharge: 3, lostItemPenalty: 1920, gracePeriodDays: 30, inventory: 225 },
  { id: "props-2x4", category: "Props", name: "Props", size: "2mx4m", rentPerDay: 4, loadingCharge: 3, lostItemPenalty: 2000, gracePeriodDays: 30, inventory: 287 },
  
  // SPAN Category - 30 Days
  { id: "box-span", category: "Span", name: "Box Span", size: "", rentPerDay: 4.16, loadingCharge: 3, lostItemPenalty: 2240, gracePeriodDays: 30, inventory: 512 },
  { id: "zig-zag-span", category: "Span", name: "Zig-Zag Span", size: "", rentPerDay: 6, loadingCharge: 5, lostItemPenalty: 3200, gracePeriodDays: 30, inventory: 224 },
  
  // H FRAME Category - 30 Days
  { id: "h-frame-with-ladder", category: "H Frame", name: "H-Frame", size: "With Ladder", rentPerDay: 5, loadingCharge: 5, lostItemPenalty: 2000, gracePeriodDays: 30, inventory: 134 },
  { id: "h-frame-without-ladder", category: "H Frame", name: "H-Frame", size: "Without Ladder", rentPerDay: 4, loadingCharge: 5, lostItemPenalty: 1760, gracePeriodDays: 30, inventory: 190 },
  { id: "h-frame-1m", category: "H Frame", name: "H-Frame", size: "1m", rentPerDay: 3, loadingCharge: 4, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 20 },
  { id: "cbp-small", category: "H Frame", name: "CBP", size: "Small", rentPerDay: 2, loadingCharge: 1, lostItemPenalty: 640, gracePeriodDays: 30, inventory: 40 },
  { id: "planks", category: "H Frame", name: "Planks", size: "", rentPerDay: 5, loadingCharge: 4, lostItemPenalty: 1600, gracePeriodDays: 30, inventory: 365 },
  { id: "base-wheels", category: "H Frame", name: "Base Wheels", size: "", rentPerDay: 2, loadingCharge: 1, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 33 },
  { id: "base-jack", category: "H Frame", name: "Base Jack", size: "", rentPerDay: 1, loadingCharge: 1, lostItemPenalty: 300, gracePeriodDays: 30, inventory: 1218 },
  
  // SCAFFOLDING Category - 30 Days
  { id: "vertical-3m", category: "Scaffolding", name: "Vertical", size: "3m", rentPerDay: 3, loadingCharge: 2, lostItemPenalty: 1120, gracePeriodDays: 30, inventory: 637 },
  { id: "vertical-2.5m", category: "Scaffolding", name: "Vertical", size: "2.5m", rentPerDay: 2.5, loadingCharge: 2, lostItemPenalty: 933.33, gracePeriodDays: 30, inventory: 514 },
  { id: "vertical-2m", category: "Scaffolding", name: "Vertical", size: "2m", rentPerDay: 2, loadingCharge: 2, lostItemPenalty: 746.66, gracePeriodDays: 30, inventory: 470 },
  { id: "vertical-1.5m", category: "Scaffolding", name: "Vertical", size: "1.5m", rentPerDay: 1.5, loadingCharge: 2, lostItemPenalty: 560, gracePeriodDays: 30, inventory: 547 },
  { id: "vertical-1m", category: "Scaffolding", name: "Vertical", size: "1m", rentPerDay: 1, loadingCharge: 2, lostItemPenalty: 373.33, gracePeriodDays: 30, inventory: 307 },
  { id: "vertical-0.5m", category: "Scaffolding", name: "Vertical", size: "0.5m", rentPerDay: 0.5, loadingCharge: 2, lostItemPenalty: 186.66, gracePeriodDays: 30, inventory: 91 },
  { id: "ledger-2m", category: "Scaffolding", name: "Ledger", size: "2m", rentPerDay: 1.66, loadingCharge: 1, lostItemPenalty: 573.33, gracePeriodDays: 30, inventory: 71 },
  { id: "ledger-1.5m", category: "Scaffolding", name: "Ledger", size: "1.5m", rentPerDay: 1.25, loadingCharge: 1, lostItemPenalty: 429.6, gracePeriodDays: 30, inventory: 153 },
  { id: "ledger-1.2m", category: "Scaffolding", name: "Ledger", size: "1.2m", rentPerDay: 1, loadingCharge: 1, lostItemPenalty: 344, gracePeriodDays: 30, inventory: 4686 },
  { id: "ledger-1m", category: "Scaffolding", name: "Ledger", size: "1m", rentPerDay: 0.83, loadingCharge: 1, lostItemPenalty: 286.66, gracePeriodDays: 30, inventory: 1034 },
  { id: "joint-pins", category: "Scaffolding", name: "Joint Pins", size: "", rentPerDay: 0.33, loadingCharge: 0.5, lostItemPenalty: 80, gracePeriodDays: 30, inventory: 1282 },
  { id: "planks-scaffolding", category: "Scaffolding", name: "Planks", size: "", rentPerDay: 5, loadingCharge: 4, lostItemPenalty: 1600, gracePeriodDays: 30, inventory: 0 },
  { id: "base-jack-scaffolding", category: "Scaffolding", name: "Base Jack", size: "", rentPerDay: 1, loadingCharge: 1, lostItemPenalty: 300, gracePeriodDays: 30, inventory: 0 },
  { id: "stirrup-head", category: "Scaffolding", name: "Stirrup Head", size: "", rentPerDay: 1, loadingCharge: 1, lostItemPenalty: 300, gracePeriodDays: 30, inventory: 1201 },
  { id: "base-wheels-scaffolding", category: "Scaffolding", name: "Base Wheels", size: "", rentPerDay: 2, loadingCharge: 1, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  
  // BRACING PIPE Category - 30 Days
  { id: "bracing-pipe-20ft", category: "Bracing Pipe", name: "Bracing Pipe", size: "20'/6m", rentPerDay: 5, loadingCharge: 4, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 154 },
  { id: "bracing-pipe-10ft", category: "Bracing Pipe", name: "Bracing Pipe", size: "10'/3m", rentPerDay: 2.5, loadingCharge: 2, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  { id: "coupler", category: "Bracing Pipe", name: "Coupler", size: "", rentPerDay: 0.33, loadingCharge: 0.5, lostItemPenalty: 80, gracePeriodDays: 30, inventory: 591 },
  
  // C CHANNEL Category - 30 Days
  { id: "c-channel-3-5m", category: "C Channel", name: "C Channel 3\"", size: "5m", rentPerDay: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  { id: "c-channel-3-6m", category: "C Channel", name: "C Channel 3\"", size: "6m", rentPerDay: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 16 },
  { id: "c-channel-4-3m", category: "C Channel", name: "C Channel 4\"", size: "3m", rentPerDay: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  { id: "c-channel-4-5m", category: "C Channel", name: "C Channel 4\"", size: "5m", rentPerDay: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 11 },
  { id: "c-channel-4-6m", category: "C Channel", name: "C Channel 4\"", size: "6m", rentPerDay: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  
  // I-SECTION Category - 30 Days
  { id: "i-section-5-3m", category: "I-Section", name: "I-Section 5\"", size: "3m", rentPerDay: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 25 },
  { id: "i-section-5-6m", category: "I-Section", name: "I-Section 5\"", size: "6m", rentPerDay: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  
  // ROUND COLUMN Category - 30 Days
  { id: "round-column-9", category: "Round Column", name: "Round Column", size: "9\"", rentPerDay: 0, loadingCharge: 4, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  { id: "round-column-12", category: "Round Column", name: "Round Column", size: "12\"", rentPerDay: 0, loadingCharge: 4, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 2 },
  { id: "round-column-18", category: "Round Column", name: "Round Column", size: "18\"", rentPerDay: 0, loadingCharge: 4, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 2 },
  
  // EXTRA Category - 30 Days
  { id: "tie-rod", category: "Extra", name: "Tie Rod", size: "", rentPerDay: 0.83, loadingCharge: 1, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  { id: "tie-channel-2", category: "Extra", name: "Tie Channel", size: "2'", rentPerDay: 1.5, loadingCharge: 1, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  { id: "tie-channel-4", category: "Extra", name: "Tie Channel", size: "4'", rentPerDay: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  { id: "anchor-nut", category: "Extra", name: "Anchor Nut", size: "", rentPerDay: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  
  // CONCRETING Category - 30 Days
  { id: "electric-mixer", category: "Concreting", name: "Electric Mixer", size: "", rentPerDay: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 3 },
  { id: "wheel-barrow", category: "Concreting", name: "Wheel Barrow", size: "", rentPerDay: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  { id: "concreting-tray", category: "Concreting", name: "Concreting Tray", size: "", rentPerDay: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 1 },
  { id: "material-lift", category: "Concreting", name: "Material Lift", size: "", rentPerDay: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
];

// Types
export interface MaterialItem {
  materialTypeId: string;
  quantity: number;
  initialQuantity: number; // Original quantity issued (for grace period charge)
  issueDate: string;
  hasOwnLabor: boolean; // If true, no LC&ULC charge
}

export interface HistoryEvent {
  date: string; // ISO string
  action: "Issued" | "Returned" | "Payment";
  siteId?: string; // Which site this event belongs to
  materialTypeId?: string;
  quantity?: number;
  amount?: number; // For payment records
  hasOwnLabor?: boolean;
  quantityLost?: number;
  paymentMethod?: string; // Payment method used (Father, Mother, Own, Cash, or custom)
}

export interface Site {
  id: string;
  siteName: string; // Name of the construction site
  location: string; // Location/region of the site
  issueDate: string; // When materials were first issued to this site
  materials: MaterialItem[]; // Materials at this site
  amountPaid: number; // Amount paid for this site
  lastSettlementDate: string | null;
  originalRentCharge: number; // Original rent charge for this site
  originalIssueLC: number; // Original issue LC for this site
  history: HistoryEvent[]; // History specific to this site
  vehicleNo?: string; // Vehicle number used for shipping
  challanNo?: string; // Challan number for the shipment
}

export interface Customer {
  id: string;
  name: string;
  registrationName?: string; // Official registration name
  contactNo?: string; // Contact number
  aadharPhoto?: string; // Base64 encoded Aadhar photo
  address?: string; // Address
  referral?: string; // Referral source (who referred this customer)
  sites: Site[]; // Multiple sites for this customer
  createdDate: string; // When customer was created
  advanceDeposit: number; // Customer-level advance deposit (excess payments)
}

const STORAGE_KEY = "rental_customers";
const SESSION_KEY = "rental_session";
const INVENTORY_KEY = "rental_inventory";

// Credentials
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

// Inventory Management
export function getInventory(): Record<string, number> {
  const stored = localStorage.getItem(INVENTORY_KEY);
  if (!stored) {
    // Initialize with default inventory from MATERIAL_TYPES
    const defaultInventory: Record<string, number> = {};
    MATERIAL_TYPES.forEach(mt => {
      defaultInventory[mt.id] = mt.inventory;
    });
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(defaultInventory));
    return defaultInventory;
  }
  return JSON.parse(stored);
}

function saveInventory(inventory: Record<string, number>): void {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}

export function getAvailableStock(materialTypeId: string): number {
  const inventory = getInventory();
  return inventory[materialTypeId] || 0;
}

export function updateInventory(materialTypeId: string, change: number): boolean {
  const inventory = getInventory();
  const current = inventory[materialTypeId] || 0;
  const newAmount = current + change;
  
  if (newAmount < 0) {
    return false; // Cannot go negative
  }
  
  inventory[materialTypeId] = newAmount;
  saveInventory(inventory);
  return true;
}

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
  const customers: any[] = raw ? JSON.parse(raw) : [];
  
  // Migrate old data format to new multi-site format
  return customers.map(c => {
    // Check if customer has old structure (materials directly on customer)
    if (c.materials && !c.sites) {
      // Migrate to new structure with a default site
      return {
        ...c,
        sites: [{
          id: crypto.randomUUID(),
          siteName: "Main Site",
          location: c.address || "Unknown",
          issueDate: c.issueDate,
          materials: c.materials.map((m: any) => ({
            ...m,
            initialQuantity: m.initialQuantity ?? m.quantity
          })),
          amountPaid: c.amountPaid ?? 0,
          lastSettlementDate: c.lastSettlementDate ?? null,
          originalRentCharge: c.originalRentCharge ?? 0,
          originalIssueLC: c.originalIssueLC ?? 0,
          history: c.history ?? []
        }],
        createdDate: c.issueDate || new Date().toISOString(),
        // Remove old fields
        materials: undefined,
        issueDate: undefined,
        amountPaid: undefined,
        lastSettlementDate: undefined,
        originalRentCharge: undefined,
        originalIssueLC: undefined,
        history: undefined
      };
    }
    
    // Already in new format
    return {
      ...c,
      sites: c.sites || [],
      createdDate: c.createdDate || new Date().toISOString(),
      advanceDeposit: c.advanceDeposit || 0 // Initialize advance deposit
    };
  });
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
  siteName: string,
  location: string,
  materialTypeId: string,
  quantity: number,
  issueDate: string,
  hasOwnLabor: boolean,
  depositAmount: number = 0,
  clientDetails?: {
    registrationName?: string;
    contactNo?: string;
    aadharPhoto?: string;
    address?: string;
    referral?: string;
  },
  shippingDetails?: {
    vehicleNo?: string;
    challanNo?: string;
  }
): boolean {
  // Check if enough inventory available
  const available = getAvailableStock(materialTypeId);
  if (available < quantity) {
    return false; // Not enough stock
  }

  const customers = getCustomers();
  const existing = customers.find((c) => c.name.toLowerCase() === name.toLowerCase());

  const materialType = getMaterialType(materialTypeId);
  if (!materialType) return false;

  const rentCharge = quantity * materialType.rentPerDay * materialType.gracePeriodDays;
  const issueLC = hasOwnLabor ? 0 : quantity * materialType.loadingCharge;

  if (existing) {
    // Find or create site for this customer
    let site = existing.sites.find(s =>
      s.siteName.toLowerCase() === siteName.toLowerCase() &&
      s.location.toLowerCase() === location.toLowerCase()
    );

    if (site) {
      // Add to existing site - always add materials (even if same type exists)
      // This allows multiple dispatches of the same material to the same site
      const existingMaterial = site.materials.find(m => m.materialTypeId === materialTypeId);
      if (existingMaterial) {
        // Add to existing material quantity
        existingMaterial.quantity += quantity;
        existingMaterial.initialQuantity += quantity;
      } else {
        // Add new material type to site
        site.materials.push({
          materialTypeId,
          quantity,
          initialQuantity: quantity,
          issueDate,
          hasOwnLabor
        });
      }
      
      // Update shipping details if provided
      if (shippingDetails?.vehicleNo) {
        site.vehicleNo = shippingDetails.vehicleNo;
      }
      if (shippingDetails?.challanNo) {
        site.challanNo = shippingDetails.challanNo;
      }
      
      // Record in history
      site.history.push({
        date: issueDate,
        action: "Issued",
        siteId: site.id,
        materialTypeId,
        quantity,
        hasOwnLabor
      });
      
      // Add charges
      site.originalRentCharge += rentCharge;
      site.originalIssueLC += issueLC;

      // Auto-apply customer advance deposit to this site
      if (existing.advanceDeposit > 0) {
        const amountToApply = Math.min(existing.advanceDeposit, rentCharge + issueLC);
        existing.advanceDeposit -= amountToApply;
        site.amountPaid += amountToApply;
        site.history.push({
          date: issueDate,
          action: "Payment",
          siteId: site.id,
          amount: amountToApply,
          paymentMethod: "Advance Deposit"
        });
      }

      // Add deposit as payment if provided
      if (depositAmount > 0) {
        site.amountPaid += depositAmount;
        site.history.push({
          date: issueDate,
          action: "Payment",
          siteId: site.id,
          amount: depositAmount,
          paymentMethod: "Cash"
        });
      }
    } else {
    // Create new site for existing customer
    const newSite: Site = {
        id: crypto.randomUUID(),
        siteName,
        location,
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
        history: [
          {
            date: issueDate,
            action: "Issued",
            materialTypeId,
            quantity,
            hasOwnLabor
          }
        ],
        vehicleNo: shippingDetails?.vehicleNo,
        challanNo: shippingDetails?.challanNo
      };

      // Auto-apply customer advance deposit to new site
      if (existing.advanceDeposit > 0) {
        const amountToApply = Math.min(existing.advanceDeposit, rentCharge + issueLC);
        existing.advanceDeposit -= amountToApply;
        newSite.amountPaid += amountToApply;
        newSite.history.push({
          date: issueDate,
          action: "Payment",
          siteId: newSite.id,
          amount: amountToApply,
          paymentMethod: "Advance Deposit"
        });
      }

      // Add deposit if provided
      if (depositAmount > 0) {
        newSite.amountPaid += depositAmount;
        newSite.history.push({
          date: issueDate,
          action: "Payment",
          siteId: newSite.id,
          amount: depositAmount,
          paymentMethod: "Cash"
        });
      }

      
      existing.sites.push(newSite);
    }
  } else {
    // Create new customer with first site
    const newSite: Site = {
      id: crypto.randomUUID(),
      siteName,
      location,
      issueDate,
      materials: [{
        materialTypeId,
        quantity,
        initialQuantity: quantity,
        issueDate,
        hasOwnLabor
      }],
      amountPaid: depositAmount, // Set initial deposit
      lastSettlementDate: null,
      originalRentCharge: rentCharge,
      originalIssueLC: issueLC,
      history: [
        {
          date: issueDate,
          action: "Issued",
          materialTypeId,
          quantity,
          hasOwnLabor
        },
        ...(depositAmount > 0 ? [{
          date: issueDate,
          action: "Payment" as const,
          siteId: "",
          amount: depositAmount,
          paymentMethod: "Cash"
        }] : [])
      ],
      vehicleNo: shippingDetails?.vehicleNo,
      challanNo: shippingDetails?.challanNo
    };
    // Set siteId in history after creating the site
    newSite.history.forEach(h => { if (h.siteId !== undefined) h.siteId = newSite.id; });

    customers.push({
      id: crypto.randomUUID(),
      name,
      registrationName: clientDetails?.registrationName,
      contactNo: clientDetails?.contactNo,
      aadharPhoto: clientDetails?.aadharPhoto,
      address: clientDetails?.address,
      referral: clientDetails?.referral,
      sites: [newSite],
      createdDate: new Date().toISOString(),
      advanceDeposit: 0 // Initialize with no advance deposit
    });
  }

  // Update inventory (subtract issued quantity)
  updateInventory(materialTypeId, -quantity);

  saveCustomers(customers);
  return true;
}

// Record return
export function recordReturn(
  customerId: string,
  siteId: string,
  materialTypeId: string,
  quantityReturned: number,
  quantityLost: number,
  hasOwnLabor: boolean
): boolean {
  const customers = getCustomers();
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) return false;

  const site = customer.sites.find(s => s.id === siteId);
  if (!site) return false;

  const material = site.materials.find(m => m.materialTypeId === materialTypeId);
  if (!material || quantityReturned + quantityLost > material.quantity) return false;

  // Update quantity (but keep initialQuantity unchanged)
  material.quantity -= (quantityReturned + quantityLost);
  
  // Don't remove material even if quantity is 0 - we need initialQuantity for penalty calculation

  site.history.push({
    date: new Date().toISOString(),
    action: "Returned",
    siteId: site.id,
    materialTypeId,
    quantity: quantityReturned,
    quantityLost,
    hasOwnLabor
  });

  // Update inventory (add back returned quantity, but not lost items)
  updateInventory(materialTypeId, quantityReturned);

  saveCustomers(customers);
  return true;
}

// Calculations
const PENALTY_PER_ITEM_PER_DAY = 10;

// Calculate rent for a specific site
export function calculateSiteRent(site: Site): {
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
    initialQuantity: number;
    rentAmount: number;
    issueLoadingCharge: number;
  }>;
} {
  const days = differenceInDays(new Date(), new Date(site.issueDate));
  
  // Determine max grace period from materials at this site
  let maxGracePeriod = 20;
  site.materials.forEach(m => {
    const mt = getMaterialType(m.materialTypeId);
    if (mt && mt.gracePeriodDays > maxGracePeriod) {
      maxGracePeriod = mt.gracePeriodDays;
    }
  });
  
  // If no materials left, check history for grace period
  if (site.materials.length === 0) {
    site.history.filter(h => h.action === "Issued").forEach(h => {
      if (h.materialTypeId) {
        const mt = getMaterialType(h.materialTypeId);
        if (mt && mt.gracePeriodDays > maxGracePeriod) {
          maxGracePeriod = mt.gracePeriodDays;
        }
      }
    });
  }
  
  const isWithinGracePeriod = days <= maxGracePeriod;
  const daysOverdue = Math.max(0, days - maxGracePeriod);
  
  let returnLoadingCharges = 0;
  let lostItemsPenalty = 0;
  const materialBreakdown: Array<any> = [];
  
  // Use stored original charges
  const rentAmount = site.originalRentCharge;
  const issueLoadingCharges = site.originalIssueLC;
  
  // Build material breakdown
  site.materials.forEach(material => {
    const materialType = getMaterialType(material.materialTypeId);
    if (!materialType) return;
    
    materialBreakdown.push({
      materialType,
      quantity: material.quantity,
      initialQuantity: material.initialQuantity,
      rentAmount: 0,
      issueLoadingCharge: 0
    });
  });
  
  // Calculate return loading charges and lost items from history
  site.history.forEach(event => {
    if (site.lastSettlementDate && event.date <= site.lastSettlementDate) {
      return;
    }
    
    if (event.action === "Returned" && event.materialTypeId) {
      const materialType = getMaterialType(event.materialTypeId);
      if (!materialType) return;
      
      if (!event.hasOwnLabor && event.quantity) {
        returnLoadingCharges += event.quantity * materialType.loadingCharge;
      }
      
      if (event.quantityLost) {
        lostItemsPenalty += event.quantityLost * materialType.lostItemPenalty;
      }
    }
  });
  
  // Calculate total initial items for penalty
  let totalInitialItems = site.materials.reduce((sum, m) => sum + (m.initialQuantity || 0), 0);
  
  if (totalInitialItems === 0) {
    totalInitialItems = site.history
      .filter(h => h.action === "Issued")
      .reduce((sum, h) => sum + (h.quantity || 0), 0);
  }
  
  const penaltyAmount = daysOverdue * totalInitialItems * PENALTY_PER_ITEM_PER_DAY;
  
  // Calculate base charges
  const baseCharges = rentAmount + issueLoadingCharges + penaltyAmount;
  const unpaidBase = Math.max(0, baseCharges - site.amountPaid);
  const overpayment = Math.max(0, site.amountPaid - baseCharges);
  
  const newCharges = returnLoadingCharges + lostItemsPenalty;
  const newChargesAfterOverpayment = Math.max(0, newCharges - overpayment);
  
  const totalRequired = unpaidBase + newChargesAfterOverpayment;
  const amountPaidTowardsNew = Math.min(overpayment, newCharges);
  
  const remainingDue = totalRequired;
  const isFullyPaid = remainingDue === 0 && site.materials.every(m => m.quantity === 0);
  
  return {
    days,
    isWithinGracePeriod,
    daysOverdue,
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

// Calculate aggregate rent across all sites for a customer (for backward compatibility)
export function calculateRent(customer: Customer): { 
  totalRemainingDue: number;
  totalPendingAmount: number;
  sites: Array<{
    site: Site;
    calculation: ReturnType<typeof calculateSiteRent>;
  }>;
} {
  // Aggregate calculations across all sites
  const siteCalculations = customer.sites.map(site => ({
    site,
    calculation: calculateSiteRent(site)
  }));
  
  const totalRemainingDue = siteCalculations.reduce((sum, sc) => sum + sc.calculation.remainingDue, 0);
  
  return {
    totalRemainingDue,
    totalPendingAmount: totalRemainingDue,
    sites: siteCalculations
  };
}

// Record payment
export function recordPayment(customerId: string, siteId: string, amount: number, paymentMethod?: string, paymentDate?: string): boolean {
  const customers = getCustomers();
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) return false;

  const site = customer.sites.find(s => s.id === siteId);
  if (!site) return false;

  // Use provided date or current date
  const recordDate = paymentDate || new Date().toISOString();

  // Calculate what's owed for this site
  const siteCalc = calculateSiteRent(site);
  const siteOwed = siteCalc.remainingDue;

  // First, try to use customer's advance deposit
  let remainingAmount = amount;
  let usedAdvance = 0;
  
  if (customer.advanceDeposit > 0 && siteOwed > 0) {
    usedAdvance = Math.min(customer.advanceDeposit, siteOwed);
    customer.advanceDeposit -= usedAdvance;
    site.amountPaid += usedAdvance;
    
    site.history.push({
      date: recordDate,
      action: "Payment",
      siteId: site.id,
      amount: usedAdvance,
      paymentMethod: "Advance Deposit"
    });
  }

  // Now apply the new payment
  const amountForSite = Math.min(remainingAmount, siteOwed - usedAdvance);
  const excessAmount = remainingAmount - amountForSite;

  if (amountForSite > 0) {
    site.amountPaid += amountForSite;
    site.history.push({
      date: recordDate,
      action: "Payment",
      siteId: site.id,
      amount: amountForSite,
      paymentMethod: paymentMethod || "Cash"
    });
  }

  // Store excess as customer advance deposit
  if (excessAmount > 0) {
    customer.advanceDeposit += excessAmount;
  }

  // Check if site is fully paid and all materials returned
  const updatedSiteCalc = calculateSiteRent(site);
  if (updatedSiteCalc.isFullyPaid) {
    // Mark settlement and reset cycle for this site
    site.lastSettlementDate = recordDate;
    site.amountPaid = 0;
    site.originalRentCharge = 0;
    site.originalIssueLC = 0;
    // Reset initialQuantity for any remaining materials
    site.materials.forEach(m => {
      m.initialQuantity = m.quantity;
    });
  }

  saveCustomers(customers);
  return true;
}

// Dashboard stats
export function getDashboardStats() {
  const customers = getCustomers();
  // Count customers with at least one site that has materials
  const active = customers.filter((c) => c.sites.some(s => s.materials.some(m => m.quantity > 0)));
  
  // Count total items across all sites
  const totalItemsRented = customers.reduce((total, c) => {
    return total + c.sites.reduce((siteTotal, site) => {
      return siteTotal + site.materials.reduce((matTotal, m) => matTotal + m.quantity, 0);
    }, 0);
  }, 0);
  
  // Calculate total pending across all customers and sites
  const totalPendingAmount = customers.reduce((total, c) => {
    const customerCalc = calculateRent(c);
    return total + customerCalc.totalPendingAmount;
  }, 0);

  return {
    totalCustomers: active.length,
    totalItemsRented,
    totalPendingAmount,
  };
}
