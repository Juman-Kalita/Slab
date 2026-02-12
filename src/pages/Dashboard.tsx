import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getCustomers, getDashboardStats, calculateRent, type Customer } from "@/lib/rental-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { HardHat, LogOut, Users, Layers, Clock, IndianRupee, Plus, RotateCcw, Search, ArrowLeft, Wallet, Download } from "lucide-react";
import IssueSlabsDialog from "@/components/IssueSlabsDialog";
import RecordReturnDialog from "@/components/RecordReturnDialog";
import RecordPaymentDialog from "@/components/RecordPaymentDialog";
import { format } from "date-fns";
import { generateInvoice, generateInvoiceNumber } from "@/lib/invoice-generator";
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

  const handleDownloadInvoice = (customer: Customer) => {
    const rent = calculateRent(customer);
    generateInvoice({
      customer,
      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: new Date().toISOString(),
      baseAmount: rent.baseAmount,
      penaltyAmount: rent.penaltyAmount,
      totalRequired: rent.totalRequired,
      amountPaid: rent.amountPaid,
      remainingDue: rent.remainingDue,
      daysOverdue: rent.daysOverdue,
      isWithinGracePeriod: rent.isWithinGracePeriod,
    });
    toast.success("Invoice downloaded successfully!");
  };

  // Force re-read when refreshKey changes
  void refreshKey;

  if (selectedCustomer) {
    const customer = customers.find((c) => c.id === selectedCustomer.id) || selectedCustomer;
    const rent = calculateRent(customer);
    return (
      <div className="min-h-screen bg-background">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-primary px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <HardHat className="h-7 w-7 text-accent" />
            <h1 className="text-lg font-bold text-primary-foreground">SlabRent Pro</h1>
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
            <Button 
              onClick={() => handleDownloadInvoice(customer)} 
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
            >
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
                <div><span className="text-muted-foreground">Initial Slabs Taken:</span><br />{customer.initialSlabs} slabs</div>
                <div><span className="text-muted-foreground">Returned:</span><br />{customer.totalReturned} slabs</div>
                <div><span className="text-muted-foreground">Currently Held:</span><br /><span className="font-bold text-accent">{customer.slabsHeld} slabs</span></div>
                <div className="col-span-2 md:col-span-3 pt-2 border-t space-y-2">
                  <div>
                    <span className="text-muted-foreground">Base Amount ({customer.initialSlabs} slabs × ₹1,000):</span>{" "}
                    <span className="text-lg font-semibold">₹{rent.baseAmount.toLocaleString("en-IN")}</span>
                  </div>
                  {rent.penaltyAmount > 0 && (
                    <div>
                      <span className="text-muted-foreground">Penalty ({rent.daysOverdue} days × {customer.initialSlabs} slabs × ₹100):</span>{" "}
                      <span className="text-lg font-semibold text-red-600">₹{rent.penaltyAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground">Total Required:</span>{" "}
                    <span className="text-xl font-bold">₹{rent.totalRequired.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount Paid:</span>{" "}
                    <span className="text-lg font-semibold text-green-600">₹{rent.amountPaid.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground">Remaining Due:</span>{" "}
                    <span className="text-2xl font-bold text-accent">₹{rent.remainingDue.toLocaleString("en-IN")}</span>
                  </div>
                  {rent.isFullyPaid && (
                    <div className="text-sm text-green-600 font-medium">✓ Fully paid - New cycle started</div>
                  )}
                </div>
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
                    <TableHead className="text-right">Slabs</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.history.map((ev, i) => (
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
                      <TableCell className="text-right">{ev.slabs > 0 ? ev.slabs : "-"}</TableCell>
                      <TableCell className="text-right">{ev.amount ? `₹${ev.amount.toLocaleString("en-IN")}` : "-"}</TableCell>
                    </TableRow>
                  ))}
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
          <h1 className="text-lg font-bold text-primary-foreground">SlabRent Pro</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:bg-primary/80">
          <LogOut className="mr-1 h-4 w-4" /> Logout
        </Button>
      </header>

      <main className="mx-auto max-w-6xl p-4 md:p-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Customers", value: stats.totalCustomers, icon: Users, color: "bg-primary text-primary-foreground" },
            { label: "Total Slabs Rented", value: stats.totalSlabsRented, icon: Layers, color: "bg-accent text-accent-foreground" },
            { label: "Pending Slabs", value: stats.totalPendingSlabs, icon: Clock, color: "bg-primary text-primary-foreground" },
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
            <Plus className="h-4 w-4" /> Issue Slabs
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
                    <TableHead className="text-center">Slabs Held</TableHead>
                    <TableHead className="text-center">Returned</TableHead>
                    <TableHead className="text-right">Pending Rent</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {search ? "No customers found" : "No rentals yet. Issue slabs to get started!"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((c) => {
                      const rent = c.slabsHeld > 0 ? calculateRent(c).remainingDue : 0;
                      return (
                        <TableRow
                          key={c.id}
                          className="hover:bg-accent/10 transition-colors"
                        >
                          <TableCell 
                            className="font-medium cursor-pointer"
                            onClick={() => setSelectedCustomer(c)}
                          >
                            {c.name}
                          </TableCell>
                          <TableCell 
                            className="text-center cursor-pointer"
                            onClick={() => setSelectedCustomer(c)}
                          >
                            {c.slabsHeld}
                          </TableCell>
                          <TableCell 
                            className="text-center cursor-pointer"
                            onClick={() => setSelectedCustomer(c)}
                          >
                            {c.totalReturned}
                          </TableCell>
                          <TableCell 
                            className="text-right font-semibold cursor-pointer"
                            onClick={() => setSelectedCustomer(c)}
                          >
                            ₹{rent.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadInvoice(c);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
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

      <IssueSlabsDialog open={issueOpen} onOpenChange={setIssueOpen} onSuccess={refresh} />
      <RecordReturnDialog open={returnOpen} onOpenChange={setReturnOpen} onSuccess={refresh} />
      <RecordPaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} onSuccess={refresh} />
    </div>
  );
};

export default Dashboard;
