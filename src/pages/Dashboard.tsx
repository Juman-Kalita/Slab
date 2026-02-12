import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getCustomers, getDashboardStats, calculateRent, getMaterialType, type Customer } from "@/lib/rental-store";
import { generateInvoice, generateInvoiceNumber } from "@/lib/invoice-generator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { HardHat, LogOut, Users, Package, IndianRupee, Plus, RotateCcw, Search, ArrowLeft, Wallet, Download } from "lucide-react";
import IssueMaterialsDialog from "@/components/IssueMaterialsDialog";
import RecordMaterialReturnDialog from "@/components/RecordMaterialReturnDialog";
import RecordPaymentDialog from "@/components/RecordPaymentDialog";
import { format } from "date-fns";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const stats = getDashboardStats();
  const customers = getCustomers();

  const filtered = search
    ? customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : customers;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Force re-read when refreshKey changes
  void refreshKey;

  const handleDownloadInvoice = (customer: Customer) => {
    const rent = calculateRent(customer);
    generateInvoice({
      customer,
      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: new Date().toISOString(),
      rentAmount: rent.rentAmount,
      issueLoadingCharges: rent.issueLoadingCharges,
      penaltyAmount: rent.penaltyAmount,
      returnLoadingCharges: rent.returnLoadingCharges,
      lostItemsPenalty: rent.lostItemsPenalty,
      totalRequired: rent.totalRequired,
      amountPaid: customer.amountPaid,
      remainingDue: rent.remainingDue,
      daysOverdue: rent.daysOverdue,
      isWithinGracePeriod: rent.isWithinGracePeriod,
      materialBreakdown: rent.materialBreakdown.map(item => ({
        ...item,
        initialQuantity: customer.materials.find(m => m.materialTypeId === item.materialType.id)?.initialQuantity || 0
      })),
    });
    toast.success("Invoice downloaded successfully!");
  };

  if (selectedCustomer) {
    const customer = customers.find((c) => c.id === selectedCustomer.id) || selectedCustomer;
    const rent = calculateRent(customer);
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

        <main className="mx-auto max-w-4xl p-4 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedCustomer(null)} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
            <Button onClick={() => handleDownloadInvoice(customer)} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Download className="h-4 w-4" /> Download Invoice
            </Button>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">{customer.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-muted-foreground">Issue Date:</span><br />{format(new Date(customer.issueDate), "dd MMM yyyy")}</div>
                <div><span className="text-muted-foreground">Days Since Issue:</span><br />{rent.days} days</div>
                <div>
                  <span className="text-muted-foreground">Status:</span><br />
                  {rent.isWithinGracePeriod ? (
                    <span className="text-green-600 font-medium">Within Grace Period</span>
                  ) : (
                    <span className="text-red-600 font-medium">Overdue by {rent.daysOverdue} days</span>
                  )}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm pt-4 border-t">
                <div>
                  <span className="text-muted-foreground">Initial Items Taken:</span><br />
                  <span className="font-semibold">
                    {customer.history
                      .filter(h => h.action === "Issued")
                      .reduce((sum, h) => sum + (h.quantity || 0), 0)} items
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Returned:</span><br />
                  <span className="font-semibold">
                    {customer.history
                      .filter(h => h.action === "Returned")
                      .reduce((sum, h) => sum + (h.quantity || 0), 0)} items
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Currently Held:</span><br />
                  <span className="font-semibold text-accent">
                    {customer.materials.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0)} items
                  </span>
                </div>
              </div>

              {/* Materials Breakdown */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Materials Held</h3>
                <div className="space-y-2">
                  {customer.materials.filter(m => m.quantity > 0).map((material) => {
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
                  {customer.materials.filter(m => m.quantity > 0).length === 0 && (
                    <div className="text-sm text-muted-foreground">No materials currently held</div>
                  )}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rent Amount (grace period):</span>
                  <span className="font-semibold">₹{rent.rentAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issue Loading Charges:</span>
                  <span className="font-semibold">₹{rent.issueLoadingCharges.toLocaleString("en-IN")}</span>
                </div>
                {rent.penaltyAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Late Penalty ({rent.daysOverdue} days):</span>
                    <span className="font-semibold text-red-600">₹{rent.penaltyAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>₹{(rent.rentAmount + rent.issueLoadingCharges + rent.penaltyAmount).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Less: Paid</span>
                  <span>-₹{customer.amountPaid.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Unpaid from grace period:</span>
                  <span>₹{Math.max(0, rent.rentAmount + rent.issueLoadingCharges + rent.penaltyAmount - customer.amountPaid).toLocaleString("en-IN")}</span>
                </div>
                
                {(rent.returnLoadingCharges > 0 || rent.lostItemsPenalty > 0) && (
                  <>
                    <div className="pt-2 border-t text-sm font-medium">Additional Charges:</div>
                    {rent.returnLoadingCharges > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Return Loading Charges:</span>
                        <span className="font-semibold">₹{rent.returnLoadingCharges.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    {rent.lostItemsPenalty > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lost Items Penalty:</span>
                        <span className="font-semibold text-red-600">₹{rent.lostItemsPenalty.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    {rent.amountPaid > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Less: Overpayment applied</span>
                        <span>-₹{rent.amountPaid.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                  </>
                )}
                
                <div className="pt-3 border-t flex justify-between">
                  <span className="font-bold text-lg">Total Amount Due:</span>
                  <span className="text-2xl font-bold text-accent">₹{rent.totalRequired.toLocaleString("en-IN")}</span>
                </div>
                
                {rent.isFullyPaid && (
                  <div className="text-sm text-green-600 font-medium">✓ Fully paid</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.history.map((ev, i) => {
                    const materialType = ev.materialTypeId ? getMaterialType(ev.materialTypeId) : null;
                    return (
                      <TableRow key={i}>
                        <TableCell>{format(new Date(ev.date), "dd MMM yyyy")}</TableCell>
                        <TableCell>
                          <span className={
                            ev.action === "Issued" ? "text-accent font-medium" : 
                            ev.action === "Payment" ? "text-green-600 font-medium" :
                            "text-muted-foreground font-medium"
                          }>
                            {ev.action}
                          </span>
                        </TableCell>
                        <TableCell>
                          {materialType ? `${materialType.name} (${materialType.size})` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {ev.quantity ? `${ev.quantity}${ev.quantityLost ? ` (${ev.quantityLost} lost)` : ""}` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {ev.amount ? `₹${ev.amount.toLocaleString("en-IN")}` : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
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
        </div>

        {/* Search + Customer List */}
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customer by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
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
                        {search ? "No customers found" : "No rentals yet. Issue materials to get started!"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((c) => {
                      const totalItems = c.materials.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0);
                      const rent = calculateRent(c).remainingDue;
                      return (
                        <TableRow
                          key={c.id}
                          className="cursor-pointer hover:bg-accent/10 transition-colors"
                          onClick={() => setSelectedCustomer(c)}
                        >
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell className="text-center">{totalItems}</TableCell>
                          <TableCell className="text-right font-semibold">₹{rent.toLocaleString("en-IN")}</TableCell>
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
    </div>
  );
};

export default Dashboard;
