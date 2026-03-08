import { useState, useEffect } from "react";
import { getCustomers } from "@/lib/rental-store";
import { updatePaymentRecord, deleteHistoryEvent, updateSitePayment } from "@/lib/supabase-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Search, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { getCurrentUser, logActivity } from "@/lib/auth-service";
import type { Customer, HistoryEvent } from "@/lib/rental-store";

interface PaymentWithContext extends Omit<HistoryEvent, 'id'> {
  id: string; // Required for deletion
  customerName: string;
  customerId: string;
  siteName: string;
}

const PaymentManagement = () => {
  const currentUser = getCurrentUser();
  const [payments, setPayments] = useState<PaymentWithContext[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentWithContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithContext | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editMethod, setEditMethod] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = payments.filter(p =>
        p.customerName.toLowerCase().includes(search.toLowerCase()) ||
        p.siteName.toLowerCase().includes(search.toLowerCase()) ||
        p.paymentMethod?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredPayments(filtered);
    } else {
      setFilteredPayments(payments);
    }
  }, [search, payments]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const customers = await getCustomers();
      const allPayments: PaymentWithContext[] = [];

      customers.forEach((customer: Customer) => {
        customer.sites.forEach((site) => {
          site.history.forEach((event) => {
            if (event.action === 'Payment' && event.amount && event.id) {
              allPayments.push({
                ...event,
                id: event.id,
                customerName: customer.name,
                customerId: customer.id,
                siteName: site.siteName
              });
            }
          });
        });
      });

      // Sort by date descending
      allPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setPayments(allPayments);
      setFilteredPayments(allPayments);
    } catch (error) {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (payment: PaymentWithContext) => {
    setSelectedPayment(payment);
    setEditAmount(payment.amount?.toString() || "");
    setEditDate(payment.date);
    setEditMethod(payment.paymentMethod || "Cash");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedPayment) return;

    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount");
      return;
    }

    if (!editDate) {
      toast.error("Date is required");
      return;
    }

    setSaving(true);
    
    // Note: This requires the history event to have an ID
    // The current schema might not have IDs on history_events
    // This is a placeholder for the functionality
    
    const success = await updatePaymentRecord(selectedPayment.date, {
      amount,
      date: editDate,
      paymentMethod: editMethod
    });

    if (success) {
      toast.success("Payment updated successfully");
      if (currentUser) {
        await logActivity(currentUser.id, 'update_payment', 'payment', selectedPayment.date, {
          customer: selectedPayment.customerName,
          site: selectedPayment.siteName,
          amount
        });
      }
      setEditDialogOpen(false);
      loadPayments();
    } else {
      toast.error("Failed to update payment");
    }

    setSaving(false);
  };

  const handleDelete = async (payment: PaymentWithContext) => {
    if (!confirm(`Delete payment of ₹${payment.amount?.toLocaleString("en-IN")} from ${payment.customerName}?`)) {
      return;
    }

    // Check if payment has an ID
    if (!payment.id) {
      toast.error("Cannot delete payment: Missing ID");
      return;
    }

    const success = await deleteHistoryEvent(payment.id);

    if (success) {
      // Recalculate the site's amountPaid by summing all remaining payment history events
      const customers = await getCustomers();
      const customer = customers.find(c => c.id === payment.customerId);
      const site = customer?.sites.find(s => s.siteName === payment.siteName);
      
      if (site) {
        // Calculate total paid from remaining payment history events
        const totalPaid = site.history
          .filter(e => e.action === 'Payment' && e.amount)
          .reduce((sum, e) => sum + (e.amount || 0), 0);
        
        // Update the site's amountPaid in database
        await updateSitePayment(site.id, totalPaid);
      }
      
      toast.success("Payment deleted successfully");
      if (currentUser) {
        await logActivity(currentUser.id, 'delete_payment', 'payment', payment.id, {
          customer: payment.customerName,
          site: payment.siteName,
          amount: payment.amount
        });
      }
      loadPayments();
    } else {
      toast.error("Failed to delete payment");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>View, edit, and manage payment records</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading payments...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{search ? "No payments found matching your search" : "No payment records yet"}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id || `${payment.date}-${payment.customerName}`}>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{payment.customerName}</TableCell>
                      <TableCell>{payment.siteName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.paymentMethod || "Cash"}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{payment.amount?.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(payment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(payment)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Payments:</span>
              <span className="font-semibold">{filteredPayments.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-semibold text-lg">
                ₹{filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Payment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>
              Update payment details for {selectedPayment?.customerName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm">
                <div><strong>Customer:</strong> {selectedPayment?.customerName}</div>
                <div><strong>Site:</strong> {selectedPayment?.siteName}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editAmount">Amount (₹) *</Label>
              <Input
                id="editAmount"
                type="text"
                inputMode="decimal"
                value={editAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setEditAmount(value);
                  }
                }}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDate">Payment Date *</Label>
              <Input
                id="editDate"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editMethod">Payment Method</Label>
              <Select value={editMethod} onValueChange={setEditMethod}>
                <SelectTrigger id="editMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentManagement;