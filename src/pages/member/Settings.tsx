import { useState, useEffect } from "react";
import { MemberLayout } from "@/components/member/MemberLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminMemberView } from "@/hooks/useAdminMemberView";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Building, User, Shield } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Member = Tables<"members">;

export default function MemberSettings() {
  const { effectiveMemberId, effectiveMemberEmail, isViewingAsMember } = useAdminMemberView();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    async function fetchMemberData() {
      setLoading(true);
      setMember(null);

      if (!effectiveMemberId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", effectiveMemberId)
        .maybeSingle();

      if (data) {
        setMember(data);
        setCompanyName(data.company_name || "");
        setContactName(data.contact_name || "");
        setPhone(data.phone || "");
      }
      setLoading(false);
    }

    void fetchMemberData();
  }, [effectiveMemberId]);

  const handleUpdateProfile = async () => {
    if (isViewingAsMember) {
      toast.error("Profile changes are disabled in admin view-as mode.");
      return;
    }

    if (!effectiveMemberId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("members")
        .update({
          company_name: companyName,
          contact_name: contactName,
          phone: phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", effectiveMemberId);

      if (error) throw error;

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList>
            <TabsTrigger value="company" className="gap-2">
              <Building className="h-4 w-4" />
              Company Profile
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2">
              <User className="h-4 w-4" />
              Contact Info
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Company Profile Tab */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>
                  Update your company information displayed on your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                    disabled={isViewingAsMember}
                  />
                </div>
                <Button onClick={handleUpdateProfile} disabled={saving || isViewingAsMember}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isViewingAsMember ? "View Only" : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Info Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Update your contact details for communication.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Enter contact name"
                    disabled={isViewingAsMember}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={effectiveMemberEmail || member?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Contact support to change your email address.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+65 XXXX XXXX"
                    disabled={isViewingAsMember}
                  />
                </div>
                <Button onClick={handleUpdateProfile} disabled={saving || isViewingAsMember}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isViewingAsMember ? "View Only" : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and security preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <h4 className="font-medium">Password</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    To change your password, use the password reset feature.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    disabled={isViewingAsMember}
                    onClick={async () => {
                      if (!effectiveMemberEmail) return;
                      const { error } = await supabase.auth.resetPasswordForEmail(
                        effectiveMemberEmail,
                        { redirectTo: `${window.location.origin}/reset-password` }
                      );
                      if (error) {
                        toast.error("Failed to send reset email");
                      } else {
                        toast.success("Password reset email sent");
                      }
                    }}
                  >
                    Send Password Reset Email
                  </Button>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <h4 className="font-medium">Active Sessions</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You are currently signed in on this device.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MemberLayout>
  );
}
