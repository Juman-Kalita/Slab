import { differenceInDays } from "date-fns";

// Types
export interface HistoryEvent {
  date: string; // ISO string
  action: "Issued" | "Returned" | "Payment";
  slabs: number;
  amount?: number; // For payment records
}

export interface Customer {
  id: string;
  name: string;
  issueDate: string; // ISO string of first issue
  slabsHeld: number;
  totalIssued: number;
  totalReturned: number;
  initialSlabs: number; // Slabs taken at start (for base payment calculation)
  amountPaid: number; // Total amount paid in current cycle
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
  
  // Migrate old data format to new format
  return customers.map(c => ({
    ...c,
    initialSlabs: c.initialSlabs ?? c.slabsHeld,
    amountPaid: c.amountPaid ?? 0,
  }));
}

function saveCustomers(customers: Customer[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

// Issue slabs
export function issueSlabs(name: string, slabs: number, issueDate: string): void {
  const customers = getCustomers();
  const existing = customers.find((c) => c.name.toLowerCase() === name.toLowerCase());

  const event: HistoryEvent = { date: issueDate, action: "Issued", slabs };

  if (existing) {
    existing.slabsHeld += slabs;
    existing.totalIssued += slabs;
    existing.history.push(event);
    // If cycle not complete (not fully paid), add to initialSlabs
    const totalRequired = existing.initialSlabs * BASE_PRICE_PER_SLAB;
    if (existing.amountPaid < totalRequired) {
      existing.initialSlabs += slabs;
    }
  } else {
    customers.push({
      id: crypto.randomUUID(),
      name,
      issueDate,
      slabsHeld: slabs,
      totalIssued: slabs,
      totalReturned: 0,
      initialSlabs: slabs,
      amountPaid: 0,
      history: [event],
    });
  }

  saveCustomers(customers);
}

// Record return
export function recordReturn(customerId: string, slabs: number): boolean {
  const customers = getCustomers();
  const customer = customers.find((c) => c.id === customerId);
  if (!customer || slabs > customer.slabsHeld || slabs <= 0) return false;

  customer.slabsHeld -= slabs;
  customer.totalReturned += slabs;
  customer.history.push({
    date: new Date().toISOString(),
    action: "Returned",
    slabs,
  });

  saveCustomers(customers);
  return true;
}

// Calculations
const GRACE_PERIOD_DAYS = 20;
const BASE_PRICE_PER_SLAB = 1000;
const PENALTY_PER_SLAB_PER_DAY = 100;

export function calculateRent(customer: Customer): { 
  days: number; 
  isWithinGracePeriod: boolean;
  daysOverdue: number;
  baseAmount: number;
  penaltyAmount: number;
  totalRequired: number;
  amountPaid: number;
  remainingDue: number;
  isFullyPaid: boolean;
} {
  const days = differenceInDays(new Date(), new Date(customer.issueDate));
  const isWithinGracePeriod = days <= GRACE_PERIOD_DAYS;
  const daysOverdue = Math.max(0, days - GRACE_PERIOD_DAYS);
  
  // Base amount is always for initial slabs taken
  const baseAmount = customer.initialSlabs * BASE_PRICE_PER_SLAB;
  
  // Penalty only applies after grace period
  const penaltyAmount = daysOverdue * customer.initialSlabs * PENALTY_PER_SLAB_PER_DAY;
  
  const totalRequired = baseAmount + penaltyAmount;
  const amountPaid = customer.amountPaid;
  const remainingDue = Math.max(0, totalRequired - amountPaid);
  const isFullyPaid = amountPaid >= totalRequired;
  
  return { 
    days, 
    isWithinGracePeriod,
    daysOverdue,
    baseAmount,
    penaltyAmount,
    totalRequired,
    amountPaid,
    remainingDue,
    isFullyPaid
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
    slabs: 0,
    amount,
  });

  // Check if fully paid
  const rent = calculateRent(customer);
  if (rent.isFullyPaid) {
    // Reset cycle with current slabs held
    customer.initialSlabs = customer.slabsHeld;
    customer.amountPaid = 0;
    customer.issueDate = new Date().toISOString();
  }

  saveCustomers(customers);
  return true;
}

// Dashboard stats
export function getDashboardStats() {
  const customers = getCustomers();
  const active = customers.filter((c) => c.slabsHeld > 0);
  const totalSlabsRented = customers.reduce((s, c) => s + c.totalIssued, 0);
  const totalPendingSlabs = customers.reduce((s, c) => s + c.slabsHeld, 0);
  const totalPendingAmount = customers.reduce((s, c) => {
    if (c.slabsHeld === 0) return s;
    return s + calculateRent(c).remainingDue;
  }, 0);

  return {
    totalCustomers: active.length,
    totalSlabsRented,
    totalPendingSlabs,
    totalPendingAmount,
  };
}
