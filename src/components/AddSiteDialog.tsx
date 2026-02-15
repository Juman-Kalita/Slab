import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { issueMaterials, MATERIAL_TYPES, getMaterialType, getAvailableStock } from "@/lib/rental-store";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface AddSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  customerName: string;
}

interface MaterialLine {
  id: string;
  materialTypeId: string;
  quantity: string;
  hasOwnLabor: boolean;
}

const AddSiteDialog = ({ open, onOpenChange, onSuccess, customerName }: AddSiteDialogProps) => {
  const [siteName, setSiteName] = useState("");
  const [location, setLocation] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
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
    if (!siteName || !location || !issueDate) {
      toast.error("Please enter site name, location, and issue date");
      return;
    }

    // Validate all lines
    const validLines = materialLines.filter(line => line.materialTypeId && line.quantity);
    if (validLines.length === 0) {
      toast.error("Please add at least one material with quantity");
      return;
    }

    // Validate deposit amount
    const deposit = depositAmount ? parseFloat(depositAmount) : 0;
    if (depositAmount && (isNaN(deposit) || deposit < 0)) {
      toast.error("Invalid deposit amount");
      return;
    }

    // Check for invalid quantities and stock availability
    for (const line of validLines) {
      const qty = parseInt(line.quantity);
      if (isNaN(qty) || qty <= 0) {
        toast.error("Please enter valid quantities for all materials");
        return;
      }
      
      const available = getAvailableStock(line.materialTypeId);
      if (qty > available) {
        const material = getMaterialType(line.materialTypeId);
        toast.error(`Not enough stock for ${material?.name} ${material?.size}. Available: ${available}`);
        return;
      }
    }

    // Issue all materials
    let successCount = 0;
    for (const line of validLines) {
      const qty = parseInt(line.quantity);
      const success = issueMaterials(
        customerName,
        siteName,
        location,
        line.materialTypeId, 
        qty, 
        issueDate, 
        line.hasOwnLabor,
        deposit
      );
      if (success) {
        successCount++;
      } else {
        toast.error("Failed to issue some materials");
        return;
      }
    }

    toast.success(`Added new site "${siteName}" with ${successCount} material type(s)`);
    
    // Reset form
    setSiteName("");
    setLocation("");
    setDepositAmount("");
    setIssueDate(new Date().toISOString().split("T")[0]);
    setMaterialLines([{ id: crypto.randomUUID(), materialTypeId: "", quantity: "", hasOwnLabor: false }]);
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Site for {customerName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                placeholder="e.g. Building A, Tower 1"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location/Region</Label>
              <Input
                id="location"
                placeholder="e.g. Mumbai, Pune"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border-2 border-yellow-400 dark:border-yellow-600">
              <Label htmlFor="depositAmount" className="font-semibold flex items-center gap-2">
                💰 Deposit Amount (₹)
              </Label>
              <Input
                id="depositAmount"
                type="number"
                placeholder="Enter deposit (optional)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="0"
                step="0.01"
                className="font-semibold"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Materials</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMaterialLine} className="gap-1">
                <Plus className="h-4 w-4" /> Add Material
              </Button>
            </div>

            {materialLines.map((line) => {
              const selectedMaterial = getMaterialType(line.materialTypeId);
              const availableStock = line.materialTypeId ? getAvailableStock(line.materialTypeId) : 0;
              const categories = Array.from(new Set(MATERIAL_TYPES.map(m => m.category)));
              
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
                            <SelectContent className="max-h-[400px]">
                              {categories.map((category, catIndex) => (
                                <div key={category}>
                                  {catIndex > 0 && <div className="h-px bg-border my-1" />}
                                  <SelectGroup>
                                    <SelectLabel className="font-bold text-primary bg-accent/20 px-2 py-1.5 sticky top-0 z-10">
                                      {category}
                                    </SelectLabel>
                                    {MATERIAL_TYPES.filter(m => m.category === category).map((material) => {
                                      const stock = getAvailableStock(material.id);
                                      return (
                                        <SelectItem 
                                          key={material.id} 
                                          value={material.id}
                                          disabled={stock === 0}
                                          className="pl-6"
                                        >
                                          <div className="flex items-center justify-between w-full gap-2">
                                            <span>
                                              {material.name} {material.size && `(${material.size})`} - ₹{material.rentPerDay}/day
                                            </span>
                                            <span className={`text-xs font-semibold ${stock === 0 ? 'text-red-600' : stock < 10 ? 'text-orange-600' : 'text-green-600'}`}>
                                              [{stock}]
                                            </span>
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectGroup>
                                </div>
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
                            max={availableStock}
                          />
                          {selectedMaterial && (
                            <p className="text-xs text-muted-foreground">
                              Available: <span className={availableStock < 10 ? 'text-orange-600 font-semibold' : 'text-green-600 font-semibold'}>{availableStock}</span>
                            </p>
                          )}
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
                            <span className="text-muted-foreground">Grace period:</span>
                            <span className="font-semibold">{selectedMaterial.gracePeriodDays} days</span>
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
              Add Site
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSiteDialog;
