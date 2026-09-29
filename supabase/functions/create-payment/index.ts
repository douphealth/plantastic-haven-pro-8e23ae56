import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const PRO_PRICE_ID =
  Deno.env.get("STRIPE_PRO_PRICE_ID") ||
  "price_1TJZHkGCqwm95OGXjymU2Vuw";

const APP_URL =
  (Deno.env.get("APP_URL") || "https://procare.plantastichaven.com").replace(
    /\/$/,
    ""
  );

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Authentication required" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return json({ error: "Authentication required" }, 401);
    }

    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecret) {
      throw new Error("Stripe is not configured");
    }

    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2025-08-27.basil",
    });

    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    const customerId = existingCustomers.data[0]?.id;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      client_reference_id: user.id,
      line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
      mode: "payment",
      success_url: \`\${APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}\`,
      cancel_url: \`\${APP_URL}/settings?checkout=cancelled\`,
      allow_promotion_codes: false,
      metadata: {
        user_id: user.id,
        entitlement: "pro",
        price_id: PRO_PRICE_ID,
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a Checkout URL");
    }

    return json({ url: session.url });
  } catch (error) {
    console.error("create-payment error:", error);
    const message =
      error instanceof Error ? error.message : "Unable to create checkout";
    return json({ error: message }, 500);
  }
});
