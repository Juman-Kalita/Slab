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
import { format } from "date-fns";
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
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:bg-primary/80">
            <LogOut className="mr-1 h-4 w-4" /> Logout
          </Button>
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

              <div className="space-y-4">
                {customer.sites.map((site) => {
                  const siteCalc = calculateSiteRent(site);
                  const totalItems = site.materials.reduce((sum, m) => sum + m.quantity, 0);
                  
                  return (
                    <Card key={site.id} className="border-2">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{site.siteName}</h3>
                            <p className="text-sm text-muted-foreground">{site.location}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Issued: {format(new Date(site.issueDate), "dd MMM yyyy")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSite({ siteName: site.siteName, location: site.location });
                                setIssueMoreOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add Materials
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadInvoice(customer, site.id)}
                            >
                              <Download className="h-4 w-4 mr-1" /> Invoice
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="bg-muted rounded-lg p-3">
                            <p className="text-muted-foreground text-xs">Items Held</p>
                            <p className="font-bold text-lg">{totalItems}</p>
                          </div>
                          <div className="bg-muted rounded-lg p-3">
                            <p className="text-muted-foreground text-xs">Total Due</p>
                            <p className="font-bold text-lg">₹{siteCalc.totalRequired.toLocaleString("en-IN")}</p>
                          </div>
                          <div className="bg-muted rounded-lg p-3">
                            <p className="text-muted-foreground text-xs">Paid</p>
                            <p className="font-bold text-lg text-green-600">₹{site.amountPaid.toLocaleString("en-IN")}</p>
                          </div>
                          <div className="bg-muted rounded-lg p-3">
                            <p className="text-muted-foreground text-xs">Remaining</p>
                            <p className="font-bold text-lg text-red-600">₹{siteCalc.remainingDue.toLocaleString("en-IN")}</p>
                          </div>
                        </div>

                        {site.materials.length > 0 && (
                          <div className="border rounded-lg p-3 space-y-2">
                            <p className="text-sm font-semibold">Materials:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              {site.materials.map((m) => {
                                const mt = getMaterialType(m.materialTypeId);
                                return mt ? (
                                  <div key={m.materialTypeId} className="flex justify-between items-center bg-muted/50 rounded px-3 py-2">
                                    <span>{mt.name} {mt.size && `(${mt.size})`}</span>
                                    <span className="font-semibold">{m.quantity} items</span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </main>

        <AddSiteDialog
          open={addSiteOpen}
          onOpenChange={setAddSiteOpen}
          onSuccess={refresh}
          customerName={customer.name}
        />
        <IssueMoreMaterialsDialog
          open={issueMoreOpen}
          onOpenChange={setIssueMoreOpen}
          onSuccess={refresh}
          customerName={customer.name}
          siteName={selectedSite?.siteName || ""}
          location={selectedSite?.location || ""}
        />
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
        <InventoryDialog
          open={inventoryOpen}
          onOpenChange={setInventoryOpen}
        />
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
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:bg-primary/80">
          <LogOut className="mr-1 h-4 w-4" /> Logout
        </Button>
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
                  <TableHead className="text-center">Items Held</TableHead>
                  <TableHead className="text-right">Pending Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((customer) => {
                    const totalItems = customer.sites.reduce(
                      (sum, site) => sum + site.materials.reduce((s, m) => s + m.quantity, 0),
                      0
                    );
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
                        <TableCell className="text-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="font-semibold hover:text-primary cursor-help">
                                  {totalItems}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  {customer.sites.map((site) => {
                                    const siteItems = site.materials.reduce((s, m) => s + m.quantity, 0);
                                    return siteItems > 0 ? (
                                      <p key={site.id}>
                                        {site.siteName}: {siteItems} items
                                      </p>
                                    ) : null;
                                  })}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
