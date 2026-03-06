import { useState, useEffect } from "react";
import { getCustomers } from "@/lib/rental-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import CustomerEditDialog from "./CustomerEditDialog";
import type { Customer } from "@/lib/rental-store";

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.contactNo?.toLowerCase().includes(search.toLowerCase()) ||
        c.sites.some(s => s.siteName.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [search, customers]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditDialogOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Are you sure you want to delete ${customer.name}? This action cannot be undone.`)) {
      return;
    }

    // TODO: Implement delete functionality
    toast.error("Delete functionality coming soon");
  };

  const getTotalMaterials = (customer: Customer) => {
    return customer.sites.reduce((total, site) => {
      return total + site.materials.reduce((sum, m) => sum + m.quantity, 0);
    }, 0);
  };

  const getTotalPending = (customer: Customer) => {
    // Simplified calculation - you may want to use the full calculateRent logic
    return customer.sites.reduce((total, site) => {
      const siteTotal = site.materials.reduce((sum, m) => sum + m.quantity * 10, 0); // Placeholder
      return total + (siteTotal - site.amountPaid);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>View and edit customer information</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search ? "No customers found matching your search" : "No customers yet"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Sites</TableHead>
                    <TableHead className="text-right">Materials Held</TableHead>
                    <TableHead className="text-right">Pending Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{customer.name}</div>
                          {customer.registrationName && (
                            <div className="text-xs text-muted-foreground">
                              {customer.registrationName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {customer.contactNo || "N/A"}
                          {customer.spareContactNo && (
                            <div className="text-xs text-muted-foreground">
                              Alt: {customer.spareContactNo}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{customer.sites.length}</TableCell>
                      <TableCell className="text-right">{getTotalMaterials(customer)}</TableCell>
                      <TableCell className="text-right">
                        ₹{getTotalPending(customer).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(customer)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCustomer && (
        <CustomerEditDialog
          customer={selectedCustomer}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={loadCustomers}
        />
      )}
    </div>
  );
};

export default CustomerManagement;
