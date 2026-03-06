import { useState, useEffect } from "react";
import { getInventory, getCustomers } from "@/lib/rental-store";
import { setInventory as updateInventory } from "@/lib/supabase-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Plus, Minus, Save } from "lucide-react";
import { toast } from "sonner";
import { MATERIAL_TYPES } from "@/lib/rental-store";
import { getCurrentUser, logActivity } from "@/lib/auth-service";

const InventoryManagement = () => {
  const currentUser = getCurrentUser();
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [rentedOut, setRentedOut] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<{ 
    id: string; 
    name: string; 
    availableQty: number;
    rentedQty: number;
    totalQty: number;
  } | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'set' | 'add' | 'subtract'>('set');
  const [adjustmentValue, setAdjustmentValue] = useState("");
  const [adjustMode, setAdjustMode] = useState<'available' | 'total'>('available');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [inventoryData, customersData] = await Promise.all([
        getInventory(),
        getCustomers()
      ]);
      
      // Calculate rented out quantities
      const rentedOutQty: Record<string, number> = {};
      customersData.forEach(customer => {
        customer.sites.forEach(site => {
          site.materials.forEach(material => {
            rentedOutQty[material.materialTypeId] = (rentedOutQty[material.materialTypeId] || 0) + material.quantity;
          });
        });
      });
      
      setInventory(inventoryData);
      setRentedOut(rentedOutQty);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdjust = (materialTypeId: string, name: string, availableQty: number, rentedQty: number) => {
    setSelectedMaterial({ 
      id: materialTypeId, 
      name, 
      availableQty,
      rentedQty,
      totalQty: availableQty + rentedQty
    });
    setAdjustmentValue("");
    setAdjustmentType('set');
    setAdjustMode('available');
    setAdjustDialogOpen(true);
  };

  const handleAdjust = async () => {
    if (!selectedMaterial) return;

    const value = parseFloat(adjustmentValue);
    if (isNaN(value) || value < 0) {
      toast.error("Please enter a valid number");
      return;
    }

    let newAvailableQty: number;
    
    if (adjustMode === 'available') {
      // Adjusting available stock directly
      if (adjustmentType === 'set') {
        newAvailableQty = value;
      } else if (adjustmentType === 'add') {
        newAvailableQty = selectedMaterial.availableQty + value;
      } else {
        newAvailableQty = Math.max(0, selectedMaterial.availableQty - value);
      }
    } else {
      // Adjusting total stock - calculate new available
      let newTotalQty: number;
      if (adjustmentType === 'set') {
        newTotalQty = value;
      } else if (adjustmentType === 'add') {
        newTotalQty = selectedMaterial.totalQty + value;
      } else {
        newTotalQty = Math.max(selectedMaterial.rentedQty, selectedMaterial.totalQty - value);
      }
      newAvailableQty = Math.max(0, newTotalQty - selectedMaterial.rentedQty);
    }

    const success = await updateInventory(selectedMaterial.id, newAvailableQty);

    if (success) {
      toast.success("Inventory updated successfully");
      if (currentUser) {
        await logActivity(currentUser.id, 'adjust_inventory', 'inventory', selectedMaterial.id, {
          mode: adjustMode,
          type: adjustmentType,
          value,
          material: selectedMaterial.name,
          newAvailableQty
        });
      }
      setAdjustDialogOpen(false);
      loadInventory();
    } else {
      toast.error("Failed to update inventory");
    }
  };

  const getNewQuantity = () => {
    if (!selectedMaterial || !adjustmentValue) {
      return adjustMode === 'available' ? selectedMaterial?.availableQty || 0 : selectedMaterial?.totalQty || 0;
    }
    
    const value = parseFloat(adjustmentValue);
    if (isNaN(value)) {
      return adjustMode === 'available' ? selectedMaterial.availableQty : selectedMaterial.totalQty;
    }

    if (adjustMode === 'available') {
      if (adjustmentType === 'set') return value;
      if (adjustmentType === 'add') return selectedMaterial.availableQty + value;
      return Math.max(0, selectedMaterial.availableQty - value);
    } else {
      if (adjustmentType === 'set') return value;
      if (adjustmentType === 'add') return selectedMaterial.totalQty + value;
      return Math.max(selectedMaterial.rentedQty, selectedMaterial.totalQty - value);
    }
  };

  const getNewAvailableFromTotal = () => {
    if (!selectedMaterial || !adjustmentValue || adjustMode === 'available') return null;
    
    const newTotal = getNewQuantity();
    return Math.max(0, newTotal - selectedMaterial.rentedQty);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>View and adjust material inventory levels</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading inventory...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Available Stock</TableHead>
                  <TableHead className="text-right">Rented Out</TableHead>
                  <TableHead className="text-right">Total Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MATERIAL_TYPES.map((material) => {
                  const availableQty = inventory[material.id] || 0;
                  const rentedQty = rentedOut[material.id] || 0;
                  const totalQty = availableQty + rentedQty;
                  const isLow = availableQty < 10;

                  return (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>{material.size}</TableCell>
                      <TableCell className="text-right">
                        <span className={isLow ? 'text-orange-600 font-semibold' : ''}>
                          {availableQty}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-blue-600 font-medium">
                          {rentedQty}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-green-600">
                          {totalQty}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAdjust(material.id, material.name, availableQty, rentedQty)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Inventory</DialogTitle>
            <DialogDescription>
              Update inventory for {selectedMaterial?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground">Available</div>
                <div className="text-xl font-bold">{selectedMaterial?.availableQty || 0}</div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xs text-blue-600">Rented Out</div>
                <div className="text-xl font-bold text-blue-600">{selectedMaterial?.rentedQty || 0}</div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xs text-green-600">Total Stock</div>
                <div className="text-xl font-bold text-green-600">{selectedMaterial?.totalQty || 0}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Adjust Mode</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={adjustMode === 'available' ? 'default' : 'outline'}
                  onClick={() => setAdjustMode('available')}
                  className="gap-2"
                >
                  Available Stock
                </Button>
                <Button
                  variant={adjustMode === 'total' ? 'default' : 'outline'}
                  onClick={() => setAdjustMode('total')}
                  className="gap-2"
                >
                  Total Stock
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {adjustMode === 'available' 
                  ? 'Adjust only the available stock in warehouse'
                  : 'Adjust total stock (available will be calculated automatically)'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Adjustment Type</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={adjustmentType === 'set' ? 'default' : 'outline'}
                  onClick={() => setAdjustmentType('set')}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Set To
                </Button>
                <Button
                  variant={adjustmentType === 'add' ? 'default' : 'outline'}
                  onClick={() => setAdjustmentType('add')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
                <Button
                  variant={adjustmentType === 'subtract' ? 'default' : 'outline'}
                  onClick={() => setAdjustmentType('subtract')}
                  className="gap-2"
                >
                  <Minus className="h-4 w-4" />
                  Subtract
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustmentValue">
                {adjustmentType === 'set' ? 'New Quantity' : 'Amount'}
              </Label>
              <Input
                id="adjustmentValue"
                type="text"
                inputMode="numeric"
                placeholder="Enter value"
                value={adjustmentValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    setAdjustmentValue(value);
                  }
                }}
              />
            </div>

            {adjustmentValue && (
              <div className="space-y-2">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    New {adjustMode === 'available' ? 'Available' : 'Total'} Stock
                  </div>
                  <div className="text-2xl font-bold">{getNewQuantity()}</div>
                </div>
                
                {adjustMode === 'total' && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-xs text-muted-foreground">New Available Stock</div>
                    <div className="text-lg font-semibold">{getNewAvailableFromTotal()}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      (Total {getNewQuantity()} - Rented {selectedMaterial?.rentedQty})
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjust} disabled={!adjustmentValue}>
              Apply Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InventoryManagement;
