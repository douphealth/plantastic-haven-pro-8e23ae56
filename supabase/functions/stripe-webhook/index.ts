import Stripe from "npm:stripe@^22";
import { createClient } from "npm:@supabase/supabase-js@2.102.1";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const PRO_PRICE_ID =
  Deno.env.get("STRIPE_PRO_PRICE_ID") ||
  "price_1UMt4LByiix0wtyT4iQ0dYbc";

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
    paymentIntent.metadata?.price_id !== PRO_PRICE_ID
  ) {
    return null;
  }

  return paymentIntent.metadata?.user_id || null;
};

const grantFromCheckoutSession = async (
  session: Stripe.Checkout.Session
) => {
  if (
    session.payment_status !== "paid" ||
    session.metadata?.entitlement !== "pro" ||
    !session.metadata?.user_id
  ) {
    return;
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
  });

  const hasProLineItem = lineItems.data.some(
    (item) => item.price?.id === PRO_PRICE_ID
  );

  if (!hasProLineItem) return;

  await setTier(session.metadata.user_id, "pro");
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

  try {
    const { data: alreadyProcessed } = await admin
      .from("stripe_webhook_events")
      .select("event_id")
      .eq("event_id", event.id)
      .maybeSingle();

    if (alreadyProcessed) {
      return Response.json({ received: true, duplicate: true });
    }

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
          await setTier(userId, dispute.status === "won" ? "pro" : "free");
        }
        break;
      }

      default:
        break;
    }

    const { error: logError } = await admin
      .from("stripe_webhook_events")
      .insert({ event_id: event.id, event_type: event.type });

    if (logError && logError.code !== "23505") {
      throw logError;
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed:", event.id, error);
    return new Response("Webhook processing failed", { status: 500 });
  }
});
