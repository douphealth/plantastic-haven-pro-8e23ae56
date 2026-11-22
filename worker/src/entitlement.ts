// Pure entitlement rules. Stripe is the system of record: Pro exists only while a
// completed, paid, USD Checkout Session for the Pro price has a charge that is not
// fully refunded and not under a blocking dispute.

export const BLOCKING_DISPUTE_STATUSES = new Set([
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
  | "zero_amount"
  | "currency"
  | "price_mismatch"
  | "missing_charge"
  | "refunded"
  | "disputed";

export type ChargeLike = {
  id?: string;
  refunded?: boolean | null;
  amount?: number | null;
  amount_refunded?: number | null;
  disputed?: boolean | null;
};

export type SessionLike = {
  id: string;
  status?: string | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
  line_items?: { data?: Array<{ price?: { id?: string | null } | null }> } | null;
  payment_intent?:
    | string
    | { id?: string | null; latest_charge?: string | ChargeLike | null }
    | null;
};

export function sessionEmail(session: SessionLike): string {
  return (session.customer_details?.email || session.customer_email || "")
    .trim()
    .toLowerCase();
}

export function chargeOf(session: SessionLike): ChargeLike | null {
  const pi = session.payment_intent;
  if (!pi || typeof pi === "string") return null;
  const charge = pi.latest_charge;
  if (!charge || typeof charge === "string") return null;
  return charge;
}

export function isFullyRefunded(charge: ChargeLike): boolean {
  if (charge.refunded === true) return true;
  return (
    typeof charge.amount === "number" &&
    charge.amount > 0 &&
    typeof charge.amount_refunded === "number" &&
    charge.amount_refunded >= charge.amount
  );
}

export function disputeBlocksAccess(statuses: string[]): boolean {
  // A disputed charge whose disputes cannot be listed is treated as blocking.
  if (statuses.length === 0) return true;
  return statuses.some((status) => BLOCKING_DISPUTE_STATUSES.has(status));
}

export function decideEntitlement(
  session: SessionLike,
  priceIds: readonly string[],
  disputeStatuses: string[] | null
): EntitlementReason {
  if (session.status !== "complete") return "incomplete";
  if (session.payment_status !== "paid") return "unpaid";
  if (typeof session.amount_total !== "number" || session.amount_total <= 0) {
    return "zero_amount";
  }
  if ((session.currency || "").toLowerCase() !== "usd") return "currency";
  const lineItems = session.line_items?.data || [];
  if (!lineItems.some((item) => item.price?.id && priceIds.includes(item.price.id))) {
    return "price_mismatch";
  }
  const charge = chargeOf(session);
  if (!charge) return "missing_charge";
  if (isFullyRefunded(charge)) return "refunded";
  if (charge.disputed && disputeBlocksAccess(disputeStatuses || [])) {
    return "disputed";
  }
  return "granted";
}
