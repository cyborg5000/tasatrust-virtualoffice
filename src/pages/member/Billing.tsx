import { useEffect, useState } from "react";
import { MemberLayout } from "@/components/member/MemberLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAdminMemberView } from "@/hooks/useAdminMemberView";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import { 
  CreditCard, 
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  Download,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";
import {
  buildInvoiceDetails,
  formatCurrency,
  getCurrentPlanBillingNote,
  getCurrentPlanRateText,
  getInvoiceNumber,
  getOrderTypeLabel,
  inferSubscriptionBillingCycle,
  TASA_TRUST_INVOICE_ISSUER,
  type BillingMember,
  type BillingOrder,
} from "@/lib/billingInvoice";
import { downloadInvoicePdf } from "@/lib/invoicePdf";
import {
  getSubscriptionTierLabel,
  type SubscriptionTier,
} from "@/lib/subscriptionPlans";
import { toast } from "sonner";

type Subscription = Tables<"subscriptions">;

export default function MemberBilling() {
  const { effectiveMemberId, isViewingAsMember } = useAdminMemberView();
  const [orders, setOrders] = useState<BillingOrder[]>([]);
  const [member, setMember] = useState<BillingMember | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<BillingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBillingData() {
      setLoading(true);
      setSubscription(null);
      setOrders([]);
      setMember(null);
      setSelectedOrder(null);

      if (!effectiveMemberId) {
        setLoading(false);
        return;
      }

      try {
        const [subscriptionResult, ordersResult, memberResult] = await Promise.all([
          supabase
            .from("subscriptions")
            .select("*")
            .eq("member_id", effectiveMemberId)
            .eq("status", "active")
            .maybeSingle(),
          supabase
            .from("orders")
            .select("*, services(name, description)")
            .eq("member_id", effectiveMemberId)
            .order("created_at", { ascending: false }),
          supabase
            .from("members")
            .select("company_name, contact_name, email, phone")
            .eq("id", effectiveMemberId)
            .maybeSingle(),
        ]);

        if (subscriptionResult.error) throw subscriptionResult.error;
        if (ordersResult.error) throw ordersResult.error;
        if (memberResult.error) throw memberResult.error;

        setSubscription(subscriptionResult.data);
        setOrders((ordersResult.data || []) as BillingOrder[]);
        setMember(memberResult.data || null);
      } catch (error) {
        console.error("Error fetching billing data:", error);
        toast.error("Unable to load billing data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void fetchBillingData();
  }, [effectiveMemberId]);

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

  const totalSpent = orders
    .filter(o => o.status === "completed")
    .reduce((sum, o) => sum + Number(o.amount), 0);
  const completedOrderCount = orders.filter(o => o.status === "completed").length;
  const hasStripeManagedSubscription = Boolean(subscription?.stripe_subscription_id);
  const subscriptionBillingCycle = inferSubscriptionBillingCycle(subscription, orders);
  const latestOrder = orders[0];
  const selectedInvoice = selectedOrder
    ? buildInvoiceDetails({
        order: selectedOrder,
        member,
        subscription,
        subscriptionBillingCycle,
      })
    : null;

  const handleDownloadInvoice = async (order: BillingOrder) => {
    const invoice = buildInvoiceDetails({
      order,
      member,
      subscription,
      subscriptionBillingCycle,
    });

    setDownloadingInvoiceId(order.id);
    try {
      await downloadInvoicePdf(invoice, logo);
      toast.success(`${invoice.invoiceNumber} downloaded.`);
    } catch (error: unknown) {
      console.error("Invoice download failed:", error);
      toast.error(error instanceof Error ? error.message : "Unable to download invoice PDF.");
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const openBillingPortal = async () => {
    if (isViewingAsMember) {
      toast.error("Billing portal actions are disabled in admin view-as mode.");
      return;
    }

    if (!effectiveMemberId || !hasStripeManagedSubscription) return;

    setIsPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-stripe-portal-session", {
        body: {
          returnUrl: `${window.location.origin}/member/billing`,
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.url) {
        throw new Error("Unable to start the billing portal.");
      }

      window.location.assign(data.url);
    } catch (error: unknown) {
      console.error("Error opening billing portal:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to open billing portal. Please try again."
      );
    } finally {
      setIsPortalLoading(false);
    }
  };

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
        <div className="relative overflow-hidden rounded-xl border border-secondary/15 bg-secondary px-5 py-5 text-secondary-foreground shadow-sm sm:px-6">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_100%_0%,hsl(var(--primary)/0.28),transparent_46%)]" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Member Billing</p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Billing & Invoices</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/72">
                Plan, renewal, invoices, and payment records in one place.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/10 bg-white/10 p-3 text-sm backdrop-blur sm:min-w-[18rem]">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-white/55">Invoices</p>
                <p className="mt-1 text-xl font-semibold">{orders.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-white/55">Paid</p>
                <p className="mt-1 text-xl font-semibold">{completedOrderCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Current Plan */}
          <Card className="relative overflow-hidden border-primary/25 bg-white/95 shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/12 text-primary">
                <CreditCard className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-secondary">
                      {getSubscriptionTierLabel(subscription.tier as SubscriptionTier)}
                    </span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Active
                    </Badge>
                  </div>
                  <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                    <p>
                      {hasStripeManagedSubscription
                        ? getCurrentPlanRateText(subscription, subscriptionBillingCycle)
                        : "Admin-managed plan"}
                    </p>
                    {hasStripeManagedSubscription ? (
                      <p className="text-xs">
                        {getCurrentPlanBillingNote(subscriptionBillingCycle)}
                      </p>
                    ) : null}
                  </div>
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
          <Card className="border-secondary/10 bg-white/95 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <Calendar className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent>
              {subscription?.current_period_end ? (
                <>
                  <span className="text-2xl font-bold text-secondary">
                    {format(new Date(subscription.current_period_end), "MMM d, yyyy")}
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {subscription.cancel_at_period_end ? "Cancels on this date" : "Auto-renews"}
                  </p>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold">
                    {subscription ? "Managed offline" : "—"}
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {subscription ? "No Stripe billing schedule is attached to this plan" : "No upcoming payment"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Total Spent */}
          <Card className="border-secondary/10 bg-white/95 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <DollarSign className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-secondary">{formatCurrency(totalSpent)}</span>
              <p className="mt-1 text-sm text-muted-foreground">
                Across {completedOrderCount} paid orders
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card className="overflow-hidden border-secondary/10 bg-white/95 shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl text-secondary">
                <FileText className="h-5 w-5 text-primary" />
                Payment History
              </CardTitle>
              <CardDescription className="mt-1">
                Invoices and payment records from your account.
              </CardDescription>
            </div>
            {latestOrder?.created_at ? (
              <div className="rounded-lg border border-border/70 bg-muted/35 px-3 py-2 text-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Latest</p>
                <p className="mt-1 font-medium text-secondary">
                  {format(new Date(latestOrder.created_at), "MMM d, yyyy")}
                </p>
              </div>
            ) : null}
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-lg border border-border/80">
                  <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/60">
                      <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        <th className="px-4 py-3 font-semibold">Invoice</th>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 font-semibold">Type</th>
                        <th className="px-4 py-3 font-semibold">Amount</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="group cursor-pointer border-t bg-white transition-colors hover:bg-primary/5"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              className="flex items-center gap-2 rounded-sm text-left transition-colors group-hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedOrder(order);
                              }}
                            >
                              {getStatusIcon(order.status || "pending")}
                              <span className="font-mono text-sm font-semibold">
                                {getInvoiceNumber(order.id)}
                              </span>
                            </button>
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            {order.created_at
                              ? format(new Date(order.created_at), "MMM d, yyyy")
                              : "—"}
                          </td>
                          <td className="px-4 py-4 text-sm">{getOrderTypeLabel(order.type)}</td>
                          <td className="px-4 py-4 text-sm font-semibold text-secondary">
                            {formatCurrency(Number(order.amount))}
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant="secondary" className={getStatusColor(order.status || "pending")}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 gap-2 border-border/80 bg-white"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedOrder(order);
                              }}
                            >
                              <Receipt className="h-4 w-4" />
                              View Invoice
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
                {hasStripeManagedSubscription ? (
                  <Button
                    variant="outline"
                    onClick={openBillingPortal}
                    disabled={isPortalLoading || isViewingAsMember}
                  >
                    {isPortalLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Opening portal...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Stripe Billing Portal
                      </>
                    )}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This plan was assigned by admin, so there is no Stripe billing portal for it yet.
                  </p>
                )}
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

        <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            {selectedOrder && selectedInvoice ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    {selectedInvoice.invoiceNumber}
                  </DialogTitle>
                  <DialogDescription>
                    Invoice for the selected billing line item.
                  </DialogDescription>
                </DialogHeader>

                <div className="rounded-xl border bg-white p-5 text-foreground shadow-sm sm:p-6">
                  <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <img src={logo} alt="TASA Trust" className="h-12 w-auto" />
                      <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                        <p className="font-semibold text-foreground">{TASA_TRUST_INVOICE_ISSUER.displayName}</p>
                        <p>{TASA_TRUST_INVOICE_ISSUER.legalName}</p>
                        <p>UEN: {TASA_TRUST_INVOICE_ISSUER.uen}</p>
                        {TASA_TRUST_INVOICE_ISSUER.address.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                        <p>{TASA_TRUST_INVOICE_ISSUER.website}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <Badge variant="secondary" className={getStatusColor(selectedInvoice.status)}>
                        {selectedInvoice.status}
                      </Badge>
                      <p className="mt-3 text-sm text-muted-foreground">Invoice</p>
                      <p className="font-mono text-lg font-semibold">{selectedInvoice.invoiceNumber}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {selectedInvoice.issuedAt
                          ? format(selectedInvoice.issuedAt, "MMM d, yyyy")
                          : "Date unavailable"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 py-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Bill To
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="font-semibold text-foreground">{selectedInvoice.billedTo.name}</p>
                        {selectedInvoice.billedTo.contactName ? (
                          <p className="text-muted-foreground">{selectedInvoice.billedTo.contactName}</p>
                        ) : null}
                        {selectedInvoice.billedTo.email ? (
                          <p className="text-muted-foreground">{selectedInvoice.billedTo.email}</p>
                        ) : null}
                        {selectedInvoice.billedTo.phone ? (
                          <p className="text-muted-foreground">{selectedInvoice.billedTo.phone}</p>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Payment Reference
                      </p>
                      <p className="mt-2 inline-flex max-w-full rounded-md bg-muted px-3 py-2 text-sm font-medium text-foreground">
                        {selectedInvoice.paymentReference || "Not available"}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/70 text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Description</th>
                          <th className="px-4 py-3 font-semibold">Billing</th>
                          <th className="px-4 py-3 text-right font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.lineItems.map((item) => (
                          <tr key={`${item.description}-${item.amountLabel}`} className="border-t">
                            <td className="px-4 py-4 font-medium">{item.description}</td>
                            <td className="px-4 py-4 text-muted-foreground">{item.periodLabel}</td>
                            <td className="px-4 py-4 text-right font-semibold">{item.amountLabel}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="ml-auto mt-5 max-w-xs space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-base">
                      <span className="font-semibold">Total Paid</span>
                      <span className="text-xl font-bold text-secondary">
                        {formatCurrency(selectedInvoice.totalPaid)}
                      </span>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    onClick={() => handleDownloadInvoice(selectedOrder)}
                    disabled={downloadingInvoiceId === selectedOrder.id}
                    className="gap-2"
                  >
                    {downloadingInvoiceId === selectedOrder.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Preparing PDF...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Subscription Management */}
        {subscription && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>Manage your subscription and billing details safely</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">
                    {getSubscriptionTierLabel(subscription.tier as SubscriptionTier)} Plan
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {hasStripeManagedSubscription
                      ? subscription.cancel_at_period_end
                        ? "Your subscription will end on " + format(new Date(subscription.current_period_end!), "MMMM d, yyyy")
                        : "Your subscription renews automatically"
                      : "This plan is active and managed manually by the TASA Trust team"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {hasStripeManagedSubscription ? (
                    <Button
                      onClick={openBillingPortal}
                      disabled={isPortalLoading || isViewingAsMember}
                      className="gap-2"
                    >
                      {isPortalLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Opening portal...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          Open Billing Portal
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {hasStripeManagedSubscription
                  ? "Need to switch plans, update card details, or cancel at period end? Open the Stripe billing portal."
                  : "Need to change this plan? Contact the TASA Trust admin team to update the manual assignment."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MemberLayout>
  );
}
