import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEmployeeHistoryEvents } from "@/lib/auth-service";
import { Activity, Package, DollarSign, Users, TrendingUp } from "lucide-react";

interface Employee {
  id: string;
  username: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
}

interface EmployeeActivityDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EmployeeActivityDialog = ({ employee, open, onOpenChange }: EmployeeActivityDialogProps) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && employee) {
      loadActivities();
    }
  }, [open, employee]);

  const loadActivities = async () => {
    if (!employee) return;

    setLoading(true);
    const data = await getEmployeeHistoryEvents(employee.id);
    setActivities(data);
    setLoading(false);
  };

  const getActionColor = (action: string) => {
    if (action === 'Issued') return 'default';
    if (action === 'Payment') return 'secondary';
    if (action === 'Returned') return 'outline';
    return 'outline';
  };

  const getActionIcon = (entityType: string) => {
    if (entityType === 'material' || entityType === 'inventory') return <Package className="h-4 w-4" />;
    if (entityType === 'payment' || entityType === 'deposit') return <DollarSign className="h-4 w-4" />;
    if (entityType === 'customer' || entityType === 'site') return <Users className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  // Calculate statistics
  const stats = {
    totalActions: activities.length,
    materialsIssued: activities.filter(a => a.action === 'Issued').length,
    paymentsCollected: activities.filter(a => a.action === 'Payment').length,
    returnsProcessed: activities.filter(a => a.action === 'Returned').length,
    totalAmountCollected: activities
      .filter(a => a.action === 'Payment')
      .reduce((sum, a) => sum + (a.details.amount || 0), 0),
    totalItemsIssued: activities
      .filter(a => a.action === 'Issued')
      .reduce((sum, a) => sum + (a.details.quantity || 0), 0),
    totalItemsReturned: activities
      .filter(a => a.action === 'Returned')
      .reduce((sum, a) => sum + (a.details.quantity || 0), 0),
    totalItemsLost: activities
      .filter(a => a.action === 'Returned')
      .reduce((sum, a) => sum + (a.details.quantityLost || 0), 0),
  };

  // Group activities by type
  const materialActivities = activities.filter(a => 
    a.action === 'Issued' || a.entity_type === 'material'
  );
  const paymentActivities = activities.filter(a => 
    a.action === 'Payment' || a.entity_type === 'payment'
  );
  const otherActivities = activities.filter(a => 
    a.action === 'Returned' || a.entity_type === 'return'
  );

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Employee Activity: {employee.fullName}</DialogTitle>
          <DialogDescription>
            @{employee.username} • All actions performed by this employee
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading activity...</div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Actions</CardDescription>
                  <CardTitle className="text-2xl">{stats.totalActions}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    All activities
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Materials Issued</CardDescription>
                  <CardTitle className="text-2xl">{stats.materialsIssued}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Package className="h-3 w-3" />
                    {stats.totalItemsIssued} total items
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Payments Collected</CardDescription>
                  <CardTitle className="text-2xl">{stats.paymentsCollected}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-green-600 font-semibold">
                    <DollarSign className="h-3 w-3" />
                    ₹{stats.totalAmountCollected.toLocaleString('en-IN')}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Returns Processed</CardDescription>
                  <CardTitle className="text-2xl">{stats.returnsProcessed}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    {stats.totalItemsReturned} returned
                    {stats.totalItemsLost > 0 && (
                      <span className="text-red-600">• {stats.totalItemsLost} lost</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({activities.length})</TabsTrigger>
                <TabsTrigger value="materials">Materials ({materialActivities.length})</TabsTrigger>
                <TabsTrigger value="payments">Payments ({paymentActivities.length})</TabsTrigger>
                <TabsTrigger value="returns">Returns ({otherActivities.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No activities yet</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Timestamp</TableHead>
                          <TableHead className="w-[120px]">Action</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activities.map((activity) => (
                          <TableRow key={activity.id}>
                            <TableCell className="text-sm font-medium">
                              {new Date(activity.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getActionColor(activity.action) as any}>
                                {activity.action}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="space-y-1">
                                <div className="font-medium text-foreground">
                                  {activity.details.customerName} - {activity.details.siteName}
                                </div>
                                <div className="text-muted-foreground">
                                  {activity.action === 'Issued' && (
                                    <span>Issued {activity.details.quantity} items</span>
                                  )}
                                  {activity.action === 'Payment' && (
                                    <span>
                                      Collected ₹{activity.details.amount?.toLocaleString('en-IN')}
                                      {activity.details.paymentMethod && ` via ${activity.details.paymentMethod}`}
                                    </span>
                                  )}
                                  {activity.action === 'Returned' && (
                                    <span>
                                      Returned {activity.details.quantity} items
                                      {activity.details.quantityLost > 0 && `, Lost ${activity.details.quantityLost} items`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="materials" className="space-y-4">
                {materialActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No material activities</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Timestamp</TableHead>
                          <TableHead className="w-[120px]">Action</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {materialActivities.map((activity) => (
                          <TableRow key={activity.id}>
                            <TableCell className="text-sm font-medium">
                              {new Date(activity.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getActionColor(activity.action) as any}>
                                {activity.action}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="space-y-1">
                                <div className="font-medium text-foreground">
                                  {activity.details.customerName} - {activity.details.siteName}
                                </div>
                                <div className="text-muted-foreground">
                                  Issued {activity.details.quantity} items
                                  {activity.details.hasOwnLabor && ' (Own Labor)'}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="payments" className="space-y-4">
                {paymentActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No payment activities</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Timestamp</TableHead>
                          <TableHead className="w-[120px]">Action</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentActivities.map((activity) => (
                          <TableRow key={activity.id}>
                            <TableCell className="text-sm font-medium">
                              {new Date(activity.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getActionColor(activity.action) as any}>
                                {activity.action}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="space-y-1">
                                <div className="font-medium text-foreground">
                                  {activity.details.customerName} - {activity.details.siteName}
                                </div>
                                <div className="text-muted-foreground">
                                  <span className="font-semibold text-green-600">
                                    ₹{activity.details.amount?.toLocaleString('en-IN')}
                                  </span>
                                  {activity.details.paymentMethod && (
                                    <span className="ml-2">via {activity.details.paymentMethod}</span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="returns" className="space-y-4">
                {otherActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No return activities</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Timestamp</TableHead>
                          <TableHead className="w-[120px]">Action</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {otherActivities.map((activity) => (
                          <TableRow key={activity.id}>
                            <TableCell className="text-sm font-medium">
                              {new Date(activity.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getActionColor(activity.action) as any}>
                                {activity.action}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="space-y-1">
                                <div className="font-medium text-foreground">
                                  {activity.details.customerName} - {activity.details.siteName}
                                </div>
                                <div className="text-muted-foreground">
                                  <span className="text-green-600">Returned {activity.details.quantity} items</span>
                                  {activity.details.quantityLost > 0 && (
                                    <span className="text-red-600 ml-2">
                                      • Lost {activity.details.quantityLost} items
                                    </span>
                                  )}
                                  {activity.details.hasOwnLabor && (
                                    <span className="ml-2">(Own Labor)</span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeActivityDialog;
