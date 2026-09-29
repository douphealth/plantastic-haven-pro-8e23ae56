import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "npm:stripe@^22";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    const proPriceId = Deno.env.get("STRIPE_PRO_PRICE_ID");
    const appUrl =
      Deno.env.get("APP_URL") || "https://procare.plantastichaven.com";

    if (!supabaseUrl || !anonKey || !stripeSecret || !proPriceId) {
      console.error("Missing required payment configuration");
      return json({ error: "Payment service is not configured" }, 503);
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const token = authHeader.slice("Bearer ".length);
    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData.user?.email) {
      return json({ error: "Invalid or expired session" }, 401);
    }

    const user = userData.user;
    const stripe = new Stripe(stripeSecret);

    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 10,
    });

    let customer = existingCustomers.data.find(
      (candidate) => candidate.metadata?.plantastic_user_id === user.id
    );

    if (!customer) {
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          plantastic_user_id: user.id,
        },
      });
    }

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer: customer.id,
        client_reference_id: user.id,
        line_items: [{ price: proPriceId, quantity: 1 }],
        allow_promotion_codes: true,
        success_url: `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/settings?payment=cancelled`,
        metadata: {
          plantastic_user_id: user.id,
          entitlement: "pro",
        },
        payment_intent_data: {
          metadata: {
            plantastic_user_id: user.id,
            entitlement: "pro",
          },
        },
      },
      {
        idempotencyKey: `pro-checkout-${user.id}-${new Date()
          .toISOString()
          .slice(0, 13)}`,
      }
    );

    if (!session.url) {
      return json({ error: "Stripe did not return a Checkout URL" }, 502);
    }

    return json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("create-payment failed", error);
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start Stripe Checkout",
      },
      500
    );
  }
});
