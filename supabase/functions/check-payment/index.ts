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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    const proPriceId = Deno.env.get("STRIPE_PRO_PRICE_ID");

    if (
      !supabaseUrl ||
      !anonKey ||
      !serviceRoleKey ||
      !stripeSecret ||
      !proPriceId
    ) {
      console.error("Missing entitlement configuration");
      return json({ error: "Entitlement service is not configured" }, 503);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const token = authHeader.slice("Bearer ".length);
    const { data: userData, error: userError } =
      await authClient.auth.getUser(token);

    if (userError || !userData.user?.email) {
      return json({ error: "Invalid or expired session" }, 401);
    }

    const user = userData.user;
    const body = await req.json().catch(() => ({}));
    const sessionId =
      typeof body?.sessionId === "string" ? body.sessionId : null;

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("subscription_tier, stripe_customer_id, pro_purchased_at")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("Profile lookup failed", profileError);
      return json({ error: "Unable to load entitlement" }, 500);
    }

    if (profile?.subscription_tier === "pro") {
      return json({
        isPro: true,
        status: "active",
        purchasedAt: profile.pro_purchased_at,
      });
    }

    const stripe = new Stripe(stripeSecret);

    const grantFromSession = async (candidateSessionId: string) => {
      const session = await stripe.checkout.sessions.retrieve(
        candidateSessionId,
        { expand: ["line_items"] }
      );

      const ownsSession =
        session.client_reference_id === user.id ||
        session.metadata?.plantastic_user_id === user.id;

      const hasExpectedPrice =
        session.line_items?.data?.some(
          (line) => line.price?.id === proPriceId
        ) ?? false;

      const paid =
        session.status === "complete" && session.payment_status === "paid";

      if (!ownsSession || !hasExpectedPrice || !paid) {
        return false;
      }

      const customerId =
        typeof session.customer === "string" ? session.customer : null;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null;

      const { error: updateError } = await admin
        .from("profiles")
        .update({
          subscription_tier: "pro",
          stripe_customer_id: customerId,
          stripe_payment_intent_id: paymentIntentId,
          pro_purchased_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) {
        throw updateError;
      }

      return true;
    };

    if (sessionId && (await grantFromSession(sessionId))) {
      return json({ isPro: true, status: "active" });
    }

    const customers = await stripe.customers.list({
      email: user.email,
      limit: 10,
    });

    const ownedCustomers = customers.data.filter(
      (customer) =>
        customer.metadata?.plantastic_user_id === user.id ||
        customer.id === profile?.stripe_customer_id
    );

    for (const customer of ownedCustomers) {
      const sessions = await stripe.checkout.sessions.list({
        customer: customer.id,
        status: "complete",
        limit: 25,
      });

      for (const session of sessions.data) {
        if (
          session.payment_status === "paid" &&
          session.metadata?.entitlement === "pro" &&
          session.metadata?.plantastic_user_id === user.id &&
          (await grantFromSession(session.id))
        ) {
          return json({ isPro: true, status: "active" });
        }
      }
    }

    return json({ isPro: false, status: "free" });
  } catch (error) {
    console.error("check-payment failed", error);
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to verify payment status",
      },
      500
    );
  }
});
