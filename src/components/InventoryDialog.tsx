import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MATERIAL_TYPES, getInventory } from "@/lib/rental-store";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface InventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InventoryDialog = ({ open, onOpenChange }: InventoryDialogProps) => {
  const [search, setSearch] = useState("");
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Load inventory when dialog opens
  useEffect(() => {
    if (open) {
      const loadInventory = async () => {
        setLoading(true);
        try {
          const data = await getInventory();
          setInventory(data);
        } catch (error) {
          console.error('Error loading inventory:', error);
        } finally {
          setLoading(false);
        }
      };
      loadInventory();
    }
  }, [open]);

  // Group materials by category
  const categories = Array.from(new Set(MATERIAL_TYPES.map(m => m.category)));

  const filteredMaterials = MATERIAL_TYPES.filter(material => {
    const searchLower = search.toLowerCase();
    return (
      material.name.toLowerCase().includes(searchLower) ||
      material.size.toLowerCase().includes(searchLower) ||
      material.category.toLowerCase().includes(searchLower)
    );
  });

  // Calculate totals
  const totalStock = MATERIAL_TYPES.reduce((sum, m) => sum + (inventory[m.id] || 0), 0);
  const totalIssued = MATERIAL_TYPES.reduce((sum, m) => sum + (m.inventory - (inventory[m.id] || 0)), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inventory Management</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading inventory...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">{MATERIAL_TYPES.length}</div>
            <div className="text-xs text-muted-foreground">Total Items</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{totalStock}</div>
            <div className="text-xs text-muted-foreground">In Stock</div>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">{totalIssued}</div>
            <div className="text-xs text-muted-foreground">Issued</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Inventory Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Issued</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => {
                const categoryMaterials = filteredMaterials.filter(m => m.category === category);
                if (categoryMaterials.length === 0) return null;

                return categoryMaterials.map((material, index) => {
                  const available = inventory[material.id] || 0;
                  const issued = material.inventory - available;
                  const percentage = material.inventory > 0 ? (available / material.inventory) * 100 : 0;

                  return (
                    <TableRow key={material.id}>
                      {index === 0 && (
                        <TableCell 
                          rowSpan={categoryMaterials.length} 
                          className="font-semibold bg-muted/30 align-top"
                        >
                          {category}
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell className="text-muted-foreground">{material.size || "-"}</TableCell>
                      <TableCell className="text-right">{material.inventory}</TableCell>
                      <TableCell className="text-right font-semibold">
                        <span className={
                          available === 0 ? "text-red-600" :
                          percentage < 20 ? "text-orange-600" :
                          "text-green-600"
                        }>
                          {available}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{issued}</TableCell>
                      <TableCell className="text-right">
                        {available === 0 ? (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Out of Stock</span>
                        ) : percentage < 20 ? (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Low Stock</span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">In Stock</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                });
              })}
              {filteredMaterials.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No materials found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InventoryDialog;
