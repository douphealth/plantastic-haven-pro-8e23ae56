import Stripe from "npm:stripe@^22";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const proPriceId = Deno.env.get("STRIPE_PRO_PRICE_ID");

if (!stripeSecret || !webhookSecret || !supabaseUrl || !serviceRoleKey || !proPriceId) {
  throw new Error("Missing Stripe webhook configuration");
}

const stripe = new Stripe(stripeSecret);
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

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
    console.error("Stripe signature verification failed", error);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (
        session.mode === "payment" &&
        session.payment_status === "paid" &&
        session.metadata?.entitlement === "pro"
      ) {
        const userId =
          session.metadata?.plantastic_user_id ||
          session.client_reference_id;

        if (!userId) {
          throw new Error("Paid Pro session is missing user metadata");
        }

        const expanded = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ["line_items"],
        });

        const hasExpectedPrice =
          expanded.line_items?.data?.some(
            (line) => line.price?.id === proPriceId
          ) ?? false;

        if (!hasExpectedPrice) {
          throw new Error("Paid session does not contain configured Pro price");
        }

        const customerId =
          typeof expanded.customer === "string" ? expanded.customer : null;
        const paymentIntentId =
          typeof expanded.payment_intent === "string"
            ? expanded.payment_intent
            : null;

        const { error: updateError } = await admin
          .from("profiles")
          .update({
            subscription_tier: "pro",
            stripe_customer_id: customerId,
            stripe_payment_intent_id: paymentIntentId,
            pro_purchased_at: new Date(
              event.created * 1000
            ).toISOString(),
          })
          .eq("user_id", userId);

        if (updateError) {
          throw updateError;
        }
      }
    }

    const { error: eventLogError } = await admin
      .from("stripe_webhook_events")
      .upsert(
        {
          event_id: event.id,
          event_type: event.type,
          processed_at: new Date().toISOString(),
        },
        { onConflict: "event_id" }
      );

    if (eventLogError) {
      console.warn("Unable to persist webhook event log", eventLogError);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
});
