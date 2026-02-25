import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { MATERIAL_TYPES } from "@/lib/rental-store";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const Setup = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    tables: boolean | null;
    inventory: boolean | null;
  }>({
    tables: null,
    inventory: null,
  });

  const checkTables = async () => {
    try {
      const { error } = await supabase.from('inventory').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  };

  const initializeInventory = async () => {
    setLoading(true);
    try {
      // Check if tables exist
      const tablesExist = await checkTables();
      setStatus(prev => ({ ...prev, tables: tablesExist }));

      if (!tablesExist) {
        toast.error("Database tables not found. Please run the SQL schema in Supabase first.");
        setLoading(false);
        return;
      }

      // Initialize inventory
      const inventoryData = MATERIAL_TYPES.map(mt => ({
        material_type_id: mt.id,
        quantity: mt.inventory
      }));

      const { error } = await supabase
        .from('inventory')
        .upsert(inventoryData, {
          onConflict: 'material_type_id'
        });

      if (error) {
        console.error('Error initializing inventory:', error);
        setStatus(prev => ({ ...prev, inventory: false }));
        toast.error(`Failed to initialize inventory: ${error.message}`);
      } else {
        setStatus(prev => ({ ...prev, inventory: true }));
        toast.success('Inventory initialized successfully!');
      }
    } catch (error: any) {
      console.error('Setup error:', error);
      toast.error(`Setup failed: ${error.message}`);
      setStatus({ tables: false, inventory: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Setup Instructions:</h3>
              
              <div className="space-y-2">
                <p className="text-sm">1. Go to your Supabase project SQL Editor</p>
                <p className="text-sm">2. Run the schema from <code className="bg-muted px-2 py-1 rounded">supabase-schema.sql</code></p>
                <p className="text-sm">3. Run the policies from <code className="bg-muted px-2 py-1 rounded">supabase-policies.sql</code></p>
                <p className="text-sm">4. Click the button below to initialize inventory</p>
              </div>

              <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Tables</span>
                  {status.tables === null ? (
                    <span className="text-sm text-muted-foreground">Not checked</span>
                  ) : status.tables ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Inventory Data</span>
                  {status.inventory === null ? (
                    <span className="text-sm text-muted-foreground">Not initialized</span>
                  ) : status.inventory ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>

              <Button 
                onClick={initializeInventory} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  'Initialize Database'
                )}
              </Button>

              {status.inventory && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-500 rounded-lg p-4">
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                    ✓ Setup complete! You can now go back to the app.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/'} 
                    variant="outline"
                    className="mt-3 w-full"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supabase Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}</p>
              <p><strong>Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '***configured***' : 'Not configured'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Setup;
