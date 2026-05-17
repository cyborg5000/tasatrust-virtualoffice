import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, Mail, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMemberSubscription } from "@/hooks/useMemberSubscription";
import { supabase } from "@/integrations/supabase/client";
import { trackPurchase } from "@/lib/analytics";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasActiveSubscription, loading, refresh } = useMemberSubscription(user?.id);
  const [timedOut, setTimedOut] = useState(false);
  const [reconcileStatus, setReconcileStatus] = useState<"idle" | "checking" | "confirmed" | "support">("idle");
  const [reconcileError, setReconcileError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const sessionId = searchParams.get("session_id");
  const attemptsRef = useRef(0);
  const reconcileAttemptedRef = useRef(false);
  const purchaseTrackedRef = useRef(false);

  useEffect(() => {
    if (hasActiveSubscription) {
      if (!purchaseTrackedRef.current) {
        purchaseTrackedRef.current = true;
        trackPurchase({ transactionId: sessionId ?? undefined });
      }
      navigate("/member", { replace: true });
      return;
    }

    const timer = setInterval(async () => {
      attemptsRef.current += 1;
      await refresh();
      if (attemptsRef.current >= 10) {
        setTimedOut(true);
        clearInterval(timer);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [hasActiveSubscription, navigate, refresh]);

  useEffect(() => {
    if (!sessionId || !user?.id || hasActiveSubscription || reconcileAttemptedRef.current) return;

    let cancelled = false;
    reconcileAttemptedRef.current = true;

    async function reconcileCheckoutSession() {
      setReconcileStatus("checking");
      setReconcileError(null);

      try {
        const { data, error } = await supabase.functions.invoke("reconcile-checkout-session", {
          body: { sessionId },
        });

        if (error) throw error;

        await refresh();
        if (cancelled) return;

        if (data?.activated) {
          setReconcileStatus("confirmed");
          navigate("/member", { replace: true });
          return;
        }

        setReconcileStatus("support");
        setReconcileError("Your payment was found, but the subscription status still needs review.");
      } catch (error) {
        console.error("Checkout reconciliation failed:", error);
        if (cancelled) return;
        setReconcileStatus("support");
        setReconcileError("We could not automatically confirm this checkout session.");
      }
    }

    void reconcileCheckoutSession();

    return () => {
      cancelled = true;
    };
  }, [hasActiveSubscription, navigate, refresh, retryKey, sessionId, user?.id]);

  const isChecking = loading || reconcileStatus === "checking";
  const needsSupport = timedOut || reconcileStatus === "support";
  const supportHref = `mailto:info@tasatrust.com?subject=${encodeURIComponent(
    "Payment activation help",
  )}&body=${encodeURIComponent(
    `Hello TASA Trust,\n\nMy payment completed but my member portal is not active yet.\n\nCheckout session: ${
      sessionId || "Not available"
    }\nAccount email: ${user?.email || "Not available"}\n`,
  )}`;

  const handleCheckAgain = async () => {
    setTimedOut(false);
    attemptsRef.current = 0;
    reconcileAttemptedRef.current = false;
    await refresh();
    setRetryKey((key) => key + 1);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            {hasActiveSubscription || reconcileStatus === "confirmed" ? (
              <CheckCircle2 className="h-6 w-6 text-primary" />
            ) : needsSupport ? (
              <AlertCircle className="h-6 w-6 text-primary" />
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl text-secondary">Finalizing Your Subscription</CardTitle>
          <CardDescription>
            {needsSupport
              ? "Your payment needs an activation check from the TASA Trust team."
              : "We are confirming your Stripe payment and activating your member plan."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {sessionId && (
            <p className="text-xs text-muted-foreground">
              Checkout session: <span className="font-mono">{sessionId}</span>
            </p>
          )}
          {isChecking && !needsSupport && (
            <p className="text-sm text-muted-foreground">
              Please wait a few seconds while your account is updated.
            </p>
          )}
          {needsSupport && (
            <p className="text-sm text-muted-foreground">
              {reconcileError || "Payment may still be processing."} Please contact support with the checkout session
              shown above so we can activate the account or review the payment.
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={handleCheckAgain} disabled={isChecking}>
              {isChecking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Check Again
            </Button>
            <Button variant="outline" onClick={() => navigate("/member")}>
              Go to Dashboard
            </Button>
            {needsSupport && (
              <Button variant="ghost" asChild>
                <a href={supportHref}>
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
