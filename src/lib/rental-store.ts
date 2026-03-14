import { differenceInDays } from "date-fns";
import * as SupabaseStore from './supabase-store';

// Material Types Configuration
export interface MaterialType {
  id: string;
  category: string; // Category for grouping
  name: string;
  size: string;
  rentPerDay: number;
  monthlyRate: number; // Monthly rate per item
  loadingCharge: number; // LC&ULC per item
  lostItemPenalty: number; // Rate in RS
  gracePeriodDays: number; // 20 or 30 days
  inventory: number; // Available stock
}

export const MATERIAL_TYPES: MaterialType[] = [
  // PLATES Category - 0 Days Grace Period (Daily calculation)
  { id: "plate-3x2", category: "Plates", name: "Plates", size: "3'x2'", rentPerDay: 2, monthlyRate: 60, loadingCharge: 1.5, lostItemPenalty: 1200, gracePeriodDays: 0, inventory: 7500 },
  { id: "plate-3x1", category: "Plates", name: "Plates", size: "3'x1'", rentPerDay: 1.25, monthlyRate: 37.5, loadingCharge: 1, lostItemPenalty: 800, gracePeriodDays: 0, inventory: 956 },
  { id: "plate-2x1", category: "Plates", name: "Plates", size: "2'x1'", rentPerDay: 1, monthlyRate: 30, loadingCharge: 1, lostItemPenalty: 600, gracePeriodDays: 0, inventory: 248 },
  { id: "new-changed-3x2", category: "Plates", name: "New Changed", size: "3'x2'", rentPerDay: 2, monthlyRate: 60, loadingCharge: 1.5, lostItemPenalty: 1200, gracePeriodDays: 0, inventory: 1000 },
  { id: "change-plate-3x2", category: "Plates", name: "Old Changed", size: "3'x2'", rentPerDay: 2, monthlyRate: 60, loadingCharge: 1.5, lostItemPenalty: 1200, gracePeriodDays: 0, inventory: 1461 },
  { id: "change-plate-3x1", category: "Plates", name: "Old Changed", size: "3'x1'", rentPerDay: 1.25, monthlyRate: 37.5, loadingCharge: 1, lostItemPenalty: 800, gracePeriodDays: 0, inventory: 1 },
  
  // PROPS Category - 30 Days
  { id: "props-2x2", category: "Props", name: "Props", size: "2mx2m", rentPerDay: 2.83334, monthlyRate: 85, loadingCharge: 3, lostItemPenalty: 1440, gracePeriodDays: 30, inventory: 2937 },
  { id: "props-2x2.5", category: "Props", name: "Props", size: "2mx2.5m", rentPerDay: 3, monthlyRate: 90, loadingCharge: 3, lostItemPenalty: 1600, gracePeriodDays: 30, inventory: 650 },
  { id: "props-2x3", category: "Props", name: "Props", size: "2mx3m", rentPerDay: 3.33334, monthlyRate: 100, loadingCharge: 3, lostItemPenalty: 1760, gracePeriodDays: 30, inventory: 1243 },
  { id: "props-2x3.5", category: "Props", name: "Props", size: "2mx3.5m", rentPerDay: 3.66667, monthlyRate: 110, loadingCharge: 3, lostItemPenalty: 1920, gracePeriodDays: 30, inventory: 225 },
  { id: "props-2x4", category: "Props", name: "Props", size: "2mx4m", rentPerDay: 4, monthlyRate: 120, loadingCharge: 3, lostItemPenalty: 2000, gracePeriodDays: 30, inventory: 287 },
  
  // SPAN Category - 30 Days
  { id: "box-span", category: "Span", name: "Box Span", size: "", rentPerDay: 4.16667, monthlyRate: 125, loadingCharge: 3, lostItemPenalty: 2240, gracePeriodDays: 30, inventory: 512 },
  { id: "zig-zag-span", category: "Span", name: "Zig-Zag Span", size: "", rentPerDay: 6, monthlyRate: 180, loadingCharge: 5, lostItemPenalty: 3200, gracePeriodDays: 30, inventory: 224 },
  
  // H FRAME Category - 30 Days
  { id: "h-frame-with-ladder", category: "H Frame", name: "H-Frame", size: "With Ladder", rentPerDay: 5, monthlyRate: 150, loadingCharge: 5, lostItemPenalty: 2000, gracePeriodDays: 30, inventory: 134 },
  { id: "h-frame-without-ladder", category: "H Frame", name: "H-Frame", size: "Without Ladder", rentPerDay: 4, monthlyRate: 120, loadingCharge: 5, lostItemPenalty: 1760, gracePeriodDays: 30, inventory: 190 },
  { id: "h-frame-1m", category: "H Frame", name: "H-Frame", size: "1m", rentPerDay: 3, monthlyRate: 90, loadingCharge: 4, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 20 },
  { id: "cbp-small", category: "H Frame", name: "CBP", size: "Small", rentPerDay: 2, monthlyRate: 60, loadingCharge: 1, lostItemPenalty: 640, gracePeriodDays: 30, inventory: 40 },
  { id: "cbp", category: "H Frame", name: "CBP", size: "", rentPerDay: 2, monthlyRate: 60, loadingCharge: 1, lostItemPenalty: 640, gracePeriodDays: 30, inventory: 50 },
  { id: "planks", category: "H Frame", name: "Planks", size: "", rentPerDay: 5, monthlyRate: 150, loadingCharge: 4, lostItemPenalty: 1600, gracePeriodDays: 30, inventory: 365 },
  { id: "base-wheels", category: "H Frame", name: "Base Wheels", size: "", rentPerDay: 2, monthlyRate: 60, loadingCharge: 1, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 33 },
  { id: "base-jack", category: "H Frame", name: "Base Jack", size: "", rentPerDay: 1, monthlyRate: 30, loadingCharge: 1, lostItemPenalty: 300, gracePeriodDays: 30, inventory: 1218 },
  
  // SCAFFOLDING Category - 30 Days
  { id: "vertical-3m", category: "Scaffolding", name: "Vertical", size: "3m", rentPerDay: 3, monthlyRate: 90, loadingCharge: 2, lostItemPenalty: 1120, gracePeriodDays: 30, inventory: 637 },
  { id: "vertical-2.5m", category: "Scaffolding", name: "Vertical", size: "2.5m", rentPerDay: 2.5, monthlyRate: 75, loadingCharge: 2, lostItemPenalty: 933.33, gracePeriodDays: 30, inventory: 514 },
  { id: "vertical-2m", category: "Scaffolding", name: "Vertical", size: "2m", rentPerDay: 2, monthlyRate: 60, loadingCharge: 2, lostItemPenalty: 746.66, gracePeriodDays: 30, inventory: 470 },
  { id: "vertical-1.5m", category: "Scaffolding", name: "Vertical", size: "1.5m", rentPerDay: 1.5, monthlyRate: 45, loadingCharge: 2, lostItemPenalty: 560, gracePeriodDays: 30, inventory: 547 },
  { id: "vertical-1m", category: "Scaffolding", name: "Vertical", size: "1m", rentPerDay: 1, monthlyRate: 30, loadingCharge: 2, lostItemPenalty: 373.33, gracePeriodDays: 30, inventory: 307 },
  { id: "vertical-0.5m", category: "Scaffolding", name: "Vertical", size: "0.5m", rentPerDay: 0.5, monthlyRate: 15, loadingCharge: 2, lostItemPenalty: 186.66, gracePeriodDays: 30, inventory: 91 },
  { id: "ledger-2m", category: "Scaffolding", name: "Ledger", size: "2m", rentPerDay: 1.66667, monthlyRate: 50, loadingCharge: 1, lostItemPenalty: 573.33, gracePeriodDays: 30, inventory: 71 },
  { id: "ledger-1.5m", category: "Scaffolding", name: "Ledger", size: "1.5m", rentPerDay: 1.25, monthlyRate: 37.5, loadingCharge: 1, lostItemPenalty: 429.6, gracePeriodDays: 30, inventory: 153 },
  { id: "ledger-1.2m", category: "Scaffolding", name: "Ledger", size: "1.2m", rentPerDay: 1, monthlyRate: 30, loadingCharge: 1, lostItemPenalty: 344, gracePeriodDays: 30, inventory: 4686 },
  { id: "ledger-1m", category: "Scaffolding", name: "Ledger", size: "1m", rentPerDay: 0.83334, monthlyRate: 25, loadingCharge: 1, lostItemPenalty: 286.66, gracePeriodDays: 30, inventory: 1034 },
  { id: "joint-pins", category: "Scaffolding", name: "Joint Pins", size: "", rentPerDay: 0.33334, monthlyRate: 10, loadingCharge: 0.5, lostItemPenalty: 80, gracePeriodDays: 30, inventory: 1282 },
  { id: "planks-scaffolding", category: "Scaffolding", name: "Planks", size: "", rentPerDay: 5, monthlyRate: 150, loadingCharge: 4, lostItemPenalty: 1600, gracePeriodDays: 30, inventory: 0 },
  { id: "base-jack-scaffolding", category: "Scaffolding", name: "Base Jack", size: "", rentPerDay: 1, monthlyRate: 30, loadingCharge: 1, lostItemPenalty: 300, gracePeriodDays: 30, inventory: 0 },
  { id: "stirrup-head", category: "Scaffolding", name: "Stirrup Head", size: "", rentPerDay: 1, monthlyRate: 30, loadingCharge: 1, lostItemPenalty: 300, gracePeriodDays: 30, inventory: 1201 },
  { id: "base-wheels-scaffolding", category: "Scaffolding", name: "Base Wheels", size: "", rentPerDay: 2, monthlyRate: 60, loadingCharge: 1, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  
  // BRACING PIPE Category - 30 Days
  { id: "bracing-pipe-20ft", category: "Bracing Pipe", name: "Bracing Pipe", size: "20'/6m", rentPerDay: 5, monthlyRate: 150, loadingCharge: 4, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 154 },
  { id: "bracing-pipe-10ft", category: "Bracing Pipe", name: "Bracing Pipe", size: "10'/3m", rentPerDay: 2.5, monthlyRate: 75, loadingCharge: 2, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  { id: "coupler", category: "Bracing Pipe", name: "Coupler", size: "", rentPerDay: 0.33334, monthlyRate: 10, loadingCharge: 0.5, lostItemPenalty: 80, gracePeriodDays: 30, inventory: 591 },
  
  // C CHANNEL Category - 30 Days
  { id: "c-channel-3-5m", category: "C Channel", name: "C Channel 3\"", size: "5m", rentPerDay: 0, monthlyRate: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  { id: "c-channel-3-6m", category: "C Channel", name: "C Channel 3\"", size: "6m", rentPerDay: 0, monthlyRate: 120, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 16 },
  { id: "c-channel-4-3m", category: "C Channel", name: "C Channel 4\"", size: "3m", rentPerDay: 0, monthlyRate: 60, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  { id: "c-channel-4-5m", category: "C Channel", name: "C Channel 4\"", size: "5m", rentPerDay: 0, monthlyRate: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 11 },
  { id: "c-channel-4-6m", category: "C Channel", name: "C Channel 4\"", size: "6m", rentPerDay: 0, monthlyRate: 300, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  
  // I-SECTION Category - 30 Days
  { id: "i-section-5-3m", category: "I-Section", name: "I-Section 5\"", size: "3m", rentPerDay: 0, monthlyRate: 90, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 25 },
  { id: "i-section-5-6m", category: "I-Section", name: "I-Section 5\"", size: "6m", rentPerDay: 0, monthlyRate: 180, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  
  // ROUND COLUMN Category - 30 Days
  { id: "round-column-9", category: "Round Column", name: "Round Column", size: "9\"", rentPerDay: 0, monthlyRate: 1000, loadingCharge: 4, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  { id: "round-column-12", category: "Round Column", name: "Round Column", size: "12\"", rentPerDay: 0, monthlyRate: 1200, loadingCharge: 4, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 2 },
  { id: "round-column-18", category: "Round Column", name: "Round Column", size: "18\"", rentPerDay: 0, monthlyRate: 1800, loadingCharge: 4, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 2 },
  
  // EXTRA Category - 30 Days
  { id: "tie-rod", category: "Extra", name: "Tie Rod", size: "1.2m", rentPerDay: 0.83334, monthlyRate: 45, loadingCharge: 1, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  { id: "tie-channel-2", category: "Extra", name: "Tie Channel", size: "2'", rentPerDay: 1.5, monthlyRate: 45, loadingCharge: 1, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  { id: "tie-channel-4", category: "Extra", name: "Tie Channel", size: "4'", rentPerDay: 0, monthlyRate: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  { id: "anchor-nut", category: "Extra", name: "Anchor Nut", size: "", rentPerDay: 0, monthlyRate: 20, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  
  // CONCRETING Category - 30 Days
  { id: "electric-mixer", category: "Concreting", name: "Electric Mixer", size: "", rentPerDay: 0, monthlyRate: 1000, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 3 },
  { id: "wheel-barrow", category: "Concreting", name: "Wheel Barrow", size: "", rentPerDay: 0, monthlyRate: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
  { id: "concreting-tray", category: "Concreting", name: "Concreting Tray", size: "", rentPerDay: 0, monthlyRate: 0, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 1 },
  { id: "material-lift", category: "Concreting", name: "Material Lift", size: "", rentPerDay: 0, monthlyRate: 8000, loadingCharge: 0, lostItemPenalty: 0, gracePeriodDays: 30, inventory: 0 },
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
  id?: string; // UUID from database
  date: string; // ISO string
  action: "Issued" | "Returned" | "Payment" | "Invoice";
  siteId?: string; // Which site this event belongs to
  materialTypeId?: string;
  quantity?: number;
  amount?: number; // For payment records
  hasOwnLabor?: boolean;
  quantityLost?: number;
  paymentMethod?: string; // Payment method used (Father, Mother, Own, Cash, or custom)
  paymentScreenshot?: string; // Base64 encoded screenshot for UPI/Bank Transfer
  employeeId?: string; // ID of employee who performed this action
  transportCharges?: number; // Transportation charges for returns
  invoiceNumber?: string; // Invoice number if this is an invoice generation event
}

export interface Site {
  id: string;
  siteName: string; // Name of the construction site
  location: string; // Location/region of the site
  issueDate: string; // When materials were first issued to this site
  gracePeriodEndDate?: string; // End date of grace period (optional, if not set uses material type grace period)
  materials: MaterialItem[]; // Materials at this site
  amountPaid: number; // Amount paid for this site
  lastSettlementDate: string | null;
  originalRentCharge: number; // Original rent charge for this site
  originalIssueLC: number; // Original issue LC for this site
  history: HistoryEvent[]; // History specific to this site
  vehicleNo?: string; // Vehicle number used for shipping
  challanNo?: string; // Challan number for the shipment
  totalDueOverride?: number; // Manual override for total due
  useOverride?: boolean; // Whether to use override instead of calculated
}

export interface Customer {
  id: string;
  name: string;
  registrationName?: string; // Official registration name
  contactNo?: string; // Primary contact number
  contacts?: Array<{ name: string; number: string }>; // Multiple contacts with names
  aadharPhoto?: string; // Base64 encoded Aadhar photo
  address?: string; // Address
  referral?: string; // Referral source (who referred this customer)
  sites: Site[]; // Multiple sites for this customer
  createdDate: string; // When customer was created
  advanceDeposit: number; // Customer-level advance deposit (excess payments)
}

const SESSION_KEY = "rental_session";

// Credentials (kept for backward compatibility, will be replaced with Supabase Auth)
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

// Inventory Management
export async function getInventory(): Promise<Record<string, number>> {
  return await SupabaseStore.getInventory();
}

export async function getAvailableStock(materialTypeId: string): Promise<number> {
  const inventory = await getInventory();
  return inventory[materialTypeId] || 0;
}

export async function updateInventory(materialTypeId: string, change: number): Promise<boolean> {
  return await SupabaseStore.adjustInventory(materialTypeId, change);
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
export async function getCustomers(): Promise<Customer[]> {
  return await SupabaseStore.getCustomers();
}

// Get material type by ID
export function getMaterialType(id: string): MaterialType | undefined {
  return MATERIAL_TYPES.find(m => m.id === id);
}

// Issue materials
export async function issueMaterials(
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
    contacts?: Array<{ name: string; number: string }>;
    aadharPhoto?: string;
    address?: string;
    referral?: string;
  },
  shippingDetails?: {
    vehicleNo?: string;
    challanNo?: string;
  },
  customLoadingCharge?: number,
  employeeId?: string,
  transportCharges?: number,
  gracePeriodEndDate?: string
): Promise<boolean> {
  try {
    // Check if enough inventory available
    const available = await getAvailableStock(materialTypeId);
    
    // If no inventory record exists, create one with the material type's default inventory
    if (available === 0) {
      const materialType = getMaterialType(materialTypeId);
      if (materialType) {
        console.log(`Initializing inventory for ${materialType.name} with ${materialType.inventory} items`);
        await SupabaseStore.updateInventory(materialTypeId, materialType.inventory);
        // Re-check available stock after initialization
        const newAvailable = await getAvailableStock(materialTypeId);
        if (newAvailable < quantity) {
          console.error(`Not enough stock: need ${quantity}, have ${newAvailable}`);
          return false;
        }
      } else {
        console.error(`Material type ${materialTypeId} not found`);
        return false;
      }
    } else if (available < quantity) {
      console.error(`Not enough stock: need ${quantity}, have ${available}`);
      return false; // Not enough stock
    }

    const customers = await getCustomers();
    const existing = customers.find((c) => c.name.toLowerCase() === name.toLowerCase());

    const materialType = getMaterialType(materialTypeId);
    if (!materialType) return false;

    if (existing) {
      // Find existing site for this customer
      const site = existing.sites.find(s =>
        s.siteName.toLowerCase() === siteName.toLowerCase() &&
        s.location.toLowerCase() === location.toLowerCase()
      );

      if (site) {
        // Calculate rent based on grace period end date logic
        let rentCharge: number;
        
        if (site.gracePeriodEndDate) {
          const newMaterialIssueDate = new Date(issueDate);
          const gracePeriodEnd = new Date(site.gracePeriodEndDate);
          
          if (newMaterialIssueDate <= gracePeriodEnd) {
            // Scenario 1: Materials issued BEFORE grace period end date
            // Calculate rent from issue date to grace period end date
            const daysUntilGraceEnd = differenceInDays(gracePeriodEnd, newMaterialIssueDate);
            rentCharge = quantity * materialType.rentPerDay * daysUntilGraceEnd;
          } else {
            // Scenario 2: Materials issued AFTER grace period end date
            // Calculate rent per day from issue date onwards (no grace period)
            // Charge for 1 day minimum (the issue day itself)
            rentCharge = quantity * materialType.rentPerDay * 1;
          }
        } else {
          // Fallback: Use original logic for backward compatibility
          const daysSinceOriginalIssue = differenceInDays(new Date(issueDate), new Date(site.issueDate));
          const daysToCharge = Math.max(materialType.gracePeriodDays, daysSinceOriginalIssue);
          rentCharge = quantity * materialType.rentPerDay * daysToCharge;
        }
        
        const issueLC = hasOwnLabor ? 0 : (customLoadingCharge !== undefined ? customLoadingCharge : quantity * materialType.loadingCharge);
        // Add to existing site
        const existingMaterial = site.materials.find(m => m.materialTypeId === materialTypeId);
        
        if (existingMaterial) {
          // Update existing material quantity and initialQuantity
          const newQuantity = existingMaterial.quantity + quantity;
          const newInitialQuantity = existingMaterial.initialQuantity + quantity;
          
          await SupabaseStore.updateMaterialQuantity(
            site.id,
            materialTypeId,
            newQuantity
          );
          
          // Also update initialQuantity
          await SupabaseStore.updateMaterialInitialQuantity(
            site.id,
            materialTypeId,
            newInitialQuantity
          );
        } else {
          // Add new material type to site
          await SupabaseStore.addMaterialToSite(site.id, {
            materialTypeId,
            quantity,
            initialQuantity: quantity,
            issueDate,
            hasOwnLabor
          });
        }
        
        // Update site charges
        await SupabaseStore.updateSiteCharges(site.id, rentCharge, issueLC);
        
        // Add history event
        await SupabaseStore.addHistoryEvent(site.id, {
          date: issueDate,
          action: "Issued",
          materialTypeId,
          quantity,
          hasOwnLabor,
          transportCharges: transportCharges || undefined,
          employeeId
        });

        // Auto-apply customer advance deposit to this site
        if (existing.advanceDeposit > 0) {
          const amountToApply = Math.min(existing.advanceDeposit, rentCharge + issueLC);
          await SupabaseStore.updateCustomerAdvanceDeposit(
            existing.id,
            existing.advanceDeposit - amountToApply
          );
          
          const currentSite = (await getCustomers())
            .find(c => c.id === existing.id)?.sites
            .find(s => s.id === site.id);
          
          if (currentSite) {
            await SupabaseStore.updateSitePayment(site.id, currentSite.amountPaid + amountToApply);
            await SupabaseStore.addHistoryEvent(site.id, {
              date: issueDate,
              action: "Payment",
              amount: amountToApply,
              paymentMethod: "Advance Deposit",
              employeeId
            });
          }
        }

        // Add deposit as payment if provided
        if (depositAmount > 0) {
          const currentSite = (await getCustomers())
            .find(c => c.id === existing.id)?.sites
            .find(s => s.id === site.id);
          
          if (currentSite) {
            await SupabaseStore.updateSitePayment(site.id, currentSite.amountPaid + depositAmount);
            await SupabaseStore.addHistoryEvent(site.id, {
              date: issueDate,
              action: "Payment",
              amount: depositAmount,
              paymentMethod: "Cash",
              employeeId
            });
          }
        }
      } else {
        // Create new site for existing customer
        // Use monthly rate for materials with grace period, day calculation for plates (0 grace period)
        const rentCharge = materialType.gracePeriodDays > 0 
          ? quantity * materialType.monthlyRate 
          : quantity * materialType.rentPerDay * (gracePeriodEndDate ? differenceInDays(new Date(gracePeriodEndDate), new Date(issueDate)) + 1 : 30);
        const issueLC = hasOwnLabor ? 0 : (customLoadingCharge !== undefined ? customLoadingCharge : quantity * materialType.loadingCharge);
        
        const historyEvents: Array<any> = [
          {
            date: issueDate,
            action: "Issued" as const,
            materialTypeId,
            quantity,
            hasOwnLabor,
            transportCharges: transportCharges || undefined,
            employeeId
          }
        ];

        let initialAmountPaid = 0;

        // Auto-apply customer advance deposit to new site
        if (existing.advanceDeposit > 0) {
          const amountToApply = Math.min(existing.advanceDeposit, rentCharge + issueLC);
          initialAmountPaid += amountToApply;
          
          await SupabaseStore.updateCustomerAdvanceDeposit(
            existing.id,
            existing.advanceDeposit - amountToApply
          );
          
          historyEvents.push({
            date: issueDate,
            action: "Payment" as const,
            amount: amountToApply,
            paymentMethod: "Advance Deposit",
            employeeId
          });
        }

        // Add deposit if provided
        if (depositAmount > 0) {
          initialAmountPaid += depositAmount;
          historyEvents.push({
            date: issueDate,
            action: "Payment" as const,
            amount: depositAmount,
            paymentMethod: "Cash",
            employeeId
          });
        }

        await SupabaseStore.addSiteToCustomer(
          existing.id,
          {
            siteName,
            location,
            issueDate,
            originalRentCharge: rentCharge,
            originalIssueLC: issueLC,
            amountPaid: initialAmountPaid,
            vehicleNo: shippingDetails?.vehicleNo,
            challanNo: shippingDetails?.challanNo,
            gracePeriodEndDate
          },
          [{
            materialTypeId,
            quantity,
            initialQuantity: quantity,
            issueDate,
            hasOwnLabor
          }],
          historyEvents
        );
      }
    } else {
      // Create new customer with first site
      // Use monthly rate for materials with grace period, day calculation for plates (0 grace period)
      const rentCharge = materialType.gracePeriodDays > 0 
        ? quantity * materialType.monthlyRate 
        : quantity * materialType.rentPerDay * (gracePeriodEndDate ? differenceInDays(new Date(gracePeriodEndDate), new Date(issueDate)) + 1 : 30);
      const issueLC = hasOwnLabor ? 0 : (customLoadingCharge !== undefined ? customLoadingCharge : quantity * materialType.loadingCharge);
      
      const historyEvents: Array<any> = [
        {
          date: issueDate,
          action: "Issued" as const,
          materialTypeId,
          quantity,
          hasOwnLabor,
          transportCharges: transportCharges || undefined,
          employeeId
        }
      ];

      if (depositAmount > 0) {
        historyEvents.push({
          date: issueDate,
          action: "Payment" as const,
          amount: depositAmount,
          paymentMethod: "Cash",
          employeeId
        });
      }

      await SupabaseStore.createCustomerWithSite(
        {
          name,
          registrationName: clientDetails?.registrationName,
          contactNo: clientDetails?.contactNo,
          contacts: clientDetails?.contacts,
          aadharPhoto: clientDetails?.aadharPhoto,
          address: clientDetails?.address,
          referral: clientDetails?.referral
        },
        {
          siteName,
          location,
          issueDate,
          originalRentCharge: rentCharge,
          originalIssueLC: issueLC,
          vehicleNo: shippingDetails?.vehicleNo,
          challanNo: shippingDetails?.challanNo,
          gracePeriodEndDate
        },
        [{
          materialTypeId,
          quantity,
          initialQuantity: quantity,
          issueDate,
          hasOwnLabor
        }],
        historyEvents
      );
    }

    // Update inventory (subtract issued quantity)
    const inventoryUpdated = await updateInventory(materialTypeId, -quantity);
    if (!inventoryUpdated) {
      console.error('Failed to update inventory after issuing materials');
      // Materials were issued but inventory wasn't updated - this is a data inconsistency
      // Log the error but still return true since materials were issued
    }

    return true;
  } catch (error) {
    console.error('Error issuing materials:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}

// Record return
export async function recordReturn(
  customerId: string,
  siteId: string,
  materialTypeId: string,
  quantityReturned: number,
  quantityLost: number,
  hasOwnLabor: boolean,
  returnDate?: string,
  employeeId?: string,
  transportCharges?: number
): Promise<boolean> {
  try {
    const customers = await getCustomers();
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return false;

    const site = customer.sites.find(s => s.id === siteId);
    if (!site) return false;

    const material = site.materials.find(m => m.materialTypeId === materialTypeId);
    if (!material || quantityReturned + quantityLost > material.quantity) return false;

    // Update quantity (but keep initialQuantity unchanged)
    const newQuantity = material.quantity - (quantityReturned + quantityLost);
    await SupabaseStore.updateMaterialQuantity(siteId, materialTypeId, newQuantity);
    
    // Add history event
    await SupabaseStore.addHistoryEvent(siteId, {
      date: returnDate || new Date().toISOString(),
      action: "Returned",
      materialTypeId,
      quantity: quantityReturned,
      quantityLost,
      hasOwnLabor,
      employeeId,
      transportCharges
    });

    // Update inventory (add back returned quantity, but not lost items)
    await updateInventory(materialTypeId, quantityReturned);

    return true;
  } catch (error) {
    console.error('Error recording return:', error);
    return false;
  }
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
  transportCharges: number;
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
  
  // Calculate grace period based on gracePeriodEndDate if provided
  let gracePeriodDays: number;
  let isWithinGracePeriod: boolean;
  let daysOverdue: number;
  
  if (site.gracePeriodEndDate) {
    // Use the explicit grace period end date
    gracePeriodDays = differenceInDays(new Date(site.gracePeriodEndDate), new Date(site.issueDate));
    const daysFromIssue = differenceInDays(new Date(), new Date(site.issueDate));
    isWithinGracePeriod = new Date() <= new Date(site.gracePeriodEndDate);
    daysOverdue = Math.max(0, differenceInDays(new Date(), new Date(site.gracePeriodEndDate)));
  } else {
    // Fallback to material type grace period (for backward compatibility)
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
    
    gracePeriodDays = maxGracePeriod;
    isWithinGracePeriod = days <= maxGracePeriod;
    daysOverdue = Math.max(0, days - maxGracePeriod);
  }
  
  let returnLoadingCharges = 0;
  let lostItemsPenalty = 0;
  const materialBreakdown: Array<any> = [];
  
  // Dynamically recalculate rent from history events using new billing logic
  const endDate = site.gracePeriodEndDate ? new Date(site.gracePeriodEndDate) : new Date();
  const siteStartDate = new Date(site.issueDate);
  
  // Group issued materials by materialTypeId + issueDate from history
  const issuedGroups: Map<string, { materialTypeId: string; quantity: number; issueDate: string }> = new Map();
  site.history.forEach(event => {
    if (event.action === "Issued" && event.materialTypeId && event.quantity) {
      const key = `${event.materialTypeId}-${event.date}`;
      const existing = issuedGroups.get(key);
      if (existing) {
        existing.quantity += event.quantity;
      } else {
        issuedGroups.set(key, { materialTypeId: event.materialTypeId, quantity: event.quantity, issueDate: event.date });
      }
    }
  });
  
  let dynamicRentAmount = 0;
  issuedGroups.forEach(group => {
    const mt = getMaterialType(group.materialTypeId);
    if (!mt) return;
    const issueDate = new Date(group.issueDate);
    const isFirstIssue = issueDate.toDateString() === siteStartDate.toDateString();
    
    let groupRent: number;
    if (isFirstIssue && mt.gracePeriodDays > 0) {
      // Monthly rate for first issue materials with grace period
      groupRent = group.quantity * mt.monthlyRate;
    } else {
      // Day calculation for plates (0 grace period) or subsequent issues
      const days = differenceInDays(endDate, issueDate) + 1;
      groupRent = group.quantity * mt.rentPerDay * days;
    }
    dynamicRentAmount += groupRent;
  });
  
  const rentAmount = dynamicRentAmount;
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
  
  // Calculate transportation charges from history
  // Issue transport charges are part of base charges
  // Return transport charges are part of new charges
  const issueTransportCharges = site.history
    .filter(h => {
      if (site.lastSettlementDate && h.date <= site.lastSettlementDate) {
        return false;
      }
      return h.action === "Issued" && h.transportCharges;
    })
    .reduce((sum, h) => sum + (h.transportCharges || 0), 0);
    
  const returnTransportCharges = site.history
    .filter(h => {
      if (site.lastSettlementDate && h.date <= site.lastSettlementDate) {
        return false;
      }
      return h.action === "Returned" && h.transportCharges;
    })
    .reduce((sum, h) => sum + (h.transportCharges || 0), 0);
  
  const transportCharges = issueTransportCharges + returnTransportCharges;
  
  // Calculate additional rent after grace period
  let penaltyAmount = 0;
  if (daysOverdue > 0) {
    // For each material currently at site, charge daily rate × quantity × days overdue
    site.materials.forEach(material => {
      const materialType = getMaterialType(material.materialTypeId);
      if (materialType) {
        penaltyAmount += material.quantity * materialType.rentPerDay * daysOverdue;
      }
    });
  }
  
  // Calculate base charges (includes issue transport charges and additional rent after grace period)
  const baseCharges = rentAmount + issueLoadingCharges + issueTransportCharges + penaltyAmount;
  const unpaidBase = Math.max(0, baseCharges - site.amountPaid);
  const overpayment = Math.max(0, site.amountPaid - baseCharges);
  
  const newCharges = returnLoadingCharges + lostItemsPenalty + returnTransportCharges;
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
    transportCharges,
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
export async function recordPayment(customerId: string, siteId: string, amount: number, paymentMethod?: string, paymentDate?: string, paymentScreenshot?: string, employeeId?: string): Promise<boolean> {
  try {
    const customers = await getCustomers();
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
      await SupabaseStore.updateCustomerAdvanceDeposit(
        customer.id,
        customer.advanceDeposit - usedAdvance
      );
      await SupabaseStore.updateSitePayment(siteId, site.amountPaid + usedAdvance);
      
      await SupabaseStore.addHistoryEvent(siteId, {
        date: recordDate,
        action: "Payment",
        amount: usedAdvance,
        paymentMethod: "Advance Deposit",
        employeeId
      });
    }

    // Now apply the new payment
    const amountForSite = Math.min(remainingAmount, siteOwed - usedAdvance);
    const excessAmount = remainingAmount - amountForSite;

    if (amountForSite > 0) {
      // Refresh site data to get updated amountPaid
      const updatedCustomers = await getCustomers();
      const updatedCustomer = updatedCustomers.find(c => c.id === customerId);
      const updatedSite = updatedCustomer?.sites.find(s => s.id === siteId);
      
      if (updatedSite) {
        await SupabaseStore.updateSitePayment(siteId, updatedSite.amountPaid + amountForSite);
        await SupabaseStore.addHistoryEvent(siteId, {
          date: recordDate,
          action: "Payment",
          amount: amountForSite,
          paymentMethod: paymentMethod || "Cash",
          paymentScreenshot: paymentScreenshot,
          employeeId
        });
      }
    }

    // Store excess as customer advance deposit
    if (excessAmount > 0) {
      // Refresh customer data to get updated advanceDeposit
      const updatedCustomers = await getCustomers();
      const updatedCustomer = updatedCustomers.find(c => c.id === customerId);
      
      if (updatedCustomer) {
        await SupabaseStore.updateCustomerAdvanceDeposit(
          customer.id,
          updatedCustomer.advanceDeposit + excessAmount
        );
      }
    }

    // Check if site is fully paid and all materials returned
    const finalCustomers = await getCustomers();
    const finalCustomer = finalCustomers.find(c => c.id === customerId);
    const finalSite = finalCustomer?.sites.find(s => s.id === siteId);
    
    if (finalSite) {
      const updatedSiteCalc = calculateSiteRent(finalSite);
      if (updatedSiteCalc.isFullyPaid) {
        // Mark settlement and reset cycle for this site
        await SupabaseStore.updateSiteSettlement(siteId, recordDate);
        await SupabaseStore.resetMaterialInitialQuantities(siteId);
      }
    }

    return true;
  } catch (error) {
    console.error('Error recording payment:', error);
    return false;
  }
}

// Dashboard stats
export async function getDashboardStats() {
  const customers = await getCustomers();
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

// Delete customer and restore inventory
export async function deleteCustomer(customerId: string): Promise<boolean> {
  try {
    const customers = await getCustomers();
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) {
      console.error('Customer not found');
      return false;
    }

    // Restore all materials from all sites back to inventory
    for (const site of customer.sites) {
      for (const material of site.materials) {
        if (material.quantity > 0) {
          // Add materials back to inventory
          const restored = await updateInventory(material.materialTypeId, material.quantity);
          if (!restored) {
            console.error(`Failed to restore ${material.quantity} of ${material.materialTypeId}`);
          }
        }
      }
    }

    // Delete customer from database
    const deleted = await SupabaseStore.deleteCustomer(customerId);
    
    if (deleted) {
      console.log(`Customer ${customer.name} deleted and ${customer.sites.reduce((total, site) => total + site.materials.reduce((sum, m) => sum + m.quantity, 0), 0)} items restored to inventory`);
    }
    
    return deleted;
  } catch (error) {
    console.error('Error deleting customer:', error);
    return false;
  }
}

// Delete site and restore inventory
export async function deleteSite(customerId: string, siteId: string): Promise<boolean> {
  try {
    const customers = await getCustomers();
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) {
      console.error('Customer not found');
      return false;
    }

    const site = customer.sites.find(s => s.id === siteId);
    
    if (!site) {
      console.error('Site not found');
      return false;
    }

    // Restore all materials from this site back to inventory
    for (const material of site.materials) {
      if (material.quantity > 0) {
        // Add materials back to inventory
        const restored = await updateInventory(material.materialTypeId, material.quantity);
        if (!restored) {
          console.error(`Failed to restore ${material.quantity} of ${material.materialTypeId}`);
        }
      }
    }

    // Delete site from database
    const deleted = await SupabaseStore.deleteSite(siteId);
    
    if (deleted) {
      const totalRestored = site.materials.reduce((sum, m) => sum + m.quantity, 0);
      console.log(`Site ${site.siteName} deleted and ${totalRestored} items restored to inventory`);
    }
    
    return deleted;
  } catch (error) {
    console.error('Error deleting site:', error);
    return false;
  }
}
