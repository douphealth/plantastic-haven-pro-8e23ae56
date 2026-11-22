import { describe, expect, it } from "vitest";
import { decideEntitlement, disputeBlocksAccess, sessionEmail, type SessionLike } from "../../worker/src/entitlement";
import { signToken, verifyToken } from "../../worker/src/tokens";

const PRICE = "price_1TJZHkGCqwm95OGXjymU2Vuw";
const SECRET = "x".repeat(48);

const paid = (overrides: Partial<SessionLike> = {}, charge: Record<string, unknown> = {}): SessionLike => ({
  id: "cs_live_abc123def456",
  status: "complete",
  payment_status: "paid",
  amount_total: 799,
  currency: "usd",
  customer_details: { email: "Buyer@Example.com" },
  line_items: { data: [{ price: { id: PRICE } }] },
  payment_intent: {
    id: "pi_1",
    latest_charge: { id: "ch_1", amount: 799, amount_refunded: 0, refunded: false, disputed: false, ...charge },
  },
  ...overrides,
});

describe("Pro entitlement decisions", () => {
  it("grants a completed, paid, USD Pro checkout with a live charge", () => {
    expect(decideEntitlement(paid(), [PRICE], null)).toBe("granted");
    expect(sessionEmail(paid())).toBe("buyer@example.com");
  });

  it("refuses unfinished, unpaid, free, foreign-currency and wrong-product sessions", () => {
    expect(decideEntitlement(paid({ status: "open" }), [PRICE], null)).toBe("incomplete");
    expect(decideEntitlement(paid({ payment_status: "unpaid" }), [PRICE], null)).toBe("unpaid");
    expect(decideEntitlement(paid({ amount_total: 0 }), [PRICE], null)).toBe("zero_amount");
    expect(decideEntitlement(paid({ currency: "eur" }), [PRICE], null)).toBe("currency");
    expect(
      decideEntitlement(paid({ line_items: { data: [{ price: { id: "price_other" } }] } }), [PRICE], null)
    ).toBe("price_mismatch");
    expect(decideEntitlement(paid({ payment_intent: "pi_unexpanded" }), [PRICE], null)).toBe("missing_charge");
  });

  it("revokes after a full refund but not a partial one", () => {
    expect(decideEntitlement(paid({}, { refunded: true, amount_refunded: 799 }), [PRICE], null)).toBe("refunded");
    expect(decideEntitlement(paid({}, { amount_refunded: 799 }), [PRICE], null)).toBe("refunded");
    expect(decideEntitlement(paid({}, { amount_refunded: 200 }), [PRICE], null)).toBe("granted");
  });

  it("pauses during open or lost disputes and restores after a won dispute", () => {
    expect(decideEntitlement(paid({}, { disputed: true }), [PRICE], ["needs_response"])).toBe("disputed");
    expect(decideEntitlement(paid({}, { disputed: true }), [PRICE], ["lost"])).toBe("disputed");
    expect(decideEntitlement(paid({}, { disputed: true }), [PRICE], ["won"])).toBe("granted");
    expect(disputeBlocksAccess([])).toBe(true);
  });

  it("accepts a legacy price only when it is configured", () => {
    const legacy = paid({ line_items: { data: [{ price: { id: "price_legacy" } }] } });
    expect(decideEntitlement(legacy, [PRICE], null)).toBe("price_mismatch");
    expect(decideEntitlement(legacy, [PRICE, "price_legacy"], null)).toBe("granted");
  });
});

const b64url = (value: string) => btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

describe("signed license and restore tokens", () => {
  it("round-trips a license and rejects tampering or the wrong secret", async () => {
    const token = await signToken({ typ: "license", sid: "cs_live_abc", email: "a@b.co", iat: 1 }, SECRET);
    expect(await verifyToken(token, SECRET, "license")).toMatchObject({ sid: "cs_live_abc", email: "a@b.co" });
    expect(await verifyToken(token, "y".repeat(48), "license")).toBeNull();
    const [, sig] = token.split(".");
    const forged = b64url(JSON.stringify({ typ: "license", sid: "cs_live_other", email: "a@b.co", iat: 1 }));
    expect(await verifyToken(forged + "." + sig, SECRET, "license")).toBeNull();
    expect(await verifyToken("garbage", SECRET, "license")).toBeNull();
  });

  it("does not accept a license as a restore link, and expires restore links", async () => {
    const license = await signToken({ typ: "license", sid: "cs_live_abc", email: "a@b.co", iat: 1 }, SECRET);
    expect(await verifyToken(license, SECRET, "restore")).toBeNull();
    const restore = await signToken({ typ: "restore", sid: "cs_live_abc", email: "a@b.co", exp: 1000 }, SECRET);
    expect(await verifyToken(restore, SECRET, "restore", 999)).not.toBeNull();
    expect(await verifyToken(restore, SECRET, "restore", 1001)).toBeNull();
  });

  it("refuses to sign with a missing or short secret", async () => {
    await expect(signToken({ typ: "license", sid: "cs_x", email: "a@b.co", iat: 1 }, "short")).rejects.toThrow();
  });
});
