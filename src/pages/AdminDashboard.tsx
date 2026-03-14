import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout, isAdmin } from "@/lib/auth-service";
import { getCustomers, getDashboardStats, calculateSiteRent, getMaterialType, type Customer } from "@/lib/rental-store";
import { generateInvoice, generateInvoiceNumber } from "@/lib/invoice-generator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  HardHat, 
  LogOut, 
  Users, 
  Package, 
  IndianRupee, 
  Plus, 
  RotateCcw, 
  Search, 
  ArrowLeft, 
  Wallet, 
  PackageSearch, 
  Download,
  Shield,
  Settings,
  UserCog,
  Database,
  Activity,
  DollarSign,
  Edit
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import IssueMaterialsDialog from "@/components/IssueMaterialsDialog";
import RecordMaterialReturnDialog from "@/components/RecordMaterialReturnDialog";
import RecordPaymentDialog from "@/components/RecordPaymentDialog";
import RecordDepositDialog from "@/components/RecordDepositDialog";
import InventoryDialog from "@/components/InventoryDialog";
import AddSiteDialog from "@/components/AddSiteDialog";
import IssueMoreMaterialsDialog from "@/components/IssueMoreMaterialsDialog";
import EmployeeManagement from "@/components/admin/EmployeeManagement";
import CustomerManagement from "@/components/admin/CustomerManagement";
import InventoryManagement from "@/components/admin/InventoryManagement";
import MaterialTypeEditor from "@/components/admin/MaterialTypeEditor";
import PaymentManagement from "@/components/admin/PaymentManagement";
import ActivityLog from "@/components/admin/ActivityLog";
import AdminSettings from "@/components/admin/AdminSettings";
import FinancialAdjustmentDialog from "@/components/admin/FinancialAdjustmentDialog";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [addSiteOpen, setAddSiteOpen] = useState(false);
  const [issueMoreOpen, setIssueMoreOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<{ siteName: string; location: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({ totalCustomers: 0, totalItemsRented: 0, totalPendingAmount: 0 });
  
  // Admin feature dialogs
  const [employeesDialogOpen, setEmployeesDialogOpen] = useState(false);
  const [customersManageDialogOpen, setCustomersManageDialogOpen] = useState(false);
  const [inventoryManageDialogOpen, setInventoryManageDialogOpen] = useState(false);
  const [materialsDialogOpen, setMaterialsDialogOpen] = useState(false);
  const [paymentsDialogOpen, setPaymentsDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshKey((k) => k + 1);
    if (selectedCustomer) {
      const updatedCustomers = await getCustomers();
      const updatedCustomer = updatedCustomers.find(c => c.id === selectedCustomer.id);
      if (updatedCustomer) {
        setSelectedCustomer(updatedCustomer);
      }
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (!user || !isAdmin()) {
      toast.error("Unauthorized access");
      navigate("/");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [customersData, statsData] = await Promise.all([
          getCustomers(),
          getDashboardStats()
        ]);
        setCustomers(customersData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refreshKey]);

  let filtered = search
    ? customers.filter((c) => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.contactNo?.toLowerCase().includes(search.toLowerCase()) ||
        c.address?.toLowerCase().includes(search.toLowerCase())
      )
    : customers;

  if (locationSearch) {
    filtered = filtered.filter((c) =>
      c.sites.some(s => s.location.toLowerCase().includes(locationSearch.toLowerCase()))
    );
  }

  const allLocations = Array.from(
    new Set(
      customers.flatMap(c => c.sites.map(s => s.location))
    )
  ).sort();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleDownloadInvoice = (customer: Customer, siteId: string) => {
    const site = customer.sites.find(s => s.id === siteId);
    if (!site) {
      toast.error("Site not found");
      return;
    }

    const siteCalc = calculateSiteRent(site);
    generateInvoice({
      customer,
      site,
      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: new Date().toISOString(),
      rentAmount: siteCalc.rentAmount,
      issueLoadingCharges: siteCalc.issueLoadingCharges,
      penaltyAmount: siteCalc.penaltyAmount,
      returnLoadingCharges: siteCalc.returnLoadingCharges,
      transportCharges: siteCalc.transportCharges,
      lostItemsPenalty: siteCalc.lostItemsPenalty,
      totalRequired: siteCalc.totalRequired,
      amountPaid: site.amountPaid,
      remainingDue: siteCalc.remainingDue,
      daysOverdue: siteCalc.daysOverdue,
      isWithinGracePeriod: siteCalc.isWithinGracePeriod,
      materialBreakdown: siteCalc.materialBreakdown,
    });
    toast.success("Invoice downloaded successfully!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Customer Detail View (same as employee dashboard)
  if (selectedCustomer) {
    const customer = customers.find((c) => c.id === selectedCustomer.id);
    if (!customer) {
      setSelectedCustomer(null);
      return null;
    }
    
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-primary px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-accent" />
            <h1 className="text-lg font-bold text-primary-foreground">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:bg-primary/80">
              <LogOut className="mr-1 h-4 w-4" /> Logout
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-4 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedCustomer(null)} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
            <Button 
              onClick={() => setAddSiteOpen(true)} 
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
            >
              <Plus className="h-4 w-4" /> Add New Site
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setReturnOpen(true)} variant="outline" className="gap-2 font-semibold">
              <RotateCcw className="h-4 w-4" /> Record Return
            </Button>
            <Button onClick={() => setPaymentOpen(true)} variant="outline" className="gap-2 font-semibold">
              <Wallet className="h-4 w-4" /> Record Site Payment
            </Button>
            <Button onClick={() => setDepositOpen(true)} className="gap-2 font-semibold bg-green-600 hover:bg-green-700">
              <Wallet className="h-4 w-4" /> Add Deposit
            </Button>
            <Button onClick={() => setInventoryOpen(true)} variant="outline" className="gap-2 font-semibold">
              <PackageSearch className="h-4 w-4" /> View Inventory
            </Button>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{customer.name}</h2>
                  {customer.contactNo && (
                    <p className="text-sm text-muted-foreground mt-1">📞 {customer.contactNo}</p>
                  )}
                </div>
                {customer.advanceDeposit > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500 rounded-xl px-6 py-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="h-5 w-5 text-green-600" />
                      <div className="text-xs text-green-700 dark:text-green-400 font-semibold uppercase tracking-wide">
                        Advance Deposit
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ₹{customer.advanceDeposit.toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                      Available for any site
                    </div>
                  </div>
                )}
              </div>
              
              {/* Client Details Section */}
              {(customer.registrationName || customer.contactNo || customer.address || customer.referral || customer.aadharPhoto) && (
                <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
                  <h3 className="font-semibold text-sm text-primary">Client Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {customer.registrationName && (
                      <div>
                        <span className="text-muted-foreground">Registration Name:</span><br />
                        <span className="font-medium">{customer.registrationName}</span>
                      </div>
                    )}
                    {customer.contactNo && (
                      <div>
                        <span className="text-muted-foreground">Contact Number:</span><br />
                        <span className="font-medium">{customer.contactNo}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Address:</span><br />
                        <span className="font-medium">{customer.address}</span>
                      </div>
                    )}
                    {customer.referral && (
                      <div>
                        <span className="text-muted-foreground">Referral:</span><br />
                        <span className="font-medium">{customer.referral}</span>
                      </div>
                    )}
                  </div>
                  {customer.aadharPhoto && (
                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground text-sm">Aadhar Photo:</span>
                      <div className="mt-2">
                        <img 
                          src={customer.aadharPhoto} 
                          alt="Aadhar" 
                          className="max-w-sm rounded border cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(customer.aadharPhoto, '_blank')}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overall Summary Boxes - ALL SITES */}
          <div className="grid grid-cols-3 gap-4">
            {/* Total Issued Across All Sites */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="border-2 rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20 cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                  <div className="text-xs text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide mb-2">
                    Total Issued
                  </div>
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {customer.sites.reduce((total, site) => {
                      return total + site.history
                        .filter(h => h.action === "Issued")
                        .reduce((sum, h) => sum + (h.quantity || 0), 0);
                    }, 0)}
                  </div>
                  <div className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                    items • Click for details
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-96">
                <div className="space-y-3">
                  <h4 className="font-semibold">All Issued Materials</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {customer.sites.map((site) => {
                      const siteIssued = site.history.filter(h => h.action === "Issued" && h.materialTypeId && h.quantity);
                      if (siteIssued.length === 0) return null;
                      
                      return (
                        <div key={site.id} className="border-b pb-3">
                          <div className="font-semibold text-sm mb-2 text-primary">{site.siteName} ({site.location})</div>
                          <div className="space-y-1">
                            {siteIssued.map((h, idx) => {
                              const mt = getMaterialType(h.materialTypeId!);
                              return (
                                <div key={idx} className="flex justify-between items-center text-sm pl-3">
                                  <div>
                                    <div className="font-medium">{mt?.name} {mt?.size && `(${mt.size})`}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {format(new Date(h.date), "dd MMM yyyy")}
                                    </div>
                                  </div>
                                  <div className="font-semibold text-blue-600">{h.quantity}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">
                      {customer.sites.reduce((total, site) => {
                        return total + site.history
                          .filter(h => h.action === "Issued")
                          .reduce((sum, h) => sum + (h.quantity || 0), 0);
                      }, 0)} items
                    </span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Total Returned Across All Sites - Interactive */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="border-2 rounded-xl p-4 bg-green-50 dark:bg-green-900/20 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="text-xs text-green-700 dark:text-green-400 font-semibold uppercase tracking-wide mb-2">
                    Total Returned
                  </div>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {customer.sites.reduce((total, site) => {
                      return total + site.history
                        .filter(h => h.action === "Returned")
                        .reduce((sum, h) => sum + (h.quantity || 0) + (h.quantityLost || 0), 0);
                    }, 0)}
                  </div>
                  <div className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                    items • Click for details
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-96 max-h-96 overflow-y-auto" align="start">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">All Returned Materials</h4>
                  {customer.sites.map((site) => {
                    const returnedItems = site.history.filter(h => h.action === "Returned");
                    if (returnedItems.length === 0) return null;
                    
                    return (
                      <div key={site.id} className="space-y-2">
                        <div className="font-medium text-sm text-muted-foreground">{site.siteName} ({site.location})</div>
                        <div className="space-y-1">
                          {returnedItems.map((h, idx) => {
                            const mt = getMaterialType(h.materialTypeId!);
                            const totalQty = (h.quantity || 0) + (h.quantityLost || 0);
                            return (
                              <div key={idx} className="flex justify-between items-center text-sm pl-3">
                                <div>
                                  <div className="font-medium">{mt?.name} {mt?.size && `(${mt.size})`}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(new Date(h.date), "dd MMM yyyy")}
                                    {h.quantityLost && h.quantityLost > 0 && (
                                      <span className="text-red-600 ml-2">• {h.quantityLost} lost</span>
                                    )}
                                  </div>
                                </div>
                                <div className="font-semibold text-green-600">{totalQty}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">
                      {customer.sites.reduce((total, site) => {
                        return total + site.history
                          .filter(h => h.action === "Returned")
                          .reduce((sum, h) => sum + (h.quantity || 0) + (h.quantityLost || 0), 0);
                      }, 0)} items
                    </span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Currently Held Across All Sites - Interactive */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="border-2 rounded-xl p-4 bg-orange-50 dark:bg-orange-900/20 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="text-xs text-orange-700 dark:text-orange-400 font-semibold uppercase tracking-wide mb-2">
                    Currently Held
                  </div>
                  <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                    {customer.sites.reduce((total, site) => {
                      return total + site.materials.reduce((sum, m) => sum + m.quantity, 0);
                    }, 0)}
                  </div>
                  <div className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">
                    items • Click for details
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-96 max-h-96 overflow-y-auto" align="start">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Currently Held Materials</h4>
                  {customer.sites.map((site) => {
                    const heldMaterials = site.materials.filter(m => m.quantity > 0);
                    if (heldMaterials.length === 0) return null;
                    
                    return (
                      <div key={site.id} className="space-y-2">
                        <div className="font-medium text-sm text-muted-foreground">{site.siteName} ({site.location})</div>
                        <div className="space-y-1">
                          {heldMaterials.map((m) => {
                            const mt = getMaterialType(m.materialTypeId);
                            return (
                              <div key={m.materialTypeId} className="flex justify-between items-center text-sm pl-3">
                                <div className="font-medium">{mt?.name} {mt?.size && `(${mt.size})`}</div>
                                <div className="font-semibold text-orange-600">{m.quantity}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-orange-600">
                      {customer.sites.reduce((total, site) => {
                        return total + site.materials.reduce((sum, m) => sum + m.quantity, 0);
                      }, 0)} items
                    </span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Sites List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sites ({customer.sites.length})</h3>
            {customer.sites.map((site) => {
              const totalItems = site.materials.reduce((sum, m) => sum + m.quantity, 0);
              const siteCalc = calculateSiteRent(site);
              
              // Calculate total items issued and returned from history
              const totalIssued = site.history
                .filter(h => h.action === "Issued")
                .reduce((sum, h) => sum + (h.quantity || 0), 0);
              
              const totalReturned = site.history
                .filter(h => h.action === "Returned")
                .reduce((sum, h) => sum + (h.quantity || 0) + (h.quantityLost || 0), 0);
              
              return (
                <Card key={site.id}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xl font-bold">{site.siteName}</h4>
                        <p className="text-sm text-muted-foreground">{site.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSite({ siteName: site.siteName, location: site.location });
                            setIssueMoreOpen(true);
                          }}
                          className="gap-1 bg-accent/10 hover:bg-accent/20"
                        >
                          <Plus className="h-4 w-4" /> Issue More
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(customer, site.id)}
                          className="gap-1"
                        >
                          <Download className="h-4 w-4" /> Invoice
                        </Button>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Issue Date</div>
                          <div className="font-medium">{format(new Date(site.issueDate), "dd MMM yyyy")}</div>
                          {site.gracePeriodEndDate && (
                            <>
                              <div className="text-sm text-muted-foreground mt-2">End Date</div>
                              <div className="font-medium">{format(new Date(site.gracePeriodEndDate), "dd MMM yyyy")}</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Items Summary - MOVED TO TOP */}
                    <div className="grid grid-cols-3 gap-3">
                      {/* Total Issued with Details */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20 cursor-pointer hover:shadow-md transition-shadow">
                            <div className="text-xs text-muted-foreground mb-1">Total Issued</div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalIssued}</div>
                            <div className="text-xs text-muted-foreground">items • Click for details</div>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm">Issued Materials Breakdown</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {site.history
                                .filter(h => h.action === "Issued" && h.materialTypeId && h.quantity)
                                .map((h, idx) => {
                                  const mt = getMaterialType(h.materialTypeId!);
                                  return (
                                    <div key={idx} className="flex justify-between items-center text-sm border-b pb-2">
                                      <div>
                                        <div className="font-medium">{mt?.name} {mt?.size && `(${mt.size})`}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {format(new Date(h.date), "dd MMM yyyy")}
                                        </div>
                                      </div>
                                      <div className="font-semibold text-blue-600">{h.quantity} items</div>
                                    </div>
                                  );
                                })}
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold">
                              <span>Total:</span>
                              <span className="text-blue-600">{totalIssued} items</span>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Total Returned */}
                      <div className="border rounded-lg p-3 bg-green-50 dark:bg-green-900/20">
                        <div className="text-xs text-muted-foreground mb-1">Total Returned</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalReturned}</div>
                        <div className="text-xs text-muted-foreground">items</div>
                      </div>

                      {/* Currently Held */}
                      <div className="border rounded-lg p-3 bg-orange-50 dark:bg-orange-900/20">
                        <div className="text-xs text-muted-foreground mb-1">Currently Held</div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalItems}</div>
                        <div className="text-xs text-muted-foreground">items</div>
                      </div>
                    </div>

                    {/* Shipping Details */}
                    {(site.vehicleNo || site.challanNo) && (
                      <div className="border rounded-lg p-3 bg-amber-50 dark:bg-amber-900/20">
                        <div className="text-xs text-muted-foreground mb-1">Shipping Details:</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {site.vehicleNo && (
                            <div>
                              <span className="text-muted-foreground">Vehicle:</span>
                              <span className="ml-2 font-medium">{site.vehicleNo}</span>
                            </div>
                          )}
                          {site.challanNo && (
                            <div>
                              <span className="text-muted-foreground">Challan:</span>
                              <span className="ml-2 font-medium">{site.challanNo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Financial Summary */}
                    <div className="border rounded-lg p-4 bg-muted/20 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rent Amount:</span>
                        <span className="font-semibold">₹{siteCalc.rentAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Loading Charges:</span>
                        <span className="font-semibold">₹{(siteCalc.issueLoadingCharges + siteCalc.returnLoadingCharges).toLocaleString("en-IN")}</span>
                      </div>
                      {siteCalc.transportCharges > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transportation Charges:</span>
                          <span className="font-semibold">₹{siteCalc.transportCharges.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      {siteCalc.penaltyAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Additional Rent (After Grace Period):</span>
                          <span className="font-semibold">₹{siteCalc.penaltyAmount.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      {siteCalc.lostItemsPenalty > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lost Items:</span>
                          <span className="font-semibold text-red-600">₹{siteCalc.lostItemsPenalty.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-medium">Remaining Due:</span>
                        <span className="font-bold text-lg text-accent">₹{siteCalc.remainingDue.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* Payment Methods Used */}
                    {(() => {
                      const paymentEvents = site.history.filter(h => h.action === "Payment" && h.paymentMethod);
                      if (paymentEvents.length > 0) {
                        const paymentMethods = Array.from(new Set(paymentEvents.map(p => p.paymentMethod)));
                        return (
                          <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                            <div className="text-xs text-muted-foreground mb-1">Payment Methods Used:</div>
                            <div className="flex flex-wrap gap-2">
                              {paymentMethods.map((method, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium">
                                  {method}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Payment History */}
                    {(() => {
                      const paymentEvents = site.history.filter(h => h.action === "Payment" && h.amount);
                      if (paymentEvents.length > 0) {
                        return (
                          <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/20">
                            <h5 className="font-semibold mb-3 text-sm">Payment History</h5>
                            <div className="space-y-2">
                              {paymentEvents.map((payment, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded border">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">₹{payment.amount?.toLocaleString("en-IN")}</span>
                                      {payment.paymentMethod && (
                                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                          {payment.paymentMethod}
                                        </span>
                                      )}
                                      {payment.paymentScreenshot && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 px-2 text-xs"
                                          onClick={() => window.open(payment.paymentScreenshot, '_blank')}
                                        >
                                          View Screenshot
                                        </Button>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {format(new Date(payment.date), "dd MMM yyyy, hh:mm a")}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Materials at this site */}
                    {(() => {
                      const issuedEvents = site.history.filter(h => h.action === "Issued" && h.materialTypeId);
                      return issuedEvents.length > 0;
                    })() && (
                      <div className="border-t pt-4">
                        <h5 className="font-semibold mb-3">Materials ({totalItems} items)</h5>
                        <div className="space-y-2">
                          {(() => {
                            // Group materials by materialTypeId and issueDate from history
                            const issuedEvents = site.history.filter(h => h.action === "Issued" && h.materialTypeId);
                            const materialGroups = new Map<string, { materialTypeId: string; issueDate: string; quantity: number; hasOwnLabor: boolean }>();
                            
                            issuedEvents.forEach(event => {
                              if (!event.materialTypeId || !event.quantity) return;
                              const key = `${event.materialTypeId}-${event.date}`;
                              const existing = materialGroups.get(key);
                              if (existing) {
                                existing.quantity += event.quantity;
                              } else {
                                materialGroups.set(key, {
                                  materialTypeId: event.materialTypeId,
                                  issueDate: event.date,
                                  quantity: event.quantity,
                                  hasOwnLabor: event.hasOwnLabor || false
                                });
                              }
                            });
                            
                            // Show ALL issued materials (including returned ones)
                            const materialsToShow = Array.from(materialGroups.values());
                            
                            return materialsToShow.map((group, index) => {
                              const materialType = getMaterialType(group.materialTypeId);
                              if (!materialType) return null;
                              
                              // Calculate days and total
                              const issueDate = new Date(group.issueDate);
                              const siteStartDate = new Date(site.issueDate);
                              const endDate = site.gracePeriodEndDate ? new Date(site.gracePeriodEndDate) : new Date();
                              
                              // Check if this is the first issue (same date as site creation)
                              const isFirstIssue = issueDate.toDateString() === siteStartDate.toDateString();
                              
                              let totalAmount: number;
                              let calculationText: string;
                              
                              if (isFirstIssue && materialType.gracePeriodDays > 0) {
                                // For first issue with grace period, use monthly rate (no day calculation)
                                totalAmount = group.quantity * materialType.monthlyRate;
                                calculationText = `${group.quantity} × ₹${materialType.monthlyRate}/month = ₹${totalAmount.toFixed(2)}`;
                              } else {
                                // For subsequent issues OR materials with 0 grace period (plates), use actual days
                                const days = differenceInDays(endDate, issueDate) + 1;
                                totalAmount = group.quantity * materialType.rentPerDay * days;
                                calculationText = `${group.quantity} × ₹${materialType.rentPerDay} × ${days} days = ₹${totalAmount.toFixed(2)}`;
                              }
                              
                              return (
                                <div key={`${group.materialTypeId}-${group.issueDate}-${index}`} className="p-3 bg-muted rounded space-y-2">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="font-medium">{materialType.name} ({materialType.size})</div>
                                      <div className="text-sm text-muted-foreground">Quantity: {group.quantity}</div>
                                      {isFirstIssue && materialType.gracePeriodDays > 0 && (
                                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">First Issue - Monthly rate</div>
                                      )}
                                    </div>
                                    <div className="flex-1 text-center">
                                      <div className="text-xs text-muted-foreground">Issued</div>
                                      <div className="text-sm font-medium">{format(issueDate, "dd MMM yyyy")}</div>
                                      {site.gracePeriodEndDate && (
                                        <>
                                          <div className="text-xs text-muted-foreground mt-1">End Date</div>
                                          <div className="text-sm font-medium">{format(endDate, "dd MMM yyyy")}</div>
                                        </>
                                      )}
                                    </div>
                                    <div className="flex-1 text-right">
                                      <div className="text-sm font-semibold">₹{materialType.rentPerDay}/day</div>
                                    </div>
                                  </div>
                                  <div className="text-xs bg-background p-2 rounded">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Calculation:</span>
                                      <span className="font-medium">{calculationText}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}

                    {site.history.filter(h => h.action === "Issued" && h.materialTypeId).length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-4 border-t">
                        No materials issued to this site
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>

        {/* Dialogs for this customer */}
        <RecordMaterialReturnDialog 
          open={returnOpen} 
          onOpenChange={setReturnOpen} 
          onSuccess={refresh}
          preSelectedCustomerId={customer.id}
        />
        <RecordPaymentDialog 
          open={paymentOpen} 
          onOpenChange={setPaymentOpen} 
          onSuccess={refresh}
          preSelectedCustomerId={customer.id}
        />
        <RecordDepositDialog 
          open={depositOpen} 
          onOpenChange={setDepositOpen} 
          onSuccess={refresh}
          preSelectedCustomerId={customer.id}
        />
        <InventoryDialog open={inventoryOpen} onOpenChange={setInventoryOpen} />
        <AddSiteDialog 
          open={addSiteOpen} 
          onOpenChange={setAddSiteOpen} 
          onSuccess={refresh}
          customerName={customer.name}
        />
        {selectedSite && (
          <IssueMoreMaterialsDialog
            open={issueMoreOpen}
            onOpenChange={setIssueMoreOpen}
            onSuccess={refresh}
            customerName={customer.name}
            siteName={selectedSite.siteName}
            location={selectedSite.location}
          />
        )}
      </div>
    );
  }

  // Main Dashboard View (same as employee dashboard with admin button)
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-primary px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-accent" />
          <h1 className="text-lg font-bold text-primary-foreground">Admin Panel</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:bg-primary/80">
            <LogOut className="mr-1 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 md:p-8 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Active Customers</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalCustomers}</p>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-100">Total Items Rented</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalItemsRented}</p>
                </div>
                <Package className="h-12 w-12 text-amber-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-100">Pending Amount</p>
                  <p className="text-3xl font-bold mt-2">₹{stats.totalPendingAmount.toLocaleString("en-IN")}</p>
                </div>
                <IndianRupee className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {/* Operational Buttons */}
          <Button 
            onClick={() => setIssueOpen(true)} 
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          >
            <Plus className="h-4 w-4" />
            Issue Materials
          </Button>
          
          <Button 
            onClick={() => setReturnOpen(true)} 
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Record Return
          </Button>
          
          <Button 
            onClick={() => setPaymentOpen(true)} 
            variant="outline"
            className="gap-2"
          >
            <Wallet className="h-4 w-4" />
            Record Site Payment
          </Button>
          
          <Button 
            onClick={() => setDepositOpen(true)} 
            variant="outline"
            className="gap-2"
          >
            <Wallet className="h-4 w-4" />
            Add Deposit
          </Button>
          
          <Button 
            onClick={() => setInventoryOpen(true)} 
            variant="outline"
            className="gap-2"
          >
            <PackageSearch className="h-4 w-4" />
            View Inventory
          </Button>

          {/* Divider */}
          <div className="w-px bg-border self-stretch mx-2"></div>

          {/* Admin Management Buttons */}
          <Button 
            onClick={() => setEmployeesDialogOpen(true)} 
            variant="outline"
            className="gap-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
          >
            <Users className="h-4 w-4" />
            Employees
          </Button>

          <Button 
            onClick={() => setCustomersManageDialogOpen(true)} 
            variant="outline"
            className="gap-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
          >
            <Edit className="h-4 w-4" />
            Edit Customers
          </Button>

          <Button 
            onClick={() => setInventoryManageDialogOpen(true)} 
            variant="outline"
            className="gap-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
          >
            <Database className="h-4 w-4" />
            Manage Inventory
          </Button>

          <Button 
            onClick={() => setMaterialsDialogOpen(true)} 
            variant="outline"
            className="gap-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
          >
            <Package className="h-4 w-4" />
            Edit Materials
          </Button>

          <Button 
            onClick={() => setPaymentsDialogOpen(true)} 
            variant="outline"
            className="gap-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
          >
            <DollarSign className="h-4 w-4" />
            All Payments
          </Button>

          <Button 
            onClick={() => setActivityDialogOpen(true)} 
            variant="outline"
            className="gap-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
          >
            <Activity className="h-4 w-4" />
            Activity Log
          </Button>

          <Button 
            onClick={() => setSettingsDialogOpen(true)} 
            variant="outline"
            className="gap-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, contact, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Search className="h-4 w-4" />
                {locationSearch || "Filter by Location"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setLocationSearch("")}
                >
                  All Locations
                </Button>
                {allLocations.map((loc) => (
                  <Button
                    key={loc}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setLocationSearch(loc)}
                  >
                    {loc}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Customer Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Pending Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((customer) => {
                    const totalPending = customer.sites.reduce(
                      (sum, site) => sum + calculateSiteRent(site).remainingDue,
                      0
                    );

                    return (
                      <TableRow
                        key={customer.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {customer.sites.length} site(s)
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{totalPending.toLocaleString("en-IN")}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <IssueMaterialsDialog
        open={issueOpen}
        onOpenChange={setIssueOpen}
        onSuccess={refresh}
      />
      
      <RecordMaterialReturnDialog
        open={returnOpen}
        onOpenChange={setReturnOpen}
        onSuccess={refresh}
      />
      
      <RecordPaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        onSuccess={refresh}
      />
      
      <RecordDepositDialog
        open={depositOpen}
        onOpenChange={setDepositOpen}
        onSuccess={refresh}
      />
      
      <InventoryDialog
        open={inventoryOpen}
        onOpenChange={setInventoryOpen}
      />

      {/* Admin Feature Dialogs */}
      <Dialog open={employeesDialogOpen} onOpenChange={setEmployeesDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Management</DialogTitle>
          </DialogHeader>
          <EmployeeManagement />
        </DialogContent>
      </Dialog>

      <Dialog open={customersManageDialogOpen} onOpenChange={setCustomersManageDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Management</DialogTitle>
          </DialogHeader>
          <CustomerManagement />
        </DialogContent>
      </Dialog>

      <Dialog open={inventoryManageDialogOpen} onOpenChange={setInventoryManageDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inventory Management</DialogTitle>
          </DialogHeader>
          <InventoryManagement />
        </DialogContent>
      </Dialog>

      <Dialog open={materialsDialogOpen} onOpenChange={setMaterialsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Material Type Editor</DialogTitle>
          </DialogHeader>
          <MaterialTypeEditor />
        </DialogContent>
      </Dialog>

      <Dialog open={paymentsDialogOpen} onOpenChange={setPaymentsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Management</DialogTitle>
          </DialogHeader>
          <PaymentManagement />
        </DialogContent>
      </Dialog>

      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Activity Log</DialogTitle>
          </DialogHeader>
          <ActivityLog />
        </DialogContent>
      </Dialog>

      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Admin Settings</DialogTitle>
          </DialogHeader>
          <AdminSettings />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
