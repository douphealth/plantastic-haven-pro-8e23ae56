export const PRO_PRICE_FALLBACK = "price_1UMt4LByiix0wtyT4iQ0dYbc";

/**
 * Earlier client config referenced this price. New Checkout sessions use only
 * the current server price. Historical sessions with this id can still fulfill
 * or revoke Pro so a price rotation does not strand or permanently entitle
 * someone.
 */
export const LEGACY_PRO_PRICE_IDS = ["price_1TJZHkGCqwm95OGXjymU2Vuw"] as const;

const BLOCKING_DISPUTE_STATUSES = new Set([
  "needs_response",
  "under_review",
  "lost",
  "warning_needs_response",
  "warning_under_review",
]);

export type EntitlementReason =
  | "granted"
  | "incomplete"
  | "unpaid"
  | "owner_mismatch"
  | "zero_amount"
  | "currency"
  | "price_mismatch"
  | "missing_charge"
  | "refunded"
  | "disputed";

export type EntitlementDecision = {
  grant: boolean;
  reason: EntitlementReason;
  ownedByUser: boolean;
};

export type ChargeSnapshot = {
  fullyRefunded: boolean;
  disputed: boolean;
};

export type CheckoutSnapshot = {
  status: string | null | undefined;
  paymentStatus: string | null | undefined;
  metadataUserId: string | null | undefined;
  amountTotal: number | null | undefined;
  currency: string | null | undefined;
  lineItemPriceIds: Array<string | null | undefined>;
  userId: string;
  expectedPriceId: string;
  charge: ChargeSnapshot | null;
};

export function isKnownProPrice(
  priceId: string | null | undefined,
  expectedPriceId: string
): boolean {
  if (!priceId) return false;
  if (priceId === expectedPriceId) return true;
  return (LEGACY_PRO_PRICE_IDS as readonly string[]).includes(priceId);
}

export function disputeBlocksAccess(statuses: string[]): boolean {
  if (statuses.length === 0) return true;
  return statuses.some((status) => BLOCKING_DISPUTE_STATUSES.has(status));
}

export function proEntitlementDecision(
  input: CheckoutSnapshot
): EntitlementDecision {
  const ownedByUser = Boolean(
    input.metadataUserId && input.metadataUserId === input.userId
  );

  if (input.status !== "complete") {
    return { grant: false, reason: "incomplete", ownedByUser };
  }
  if (input.paymentStatus !== "paid") {
    return { grant: false, reason: "unpaid", ownedByUser };
  }
  if (!ownedByUser) {
    return { grant: false, reason: "owner_mismatch", ownedByUser: false };
  }
  if (typeof input.amountTotal !== "number" || input.amountTotal <= 0) {
    return { grant: false, reason: "zero_amount", ownedByUser: true };
  }
  if ((input.currency || "").toLowerCase() !== "usd") {
    return { grant: false, reason: "currency", ownedByUser: true };
  }
  if (
    !input.lineItemPriceIds.some((priceId) =>
      isKnownProPrice(priceId, input.expectedPriceId)
    )
  ) {
    return { grant: false, reason: "price_mismatch", ownedByUser: true };
  }
  if (!input.charge) {
    return { grant: false, reason: "missing_charge", ownedByUser: true };
  }
  if (input.charge.fullyRefunded) {
    return { grant: false, reason: "refunded", ownedByUser: true };
  }
  if (input.charge.disputed) {
    return { grant: false, reason: "disputed", ownedByUser: true };
  }
  return { grant: true, reason: "granted", ownedByUser: true };
}

export function reconcileEntitlements(decisions: EntitlementDecision[]): {
  isPro: boolean;
  revoke: boolean;
} {
  if (decisions.some((decision) => decision.grant)) {
    return { isPro: true, revoke: false };
  }

  const revoke = decisions.some(
    (decision) =>
      decision.ownedByUser &&
      (decision.reason === "refunded" || decision.reason === "disputed")
  );

  return { isPro: false, revoke };
}

type ChargeObject = {
  id: string;
  refunded?: boolean;
  amount?: number;
  amount_refunded?: number;
  disputed?: boolean;
};

export type CheckoutSessionLike = {
  id: string;
  status?: string | null;
  payment_status?: string | null;
  metadata?: { user_id?: string | null; entitlement?: string | null } | null;
  amount_total?: number | null;
  currency?: string | null;
  payment_intent?: string | { id?: string | null } | null;
};

export type StripeEntitlementClient = {
  checkout: {
    sessions: {
      listLineItems: (
        id: string,
        options: { limit: number }
      ) => Promise<{
        data: Array<{ price?: { id?: string | null } | null }>;
      }>;
    };
  };
  paymentIntents: {
    retrieve: (
      id: string,
      options?: { expand?: string[] }
    ) => Promise<{ latest_charge?: string | ChargeObject | null }>;
  };
  disputes: {
    list: (options: {
      charge: string;
      limit: number;
    }) => Promise<{ data: Array<{ status?: string | null }> }>;
  };
};

const paymentIntentId = (session: CheckoutSessionLike): string | null => {
  if (!session.payment_intent) return null;
  if (typeof session.payment_intent === "string") return session.payment_intent;
  return session.payment_intent.id || null;
};

export async function evaluateCheckoutSession(
  stripe: StripeEntitlementClient,
  session: CheckoutSessionLike,
  userId: string,
  expectedPriceId: string
): Promise<EntitlementDecision> {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
  });
  const intentId = paymentIntentId(session);
  let charge: ChargeSnapshot | null = null;

  if (intentId) {
    const paymentIntent = await stripe.paymentIntents.retrieve(intentId, {
      expand: ["latest_charge"],
    });
    const latest = paymentIntent.latest_charge;

    if (latest && typeof latest !== "string") {
      const fullyRefunded =
        latest.refunded === true ||
        (typeof latest.amount === "number" &&
          latest.amount > 0 &&
          typeof latest.amount_refunded === "number" &&
          latest.amount_refunded >= latest.amount);

      let disputed = false;
      if (latest.disputed) {
        const disputes = await stripe.disputes.list({
          charge: latest.id,
          limit: 10,
        });
        disputed = disputeBlocksAccess(
          disputes.data.map((dispute) => dispute.status || "")
        );
      }

      charge = { fullyRefunded, disputed };
    }
  }

  return proEntitlementDecision({
    status: session.status,
    paymentStatus: session.payment_status,
    metadataUserId: session.metadata?.user_id,
    amountTotal: session.amount_total,
    currency: session.currency,
    lineItemPriceIds: lineItems.data.map((item) => item.price?.id),
    userId,
    expectedPriceId,
    charge,
  });
}
