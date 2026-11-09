import { describe, expect, it } from "vitest";
import {
  evaluateCheckoutSession,
  proEntitlementDecision,
  reconcileEntitlements,
  type CheckoutSessionLike,
  type StripeEntitlementClient,
} from "../../supabase/functions/_shared/entitlement";

const paidSession = (
  overrides: Partial<CheckoutSessionLike> = {}
): CheckoutSessionLike => ({
  id: "cs_test_123",
  status: "complete",
  payment_status: "paid",
  metadata: { user_id: "user-1", entitlement: "pro" },
  amount_total: 799,
  currency: "usd",
  payment_intent: "pi_123",
  ...overrides,
});

const baseDecision = {
  status: "complete",
  paymentStatus: "paid",
  metadataUserId: "user-1",
  amountTotal: 799,
  currency: "usd",
  lineItemPriceIds: ["price_1UMt4LByiix0wtyT4iQ0dYbc"],
  userId: "user-1",
  expectedPriceId: "price_1UMt4LByiix0wtyT4iQ0dYbc",
  charge: { fullyRefunded: false, disputed: false },
};

describe("pro entitlement decisions", () => {
  it("grants a paid, owned, unrefunded Pro checkout", () => {
    expect(proEntitlementDecision(baseDecision)).toMatchObject({
      grant: true,
      reason: "granted",
    });
  });

  it("does not grant another user's session", () => {
    expect(
      proEntitlementDecision({ ...baseDecision, metadataUserId: "user-2" })
    ).toMatchObject({ grant: false, reason: "owner_mismatch", ownedByUser: false });
  });

  it("does not grant a refunded or disputed charge", () => {
    expect(
      proEntitlementDecision({
        ...baseDecision,
        charge: { fullyRefunded: true, disputed: false },
      }).reason
    ).toBe("refunded");
    expect(
      proEntitlementDecision({
        ...baseDecision,
        charge: { fullyRefunded: false, disputed: true },
      }).reason
    ).toBe("disputed");
  });

  it("still accepts the legacy Pro price id", () => {
    expect(
      proEntitlementDecision({
        ...baseDecision,
        lineItemPriceIds: ["price_1TJZHkGCqwm95OGXjymU2Vuw"],
      }).grant
    ).toBe(true);
  });

  it("revokes when the only owned checkout was refunded", () => {
    expect(
      reconcileEntitlements([
        {
          grant: false,
          reason: "refunded",
          ownedByUser: true,
        },
      ])
    ).toEqual({ isPro: false, revoke: true });
  });

  it("keeps Pro when a later checkout is still paid", () => {
    expect(
      reconcileEntitlements([
        { grant: false, reason: "refunded", ownedByUser: true },
        { grant: true, reason: "granted", ownedByUser: true },
      ])
    ).toEqual({ isPro: true, revoke: false });
  });
});

describe("evaluateCheckoutSession", () => {
  it("reads the charge and refuses a full refund", async () => {
    const stripe: StripeEntitlementClient = {
      checkout: {
        sessions: {
          listLineItems: async () => ({
            data: [{ price: { id: "price_1UMt4LByiix0wtyT4iQ0dYbc" } }],
          }),
        },
      },
      paymentIntents: {
        retrieve: async () => ({
          latest_charge: {
            id: "ch_123",
            refunded: true,
            amount: 799,
            amount_refunded: 799,
            disputed: false,
          },
        }),
      },
      disputes: { list: async () => ({ data: [] }) },
    };

    const decision = await evaluateCheckoutSession(
      stripe,
      paidSession(),
      "user-1",
      "price_1UMt4LByiix0wtyT4iQ0dYbc"
    );

    expect(decision).toMatchObject({ grant: false, reason: "refunded" });
  });

  it("allows a won dispute and blocks an open one", async () => {
    const disputes = { status: "won" };
    const stripe: StripeEntitlementClient = {
      checkout: {
        sessions: {
          listLineItems: async () => ({
            data: [{ price: { id: "price_1UMt4LByiix0wtyT4iQ0dYbc" } }],
          }),
        },
      },
      paymentIntents: {
        retrieve: async () => ({
          latest_charge: {
            id: "ch_123",
            refunded: false,
            amount: 799,
            amount_refunded: 0,
            disputed: true,
          },
        }),
      },
      disputes: { list: async () => ({ data: [disputes] }) },
    };

    await expect(
      evaluateCheckoutSession(
        stripe,
        paidSession(),
        "user-1",
        "price_1UMt4LByiix0wtyT4iQ0dYbc"
      )
    ).resolves.toMatchObject({ grant: true });

    disputes.status = "needs_response";
    await expect(
      evaluateCheckoutSession(
        stripe,
        paidSession(),
        "user-1",
        "price_1UMt4LByiix0wtyT4iQ0dYbc"
      )
    ).resolves.toMatchObject({ grant: false, reason: "disputed" });
  });
});
