import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ResetPassword() {
  const location = useLocation();
  const { hash, search } = location;
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hashParams = useMemo(() => new URLSearchParams((hash || "").replace(/^#/, "")), [hash]);
  const queryParams = useMemo(() => new URLSearchParams(search), [search]);

  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  const code = queryParams.get("code");
  const hasTokenFromHash = Boolean(accessToken && refreshToken);

  useEffect(() => {
    let isMounted = true;

    const initRecoverySession = async () => {
      if (!code && !hasTokenFromHash) {
        setErrorMessage("This reset link is invalid or expired.");
        setReady(false);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!isMounted) return;
        if (error) {
          setErrorMessage(error.message);
          setReady(false);
          return;
        }
        setReady(true);
        return;
      }

      if (hasTokenFromHash && accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!isMounted) return;
        if (error) {
          setErrorMessage(error.message);
          setReady(false);
          return;
        }
        setReady(true);
      }
    };

    void initRecoverySession();

    return () => {
      isMounted = false;
    };
  }, [code, accessToken, hasTokenFromHash, refreshToken]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      toast.success("Password updated. Please sign in with your new password.");
      navigate("/login");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>Set a new secure password for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            {!ready && errorMessage ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
                <Button asChild className="w-full">
                  <Link to="/forgot-password">Request a new reset link</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || !ready}>
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Update password
                </Button>
              </form>
            )}
            <div className="mt-6 text-center text-sm">
              <Link to="/login" className="text-muted-foreground hover:text-primary">
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
