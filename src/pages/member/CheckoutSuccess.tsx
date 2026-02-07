import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMemberSubscription } from "@/hooks/useMemberSubscription";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasActiveSubscription, loading, refresh } = useMemberSubscription(user?.id);
  const [timedOut, setTimedOut] = useState(false);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (hasActiveSubscription) {
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

  const sessionId = searchParams.get("session_id");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            {hasActiveSubscription ? (
              <CheckCircle2 className="h-6 w-6 text-primary" />
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl text-secondary">Finalizing Your Subscription</CardTitle>
          <CardDescription>
            We are confirming your Stripe payment and activating your member plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {sessionId && (
            <p className="text-xs text-muted-foreground">
              Checkout session: <span className="font-mono">{sessionId}</span>
            </p>
          )}
          {loading && !timedOut && (
            <p className="text-sm text-muted-foreground">
              Please wait a few seconds while your account is updated.
            </p>
          )}
          {timedOut && (
            <p className="text-sm text-muted-foreground">
              Payment may still be processing. Refresh this page in a moment, or return to onboarding.
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => navigate("/member/onboarding")}>Back to Onboarding</Button>
            <Button variant="outline" onClick={() => navigate("/member")}>
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
