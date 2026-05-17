import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";
import {
  cleanSignupCompanyName,
  normalizeSignupEmail,
  SIGNUP_VERIFICATION_WORD,
  validateSignupGuard,
} from "@/lib/signupAbuse";
import { trackSignUp } from "@/lib/analytics";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [verificationWord, setVerificationWord] = useState("");
  const [loading, setLoading] = useState(false);
  const formStartedAt = useRef(Date.now());

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanedCompanyName = cleanSignupCompanyName(companyName);
      const normalizedEmail = normalizeSignupEmail(email);
      const guard = validateSignupGuard({
        trapValue: website,
        verificationValue: verificationWord,
        elapsedMs: Date.now() - formStartedAt.current,
      });

      if (!guard.ok) {
        throw new Error(guard.message || "We could not verify this signup.");
      }

      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            company_name: cleanedCompanyName,
          },
        },
      });

      if (authError) throw authError;

      if (authData.session) {
        toast.success("Account created. Welcome to your member setup.");
        navigate("/member/onboarding");
      } else {
        toast.success("Account created. Please confirm your email, then sign in.");
        navigate("/login");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to create account");
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
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>
              Get started with TASA Trust today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Your Company Pte. Ltd."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
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
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 6 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="verificationWord">Verification</Label>
                <Input
                  id="verificationWord"
                  type="text"
                  placeholder={`Type ${SIGNUP_VERIFICATION_WORD.toUpperCase()}`}
                  value={verificationWord}
                  onChange={(e) => setVerificationWord(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
