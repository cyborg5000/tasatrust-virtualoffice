import { useEffect, useState } from "react";
import { MemberLayout } from "@/components/member/MemberLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  Download, 
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";
import { SUBSCRIPTION_PLAN_BY_TIER } from "@/lib/subscriptionPlans";

type Order = Tables<"orders">;
type Subscription = Tables<"subscriptions">;

export default function MemberBilling() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBillingData() {
      if (!user) return;

      try {
        // Fetch subscription
        const { data: subData } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("member_id", user.id)
          .eq("status", "active")
          .maybeSingle();
        setSubscription(subData);

        // Fetch all orders
        const { data: ordersData } = await supabase
          .from("orders")
          .select("*")
          .eq("member_id", user.id)
          .order("created_at", { ascending: false });
        setOrders(ordersData || []);
      } catch (error) {
        console.error("Error fetching billing data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBillingData();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case "cancelled":
      case "refunded":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-primary/10 text-primary";
      case "pending":
        return "bg-muted text-muted-foreground";
      case "processing":
        return "bg-accent text-accent-foreground";
      case "cancelled":
      case "refunded":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTierPrice = (tier: string) => {
    const typedTier = tier as keyof typeof SUBSCRIPTION_PLAN_BY_TIER;
    if (!SUBSCRIPTION_PLAN_BY_TIER[typedTier]) return "$0.00";
    return `$${SUBSCRIPTION_PLAN_BY_TIER[typedTier].checkoutMonthlyPrice.toFixed(2)}`;
  };

  const totalSpent = orders
    .filter(o => o.status === "completed")
    .reduce((sum, o) => sum + Number(o.amount), 0);

  if (loading) {
    return (
      <MemberLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage your subscription and view payment history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Current Plan */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {subscription ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold capitalize">{subscription.tier}</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Active
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getTierPrice(subscription.tier)}/month
                  </p>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold">No Plan</span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose a plan to get started
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Next Payment */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {subscription?.current_period_end ? (
                <>
                  <span className="text-2xl font-bold">
                    {format(new Date(subscription.current_period_end), "MMM d, yyyy")}
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {subscription.cancel_at_period_end ? "Cancels on this date" : "Auto-renews"}
                  </p>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold">—</span>
                  <p className="mt-1 text-sm text-muted-foreground">No upcoming payment</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Total Spent */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">${totalSpent.toFixed(2)}</span>
              <p className="mt-1 text-sm text-muted-foreground">
                Across {orders.filter(o => o.status === "completed").length} orders
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Payment History
            </CardTitle>
            <CardDescription>View and download your invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Invoice</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status || "pending")}
                            <span className="font-mono text-sm">
                              INV-{order.id.slice(0, 8).toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {order.created_at
                            ? format(new Date(order.created_at), "MMM d, yyyy")
                            : "—"}
                        </td>
                        <td className="py-4 text-sm capitalize">{order.type}</td>
                        <td className="py-4 text-sm font-medium">
                          ${Number(order.amount).toFixed(2)}
                        </td>
                        <td className="py-4">
                          <Badge variant="secondary" className={getStatusColor(order.status || "pending")}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-4 text-right">
                          <Button variant="ghost" size="sm" disabled>
                            <Download className="mr-2 h-4 w-4" />
                            PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No invoices yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your payment history will appear here once you make a purchase.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Management */}
        {subscription && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>Manage your subscription settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium capitalize">{subscription.tier} Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.cancel_at_period_end
                      ? "Your subscription will end on " + format(new Date(subscription.current_period_end!), "MMMM d, yyyy")
                      : "Your subscription renews automatically"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" disabled>
                    Change Plan
                  </Button>
                  <Button variant="destructive" disabled>
                    Cancel
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                * Subscription management features coming soon. Please contact support for changes.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MemberLayout>
  );
}
