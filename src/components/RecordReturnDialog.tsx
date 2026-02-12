import { useState } from "react";
import { getCustomers, recordReturn, type Customer } from "@/lib/rental-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const RecordReturnDialog = ({ open, onOpenChange, onSuccess }: Props) => {
  const [customerId, setCustomerId] = useState("");
  const [slabs, setSlabs] = useState("");

  const customers = getCustomers().filter((c) => c.slabsHeld > 0);
  const selected = customers.find((c) => c.id === customerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(slabs);
    if (!customerId || !count || count <= 0) {
      toast({ title: "Invalid input", description: "Select a customer and enter slab count.", variant: "destructive" });
      return;
    }
    const ok = recordReturn(customerId, count);
    if (!ok) {
      toast({ title: "Error", description: "Cannot return more slabs than currently held.", variant: "destructive" });
      return;
    }
    toast({ title: "Return Recorded", description: `${count} slabs returned by ${selected?.name}` });
    setCustomerId("");
    setSlabs("");
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Return</DialogTitle>
          <DialogDescription>Record slabs returned by a customer.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.slabsHeld} slabs held)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="return-slabs">Slabs to Return</Label>
            <Input
              id="return-slabs"
              type="number"
              min="1"
              max={selected?.slabsHeld || 999}
              value={slabs}
              onChange={(e) => setSlabs(e.target.value)}
              placeholder={selected ? `Max: ${selected.slabsHeld}` : "Enter count"}
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">Record Return</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordReturnDialog;
