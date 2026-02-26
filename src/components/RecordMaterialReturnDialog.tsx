import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { getCustomers, recordReturn, getMaterialType } from "@/lib/rental-store";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecordMaterialReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preSelectedCustomerId?: string; // Optional pre-selected customer
}

const RecordMaterialReturnDialog = ({ open, onOpenChange, onSuccess, preSelectedCustomerId }: RecordMaterialReturnDialogProps) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [selectedMaterialTypeId, setSelectedMaterialTypeId] = useState("");
  const [quantityReturned, setQuantityReturned] = useState("");
  const [quantityLost, setQuantityLost] = useState("0");
  const [hasOwnLabor, setHasOwnLabor] = useState(false);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Use pre-selected customer if provided
  const effectiveCustomerId = preSelectedCustomerId || selectedCustomerId;

  // Load customers when dialog opens
  useEffect(() => {
    if (open) {
      const loadCustomers = async () => {
        setLoading(true);
        try {
          const data = await getCustomers();
          const filtered = data.filter((c: any) => c.sites.some((s: any) => s.materials.some((m: any) => m.quantity > 0)));
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
  const selectedSite = selectedCustomer?.sites.find((s: any) => s.id === selectedSiteId);
  const selectedMaterial = selectedSite?.materials.find((m: any) => m.materialTypeId === selectedMaterialTypeId);
  const materialType = selectedMaterial ? getMaterialType(selectedMaterial.materialTypeId) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    
    if (!effectiveCustomerId || !selectedSiteId || !selectedMaterialTypeId || !quantityReturned) {
      toast.error("Please fill all required fields");
      return;
    }

    const qtyReturned = parseInt(quantityReturned);
    const qtyLost = parseInt(quantityLost);
    
    if (isNaN(qtyReturned) || qtyReturned < 0) {
      toast.error("Please enter a valid quantity returned");
      return;
    }

    if (isNaN(qtyLost) || qtyLost < 0) {
      toast.error("Please enter a valid quantity lost");
      return;
    }

    if (qtyReturned + qtyLost === 0) {
      toast.error("Total returned + lost must be greater than 0");
      return;
    }

    setSubmitting(true);
    try {
      const success = await recordReturn(effectiveCustomerId, selectedSiteId, selectedMaterialTypeId, qtyReturned, qtyLost, hasOwnLabor, returnDate);
      if (success) {
        const lostMessage = qtyLost > 0 ? ` (${qtyLost} lost)` : "";
        toast.success(`Recorded return of ${qtyReturned} items${lostMessage}`);
        setSelectedCustomerId("");
        setSelectedSiteId("");
        setSelectedMaterialTypeId("");
        setQuantityReturned("");
        setQuantityLost("0");
        setHasOwnLabor(false);
        setReturnDate(new Date().toISOString().split("T")[0]);
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error("Failed to record return. Check quantity.");
      }
    } catch (error) {
      console.error('Error recording return:', error);
      toast.error('Failed to record return');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Material Return</DialogTitle>
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
                              setSelectedSiteId("");
                              setSelectedMaterialTypeId("");
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
            </div>
          )}

          {selectedCustomer && (
            <div className="space-y-2">
              <Label htmlFor="site">Site</Label>
              <Select value={selectedSiteId} onValueChange={(value) => {
                setSelectedSiteId(value);
                setSelectedMaterialTypeId("");
              }}>
                <SelectTrigger id="site">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCustomer.sites.filter(s => s.materials.some(m => m.quantity > 0)).map((s) => {
                    const totalItems = s.materials.reduce((sum, m) => sum + m.quantity, 0);
                    return (
                      <SelectItem key={s.id} value={s.id}>
                        {s.siteName} ({s.location}) - {totalItems} items
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedSite && (
            <div className="space-y-2">
              <Label htmlFor="material">Material Type</Label>
              <Select value={selectedMaterialTypeId} onValueChange={setSelectedMaterialTypeId}>
                <SelectTrigger id="material">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {selectedSite.materials.filter(m => m.quantity > 0).map((m) => {
                    const mt = getMaterialType(m.materialTypeId);
                    return (
                      <SelectItem key={m.materialTypeId} value={m.materialTypeId}>
                        {mt?.name} ({mt?.size}) - {m.quantity} items
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedMaterial && materialType && (
            <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total held:</span>
                <span className="font-semibold">{selectedMaterial.quantity} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Return LC&ULC:</span>
                <span className="font-semibold">₹{materialType.loadingCharge}/item</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lost item penalty:</span>
                <span className="font-semibold text-red-600">₹{materialType.lostItemPenalty}/item</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="returnDate">Return Date</Label>
            <Input
              id="returnDate"
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
            <p className="text-xs text-muted-foreground">
              Select the actual date materials were returned
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantityReturned">Quantity Returned</Label>
            <Input
              id="quantityReturned"
              type="number"
              placeholder="Number of items returned"
              value={quantityReturned}
              onChange={(e) => setQuantityReturned(e.target.value)}
              min="0"
              max={selectedMaterial?.quantity || 0}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantityLost">Quantity Lost</Label>
            <Input
              id="quantityLost"
              type="number"
              placeholder="Number of items lost"
              value={quantityLost}
              onChange={(e) => setQuantityLost(e.target.value)}
              min="0"
              max={selectedMaterial?.quantity || 0}
            />
            <p className="text-xs text-muted-foreground">
              Lost items will be charged at ₹{materialType?.lostItemPenalty || 0} per item
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasOwnLaborReturn"
              checked={hasOwnLabor}
              onCheckedChange={(checked) => setHasOwnLabor(checked as boolean)}
            />
            <Label htmlFor="hasOwnLaborReturn" className="text-sm font-normal cursor-pointer">
              Customer brings own labor (No return LC&ULC charge)
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={submitting}>
              {submitting ? "Recording..." : "Record Return"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordMaterialReturnDialog;
