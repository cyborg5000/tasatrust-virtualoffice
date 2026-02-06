import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Users, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface Metrics {
  totalMembers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  newMembersThisMonth: number;
}

interface MonthlyData {
  month: string;
  members: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalMembers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    newMembersThisMonth: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      setIsLoading(true);

      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);

      // Fetch total members count
      const { count: totalMembers } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true });

      // Fetch active subscriptions count
      const { count: activeSubscriptions } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Fetch monthly revenue (sum of completed orders this month)
      const { data: ordersData } = await supabase
        .from("orders")
        .select("amount")
        .eq("status", "completed")
        .gte("created_at", startOfCurrentMonth.toISOString())
        .lte("created_at", endOfCurrentMonth.toISOString());

      const monthlyRevenue = ordersData?.reduce((sum, order) => sum + Number(order.amount), 0) || 0;

      // Fetch new members this month
      const { count: newMembersThisMonth } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfCurrentMonth.toISOString())
        .lte("created_at", endOfCurrentMonth.toISOString());

      setMetrics({
        totalMembers: totalMembers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        monthlyRevenue,
        newMembersThisMonth: newMembersThisMonth || 0,
      });

      // Fetch members per month for the last 6 months
      const monthlyStats: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthEnd = endOfMonth(subMonths(now, i));

        const { count } = await supabase
          .from("members")
          .select("*", { count: "exact", head: true })
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString());

        monthlyStats.push({
          month: format(monthStart, "MMM"),
          members: count || 0,
        });
      }

      setMonthlyData(monthlyStats);
      setIsLoading(false);
    }

    fetchMetrics();
  }, []);

  const metricsCards = [
    {
      title: "Total Members",
      value: metrics.totalMembers,
      icon: Users,
      description: "Registered companies",
    },
    {
      title: "Active Subscriptions",
      value: metrics.activeSubscriptions,
      icon: CreditCard,
      description: "Currently active plans",
    },
    {
      title: "Monthly Revenue",
      value: `$${metrics.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "Revenue this month",
    },
    {
      title: "New Members",
      value: metrics.newMembersThisMonth,
      icon: TrendingUp,
      description: "Joined this month",
    },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Monitor your business metrics and member activity
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metricsCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>New Members per Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="month"
                    className="text-xs fill-muted-foreground"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar
                    dataKey="members"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    name="New Members"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
