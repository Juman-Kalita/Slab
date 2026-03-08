import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { DollarSign, AlertTriangle } from "lucide-react";
import { updateSitePayment } from "@/lib/supabase-store";
import { getCurrentUser, logActivity } from "@/lib/auth-service";
import { calculateSiteRent } from "@/lib/rental-store";
import type { Site } from "@/lib/rental-store";

interface FinancialAdjustmentDialogProps {
  site: Site;
  customerName: string;
  customerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const FinancialAdjustmentDialog = ({ 
  site, 
  customerName,
  customerId,
  open, 
  onOpenChange, 
  onSuccess 
}: FinancialAdjustmentDialogProps) => {
  const currentUser = getCurrentUser();
  const siteCalc = calculateSiteRent(site);
  
  const [amountPaid, setAmountPaid] = useState(site.amountPaid.toString());
  const [totalDueOverride, setTotalDueOverride] = useState(
    site.totalDueOverride?.toString() || siteCalc.totalRequired.toString()
  );
  const [useOverride, setUseOverride] = useState(site.useOverride || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const newPaid = parseFloat(amountPaid);
    const newTotalDue = parseFloat(totalDueOverride);
    
    if (isNaN(newPaid) || newPaid < 0) {
      toast.error("Invalid paid amount");
      return;
    }

    if (useOverride && (isNaN(newTotalDue) || newTotalDue < 0)) {
      toast.error("Invalid total due amount");
      return;
    }

    setSaving(true);
    try {
      // Update paid amount
      await updateSitePayment(site.id, newPaid);
      
      // Update override settings
      await updateSiteFinancialOverride(site.id, useOverride, useOverride ? newTotalDue : null);
      
      toast.success("Financial details updated successfully");
      
      if (currentUser) {
        await logActivity(currentUser.id, 'adjust_site_financials', 'site', site.id, {
          customer: customerName,
          site: site.siteName,
          oldPaid: site.amountPaid,
          newPaid,
          useOverride,
          totalDueOverride: useOverride ? newTotalDue : null
        });
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating financials:', error);
      toast.error("Failed to update financial details");
    } finally {
      setSaving(false);
    }
  };

  const calculatedRemaining = useOverride 
    ? Math.max(0, parseFloat(totalDueOverride) - parseFloat(amountPaid))
    : Math.max(0, siteCalc.totalRequired - parseFloat(amountPaid));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Financial Details</DialogTitle>
          <DialogDescription>
            Manually adjust payment and total due for {site.siteName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-medium">{customerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Site:</span>
              <span className="font-medium">{site.siteName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{site.location}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountPaid">Amount Paid (₹)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="amountPaid"
                type="text"
                inputMode="decimal"
                value={amountPaid}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setAmountPaid(value);
                  }
                }}
                className="pl-9"
                placeholder="Enter amount paid"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Current: ₹{site.amountPaid.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="useOverride">Override Total Due</Label>
                <p className="text-xs text-muted-foreground">
                  Manually set total due amount
                </p>
              </div>
              <Switch
                id="useOverride"
                checked={useOverride}
                onCheckedChange={setUseOverride}
              />
            </div>

            {useOverride && (
              <div className="space-y-2">
                <Label htmlFor="totalDue">Total Due (₹)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="totalDue"
                    type="text"
                    inputMode="decimal"
                    value={totalDueOverride}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setTotalDueOverride(value);
                      }
                    }}
                    className="pl-9"
                    placeholder="Enter total due"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Calculated: ₹{siteCalc.totalRequired.toLocaleString("en-IN")}
                </p>
              </div>
            )}
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                Preview
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Due:</span>
                <span className="font-semibold">
                  ₹{(useOverride ? parseFloat(totalDueOverride) : siteCalc.totalRequired).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid:</span>
                <span className="font-semibold text-green-600">
                  ₹{parseFloat(amountPaid).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-muted-foreground">Remaining:</span>
                <span className="font-bold text-red-600">
                  ₹{calculatedRemaining.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {useOverride && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 flex gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> Overriding total due will ignore calculated charges. Use this only for special cases or corrections.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to update financial override
async function updateSiteFinancialOverride(
  siteId: string,
  useOverride: boolean,
  totalDueOverride: number | null
): Promise<void> {
  const { supabase } = await import("@/lib/supabase");
  
  const { error } = await supabase
    .from('sites')
    .update({
      use_override: useOverride,
      total_due_override: totalDueOverride
    })
    .eq('id', siteId);

  if (error) throw error;
}

export default FinancialAdjustmentDialog;
