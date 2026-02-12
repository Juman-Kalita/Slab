import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCustomers, recordPayment, calculateRent, type Customer } from "@/lib/rental-store";
import { generateInvoice, generateInvoiceNumber } from "@/lib/invoice-generator";
import { toast } from "sonner";
import { Download } from "lucide-react";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const RecordPaymentDialog = ({ open, onOpenChange, onSuccess }: RecordPaymentDialogProps) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [amount, setAmount] = useState("");

  const customers = getCustomers().filter((c) => c.materials.length > 0);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const calculatedRent = selectedCustomer ? calculateRent(selectedCustomer) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !amount) {
      toast.error("Please select a customer and enter amount");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (!customer) return;

    const success = recordPayment(selectedCustomerId, amountNum);
    if (success) {
      toast.success("Payment recorded successfully!");
      
      setSelectedCustomerId("");
      setAmount("");
      onSuccess();
      onOpenChange(false);
    } else {
      toast.error("Failed to record payment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No customers with materials</div>
                ) : (
                  customers.map((c) => {
                    const totalItems = c.materials.reduce((sum, m) => sum + m.quantity, 0);
                    return (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} - {totalItems} items
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          {calculatedRent && (
            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rent Amount:</span>
                <span className="font-semibold">₹{calculatedRent.rentAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loading Charges:</span>
                <span className="font-semibold">₹{(calculatedRent.issueLoadingCharges + calculatedRent.returnLoadingCharges).toLocaleString("en-IN")}</span>
              </div>
              {calculatedRent.lostItemsPenalty > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lost Items:</span>
                  <span className="font-semibold text-red-600">₹{calculatedRent.lostItemsPenalty.toLocaleString("en-IN")}</span>
                </div>
              )}
              {calculatedRent.penaltyAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Late Penalty:</span>
                  <span className="font-semibold text-red-600">₹{calculatedRent.penaltyAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Total Required:</span>
                <span className="font-bold text-lg">₹{calculatedRent.totalRequired.toLocaleString("en-IN")}</span>
              </div>
              {calculatedRent.amountPaid > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Paid:</span>
                  <span className="font-semibold text-green-600">₹{calculatedRent.amountPaid.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Remaining Due:</span>
                <span className="font-bold text-lg text-accent">₹{calculatedRent.remainingDue.toLocaleString("en-IN")}</span>
              </div>
              {calculatedRent.isWithinGracePeriod ? (
                <div className="text-xs text-green-600">Within 20-day grace period</div>
              ) : (
                <div className="text-xs text-red-600">Overdue by {calculatedRent.daysOverdue} days</div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount Received (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordPaymentDialog;
