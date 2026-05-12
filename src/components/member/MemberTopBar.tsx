import { Bell, CheckCircle2, LogOut, ReceiptText, Settings, Shield, User } from "lucide-react";
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
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { getSubscriptionTierLabel, type SubscriptionTier } from "@/lib/subscriptionPlans";
import { useAdminMemberView } from "@/hooks/useAdminMemberView";

interface MemberTopBarProps {
  companyName?: string;
  memberEmail?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  kind: "subscription" | "payment";
}

export function MemberTopBar({ companyName, memberEmail }: MemberTopBarProps) {
  const { user, signOut } = useAuth();
  const { effectiveMemberId, isViewingAsMember, returnToAdminView } = useAdminMemberView();
  const navigate = useNavigate();
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    async function loadNotifications() {
      if (!effectiveMemberId) {
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
            .eq("member_id", effectiveMemberId)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("orders")
            .select("id, amount, status, created_at, type")
            .eq("member_id", effectiveMemberId)
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
            kind: "subscription",
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
            kind: "payment",
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
  }, [effectiveMemberId]);

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
    : memberEmail?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Member Portal</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full border border-border/70 bg-background shadow-sm hover:bg-muted/70"
              aria-label={`Notifications${notifications.length > 0 ? `, ${notifications.length} unread` : ""}`}
            >
              <Bell className="h-5 w-5" />
              {!loadingNotifications && notifications.length > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full border-2 border-background bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground shadow-sm">
                  {notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl p-0 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                <p className="text-xs text-muted-foreground">Recent billing and account activity</p>
              </div>
              {!loadingNotifications && notifications.length > 0 && (
                <span className="rounded-full bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
                  {notifications.length}
                </span>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-auto">
              {loadingNotifications ? (
                <DropdownMenuItem className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                  Loading notifications...
                </DropdownMenuItem>
              ) : notifications.length > 0 ? (
                notifications.map((item) => (
                  <DropdownMenuItem key={item.id} className="flex items-start gap-3 rounded-none p-4">
                    <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {item.kind === "subscription" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <ReceiptText className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 space-y-1">
                      <span className="block font-medium text-foreground">{item.title}</span>
                      <span className="block text-sm leading-5 text-muted-foreground">{item.description}</span>
                    </span>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="flex items-start gap-3 rounded-none p-4">
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <span className="space-y-1">
                    <span className="block font-medium text-foreground">No notifications</span>
                    <span className="block text-sm leading-5 text-muted-foreground">
                      You're all caught up. New billing activity will appear here.
                    </span>
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
                {companyName || memberEmail || user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {isViewingAsMember && (
              <>
                <DropdownMenuItem onClick={returnToAdminView} className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Return to Admin View
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
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
