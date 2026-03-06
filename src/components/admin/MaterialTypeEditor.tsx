import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Plus, Save } from "lucide-react";
import { MATERIAL_TYPES } from "@/lib/rental-store";
import { toast } from "sonner";
import { getCurrentUser, logActivity } from "@/lib/auth-service";

interface MaterialType {
  id: string;
  name: string;
  size: string;
  rentPerDay: number;
  loadingCharge: number;
  gracePeriodDays: number;
  inventory: number;
}

const MaterialTypeEditor = () => {
  const currentUser = getCurrentUser();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType | null>(null);
  
  // Edit form state
  const [editName, setEditName] = useState("");
  const [editSize, setEditSize] = useState("");
  const [editRentPerDay, setEditRentPerDay] = useState("");
  const [editLoadingCharge, setEditLoadingCharge] = useState("");
  const [editGracePeriod, setEditGracePeriod] = useState("");
  const [saving, setSaving] = useState(false);

  const handleOpenEdit = (material: MaterialType) => {
    setSelectedMaterial(material);
    setEditName(material.name);
    setEditSize(material.size);
    setEditRentPerDay(material.rentPerDay.toString());
    setEditLoadingCharge(material.loadingCharge.toString());
    setEditGracePeriod(material.gracePeriodDays.toString());
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedMaterial) return;

    // Validate inputs
    if (!editName.trim()) {
      toast.error("Material name is required");
      return;
    }

    const rentPerDay = parseFloat(editRentPerDay);
    const loadingCharge = parseFloat(editLoadingCharge);
    const gracePeriod = parseInt(editGracePeriod);

    if (isNaN(rentPerDay) || rentPerDay < 0) {
      toast.error("Invalid rent per day");
      return;
    }

    if (isNaN(loadingCharge) || loadingCharge < 0) {
      toast.error("Invalid loading charge");
      return;
    }

    if (isNaN(gracePeriod) || gracePeriod < 0) {
      toast.error("Invalid grace period");
      return;
    }

    setSaving(true);

    // TODO: Implement actual save to database
    // For now, this would require updating the MATERIAL_TYPES constant
    // In a real implementation, material types should be stored in the database
    
    toast.info("Material type editing requires database migration. Currently, material types are hardcoded in the application.");
    
    if (currentUser) {
      await logActivity(currentUser.id, 'edit_material_type', 'material_type', selectedMaterial.id, {
        name: editName,
        rentPerDay,
        loadingCharge,
        gracePeriod
      });
    }

    setSaving(false);
    setEditDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Material Types</CardTitle>
              <CardDescription>Edit material prices, names, and settings</CardDescription>
            </div>
            <Button onClick={() => toast.info("Add material type requires database migration")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Material Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Rent/Day</TableHead>
                  <TableHead className="text-right">Loading Charge</TableHead>
                  <TableHead className="text-right">Grace Period</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MATERIAL_TYPES.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>{material.size}</TableCell>
                    <TableCell className="text-right">₹{material.rentPerDay}</TableCell>
                    <TableCell className="text-right">₹{material.loadingCharge}</TableCell>
                    <TableCell className="text-right">{material.gracePeriodDays} days</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(material as MaterialType)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Material types are currently hardcoded in the application. 
              To enable full editing, material types need to be migrated to the database. 
              This would allow dynamic addition, editing, and removal of material types.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Material Type Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Material Type</DialogTitle>
            <DialogDescription>
              Update material type pricing and settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Material Name *</Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Slab"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSize">Size</Label>
                <Input
                  id="editSize"
                  value={editSize}
                  onChange={(e) => setEditSize(e.target.value)}
                  placeholder="e.g. 8x4"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editRentPerDay">Rent Per Day (₹) *</Label>
                <Input
                  id="editRentPerDay"
                  type="text"
                  inputMode="decimal"
                  value={editRentPerDay}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setEditRentPerDay(value);
                    }
                  }}
                  placeholder="e.g. 10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLoadingCharge">Loading Charge (₹) *</Label>
                <Input
                  id="editLoadingCharge"
                  type="text"
                  inputMode="decimal"
                  value={editLoadingCharge}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setEditLoadingCharge(value);
                    }
                  }}
                  placeholder="e.g. 1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editGracePeriod">Grace Period (Days) *</Label>
              <Input
                id="editGracePeriod"
                type="text"
                inputMode="numeric"
                value={editGracePeriod}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    setEditGracePeriod(value);
                  }
                }}
                placeholder="e.g. 7"
              />
              <p className="text-xs text-muted-foreground">
                Number of days before rent charges begin
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Preview:</strong> {editName} ({editSize}) - ₹{editRentPerDay}/day, 
                LC: ₹{editLoadingCharge}, Grace: {editGracePeriod} days
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MaterialTypeEditor;
