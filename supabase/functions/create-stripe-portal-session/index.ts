import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
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
  const stripeSecretKey = Deno.env.get("STRIPE_RESTRICTED_KEY") || Deno.env.get("STRIPE_SECRET_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !stripeSecretKey) {
    return jsonResponse({ error: "Server is not configured." }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing authorization header." }, 401);
  }

  let body: { returnUrl?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: "Unauthorized." }, 401);
  }

  const { data: memberData, error: memberError } = await adminClient
    .from("members")
    .select("stripe_customer_id, id")
    .eq("id", user.id)
    .maybeSingle();

  if (memberError || !memberData?.stripe_customer_id) {
    return jsonResponse({ error: "No billing profile found. Start a subscription first." }, 404);
  }

  const siteUrl = (Deno.env.get("SITE_URL") || req.headers.get("origin") || "http://localhost:5173").replace(
    /\/+$/,
    ""
  );
  const returnUrl = body.returnUrl && body.returnUrl.startsWith(siteUrl)
    ? body.returnUrl
    : `${siteUrl}/member/billing`;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: memberData.stripe_customer_id,
      return_url: returnUrl,
    });

    return jsonResponse({ url: session.url });
  } catch (error) {
    console.error("Stripe portal session error:", error);
    return jsonResponse({ error: "Unable to create billing portal session." }, 500);
  }
});
