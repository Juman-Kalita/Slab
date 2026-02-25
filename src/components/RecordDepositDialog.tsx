import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getCustomers, type Customer } from "@/lib/rental-store";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecordDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preSelectedCustomerId?: string;
}

const RecordDepositDialog = ({ open, onOpenChange, onSuccess, preSelectedCustomerId }: RecordDepositDialogProps) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [customPaymentMethod, setCustomPaymentMethod] = useState("");
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split("T")[0]);
  const [depositTime, setDepositTime] = useState(new Date().toTimeString().slice(0, 5));
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const effectiveCustomerId = preSelectedCustomerId || selectedCustomerId;

  useEffect(() => {
    if (open) {
      const loadCustomers = async () => {
        setLoading(true);
        try {
          const data = await getCustomers();
          setCustomers(data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    
    if (!effectiveCustomerId || !amount) {
      toast.error("Please select a customer and enter amount");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (paymentMethod === "Other" && !customPaymentMethod.trim()) {
      toast.error("Please specify the payment method");
      return;
    }

    const finalPaymentMethod = paymentMethod === "Other" ? customPaymentMethod : paymentMethod;
    const depositDateTime = new Date(`${depositDate}T${depositTime}`).toISOString();

    setSubmitting(true);
    try {
      // Update customer's advance deposit
      const newAdvanceDeposit = (selectedCustomer?.advanceDeposit || 0) + amountNum;
      
      const { error } = await supabase
        .from('customers')
        .update({ advance_deposit: newAdvanceDeposit })
        .eq('id', effectiveCustomerId);

      if (error) throw error;

      toast.success(`Deposit of ₹${amountNum.toLocaleString("en-IN")} recorded successfully!`);
      
      setSelectedCustomerId("");
      setAmount("");
      setPaymentMethod("Cash");
      setCustomPaymentMethod("");
      setDepositDate(new Date().toISOString().split("T")[0]);
      setDepositTime(new Date().toTimeString().slice(0, 5));
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error recording deposit:', error);
      toast.error('Failed to record deposit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-600" />
            Record Advance Deposit
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!preSelectedCustomerId && (
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerSearchOpen}
                    className="w-full justify-between"
                  >
                    {selectedCustomerId
                      ? customers.find((c) => c.id === selectedCustomerId)?.name
                      : "Select customer..."}
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
                          <CommandItem
                            key={c.id}
                            value={c.name}
                            onSelect={() => {
                              setSelectedCustomerId(c.id);
                              setCustomerSearchOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCustomerId === c.id ? "opacity-100" : "opacity-0"
                              )}
                            />
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
              {selectedCustomer.advanceDeposit > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  Current Deposit: ₹{selectedCustomer.advanceDeposit.toLocaleString("en-IN")}
                </p>
              )}
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-500 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              💡 This deposit will be stored as advance and can be used for any site of this customer.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Deposit Amount (₹)</Label>
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

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
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
              <Input
                id="customPaymentMethod"
                placeholder="Enter payment method"
                value={customPaymentMethod}
                onChange={(e) => setCustomPaymentMethod(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="depositDate">Deposit Date</Label>
              <Input
                id="depositDate"
                type="date"
                value={depositDate}
                onChange={(e) => setDepositDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depositTime">Deposit Time</Label>
              <Input
                id="depositTime"
                type="time"
                value={depositTime}
                onChange={(e) => setDepositTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 text-white hover:bg-green-700" disabled={submitting}>
              {submitting ? "Recording..." : "Record Deposit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordDepositDialog;
