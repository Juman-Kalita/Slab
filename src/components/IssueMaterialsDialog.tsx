import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { issueMaterials, MATERIAL_TYPES, getMaterialType, getAvailableStock, getCustomers } from "@/lib/rental-store";
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

interface SiteLine {
  id: string;
  siteName: string;
  location: string;
  materials: MaterialLine[];
}

const IssueMaterialsDialog = ({ open, onOpenChange, onSuccess }: IssueMaterialsDialogProps) => {
  const [customerName, setCustomerName] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [siteLines, setSiteLines] = useState<SiteLine[]>([
    {
      id: crypto.randomUUID(),
      siteName: "",
      location: "",
      materials: [{ id: crypto.randomUUID(), materialTypeId: "", quantity: "", hasOwnLabor: false }]
    }
  ]);
  
  // Client details (for new customers)
  const [registrationName, setRegistrationName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [aadharPhoto, setAadharPhoto] = useState<string>("");
  const [address, setAddress] = useState("");
  const [referral, setReferral] = useState("");
  
  // Check if customer exists and has advance deposit
  const customers = getCustomers();
  const existingCustomer = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase());
  const hasAdvanceDeposit = existingCustomer && existingCustomer.advanceDeposit > 0;
  
  const handleAadharUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size should be less than 2MB");
        return;
      }
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setAadharPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const addSiteLine = () => {
    setSiteLines([...siteLines, {
      id: crypto.randomUUID(),
      siteName: "",
      location: "",
      materials: [{ id: crypto.randomUUID(), materialTypeId: "", quantity: "", hasOwnLabor: false }]
    }]);
  };

  const removeSiteLine = (siteId: string) => {
    if (siteLines.length > 1) {
      setSiteLines(siteLines.filter(site => site.id !== siteId));
    }
  };

  const updateSiteLine = (siteId: string, field: 'siteName' | 'location', value: string) => {
    setSiteLines(siteLines.map(site =>
      site.id === siteId ? { ...site, [field]: value } : site
    ));
  };

  const addMaterialLine = (siteId: string) => {
    setSiteLines(siteLines.map(site =>
      site.id === siteId
        ? { ...site, materials: [...site.materials, { id: crypto.randomUUID(), materialTypeId: "", quantity: "", hasOwnLabor: false }] }
        : site
    ));
  };

  const removeMaterialLine = (siteId: string, materialId: string) => {
    setSiteLines(siteLines.map(site =>
      site.id === siteId && site.materials.length > 1
        ? { ...site, materials: site.materials.filter(m => m.id !== materialId) }
        : site
    ));
  };

  const updateMaterialLine = (siteId: string, materialId: string, field: keyof MaterialLine, value: any) => {
    setSiteLines(siteLines.map(site =>
      site.id === siteId
        ? {
            ...site,
            materials: site.materials.map(m =>
              m.id === materialId ? { ...m, [field]: value } : m
            )
          }
        : site
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !issueDate) {
      toast.error("Please enter customer name and issue date");
      return;
    }

    // Validate contact number
    if (!contactNo || contactNo.length !== 10) {
      toast.error("Please enter a valid 10-digit contact number");
      return;
    }

    // Validate all sites
    const validSites = siteLines.filter(site => 
      site.siteName && site.location && site.materials.some(m => m.materialTypeId && m.quantity)
    );

    if (validSites.length === 0) {
      toast.error("Please add at least one site with materials");
      return;
    }

    // Process each site
    let totalSitesProcessed = 0;
    let totalMaterialsIssued = 0;

    for (const site of validSites) {
      const validMaterials = site.materials.filter(m => m.materialTypeId && m.quantity);
      
      // Check quantities and stock for this site
      for (const material of validMaterials) {
        const qty = parseInt(material.quantity);
        if (isNaN(qty) || qty <= 0) {
          toast.error(`Invalid quantity for materials at ${site.siteName}`);
          return;
        }
        
        const available = getAvailableStock(material.materialTypeId);
        if (qty > available) {
          const mt = getMaterialType(material.materialTypeId);
          toast.error(`Not enough stock for ${mt?.name} ${mt?.size} at ${site.siteName}. Available: ${available}`);
          return;
        }
      }

      // Issue all materials for this site
      for (const material of validMaterials) {
        const qty = parseInt(material.quantity);
        const success = issueMaterials(
          customerName,
          site.siteName,
          site.location,
          material.materialTypeId,
          qty,
          issueDate,
          material.hasOwnLabor,
          0, // No deposit during issuance
          {
            registrationName: registrationName || undefined,
            contactNo: contactNo || undefined,
            aadharPhoto: aadharPhoto || undefined,
            address: address || undefined,
            referral: referral || undefined,
          }
        );
        
        if (success) {
          totalMaterialsIssued++;
        } else {
          toast.error(`Failed to issue materials to ${site.siteName}`);
          return;
        }
      }
      
      totalSitesProcessed++;
    }

    toast.success(`Issued materials to ${totalSitesProcessed} site(s) for ${customerName}`);
    
    // Reset form
    setCustomerName("");
    setRegistrationName("");
    setContactNo("");
    setAadharPhoto("");
    setAddress("");
    setReferral("");
    setIssueDate(new Date().toISOString().split("T")[0]);
    setSiteLines([{
      id: crypto.randomUUID(),
      siteName: "",
      location: "",
      materials: [{ id: crypto.randomUUID(), materialTypeId: "", quantity: "", hasOwnLabor: false }]
    }]);
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
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
            {hasAdvanceDeposit && existingCustomer && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-500 rounded-lg p-3 text-sm">
                <p className="text-green-700 dark:text-green-400 font-medium">
                  ✓ Customer has advance deposit of ₹{existingCustomer.advanceDeposit.toLocaleString("en-IN")}
                </p>
                <p className="text-green-600 dark:text-green-300 text-xs mt-1">
                  This will be automatically applied to the new materials
                </p>
              </div>
            )}
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

          {/* Client Details Section */}
          <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
            <h3 className="font-semibold text-sm">Client Details (Optional for new customers)</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="registrationName">Registration Name</Label>
                <Input
                  id="registrationName"
                  placeholder="Official registration name"
                  value={registrationName}
                  onChange={(e) => setRegistrationName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNo">Contact Number *</Label>
                <Input
                  id="contactNo"
                  placeholder="10-digit phone number"
                  value={contactNo}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/\D/g, '');
                    // Limit to 10 digits
                    if (value.length <= 10) {
                      setContactNo(value);
                    }
                  }}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  required
                />
                {contactNo && contactNo.length !== 10 && (
                  <p className="text-xs text-red-600">Phone number must be exactly 10 digits</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referral">Referral (Who referred this customer?)</Label>
              <Input
                id="referral"
                placeholder="Referral source"
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aadharPhoto">Aadhar Photo</Label>
              <Input
                id="aadharPhoto"
                type="file"
                accept="image/*"
                onChange={handleAadharUpload}
                className="cursor-pointer"
              />
              {aadharPhoto && (
                <div className="mt-2">
                  <img src={aadharPhoto} alt="Aadhar preview" className="max-w-xs rounded border" />
                </div>
              )}
            </div>
          </div>

          {/* Site Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Sites & Materials</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSiteLine} className="gap-1">
                <Plus className="h-4 w-4" /> Add Site
              </Button>
            </div>

            {siteLines.map((site, siteIndex) => (
              <div key={site.id} className="border-2 rounded-lg p-4 space-y-3 bg-accent/5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">Site {siteIndex + 1}</h3>
                      {siteLines.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSiteLine(site.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`siteName-${site.id}`}>Site Name</Label>
                        <Input
                          id={`siteName-${site.id}`}
                          placeholder="e.g. Building A, Tower 1"
                          value={site.siteName}
                          onChange={(e) => updateSiteLine(site.id, 'siteName', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`location-${site.id}`}>Location/Region</Label>
                        <Input
                          id={`location-${site.id}`}
                          placeholder="e.g. Mumbai, Pune"
                          value={site.location}
                          onChange={(e) => updateSiteLine(site.id, 'location', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Materials for this site */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Materials</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addMaterialLine(site.id)}
                          className="gap-1 h-7 text-xs"
                        >
                          <Plus className="h-3 w-3" /> Add Material
                        </Button>
                      </div>

                      {site.materials.map((material) => {
                        const selectedMaterial = getMaterialType(material.materialTypeId);
                        const availableStock = material.materialTypeId ? getAvailableStock(material.materialTypeId) : 0;
                        const categories = Array.from(new Set(MATERIAL_TYPES.map(m => m.category)));

                        return (
                          <div key={material.id} className="border rounded-lg p-3 space-y-2 bg-background">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Material Type</Label>
                                    <Select
                                      value={material.materialTypeId}
                                      onValueChange={(value) => updateMaterialLine(site.id, material.id, "materialTypeId", value)}
                                    >
                                      <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Select material" />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-[300px]">
                                        {categories.map((category, catIndex) => (
                                          <div key={category}>
                                            {catIndex > 0 && <div className="h-px bg-border my-1" />}
                                            <SelectGroup>
                                              <SelectLabel className="font-bold text-primary bg-accent/20 px-2 py-1 sticky top-0 z-10 text-xs">
                                                {category}
                                              </SelectLabel>
                                              {MATERIAL_TYPES.filter(m => m.category === category).map((mt) => {
                                                const stock = getAvailableStock(mt.id);
                                                return (
                                                  <SelectItem
                                                    key={mt.id}
                                                    value={mt.id}
                                                    disabled={stock === 0}
                                                    className="pl-6 text-xs"
                                                  >
                                                    <div className="flex items-center justify-between w-full gap-2">
                                                      <span>
                                                        {mt.name} {mt.size && `(${mt.size})`} - ₹{mt.rentPerDay}/day
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

                                  <div className="space-y-1">
                                    <Label className="text-xs">Quantity</Label>
                                    <Input
                                      type="number"
                                      placeholder="e.g. 10"
                                      value={material.quantity}
                                      onChange={(e) => updateMaterialLine(site.id, material.id, "quantity", e.target.value)}
                                      min="1"
                                      max={availableStock}
                                      className="h-9"
                                    />
                                    {selectedMaterial && (
                                      <p className="text-xs text-muted-foreground">
                                        Available: <span className={availableStock < 10 ? 'text-orange-600 font-semibold' : 'text-green-600 font-semibold'}>{availableStock}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {selectedMaterial && (
                                  <div className="rounded bg-muted p-2 text-xs space-y-0.5">
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
                                    id={`hasOwnLabor-${material.id}`}
                                    checked={material.hasOwnLabor}
                                    onCheckedChange={(checked) => updateMaterialLine(site.id, material.id, "hasOwnLabor", checked as boolean)}
                                  />
                                  <Label htmlFor={`hasOwnLabor-${material.id}`} className="text-xs font-normal cursor-pointer">
                                    Own labor (No LC&ULC)
                                  </Label>
                                </div>
                              </div>

                              {site.materials.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMaterialLine(site.id, material.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
