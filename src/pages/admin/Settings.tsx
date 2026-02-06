import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield } from "lucide-react";

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Settings</h1>
          <p className="text-muted-foreground">
            Manage admin configuration and access controls
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Access Control
            </CardTitle>
            <CardDescription>
              Admin access is controlled via the user_roles table in Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Role-based Access</p>
                  <p className="text-sm text-muted-foreground">
                    Users must have the 'admin' role in user_roles table
                  </p>
                </div>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>To grant admin access to a user:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Get the user's ID from auth.users table</li>
                  <li>Insert a row into user_roles with role = 'admin'</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              System Configuration
            </CardTitle>
            <CardDescription>
              Additional admin settings will be added here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Settings page is under construction.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
