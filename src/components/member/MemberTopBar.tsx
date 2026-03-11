import { Bell, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { getSubscriptionTierLabel, type SubscriptionTier } from "@/lib/subscriptionPlans";

interface MemberTopBarProps {
  companyName?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
}

export function MemberTopBar({ companyName }: MemberTopBarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    async function loadNotifications() {
      if (!user) {
        setNotifications([]);
        setLoadingNotifications(false);
        return;
      }

      setLoadingNotifications(true);
      try {
        const [{ data: subscription }, { data: orders }] = await Promise.all([
          supabase
            .from("subscriptions")
            .select("id, tier, status, cancel_at_period_end, current_period_end, stripe_subscription_id")
            .eq("member_id", user.id)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("orders")
            .select("id, amount, status, created_at, type")
            .eq("member_id", user.id)
            .order("created_at", { ascending: false })
            .limit(4),
        ]);

        const nextNotifications: NotificationItem[] = [];

        if (subscription) {
          const tierLabel = getSubscriptionTierLabel(subscription.tier as SubscriptionTier);
          const statusText = subscription.stripe_subscription_id
            ? subscription.cancel_at_period_end
              ? `Your ${tierLabel} plan is set to end on ${subscription.current_period_end ? format(new Date(subscription.current_period_end), "MMM d, yyyy") : "the period end date"}`
              : `Your ${tierLabel} plan is active and will renew automatically.`
            : `Your ${tierLabel} plan is active and managed by the TASA Trust team.`;

          nextNotifications.push({
            id: `subscription-${subscription.id}`,
            title: subscription.stripe_subscription_id && subscription.cancel_at_period_end
              ? "Subscription Ending"
              : "Subscription Active",
            description: statusText,
          });
        }

        for (const order of orders || []) {
          if (!order.created_at) continue;
          const label =
            order.status === "completed"
              ? `Payment of $${Number(order.amount).toFixed(2)} completed for ${order.type}.`
              : `Payment ${order.status || "pending"} for ${order.type}.`;

          nextNotifications.push({
            id: `order-${order.id}`,
            title: order.type
              ? `${order.type.charAt(0).toUpperCase()}${order.type.slice(1)} update`
              : "Payment update",
            description: `${format(new Date(order.created_at), "MMM d")} — ${label}`,
          });
        }

        setNotifications(nextNotifications.slice(0, 5));
      } catch (error) {
        console.error("Error loading notifications:", error);
        setNotifications([]);
      } finally {
        setLoadingNotifications(false);
      }
    }

    void loadNotifications();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const initials = companyName
    ? companyName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Member Portal</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {!loadingNotifications && notifications.length > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                  {notifications.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-4">
              <h3 className="font-medium">Notifications</h3>
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-auto">
              {loadingNotifications ? (
                <DropdownMenuItem className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                  Loading notifications...
                </DropdownMenuItem>
              ) : notifications.length > 0 ? (
                notifications.map((item) => (
                  <DropdownMenuItem key={item.id} className="flex flex-col items-start gap-1 p-4">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-sm text-muted-foreground">{item.description}</span>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
                  <span className="font-medium">No notifications</span>
                  <span className="text-sm text-muted-foreground">
                    You're all caught up. New billing activity will appear here.
                  </span>
                </DropdownMenuItem>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline">
                {companyName || user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/member/settings" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/member/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="flex items-center gap-2 text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
