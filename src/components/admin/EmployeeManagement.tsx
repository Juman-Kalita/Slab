import { useState, useEffect } from "react";
import { createEmployee, getEmployees, updateEmployee, deleteEmployee } from "@/lib/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, UserX, UserCheck, Activity, Trash2 } from "lucide-react";
import { toast } from "sonner";
import EmployeeActivityDialog from "./EmployeeActivityDialog";

interface Employee {
  id: string;
  username: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
}

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Create form
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");

  // Edit form
  const [editFullName, setEditFullName] = useState("");
  const [editPassword, setEditPassword] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    const data = await getEmployees();
    setEmployees(data);
    setLoading(false);
  };

  const handleCreateEmployee = async () => {
    if (!newUsername || !newPassword || !newFullName) {
      toast.error("Please fill all fields");
      return;
    }

    const result = await createEmployee({
      username: newUsername,
      password: newPassword,
      fullName: newFullName
    });

    if (result.success) {
      toast.success("Employee created successfully");
      setCreateDialogOpen(false);
      setNewUsername("");
      setNewPassword("");
      setNewFullName("");
      loadEmployees();
    } else {
      toast.error(result.error || "Failed to create employee");
    }
  };

  const handleEditEmployee = async () => {
    if (!selectedEmployee) return;

    const updates: any = {};
    if (editFullName && editFullName !== selectedEmployee.fullName) {
      updates.fullName = editFullName;
    }
    if (editPassword) {
      updates.password = editPassword;
    }

    if (Object.keys(updates).length === 0) {
      toast.error("No changes to save");
      return;
    }

    const result = await updateEmployee(selectedEmployee.id, updates);

    if (result.success) {
      toast.success("Employee updated successfully");
      setEditDialogOpen(false);
      setSelectedEmployee(null);
      setEditFullName("");
      setEditPassword("");
      loadEmployees();
    } else {
      toast.error(result.error || "Failed to update employee");
    }
  };

  const handleToggleActive = async (employee: Employee) => {
    const result = await updateEmployee(employee.id, {
      isActive: !employee.isActive
    });

    if (result.success) {
      toast.success(`Employee ${!employee.isActive ? 'activated' : 'deactivated'}`);
      loadEmployees();
    } else {
      toast.error(result.error || "Failed to update employee");
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (!confirm(`Are you sure you want to permanently delete employee "${employee.fullName}" (${employee.username})? This action cannot be undone.`)) {
      return;
    }

    const result = await deleteEmployee(employee.id);

    if (result.success) {
      toast.success("Employee deleted successfully");
      loadEmployees();
    } else {
      toast.error(result.error || "Failed to delete employee");
    }
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditFullName(employee.fullName);
    setEditPassword("");
    setEditDialogOpen(true);
  };

  const openActivityDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setActivityDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employee Management</CardTitle>
              <CardDescription>Manage employee accounts and permissions</CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading employees...</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No employees yet. Create your first employee account.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Username</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.username}</TableCell>
                    <TableCell>{employee.fullName}</TableCell>
                    <TableCell>
                      <Badge variant={employee.isActive ? "default" : "secondary"}>
                        {employee.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(employee.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActivityDialog(employee)}
                          title="View Activity"
                        >
                          <Activity className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(employee)}
                          title="Edit Employee"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={employee.isActive ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleActive(employee)}
                          title={employee.isActive ? "Deactivate" : "Activate"}
                        >
                          {employee.isActive ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee)}
                          title="Delete Employee"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Employee Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Employee</DialogTitle>
            <DialogDescription>
              Add a new employee account. They will use these credentials to log in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="employee1"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEmployee}>Create Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee details. Leave password empty to keep current password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={selectedEmployee?.username || ""} disabled />
              <p className="text-xs text-muted-foreground">Username cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editFullName">Full Name</Label>
              <Input
                id="editFullName"
                placeholder="John Doe"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPassword">New Password (Optional)</Label>
              <Input
                id="editPassword"
                type="password"
                placeholder="Leave empty to keep current"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEmployee}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Activity Dialog */}
      <EmployeeActivityDialog
        employee={selectedEmployee}
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
      />
    </div>
  );
};

export default EmployeeManagement;
