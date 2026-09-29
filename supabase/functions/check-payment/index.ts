import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const PRO_PRICE_ID =
  Deno.env.get("STRIPE_PRO_PRICE_ID") ||
  "price_1TJZHkGCqwm95OGXjymU2Vuw";

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

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!serviceRoleKey || !stripeSecret) {
      throw new Error("Payment verification is not configured");
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      serviceRoleKey,
      { auth: { persistSession: false } }
    );

    const token = authHeader.slice("Bearer ".length);
    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(token);

    if (userError || !user?.email) {
      return json({ error: "Authentication required" }, 401);
    }

    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2025-08-27.basil",
    });

    const body = await req.json().catch(() => ({}));
    const sessionId =
      typeof body?.sessionId === "string" && body.sessionId.startsWith("cs_")
        ? body.sessionId
        : null;

    const sessionQualifies = async (
      session: Stripe.Checkout.Session
    ): Promise<boolean> => {
      if (
        session.status !== "complete" ||
        session.payment_status !== "paid" ||
        session.metadata?.user_id !== user.id
      ) {
        return false;
      }

      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        { limit: 100 }
      );

      return lineItems.data.some((item) => item.price?.id === PRO_PRICE_ID);
    };

    let hasPro = false;
    let verifiedSessionId: string | null = null;

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      hasPro = await sessionQualifies(session);
      verifiedSessionId = hasPro ? session.id : null;
    } else {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 10,
      });

      for (const customer of customers.data) {
        const sessions = await stripe.checkout.sessions.list({
          customer: customer.id,
          status: "complete",
          limit: 100,
        });

        for (const session of sessions.data) {
          if (await sessionQualifies(session)) {
            hasPro = true;
            verifiedSessionId = session.id;
            break;
          }
        }

        if (hasPro) break;
      }
    }

    if (hasPro) {
      const { error: updateError } = await admin
        .from("profiles")
        .update({ subscription_tier: "pro" })
        .eq("user_id", user.id);

      if (updateError) {
        throw updateError;
      }
    }

    return json({
      isPro: hasPro,
      verifiedSessionId,
    });
  } catch (error) {
    console.error("check-payment error:", error);
    const message =
      error instanceof Error ? error.message : "Unable to verify payment";
    return json({ error: message }, 500);
  }
});
