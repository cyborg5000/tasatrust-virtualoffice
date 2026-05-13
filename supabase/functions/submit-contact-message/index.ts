import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";
import { escapeHtml, sendResendEmail } from "../_shared/email.ts";

type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  inquiryType: "virtual-office" | "incorporation" | "accounting" | "general";
  message: string;
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

function getIpAddress(req: Request): string | null {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  return realIp?.trim() || null;
}

function cleanText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ");
}

function mapInquiryType(type: string) {
  const labels: Record<ContactPayload["inquiryType"], string> = {
    "virtual-office": "Virtual Office / Business Address",
    incorporation: "Company Incorporation",
    accounting: "Accounting & Tax",
    general: "General Inquiry",
  };

  if (
    type === "virtual-office" ||
    type === "incorporation" ||
    type === "accounting" ||
    type === "general"
  ) {
    return labels[type];
  }

  return "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Server email is not fully configured." }, 500);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  let payload: ContactPayload;

  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request payload." }, 400);
  }

  const name = cleanText(payload.name);
  const email = cleanText(payload.email).toLowerCase();
  const phone = cleanText(payload.phone);
  const company = cleanText(payload.company);
  const inquiryType = cleanText(payload.inquiryType);
  const message = cleanText(payload.message);
  const inquiryLabel = mapInquiryType(inquiryType);

  if (!name) {
    return jsonResponse({ error: "Name is required." }, 400);
  }
  if (name.length > 100) {
    return jsonResponse({ error: "Name is too long." }, 400);
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
    return jsonResponse({ error: "Please provide a valid email address." }, 400);
  }
  if (phone.length > 30) {
    return jsonResponse({ error: "Phone number is too long." }, 400);
  }
  if (company.length > 200) {
    return jsonResponse({ error: "Company name is too long." }, 400);
  }
  if (!inquiryLabel) {
    return jsonResponse({ error: "Please choose a valid inquiry type." }, 400);
  }
  if (message.length < 10) {
    return jsonResponse({ error: "Message must be at least 10 characters." }, 400);
  }
  if (message.length > 1000) {
    return jsonResponse({ error: "Message is too long." }, 400);
  }

  const requestIp = getIpAddress(req);

  if (requestIp) {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { count, error: rateLimitError } = await adminClient
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .eq("request_ip", requestIp)
      .gte("created_at", thirtyMinutesAgo);

    if (rateLimitError) {
      return jsonResponse({ error: "Unable to validate request frequency." }, 500);
    }

    if ((count ?? 0) >= 6) {
      return jsonResponse({ error: "Too many submissions. Please try again later." }, 429);
    }
  }

  const userAgent = req.headers.get("user-agent");

  const notifyEmail =
    Deno.env.get("CONTACT_NOTIFICATION_EMAIL") ||
    Deno.env.get("SUPPORT_EMAIL") ||
    Deno.env.get("RESEND_TO_EMAIL") ||
    "info@tasatrust.com";

  const { data: inserted, error: insertError } = await adminClient
    .from("contact_submissions")
    .insert({
      name,
      email,
      phone: phone || null,
      company: company || null,
      inquiry_type: inquiryType,
      message,
      request_ip: requestIp,
      user_agent: userAgent,
      status: "new",
    })
    .select("id")
    .single();

  if (insertError) {
    return jsonResponse({ error: "Unable to save your message right now." }, 500);
  }

  const emailResponse = await sendResendEmail({
    to: notifyEmail,
    replyTo: email,
    subject: `[TASA Contact] ${inquiryLabel}`,
    html: `
      <h2>New Contact Inquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
      ${company ? `<p><strong>Company:</strong> ${escapeHtml(company)}</p>` : ""}
      <p><strong>Type:</strong> ${inquiryLabel}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
      <hr/>
      <p>Submission ID: ${inserted.id}</p>
    `,
  });

  if (!emailResponse.ok) {
    console.error("Resend API error:", emailResponse.error);
    return jsonResponse({ error: "Message was received but email notification failed." }, 502);
  }

  return jsonResponse({
    success: true,
    message: "Your message has been sent.",
    submissionId: inserted.id,
  });
});
