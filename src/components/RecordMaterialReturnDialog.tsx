import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getCustomers, recordReturn, getMaterialType } from "@/lib/rental-store";
import { toast } from "sonner";

interface RecordMaterialReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const RecordMaterialReturnDialog = ({ open, onOpenChange, onSuccess }: RecordMaterialReturnDialogProps) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedMaterialTypeId, setSelectedMaterialTypeId] = useState("");
  const [quantityReturned, setQuantityReturned] = useState("");
  const [quantityLost, setQuantityLost] = useState("0");
  const [hasOwnLabor, setHasOwnLabor] = useState(false);

  const customers = getCustomers().filter((c) => c.materials.length > 0);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const selectedMaterial = selectedCustomer?.materials.find(m => m.materialTypeId === selectedMaterialTypeId);
  const materialType = selectedMaterial ? getMaterialType(selectedMaterial.materialTypeId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedMaterialTypeId || !quantityReturned) {
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

    const success = recordReturn(selectedCustomerId, selectedMaterialTypeId, qtyReturned, qtyLost, hasOwnLabor);
    if (success) {
      const lostMessage = qtyLost > 0 ? ` (${qtyLost} lost)` : "";
      toast.success(`Recorded return of ${qtyReturned} items${lostMessage}`);
      setSelectedCustomerId("");
      setSelectedMaterialTypeId("");
      setQuantityReturned("");
      setQuantityLost("0");
      setHasOwnLabor(false);
      onSuccess();
      onOpenChange(false);
    } else {
      toast.error("Failed to record return. Check quantity.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Material Return</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select value={selectedCustomerId} onValueChange={(value) => {
              setSelectedCustomerId(value);
              setSelectedMaterialTypeId("");
            }}>
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No customers with materials</div>
                ) : (
                  customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedCustomer && (
            <div className="space-y-2">
              <Label htmlFor="material">Material Type</Label>
              <Select value={selectedMaterialTypeId} onValueChange={setSelectedMaterialTypeId}>
                <SelectTrigger id="material">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCustomer.materials.map((m) => {
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Record Return
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordMaterialReturnDialog;
