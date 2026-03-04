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
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaterialReturnLine {
  id: string;
  materialTypeId: string;
  quantityReturned: string;
  quantityLost: string;
  hasOwnLabor: boolean;
}

interface RecordMaterialReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preSelectedCustomerId?: string; // Optional pre-selected customer
}

const RecordMaterialReturnDialog = ({ open, onOpenChange, onSuccess, preSelectedCustomerId }: RecordMaterialReturnDialogProps) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [materialLines, setMaterialLines] = useState<MaterialReturnLine[]>([
    { id: crypto.randomUUID(), materialTypeId: "", quantityReturned: "", quantityLost: "0", hasOwnLabor: false }
  ]);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

  // Use pre-selected customer if provided
  const effectiveCustomerId = preSelectedCustomerId || selectedCustomerId;

  // Load customers when dialog opens
  useEffect(() => {
    if (open) {
      const loadCustomers = async () => {
        try {
          const data = await getCustomers();
          const filtered = data.filter((c: any) => c.sites.some((s: any) => s.materials.some((m: any) => m.quantity > 0)));
          setCustomers(filtered);
        } catch (error) {
          console.error('Error loading customers:', error);
        }
      };
      loadCustomers();
    }
  }, [open]);
  
  const selectedCustomer = customers.find((c) => c.id === effectiveCustomerId);
  const selectedSite = selectedCustomer?.sites.find((s: any) => s.id === selectedSiteId);

  const addMaterialLine = () => {
    setMaterialLines([...materialLines, { 
      id: crypto.randomUUID(), 
      materialTypeId: "", 
      quantityReturned: "", 
      quantityLost: "0", 
      hasOwnLabor: false 
    }]);
  };

  const removeMaterialLine = (id: string) => {
    if (materialLines.length > 1) {
      setMaterialLines(materialLines.filter(line => line.id !== id));
    }
  };

  const updateMaterialLine = (id: string, field: keyof MaterialReturnLine, value: any) => {
    setMaterialLines(materialLines.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    
    if (!effectiveCustomerId || !selectedSiteId) {
      toast.error("Please select a customer and site");
      return;
    }

    // Validate all material lines
    const validLines = materialLines.filter(line => line.materialTypeId && (line.quantityReturned || line.quantityLost !== "0"));
    
    if (validLines.length === 0) {
      toast.error("Please add at least one material to return");
      return;
    }

    // Validate quantities
    for (const line of validLines) {
      const qtyReturned = parseInt(line.quantityReturned) || 0;
      const qtyLost = parseInt(line.quantityLost) || 0;
      
      if (qtyReturned < 0 || qtyLost < 0) {
        toast.error("Quantities cannot be negative");
        return;
      }

      if (qtyReturned + qtyLost === 0) {
        toast.error("Each material must have returned or lost quantity greater than 0");
        return;
      }

      // Check if quantity exceeds available
      const material = selectedSite?.materials.find((m: any) => m.materialTypeId === line.materialTypeId);
      if (material && qtyReturned + qtyLost > material.quantity) {
        const materialType = getMaterialType(line.materialTypeId);
        toast.error(`${materialType?.name}: Cannot return more than ${material.quantity} items`);
        return;
      }
    }

    setSubmitting(true);
    try {
      let successCount = 0;
      let totalReturned = 0;
      let totalLost = 0;

      // Process each material line
      for (const line of validLines) {
        const qtyReturned = parseInt(line.quantityReturned) || 0;
        const qtyLost = parseInt(line.quantityLost) || 0;
        
        const success = await recordReturn(
          effectiveCustomerId, 
          selectedSiteId, 
          line.materialTypeId, 
          qtyReturned, 
          qtyLost, 
          line.hasOwnLabor, 
          returnDate
        );
        
        if (success) {
          successCount++;
          totalReturned += qtyReturned;
          totalLost += qtyLost;
        }
      }

      if (successCount > 0) {
        const lostMessage = totalLost > 0 ? ` (${totalLost} lost)` : "";
        toast.success(`Successfully recorded return of ${totalReturned} items${lostMessage} across ${successCount} material type(s)`);
        
        // Reset form
        setSelectedCustomerId("");
        setSelectedSiteId("");
        setMaterialLines([{ id: crypto.randomUUID(), materialTypeId: "", quantityReturned: "", quantityLost: "0", hasOwnLabor: false }]);
        setReturnDate(new Date().toISOString().split("T")[0]);
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error("Failed to record returns. Check quantities.");
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
                              setMaterialLines([{ id: crypto.randomUUID(), materialTypeId: "", quantityReturned: "", quantityLost: "0", hasOwnLabor: false }]);
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
                setMaterialLines([{ id: crypto.randomUUID(), materialTypeId: "", quantityReturned: "", quantityLost: "0", hasOwnLabor: false }]);
              }}>
                <SelectTrigger id="site">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCustomer.sites.filter((s: any) => s.materials.some((m: any) => m.quantity > 0)).map((s: any) => {
                    const totalItems = s.materials.reduce((sum: number, m: any) => sum + m.quantity, 0);
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

          {selectedSite && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Materials to Return</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMaterialLine}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Material
                </Button>
              </div>

              {materialLines.map((line, index) => {
                const material = selectedSite.materials.find((m: any) => m.materialTypeId === line.materialTypeId);
                const materialType = material ? getMaterialType(material.materialTypeId) : null;

                return (
                  <div key={line.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Material {index + 1}</Label>
                      {materialLines.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMaterialLine(line.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Material Type</Label>
                      <Select 
                        value={line.materialTypeId} 
                        onValueChange={(value) => updateMaterialLine(line.id, 'materialTypeId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedSite.materials.filter((m: any) => m.quantity > 0).map((m: any) => {
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

                    {materialType && (
                      <div className="rounded-lg bg-background p-3 text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total held:</span>
                          <span className="font-semibold">{material.quantity} items</span>
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

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Quantity Returned</Label>
                        <Input
                          type="number"
                          placeholder="Returned"
                          value={line.quantityReturned}
                          onChange={(e) => updateMaterialLine(line.id, 'quantityReturned', e.target.value)}
                          min="0"
                          max={material?.quantity || 0}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Quantity Lost</Label>
                        <Input
                          type="number"
                          placeholder="Lost"
                          value={line.quantityLost}
                          onChange={(e) => updateMaterialLine(line.id, 'quantityLost', e.target.value)}
                          min="0"
                          max={material?.quantity || 0}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`hasOwnLabor-${line.id}`}
                        checked={line.hasOwnLabor}
                        onCheckedChange={(checked) => updateMaterialLine(line.id, 'hasOwnLabor', checked as boolean)}
                      />
                      <Label htmlFor={`hasOwnLabor-${line.id}`} className="text-sm font-normal cursor-pointer">
                        Customer brings own labor (No return LC&ULC charge)
                      </Label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
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
