import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getCustomers, recordPayment, recordDepositAdjustment, calculateSiteRent, type Customer } from "@/lib/rental-store";
import { getCurrentUser } from "@/lib/auth-service";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preSelectedCustomerId?: string;
}

const RecordPaymentDialog = ({ open, onOpenChange, onSuccess, preSelectedCustomerId }: RecordPaymentDialogProps) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [customPaymentMethod, setCustomPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  // Payment mode: 'neutral' = normal payment, 'deposit' = apply advance deposit
  const [paymentMode, setPaymentMode] = useState<'neutral' | 'deposit'>('neutral');

  const effectiveCustomerId = preSelectedCustomerId || selectedCustomerId;

  useEffect(() => {
    if (open) {
      const loadCustomers = async () => {
        setLoading(true);
        try {
          const data = await getCustomers();
          const filtered = data.filter((c) =>
            c.sites.some(s => {
              const hasActiveMaterials = s.materials.some(m => m.quantity > 0);
              const siteRent = calculateSiteRent(s);
              const hasUnpaidBalance = siteRent.remainingDue > 0;
              return hasActiveMaterials || hasUnpaidBalance;
            })
          );
          setCustomers(filtered);
        } catch (error) {
          console.error('Error loading customers:', error);
        } finally {
          setLoading(false);
        }
      };
      loadCustomers();
    }
  }, [open]);

  const selectedCustomer = customers.find((c) => c.id === effectiveCustomerId);
  const selectedSite = selectedCustomer?.sites.find(s => s.id === selectedSiteId);
  const calculatedRent = selectedSite ? calculateSiteRent(selectedSite) : null;
  const depositAvailable = selectedCustomer?.advanceDeposit || 0;

  // Deposit adjustment preview
  const depositApplied = calculatedRent ? Math.min(depositAvailable, calculatedRent.remainingDue) : 0;
  const afterDepositDue = calculatedRent ? Math.max(0, calculatedRent.remainingDue - depositApplied) : 0;
  const depositLeftover = Math.max(0, depositAvailable - depositApplied);

  const resetForm = () => {
    setSelectedCustomerId("");
    setSelectedSiteId("");
    setAmount("");
    setPaymentMethod("Cash");
    setCustomPaymentMethod("");
    setPaymentDetails("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentMode('neutral');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!effectiveCustomerId || !selectedSiteId) {
      toast.error("Please select a customer and site");
      return;
    }

    setSubmitting(true);
    try {
      if (paymentMode === 'deposit') {
        // Deposit Adjustment mode — apply advance deposit to site
        if (depositAvailable <= 0) {
          toast.error("No advance deposit available for this customer");
          setSubmitting(false);
          return;
        }
        const result = await recordDepositAdjustment(
          effectiveCustomerId,
          selectedSiteId,
          new Date(paymentDate).toISOString()
        );
        if (result.success) {
          toast.success(`Applied ₹${result.amountApplied.toLocaleString("en-IN")} from advance deposit. ${result.remainingDue > 0 ? `₹${result.remainingDue.toLocaleString("en-IN")} still due.` : "Fully settled!"}`);
          resetForm();
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error("Failed to apply deposit adjustment");
        }
      } else {
        // Neutral Payment mode
        if (!amount) {
          toast.error("Please enter an amount");
          setSubmitting(false);
          return;
        }
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
          toast.error("Please enter a valid amount");
          setSubmitting(false);
          return;
        }
        if (paymentMethod === "Other" && !customPaymentMethod.trim()) {
          toast.error("Please specify the payment method");
          setSubmitting(false);
          return;
        }
        const finalPaymentMethod = paymentMethod === "Other" ? customPaymentMethod : paymentMethod;
        const currentUser = getCurrentUser();
        const success = await recordPayment(
          effectiveCustomerId, selectedSiteId, amountNum,
          finalPaymentMethod, new Date(paymentDate).toISOString(),
          undefined, currentUser?.id
        );
        if (success) {
          toast.success("Payment recorded successfully!");
          resetForm();
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error("Failed to record payment");
        }
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Site Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Customer */}
          {!preSelectedCustomerId && (
            <div className="space-y-2">
              <Label>Customer</Label>
              <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {selectedCustomerId ? customers.find((c) => c.id === selectedCustomerId)?.name : "Select customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search customer..." />
                    <CommandList>
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {customers.map((c) => (
                          <CommandItem key={c.id} value={c.name} onSelect={() => { setSelectedCustomerId(c.id); setSelectedSiteId(""); setCustomerSearchOpen(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", selectedCustomerId === c.id ? "opacity-100" : "opacity-0")} />
                            {c.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {preSelectedCustomerId && selectedCustomer && (
            <div className="rounded-lg bg-accent/10 p-3 border">
              <Label className="text-sm text-muted-foreground">Customer</Label>
              <p className="font-semibold">{selectedCustomer.name}</p>
            </div>
          )}

          {/* Site */}
          {selectedCustomer && (
            <div className="space-y-2">
              <Label htmlFor="site">Site</Label>
              <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                <SelectTrigger id="site"><SelectValue placeholder="Select site" /></SelectTrigger>
                <SelectContent>
                  {selectedCustomer.sites.filter(s => {
                    const hasActiveMaterials = s.materials.some(m => m.quantity > 0);
                    const siteRent = calculateSiteRent(s);
                    return hasActiveMaterials || siteRent.remainingDue > 0;
                  }).map((s) => {
                    const siteRent = calculateSiteRent(s);
                    return (
                      <SelectItem key={s.id} value={s.id}>
                        {s.siteName} ({s.location}) — ₹{siteRent.remainingDue.toLocaleString("en-IN")} due
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Bill Summary */}
          {calculatedRent && (
            <div className="rounded-lg bg-muted p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rent:</span>
                <span className="font-semibold">₹{calculatedRent.rentAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loading Charges:</span>
                <span className="font-semibold">₹{(calculatedRent.issueLoadingCharges + calculatedRent.returnLoadingCharges).toLocaleString("en-IN")}</span>
              </div>
              {calculatedRent.transportCharges > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transport:</span>
                  <span className="font-semibold">₹{calculatedRent.transportCharges.toLocaleString("en-IN")}</span>
                </div>
              )}
              {calculatedRent.lostItemsPenalty > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Lost Items:</span>
                  <span className="font-semibold">₹{calculatedRent.lostItemsPenalty.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between pt-1.5 border-t font-medium">
                <span>Total Bill:</span>
                <span>₹{(calculatedRent.totalRequired + calculatedRent.amountPaid).toLocaleString("en-IN")}</span>
              </div>
              {calculatedRent.amountPaid > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Already Paid:</span>
                  <span className="font-semibold">- ₹{calculatedRent.amountPaid.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between pt-1.5 border-t">
                <span className="font-medium">Remaining Due:</span>
                <span className="font-bold text-accent">₹{calculatedRent.remainingDue.toLocaleString("en-IN")}</span>
              </div>
              {depositAvailable > 0 && (
                <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded text-green-700 dark:text-green-400">
                  <span className="font-medium">Advance Deposit:</span>
                  <span className="font-bold">₹{depositAvailable.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>
          )}

          {/* Payment Mode Checkboxes */}
          {selectedSiteId && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Payment Type</Label>
              <div className="flex gap-6">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPaymentMode('neutral')}>
                  <Checkbox checked={paymentMode === 'neutral'} onCheckedChange={() => setPaymentMode('neutral')} />
                  <span className="text-sm font-medium">Neutral Payment</span>
                </div>
                <div className={cn("flex items-center gap-2 cursor-pointer", depositAvailable <= 0 && "opacity-40 cursor-not-allowed")}
                  onClick={() => depositAvailable > 0 && setPaymentMode('deposit')}>
                  <Checkbox checked={paymentMode === 'deposit'} onCheckedChange={() => depositAvailable > 0 && setPaymentMode('deposit')} disabled={depositAvailable <= 0} />
                  <span className="text-sm font-medium">Deposit Adjustment</span>
                </div>
              </div>
            </div>
          )}

          {/* Deposit Adjustment Preview */}
          {paymentMode === 'deposit' && calculatedRent && (
            <div className="rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-3 space-y-1.5 text-sm">
              <div className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Deposit Adjustment Preview</div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining Due:</span>
                <span className="font-semibold">₹{calculatedRent.remainingDue.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Advance Deposit Available:</span>
                <span className="font-semibold text-green-600">₹{depositAvailable.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1.5">
                <span>Amount to Apply:</span>
                <span className="text-blue-700 dark:text-blue-300">₹{depositApplied.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Remaining Due After:</span>
                <span className={afterDepositDue > 0 ? "text-orange-600" : "text-green-600"}>
                  {afterDepositDue > 0 ? `₹${afterDepositDue.toLocaleString("en-IN")} still owed` : "Fully Settled ✓"}
                </span>
              </div>
              {depositLeftover > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deposit Remaining:</span>
                  <span className="text-green-600 font-semibold">₹{depositLeftover.toLocaleString("en-IN")} stays in advance</span>
                </div>
              )}
            </div>
          )}

          {/* Neutral Payment fields */}
          {paymentMode === 'neutral' && selectedSiteId && (
            <>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount Received (₹)</Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) setAmount(value);
                  }}
                />
                {amount && calculatedRent && parseFloat(amount) > calculatedRent.remainingDue && (
                  <p className="text-xs text-green-600 font-medium">
                    Excess ₹{(parseFloat(amount) - calculatedRent.remainingDue).toLocaleString("en-IN")} will be saved as advance deposit
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="paymentMethod"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "Other" && (
                <div className="space-y-2">
                  <Label htmlFor="customPaymentMethod">Specify Payment Method</Label>
                  <Input id="customPaymentMethod" placeholder="Enter payment method" value={customPaymentMethod} onChange={(e) => setCustomPaymentMethod(e.target.value)} />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="paymentDetails">Payment Details (Optional)</Label>
                <Input id="paymentDetails" placeholder="Transaction ID, cheque number, etc." value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)} />
              </div>
            </>
          )}

          {/* Payment Date */}
          {selectedSiteId && (
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input id="paymentDate" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { resetForm(); onOpenChange(false); }} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={submitting || !selectedSiteId}>
              {submitting ? "Recording..." : paymentMode === 'deposit' ? "Apply Deposit" : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordPaymentDialog;
