import { differenceInDays } from "date-fns";
import * as SupabaseStore from './supabase-store';

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
    aadharPhoto?: string;
    address?: string;
    referral?: string;
  },
  shippingDetails?: {
    vehicleNo?: string;
    challanNo?: string;
  },
  customLoadingCharge?: number
): Promise<boolean> {
  try {
    // Check if enough inventory available
    const available = await getAvailableStock(materialTypeId);
    if (available < quantity) {
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
        // Calculate rent based on ORIGINAL site issue date, not new materials
        const daysSinceOriginalIssue = differenceInDays(new Date(issueDate), new Date(site.issueDate));
        const daysToCharge = Math.max(materialType.gracePeriodDays, daysSinceOriginalIssue);
        const rentCharge = quantity * materialType.rentPerDay * daysToCharge;
        const issueLC = hasOwnLabor ? 0 : (customLoadingCharge !== undefined ? customLoadingCharge : quantity * materialType.loadingCharge);
        // Add to existing site
        const existingMaterial = site.materials.find(m => m.materialTypeId === materialTypeId);
        
        if (existingMaterial) {
          // Update existing material quantity
          await SupabaseStore.updateMaterialQuantity(
            site.id,
            materialTypeId,
            existingMaterial.quantity + quantity
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
          hasOwnLabor
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
              paymentMethod: "Advance Deposit"
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
              paymentMethod: "Cash"
            });
          }
        }
      } else {
        // Create new site for existing customer - use full grace period
        const rentCharge = quantity * materialType.rentPerDay * materialType.gracePeriodDays;
        const issueLC = hasOwnLabor ? 0 : (customLoadingCharge !== undefined ? customLoadingCharge : quantity * materialType.loadingCharge);
        
        const historyEvents: Array<any> = [
          {
            date: issueDate,
            action: "Issued" as const,
            materialTypeId,
            quantity,
            hasOwnLabor
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
            paymentMethod: "Advance Deposit"
          });
        }

        // Add deposit if provided
        if (depositAmount > 0) {
          initialAmountPaid += depositAmount;
          historyEvents.push({
            date: issueDate,
            action: "Payment" as const,
            amount: depositAmount,
            paymentMethod: "Cash"
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
            amountPaid: initialAmountPaid
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
      // Create new customer with first site - use full grace period
      const rentCharge = quantity * materialType.rentPerDay * materialType.gracePeriodDays;
      const issueLC = hasOwnLabor ? 0 : (customLoadingCharge !== undefined ? customLoadingCharge : quantity * materialType.loadingCharge);
      
      const historyEvents: Array<any> = [
        {
          date: issueDate,
          action: "Issued" as const,
          materialTypeId,
          quantity,
          hasOwnLabor
        }
      ];

      if (depositAmount > 0) {
        historyEvents.push({
          date: issueDate,
          action: "Payment" as const,
          amount: depositAmount,
          paymentMethod: "Cash"
        });
      }

      await SupabaseStore.createCustomerWithSite(
        {
          name,
          registrationName: clientDetails?.registrationName,
          contactNo: clientDetails?.contactNo,
          aadharPhoto: clientDetails?.aadharPhoto,
          address: clientDetails?.address,
          referral: clientDetails?.referral
        },
        {
          siteName,
          location,
          issueDate,
          originalRentCharge: rentCharge,
          originalIssueLC: issueLC
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
    await updateInventory(materialTypeId, -quantity);

    return true;
  } catch (error) {
    console.error('Error issuing materials:', error);
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
  hasOwnLabor: boolean
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
      date: new Date().toISOString(),
      action: "Returned",
      materialTypeId,
      quantity: quantityReturned,
      quantityLost,
      hasOwnLabor
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
export async function recordPayment(customerId: string, siteId: string, amount: number, paymentMethod?: string, paymentDate?: string): Promise<boolean> {
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
        paymentMethod: "Advance Deposit"
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
          paymentMethod: paymentMethod || "Cash"
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
