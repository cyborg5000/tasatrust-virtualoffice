import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";
import {
  escapeHtml,
  getAdminNotificationEmails,
  normalizeEmail,
  sendResendEmail,
} from "../_shared/email.ts";

type SignupEmailPayload = {
  userId?: string;
  email?: string;
  companyName?: string;
  source?: "signup";
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function cleanCompanyName(value: unknown) {
  if (typeof value !== "string") return "New Customer";
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "New Customer";
}

function buildWelcomeEmail({ companyName }: { companyName: string }) {
  return `
    <h2>Welcome to TASA Trust</h2>
    <p>Hi ${escapeHtml(companyName)},</p>
    <p>Thanks for creating your TASA Trust account. We are glad you're here.</p>
    <p>Your dashboard is ready and you can begin onboarding immediately.</p>
    <p>
      <strong>Need help?</strong><br />
      Email us at <a href="mailto:support@tasatrust.com">support@tasatrust.com</a>
    </p>
  `;
}

function buildAdminSignupEmail({
  companyName,
  email,
  userId,
}: {
  companyName: string;
  email: string;
  userId?: string;
}) {
  return `
    <h2>New member signup</h2>
    <p><strong>Company:</strong> ${escapeHtml(companyName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${userId ? `<p><strong>User ID:</strong> ${escapeHtml(userId)}</p>` : ""}
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return jsonResponse({ error: "Server is not configured." }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing authorization header." }, 401);
  }

  let payload: SignupEmailPayload;

  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: "Unauthorized." }, 401);
  }

  if (payload.userId && payload.userId !== user.id) {
    return jsonResponse({ error: "Cannot send notifications for another user." }, 403);
  }

  const recipientEmail = normalizeEmail(user.email);
  const metadataCompanyName =
    typeof user.user_metadata?.company_name === "string"
      ? user.user_metadata.company_name
      : undefined;
  const companyName = cleanCompanyName(metadataCompanyName || payload.companyName);

  if (!recipientEmail) {
    return jsonResponse({ error: "Recipient email is required." }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  let resolvedEmail = recipientEmail;
  let resolvedCompany = companyName;

  const { data: member } = await adminClient
    .from("members")
    .select("email, company_name")
    .eq("id", user.id)
    .maybeSingle();

  if (member?.email) resolvedEmail = normalizeEmail(member.email) || recipientEmail;
  if (member?.company_name) resolvedCompany = cleanCompanyName(member.company_name);

  const adminEmails = getAdminNotificationEmails();

  const [userResult, adminResult] = await Promise.allSettled([
    sendResendEmail({
      to: resolvedEmail,
      subject: "Welcome to TASA Trust",
      html: buildWelcomeEmail({ companyName: resolvedCompany }),
      replyTo: "support@tasatrust.com",
    }),
    sendResendEmail({
      to: adminEmails,
      subject: `New signup: ${resolvedCompany}`,
      html: buildAdminSignupEmail({
        companyName: resolvedCompany,
        email: resolvedEmail,
        userId: user.id,
      }),
      replyTo: resolvedEmail,
    }),
  ]);

  const userSent = userResult.status === "fulfilled" && userResult.value.ok;
  const adminSent = adminResult.status === "fulfilled" && adminResult.value.ok;

  if (!userSent && !adminSent) {
    return jsonResponse(
      {
        error: "Unable to send signup notifications.",
        userEmailSent: userSent,
        adminEmailSent: adminSent,
      },
      502,
    );
  }

  return jsonResponse({
    success: true,
    userEmailSent: userSent,
    adminEmailSent: adminSent,
    recipient: resolvedEmail,
  });
});
