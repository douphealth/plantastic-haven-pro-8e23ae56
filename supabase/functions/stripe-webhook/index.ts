import Stripe from "npm:stripe@^22";
import { createClient } from "npm:@supabase/supabase-js@2.102.1";
import {
  PRO_PRICE_FALLBACK,
  evaluateCheckoutSession,
  isKnownProPrice,
} from "../_shared/entitlement.ts";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const PRO_PRICE_ID = Deno.env.get("STRIPE_PRO_PRICE_ID") || PRO_PRICE_FALLBACK;

if (!stripeSecret || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
  throw new Error("Stripe webhook environment is not fully configured");
}

const stripe = new Stripe(stripeSecret);
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const setTier = async (userId: string, tier: "free" | "pro") => {
  const { error } = await admin
    .from("profiles")
    .update({ subscription_tier: tier })
    .eq("user_id", userId);

  if (error) throw error;
};

const paymentIntentUserId = async (
  paymentIntentRef: string | Stripe.PaymentIntent | null
) => {
  if (!paymentIntentRef) return null;

  const paymentIntent =
    typeof paymentIntentRef === "string"
      ? await stripe.paymentIntents.retrieve(paymentIntentRef)
      : paymentIntentRef;

  if (
    paymentIntent.metadata?.entitlement !== "pro" ||
    !isKnownProPrice(paymentIntent.metadata?.price_id, PRO_PRICE_ID)
  ) {
    return null;
  }

  return paymentIntent.metadata?.user_id || null;
};

const grantFromCheckoutSession = async (session: Stripe.Checkout.Session) => {
  if (!session.metadata?.user_id) return;

  const decision = await evaluateCheckoutSession(
    stripe,
    session,
    session.metadata.user_id,
    PRO_PRICE_ID
  );

  if (decision.grant) {
    await setTier(session.metadata.user_id, "pro");
  }
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature") || "";
  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );
  } catch (error) {
    console.error("Stripe signature verification failed:", error);
    return new Response("Invalid signature", { status: 400 });
  }

  const { error: insertError } = await admin
    .from("stripe_webhook_events")
    .insert({ event_id: event.id, event_type: event.type });

  if (insertError?.code === "23505") {
    return Response.json({ received: true, duplicate: true });
  }

  if (insertError) {
    console.error("Stripe webhook idempotency insert failed:", insertError);
    return new Response("Webhook processing failed", { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        await grantFromCheckoutSession(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;

        if (charge.refunded) {
          const userId = await paymentIntentUserId(charge.payment_intent);
          if (userId) await setTier(userId, "free");
        }
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const userId = await paymentIntentUserId(dispute.payment_intent);
        if (userId) await setTier(userId, "free");
        break;
      }

      case "charge.dispute.closed": {
        const dispute = event.data.object as Stripe.Dispute;
        const userId = await paymentIntentUserId(dispute.payment_intent);

        if (userId) {
          const chargeRef = dispute.charge;
          const chargeId =
            typeof chargeRef === "string" ? chargeRef : chargeRef?.id;
          const charge = chargeId
            ? await stripe.charges.retrieve(chargeId)
            : null;
          const restored = dispute.status === "won" && charge?.refunded !== true;
          await setTier(userId, restored ? "pro" : "free");
        }
        break;
      }

      default:
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed:", event.id, error);
    await admin.from("stripe_webhook_events").delete().eq("event_id", event.id);
    return new Response("Webhook processing failed", { status: 500 });
  }
});
