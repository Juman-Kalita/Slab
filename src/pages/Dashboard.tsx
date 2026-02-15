import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getCustomers, getDashboardStats, calculateRent, getMaterialType, calculateSiteRent, type Customer } from "@/lib/rental-store";
import { generateInvoice, generateInvoiceNumber } from "@/lib/invoice-generator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { HardHat, LogOut, Users, Package, IndianRupee, Plus, RotateCcw, Search, ArrowLeft, Wallet, PackageSearch, X, Download } from "lucide-react";
import IssueMaterialsDialog from "@/components/IssueMaterialsDialog";
import RecordMaterialReturnDialog from "@/components/RecordMaterialReturnDialog";
import RecordPaymentDialog from "@/components/RecordPaymentDialog";
import InventoryDialog from "@/components/InventoryDialog";
import AddSiteDialog from "@/components/AddSiteDialog";
import { format } from "date-fns";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [addSiteOpen, setAddSiteOpen] = useState(false);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    // If a customer is selected, refresh their data
    if (selectedCustomer) {
      const updatedCustomers = getCustomers();
      const updatedCustomer = updatedCustomers.find(c => c.id === selectedCustomer.id);
      if (updatedCustomer) {
        setSelectedCustomer(updatedCustomer);
      }
    }
  }, [selectedCustomer]);

  const stats = getDashboardStats();
  const customers = getCustomers();

  // Filter by customer name/contact/address
  let filtered = search
    ? customers.filter((c) => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.contactNo?.toLowerCase().includes(search.toLowerCase()) ||
        c.address?.toLowerCase().includes(search.toLowerCase())
      )
    : customers;

  // Filter by location - show customers who have sites in the searched location
  if (locationSearch) {
    filtered = filtered.filter((c) =>
      c.sites.some(s => s.location.toLowerCase().includes(locationSearch.toLowerCase()))
    );
  }

  // Get all unique locations for the location search
  const allLocations = Array.from(
    new Set(
      customers.flatMap(c => c.sites.map(s => s.location))
    )
  ).sort();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Force re-read when refreshKey changes
  void refreshKey;

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

  if (selectedCustomer) {
    // Always get fresh customer data
    const customer = customers.find((c) => c.id === selectedCustomer.id);
    if (!customer) {
      // Customer was deleted, go back to dashboard
      setSelectedCustomer(null);
      return null;
    }
    
    return (
      <div className="min-h-screen bg-background">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-primary px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <HardHat className="h-7 w-7 text-accent" />
            <h1 className="text-lg font-bold text-primary-foreground">Material Rental Pro</h1>
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

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">{customer.name}</h2>
              
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

          {/* Sites List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sites ({customer.sites.length})</h3>
            {customer.sites.map((site) => {
              const totalItems = site.materials.reduce((sum, m) => sum + m.quantity, 0);
              const siteCalc = calculateSiteRent(site);
              
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
                          onClick={() => handleDownloadInvoice(customer, site.id)}
                          className="gap-1"
                        >
                          <Download className="h-4 w-4" /> Invoice
                        </Button>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Issue Date</div>
                          <div className="font-medium">{format(new Date(site.issueDate), "dd MMM yyyy")}</div>
                        </div>
                      </div>
                    </div>

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
                      {siteCalc.penaltyAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Late Penalty:</span>
                          <span className="font-semibold text-red-600">₹{siteCalc.penaltyAmount.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      {siteCalc.lostItemsPenalty > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lost Items:</span>
                          <span className="font-semibold text-red-600">₹{siteCalc.lostItemsPenalty.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-medium">Amount Deposited:</span>
                        <span className="font-semibold text-green-600">₹{site.amountPaid.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-medium">Remaining Due:</span>
                        <span className="font-bold text-lg text-accent">₹{siteCalc.remainingDue.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* Materials at this site */}
                    {site.materials.filter(m => m.quantity > 0).length > 0 && (
                      <div className="border-t pt-4">
                        <h5 className="font-semibold mb-3">Materials ({totalItems} items)</h5>
                        <div className="space-y-2">
                          {site.materials.filter(m => m.quantity > 0).map((material) => {
                            const materialType = getMaterialType(material.materialTypeId);
                            if (!materialType) return null;
                            return (
                              <div key={material.materialTypeId} className="flex justify-between items-center p-2 bg-muted rounded">
                                <div>
                                  <span className="font-medium">{materialType.name} ({materialType.size})</span>
                                  <span className="text-sm text-muted-foreground ml-2">× {material.quantity}</span>
                                </div>
                                <span className="text-sm">₹{materialType.rentPerDay}/day</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {site.materials.filter(m => m.quantity > 0).length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-4 border-t">
                        No materials currently at this site
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>

        {/* Add Site Dialog for this customer */}
        <AddSiteDialog 
          open={addSiteOpen} 
          onOpenChange={setAddSiteOpen} 
          onSuccess={refresh}
          customerName={customer.name}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-primary px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <HardHat className="h-7 w-7 text-accent" />
          <h1 className="text-lg font-bold text-primary-foreground">Material Rental Pro</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:bg-primary/80">
          <LogOut className="mr-1 h-4 w-4" /> Logout
        </Button>
      </header>

      <main className="mx-auto max-w-6xl p-4 md:p-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Active Customers", value: stats.totalCustomers, icon: Users, color: "bg-primary text-primary-foreground" },
            { label: "Total Items Rented", value: stats.totalItemsRented, icon: Package, color: "bg-accent text-accent-foreground" },
            { label: "Pending Amount", value: `₹${stats.totalPendingAmount.toLocaleString("en-IN")}`, icon: IndianRupee, color: "bg-accent text-accent-foreground" },
          ].map((stat) => (
            <Card key={stat.label} className="overflow-hidden border-none shadow-md">
              <CardContent className="p-0">
                <div className={`flex items-center gap-3 p-4 ${stat.color}`}>
                  <stat.icon className="h-8 w-8 shrink-0 opacity-80" />
                  <div>
                    <p className="text-xs opacity-80">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setIssueOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold gap-2">
            <Plus className="h-4 w-4" /> Issue Materials
          </Button>
          <Button onClick={() => setReturnOpen(true)} variant="outline" className="gap-2 font-semibold">
            <RotateCcw className="h-4 w-4" /> Record Return
          </Button>
          <Button onClick={() => setPaymentOpen(true)} variant="outline" className="gap-2 font-semibold">
            <Wallet className="h-4 w-4" /> Record Payment
          </Button>
          <Button onClick={() => setInventoryOpen(true)} variant="outline" className="gap-2 font-semibold">
            <PackageSearch className="h-4 w-4" /> View Inventory
          </Button>
        </div>

        {/* Search + Customer List */}
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, contact, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by location/region..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="pl-9"
                list="locations-list"
              />
              <datalist id="locations-list">
                {allLocations.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>
            {(search || locationSearch) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setLocationSearch("");
                }}
                className="gap-1"
              >
                Clear Filters
              </Button>
            )}
          </div>

          <Card className="border-none shadow-md">
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
                        {search || locationSearch ? "No customers found matching your search" : "No rentals yet. Issue materials to get started!"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((c) => {
                      // Calculate total items across all sites
                      const totalItems = c.sites.reduce((total, site) => {
                        return total + site.materials.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0);
                      }, 0);
                      
                      // Calculate pending amount across all sites
                      const customerCalc = calculateRent(c);
                      const pendingAmount = customerCalc.totalPendingAmount;
                      
                      return (
                        <TableRow
                          key={c.id}
                          className="cursor-pointer hover:bg-accent/10 transition-colors"
                          onClick={() => setSelectedCustomer(c)}
                        >
                          <TableCell className="font-medium">
                            <div>{c.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {locationSearch ? (
                                // Show matching sites when location filter is active
                                c.sites
                                  .filter(s => s.location.toLowerCase().includes(locationSearch.toLowerCase()))
                                  .map(s => `${s.siteName} (${s.location})`)
                                  .join(", ")
                              ) : (
                                `${c.sites.length} site(s)`
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{totalItems}</TableCell>
                          <TableCell className="text-right font-semibold">₹{pendingAmount.toLocaleString("en-IN")}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      <IssueMaterialsDialog open={issueOpen} onOpenChange={setIssueOpen} onSuccess={refresh} />
      <RecordMaterialReturnDialog open={returnOpen} onOpenChange={setReturnOpen} onSuccess={refresh} />
      <RecordPaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} onSuccess={refresh} />
      <InventoryDialog open={inventoryOpen} onOpenChange={setInventoryOpen} />
    </div>
  );
};

export default Dashboard;
