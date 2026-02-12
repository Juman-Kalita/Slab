import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { issueMaterials, MATERIAL_TYPES, getMaterialType } from "@/lib/rental-store";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface IssueMaterialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface MaterialLine {
  id: string;
  materialTypeId: string;
  quantity: string;
  hasOwnLabor: boolean;
}

const IssueMaterialsDialog = ({ open, onOpenChange, onSuccess }: IssueMaterialsDialogProps) => {
  const [customerName, setCustomerName] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [materialLines, setMaterialLines] = useState<MaterialLine[]>([
    { id: crypto.randomUUID(), materialTypeId: "", quantity: "", hasOwnLabor: false }
  ]);

  const addMaterialLine = () => {
    setMaterialLines([...materialLines, { 
      id: crypto.randomUUID(), 
      materialTypeId: "", 
      quantity: "", 
      hasOwnLabor: false 
    }]);
  };

  const removeMaterialLine = (id: string) => {
    if (materialLines.length > 1) {
      setMaterialLines(materialLines.filter(line => line.id !== id));
    }
  };

  const updateMaterialLine = (id: string, field: keyof MaterialLine, value: any) => {
    setMaterialLines(materialLines.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !issueDate) {
      toast.error("Please enter customer name and issue date");
      return;
    }

    // Validate all lines
    const validLines = materialLines.filter(line => line.materialTypeId && line.quantity);
    if (validLines.length === 0) {
      toast.error("Please add at least one material with quantity");
      return;
    }

    // Check for invalid quantities
    for (const line of validLines) {
      const qty = parseInt(line.quantity);
      if (isNaN(qty) || qty <= 0) {
        toast.error("Please enter valid quantities for all materials");
        return;
      }
    }

    // Issue all materials
    let successCount = 0;
    validLines.forEach(line => {
      const qty = parseInt(line.quantity);
      issueMaterials(customerName, line.materialTypeId, qty, issueDate, line.hasOwnLabor);
      successCount++;
    });

    toast.success(`Issued ${successCount} material type(s) to ${customerName}`);
    
    // Reset form
    setCustomerName("");
    setIssueDate(new Date().toISOString().split("T")[0]);
    setMaterialLines([{ id: crypto.randomUUID(), materialTypeId: "", quantity: "", hasOwnLabor: false }]);
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Issue Materials</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              placeholder="Customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issueDate">Issue Date</Label>
            <Input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Materials</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMaterialLine} className="gap-1">
                <Plus className="h-4 w-4" /> Add Material
              </Button>
            </div>

            {materialLines.map((line, index) => {
              const selectedMaterial = getMaterialType(line.materialTypeId);
              return (
                <div key={line.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Material Type</Label>
                          <Select 
                            value={line.materialTypeId} 
                            onValueChange={(value) => updateMaterialLine(line.id, "materialTypeId", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select material" />
                            </SelectTrigger>
                            <SelectContent>
                              {MATERIAL_TYPES.map((material) => (
                                <SelectItem key={material.id} value={material.id}>
                                  {material.name} ({material.size}) - ₹{material.rentPerDay}/day
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 10"
                            value={line.quantity}
                            onChange={(e) => updateMaterialLine(line.id, "quantity", e.target.value)}
                            min="1"
                          />
                        </div>
                      </div>

                      {selectedMaterial && (
                        <div className="rounded bg-background p-2 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rent/day:</span>
                            <span className="font-semibold">₹{selectedMaterial.rentPerDay}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">LC&ULC:</span>
                            <span className="font-semibold">₹{selectedMaterial.loadingCharge}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Lost penalty:</span>
                            <span className="font-semibold">₹{selectedMaterial.lostItemPenalty}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`hasOwnLabor-${line.id}`}
                          checked={line.hasOwnLabor}
                          onCheckedChange={(checked) => updateMaterialLine(line.id, "hasOwnLabor", checked as boolean)}
                        />
                        <Label htmlFor={`hasOwnLabor-${line.id}`} className="text-sm font-normal cursor-pointer">
                          Own labor (No LC&ULC)
                        </Label>
                      </div>
                    </div>

                    {materialLines.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMaterialLine(line.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Issue Materials
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IssueMaterialsDialog;
