import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import {
  PRO_PRICE_FALLBACK,
  evaluateCheckoutSession,
  reconcileEntitlements,
  type EntitlementDecision,
} from "../_shared/entitlement.ts";

const PRO_PRICE_ID = Deno.env.get("STRIPE_PRO_PRICE_ID") || PRO_PRICE_FALLBACK;

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

    const decisions: EntitlementDecision[] = [];
    let verifiedSessionId: string | null = null;

    const consider = async (session: Stripe.Checkout.Session) => {
      const decision = await evaluateCheckoutSession(
        stripe,
        session,
        user.id,
        PRO_PRICE_ID
      );
      decisions.push(decision);
      if (decision.grant && !verifiedSessionId) {
        verifiedSessionId = session.id;
      }
      return decision.grant;
    };

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const granted = await consider(session);
      if (granted) {
        decisions.splice(0, decisions.length, decisions[decisions.length - 1]);
      }
    }

    if (!verifiedSessionId) {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 5,
      });

      for (const customer of customers.data) {
        const sessions = await stripe.checkout.sessions.list({
          customer: customer.id,
          status: "complete",
          limit: 20,
        });

        for (const session of sessions.data) {
          if (await consider(session)) break;
        }

        if (verifiedSessionId) break;
      }
    }

    const outcome = reconcileEntitlements(decisions);

    if (outcome.isPro) {
      const { error: updateError } = await admin
        .from("profiles")
        .update({ subscription_tier: "pro" })
        .eq("user_id", user.id);

      if (updateError) throw updateError;
    } else if (outcome.revoke) {
      const { error: updateError } = await admin
        .from("profiles")
        .update({ subscription_tier: "free" })
        .eq("user_id", user.id);

      if (updateError) throw updateError;
    }

    return json({
      isPro: outcome.isPro,
      verifiedSessionId: outcome.isPro ? verifiedSessionId : null,
    });
  } catch (error) {
    console.error("check-payment error:", error);
    return json({ error: "Unable to verify payment" }, 500);
  }
});
