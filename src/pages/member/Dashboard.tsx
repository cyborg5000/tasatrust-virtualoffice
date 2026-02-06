import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MemberLayout } from "@/components/member/MemberLayout";
import { WebsiteBuildCard } from "@/components/member/WebsiteBuildCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, 
  Plus, 
  FileText, 
  CreditCard, 
  ArrowRight,
  CheckCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;
type Subscription = Tables<"subscriptions">;
type Member = Tables<"members">;

export default function MemberDashboard() {
  const { user } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      try {
        // Fetch member data
        const { data: memberData } = await supabase
          .from("members")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        setMember(memberData);

        // Fetch subscription
        const { data: subData } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("member_id", user.id)
          .eq("status", "active")
          .maybeSingle();
        setSubscription(subData);

        // Fetch recent orders
        const { data: ordersData } = await supabase
          .from("orders")
          .select("*")
          .eq("member_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        setRecentOrders(ordersData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "professional":
        return "bg-primary text-primary-foreground";
      case "essential":
        return "bg-primary/80 text-primary-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <Card className="bg-secondary text-secondary-foreground">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {member?.company_name || "Member"}
              </h1>
              <p className="mt-1 text-muted-foreground">
                Here's what's happening with your account today.
              </p>
            </div>
            <Button asChild>
              <Link to="/member/services">
                View Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {/* Website Build Card - Only for Professional tier */}
          <WebsiteBuildCard tier={subscription?.tier || null} />
          {/* Subscription Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Subscription Status
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {subscription ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold capitalize">
                      {subscription.status}
                    </span>
                    <Badge className={getTierColor(subscription.tier)}>
                      {subscription.tier}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your plan is active
                  </p>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold">No Plan</span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <Link to="/pricing" className="text-primary hover:underline">
                      Choose a plan
                    </Link>
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Renewal Date */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Renewal Date</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {subscription?.current_period_end ? (
                <>
                  <span className="text-2xl font-bold">
                    {format(new Date(subscription.current_period_end), "MMM d, yyyy")}
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {subscription.cancel_at_period_end
                      ? "Cancels at end of period"
                      : "Auto-renews"}
                  </p>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold">—</span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No active subscription
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Booking */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Booking
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">None</span>
              <p className="mt-1 text-sm text-muted-foreground">
                No upcoming meetings scheduled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <Link to="/member/bookings">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <Calendar className="mb-4 h-10 w-10 text-primary" />
                <CardTitle className="text-lg">Book Room</CardTitle>
                <CardDescription>
                  Schedule a meeting room
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <Link to="/member/services">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <Plus className="mb-4 h-10 w-10 text-primary" />
                <CardTitle className="text-lg">Add Services</CardTitle>
                <CardDescription>
                  Enhance your plan
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <Link to="/member/billing">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <FileText className="mb-4 h-10 w-10 text-primary" />
                <CardTitle className="text-lg">View Invoices</CardTitle>
                <CardDescription>
                  Download billing history
                </CardDescription>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/member/billing">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Order ID</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="py-3 text-sm font-mono">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="py-3 text-sm capitalize">{order.type}</td>
                        <td className="py-3 text-sm font-medium">
                          ${Number(order.amount).toFixed(2)}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant="secondary"
                            className={getStatusColor(order.status || "pending")}
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {order.created_at
                            ? format(new Date(order.created_at), "MMM d, yyyy")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No orders yet</p>
                <Button variant="link" asChild>
                  <Link to="/member/services">Browse services</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
}
