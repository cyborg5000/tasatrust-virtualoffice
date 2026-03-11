import { useState } from "react";
import { Link, useLocation, useNavigate, type Location } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";

function isMemberPath(path: string) {
  return path === "/member" || path.startsWith("/member/");
}

function isOnboardingPath(path: string) {
  return path === "/member/onboarding" || path.startsWith("/member/onboarding/");
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const userId = authData.user?.id;
      let hasActiveSubscription = false;

      const { error: ensureMemberError } = await supabase.rpc("ensure_member_profile");
      if (ensureMemberError) {
        console.error("Error reconciling member profile during login:", ensureMemberError);
      }

      if (userId) {
        const { data: subscriptions, error: subscriptionError } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("member_id", userId)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1);

        if (subscriptionError) {
          console.error("Error loading subscription after login:", subscriptionError);
        } else {
          hasActiveSubscription = (subscriptions?.length || 0) > 0;
        }
      }

      toast.success("Welcome back!");
      const fromLocation = (location.state as { from?: Location } | undefined)?.from;
      const fromPath = fromLocation
        ? `${fromLocation.pathname || ""}${fromLocation.search || ""}${fromLocation.hash || ""}`
        : "";

      let destination = fromPath || (hasActiveSubscription ? "/member" : "/member/onboarding");

      if (isMemberPath(destination)) {
        if (hasActiveSubscription && isOnboardingPath(destination)) {
          destination = "/member";
        }

        if (!hasActiveSubscription && !isOnboardingPath(destination) && destination !== "/member/checkout/success") {
          destination = "/member/onboarding";
        }
      }

      navigate(destination, { replace: true });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img src={logo} alt="TASA Trust" className="h-12 w-auto" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your member portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
              <p className="mt-2">
                <Link
                  to="/forgot-password"
                  className="text-muted-foreground hover:text-primary"
                >
                  Forgot your password?
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
