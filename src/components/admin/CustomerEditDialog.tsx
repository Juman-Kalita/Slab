import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Edit, Trash2, Save } from "lucide-react";
import { updateCustomer, updateSite, updateMaterialQuantity, deleteSite, updateAdvanceDeposit, updateSitePayment } from "@/lib/supabase-store";
import { getMaterialType } from "@/lib/rental-store";
import { getCurrentUser, logActivity } from "@/lib/auth-service";
import type { Customer } from "@/lib/rental-store";

interface CustomerEditDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CustomerEditDialog = ({ customer, open, onOpenChange, onSuccess }: CustomerEditDialogProps) => {
  const currentUser = getCurrentUser();
  
  // Customer details
  const [name, setName] = useState(customer.name);
  const [registrationName, setRegistrationName] = useState(customer.registrationName || "");
  const [contactNo, setContactNo] = useState(customer.contactNo || "");
  const [spareContactNo, setSpareContactNo] = useState(customer.spareContactNo || "");
  const [address, setAddress] = useState(customer.address || "");
  const [advanceDeposit, setAdvanceDeposit] = useState(customer.advanceDeposit.toString());

  // Site editing
  const [editingSite, setEditingSite] = useState<string | null>(null);
  const [siteEdits, setSiteEdits] = useState<Record<string, { siteName: string; location: string }>>({});

  // Material editing
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null);
  const [materialEdits, setMaterialEdits] = useState<Record<string, number>>({});

  // Site payment editing
  const [editingSitePayment, setEditingSitePayment] = useState<string | null>(null);
  const [sitePaymentEdits, setSitePaymentEdits] = useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);

  const handleSaveCustomer = async () => {
    if (!name.trim()) {
      toast.error("Customer name is required");
      return;
    }

    setSaving(true);
    const success = await updateCustomer(customer.id, {
      name: name.trim(),
      registrationName: registrationName.trim() || undefined,
      contactNo: contactNo.trim() || undefined,
      spareContactNo: spareContactNo.trim() || undefined,
      address: address.trim() || undefined,
    });

    if (success) {
      toast.success("Customer updated successfully");
      if (currentUser) {
        await logActivity(currentUser.id, 'update_customer', 'customer', customer.id, { name });
      }
      onSuccess();
    } else {
      toast.error("Failed to update customer");
    }
    setSaving(false);
  };

  const handleSaveAdvanceDeposit = async () => {
    const amount = parseFloat(advanceDeposit);
    if (isNaN(amount) || amount < 0) {
      toast.error("Invalid advance deposit amount");
      return;
    }

    setSaving(true);
    const success = await updateAdvanceDeposit(customer.id, amount);

    if (success) {
      toast.success("Advance deposit updated");
      if (currentUser) {
        await logActivity(currentUser.id, 'update_advance_deposit', 'customer', customer.id, { amount });
      }
      onSuccess();
    } else {
      toast.error("Failed to update advance deposit");
    }
    setSaving(false);
  };

  const handleEditSite = (siteId: string, siteName: string, location: string) => {
    setEditingSite(siteId);
    setSiteEdits({ ...siteEdits, [siteId]: { siteName, location } });
  };

  const handleSaveSite = async (siteId: string) => {
    const edits = siteEdits[siteId];
    if (!edits || !edits.siteName.trim()) {
      toast.error("Site name is required");
      return;
    }

    setSaving(true);
    const success = await updateSite(siteId, {
      siteName: edits.siteName.trim(),
      location: edits.location.trim()
    });

    if (success) {
      toast.success("Site updated successfully");
      if (currentUser) {
        await logActivity(currentUser.id, 'update_site', 'site', siteId, edits);
      }
      setEditingSite(null);
      onSuccess();
    } else {
      toast.error("Failed to update site");
    }
    setSaving(false);
  };

  const handleDeleteSite = async (siteId: string, siteName: string) => {
    if (!confirm(`Are you sure you want to delete site "${siteName}"? This will remove all materials and history for this site.`)) {
      return;
    }

    setSaving(true);
    const success = await deleteSite(siteId);

    if (success) {
      toast.success("Site deleted successfully");
      if (currentUser) {
        await logActivity(currentUser.id, 'delete_site', 'site', siteId, { siteName });
      }
      onSuccess();
    } else {
      toast.error("Failed to delete site");
    }
    setSaving(false);
  };

  const handleEditMaterial = (key: string, currentQty: number) => {
    setEditingMaterial(key);
    setMaterialEdits({ ...materialEdits, [key]: currentQty });
  };

  const handleSaveMaterial = async (siteId: string, materialTypeId: string, key: string) => {
    const newQty = materialEdits[key];
    if (newQty === undefined || newQty < 0) {
      toast.error("Invalid quantity");
      return;
    }

    setSaving(true);
    const success = await updateMaterialQuantity(siteId, materialTypeId, newQty);

    if (success) {
      toast.success("Material quantity updated");
      if (currentUser) {
        await logActivity(currentUser.id, 'update_material_quantity', 'material', `${siteId}-${materialTypeId}`, { quantity: newQty });
      }
      setEditingMaterial(null);
      onSuccess();
    } else {
      toast.error("Failed to update material");
    }
    setSaving(false);
  };

  const handleEditSitePayment = (siteId: string, currentPaid: number) => {
    setEditingSitePayment(siteId);
    setSitePaymentEdits({ ...sitePaymentEdits, [siteId]: currentPaid.toString() });
  };

  const handleSaveSitePayment = async (siteId: string, siteName: string) => {
    const newPaid = parseFloat(sitePaymentEdits[siteId]);
    if (isNaN(newPaid) || newPaid < 0) {
      toast.error("Invalid payment amount");
      return;
    }

    setSaving(true);
    try {
      await updateSitePayment(siteId, newPaid);
      toast.success("Site payment updated");
      if (currentUser) {
        await logActivity(currentUser.id, 'update_site_payment', 'site', siteId, { 
          siteName,
          amountPaid: newPaid 
        });
      }
      setEditingSitePayment(null);
      onSuccess();
    } catch (error) {
      console.error('Error updating site payment:', error);
      toast.error("Failed to update payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Customer: {customer.name}</DialogTitle>
          <DialogDescription>
            Update customer information, sites, and materials
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Customer Details</TabsTrigger>
            <TabsTrigger value="sites">Sites & Materials</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Customer Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationName">Registration Name</Label>
                    <Input
                      id="registrationName"
                      value={registrationName}
                      onChange={(e) => setRegistrationName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactNo">Contact Number</Label>
                    <Input
                      id="contactNo"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spareContactNo">Spare Contact</Label>
                    <Input
                      id="spareContactNo"
                      value={spareContactNo}
                      onChange={(e) => setSpareContactNo(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveCustomer} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Customer Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sites" className="space-y-4">
            {customer.sites.map((site) => {
              const isEditing = editingSite === site.id;
              const edits = siteEdits[site.id];

              return (
                <Card key={site.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        {isEditing ? (
                          <div className="space-y-2">
                            <Input
                              value={edits?.siteName || site.siteName}
                              onChange={(e) => setSiteEdits({
                                ...siteEdits,
                                [site.id]: { ...edits, siteName: e.target.value }
                              })}
                              placeholder="Site name"
                            />
                            <Input
                              value={edits?.location || site.location}
                              onChange={(e) => setSiteEdits({
                                ...siteEdits,
                                [site.id]: { ...edits, location: e.target.value }
                              })}
                              placeholder="Location"
                            />
                          </div>
                        ) : (
                          <>
                            <CardTitle className="text-base">{site.siteName}</CardTitle>
                            <CardDescription>{site.location}</CardDescription>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button size="sm" onClick={() => handleSaveSite(site.id)} disabled={saving}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingSite(null)}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditSite(site.id, site.siteName, site.location)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteSite(site.id, site.siteName)}
                              disabled={saving}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {site.materials.map((material) => {
                          const materialType = getMaterialType(material.materialTypeId);
                          const key = `${site.id}-${material.materialTypeId}`;
                          const isEditingMat = editingMaterial === key;

                          return (
                            <TableRow key={material.materialTypeId}>
                              <TableCell>
                                {materialType?.name} ({materialType?.size})
                              </TableCell>
                              <TableCell className="text-right">
                                {isEditingMat ? (
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    value={materialEdits[key] || material.quantity}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (value === '' || /^\d+$/.test(value)) {
                                        setMaterialEdits({ ...materialEdits, [key]: parseInt(value) || 0 });
                                      }
                                    }}
                                    className="w-24 text-right"
                                  />
                                ) : (
                                  material.quantity
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {isEditingMat ? (
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleSaveMaterial(site.id, material.materialTypeId, key)}
                                      disabled={saving}
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingMaterial(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditMaterial(key, material.quantity)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advance Deposit</CardTitle>
                <CardDescription>Manage customer advance deposit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="advanceDeposit">Advance Deposit (₹)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="advanceDeposit"
                      type="text"
                      inputMode="decimal"
                      value={advanceDeposit}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          setAdvanceDeposit(value);
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={handleSaveAdvanceDeposit} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      Update
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current: ₹{customer.advanceDeposit.toLocaleString("en-IN")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Site Payments</CardTitle>
                <CardDescription>Adjust paid amounts for each site</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Site Name</TableHead>
                      <TableHead className="text-right">Amount Paid (₹)</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.sites.map((site) => {
                      const isEditingPayment = editingSitePayment === site.id;
                      
                      return (
                        <TableRow key={site.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{site.siteName}</div>
                              <div className="text-xs text-muted-foreground">{site.location}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditingPayment ? (
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={sitePaymentEdits[site.id] || site.amountPaid}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                    setSitePaymentEdits({ ...sitePaymentEdits, [site.id]: value });
                                  }
                                }}
                                className="w-32 text-right ml-auto"
                              />
                            ) : (
                              <span className="font-semibold text-green-600">
                                ₹{site.amountPaid.toLocaleString("en-IN")}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditingPayment ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveSitePayment(site.id, site.siteName)}
                                  disabled={saving}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingSitePayment(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditSitePayment(site.id, site.amountPaid)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <p className="text-xs text-muted-foreground mt-4">
                  Note: Editing the paid amount will directly update the site's payment record. This does not create a payment history event.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerEditDialog;
