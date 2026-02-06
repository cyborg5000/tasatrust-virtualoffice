import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Building2, Mail, Phone, Calendar, CreditCard, Package } from "lucide-react";

interface MemberWithDetails {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string;
  phone: string | null;
  created_at: string | null;
  subscription?: {
    tier: string;
    status: string;
    current_period_end: string | null;
  } | null;
  orders?: Array<{
    id: string;
    amount: number;
    status: string;
    created_at: string | null;
  }>;
}

interface MemberDetailDrawerProps {
  member: MemberWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberDetailDrawer({ member, isOpen, onClose }: MemberDetailDrawerProps) {
  if (!member) return null;

  const tierColors: Record<string, string> = {
    basic: "bg-secondary text-secondary-foreground",
    essential: "bg-primary/20 text-primary",
    professional: "bg-primary text-primary-foreground",
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-500/20 text-green-700",
    cancelled: "bg-destructive/20 text-destructive",
    past_due: "bg-yellow-500/20 text-yellow-700",
    paused: "bg-muted text-muted-foreground",
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {member.company_name}
          </DrawerTitle>
          <DrawerDescription>
            Member details and subscription information
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-4 space-y-6">
          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>
            <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4">
              {member.contact_name && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-medium">{member.contact_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Joined {member.created_at ? format(new Date(member.created_at), "MMM d, yyyy") : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Subscription */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription
            </h3>
            {member.subscription ? (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <Badge className={tierColors[member.subscription.tier] || ""}>
                    {member.subscription.tier.charAt(0).toUpperCase() + member.subscription.tier.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={statusColors[member.subscription.status] || ""}>
                    {member.subscription.status.charAt(0).toUpperCase() + member.subscription.status.slice(1)}
                  </Badge>
                </div>
                {member.subscription.current_period_end && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Renews</span>
                    <span className="text-sm">
                      {format(new Date(member.subscription.current_period_end), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active subscription</p>
            )}
          </div>

          <Separator />

          {/* Recent Orders */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Recent Orders
            </h3>
            {member.orders && member.orders.length > 0 ? (
              <div className="space-y-2">
                {member.orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">${order.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.created_at ? format(new Date(order.created_at), "MMM d, yyyy") : "N/A"}
                      </p>
                    </div>
                    <Badge
                      variant={order.status === "completed" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No orders yet</p>
            )}
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
