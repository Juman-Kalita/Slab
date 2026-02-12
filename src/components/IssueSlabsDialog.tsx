import { useState } from "react";
import { issueSlabs } from "@/lib/rental-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const IssueSlabsDialog = ({ open, onOpenChange, onSuccess }: Props) => {
  const [name, setName] = useState("");
  const [slabs, setSlabs] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slabCount = parseInt(slabs);
    if (!name.trim() || !slabCount || slabCount <= 0) {
      toast({ title: "Invalid input", description: "Enter a valid name and slab count.", variant: "destructive" });
      return;
    }
    issueSlabs(name.trim(), slabCount, new Date(date).toISOString());
    toast({ title: "Slabs Issued", description: `${slabCount} slabs issued to ${name.trim()}` });
    setName("");
    setSlabs("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue Slabs</DialogTitle>
          <DialogDescription>Add a new rental record for a customer.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cust-name">Customer Name</Label>
            <Input id="cust-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slab-count">Number of Slabs</Label>
            <Input id="slab-count" type="number" min="1" value={slabs} onChange={(e) => setSlabs(e.target.value)} placeholder="e.g. 10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issue-date">Issue Date</Label>
            <Input id="issue-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">Issue Slabs</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IssueSlabsDialog;
