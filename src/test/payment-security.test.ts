import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("payment and entitlement security invariants", () => {
  it("does not ship guest-mode authentication or mocked payment responses", () => {
    const client = read("src/integrations/supabase/client.ts");
    const auth = read("src/contexts/AuthContext.tsx");

    expect(client).not.toContain("mock-token");
    expect(client).not.toContain('functionName === "check-payment"');
    expect(client).not.toContain('functionName === "create-payment"');
    expect(auth).not.toContain("GUEST_SESSION");
    expect(auth).not.toContain("Premium Guest Gardener");
  });

  it("creates checkout with a server-controlled Pro price", () => {
    const source = read("supabase/functions/create-payment/index.ts");

    expect(source).toContain("PRO_PRICE_ID");
    expect(source).toContain("line_items: [{ price: PRO_PRICE_ID");
    expect(source).not.toContain("const { priceId }");
    expect(source).toContain('metadata: {');
    expect(source).toContain('entitlement: "pro"');
    expect(source).toContain('customer_creation: customerId ? undefined : "always"');
  });

  it("verifies payment, user ownership, and the exact Pro line item", () => {
    const source = read("supabase/functions/check-payment/index.ts");

    expect(source).toContain("evaluateCheckoutSession");
    expect(source).toContain("reconcileEntitlements");
    expect(source).not.toContain("error instanceof Error ? error.message");
  });

  it("protects paid application routes", () => {
    const app = read("src/App.tsx");

    for (const route of [
      "/dashboard",
      "/my-garden",
      "/care-calendar",
      "/plant-identifier",
      "/community",
      "/email-sequences",
    ]) {
      expect(app).toContain(`path="${route}"`);
    }
    expect(app).toContain("<PremiumRoute>");
  });

  it("uses a signed Stripe webhook for asynchronous entitlement lifecycle", () => {
    const source = read("supabase/functions/stripe-webhook/index.ts");
    const config = read("supabase/config.toml");

    expect(source).toContain("stripe_webhook_events");
    expect(source).toContain("duplicate: true");
    expect(source).toContain("constructEventAsync");
    expect(source).toContain('req.headers.get("stripe-signature")');
    expect(source).toContain('"checkout.session.async_payment_succeeded"');
    expect(source).toContain('"charge.refunded"');
    expect(source).toContain('"charge.dispute.created"');
    expect(config).toContain("[functions.stripe-webhook]");
    expect(config).toContain("verify_jwt = false");
  });

  it("requires Pro inside the paid AI edge function", () => {
    const source = read("supabase/functions/plant-identifier/index.ts");

    expect(source).toContain('auth.getUser()');
    expect(source).toContain('profile?.subscription_tier !== "pro"');
    expect(source).toContain('code: "PRO_REQUIRED"');
    expect(source).toContain('code: "RATE_LIMIT"');
    expect(source).not.toContain("OPENAI_API_KEY or AI_API_KEY is not configured");
  });

  it("does not pretend to send care-sequence email", () => {
    const source = read("src/pages/EmailSequences.tsx");
    expect(source).toContain("Nothing here sends email");
    expect(source).not.toContain("Test Email Dispatched");
    expect(source).not.toContain("Simulate Urgent");
  });

  it("keeps the displayed Pro price aligned with the server fallback", () => {
    const config = read("src/lib/stripe-config.ts");
    const shared = read("supabase/functions/_shared/entitlement.ts");
    expect(config).toContain("price_1UMt4LByiix0wtyT4iQ0dYbc");
    expect(shared).toContain("price_1UMt4LByiix0wtyT4iQ0dYbc");
    expect(shared).toContain("price_1TJZHkGCqwm95OGXjymU2Vuw");
  });

  it("prevents clients from editing the entitlement column", () => {
    const migration = read(
      "supabase/migrations/20260929190000_lock_profile_entitlements.sql"
    );

    expect(migration).toContain(
      "REVOKE INSERT, UPDATE ON TABLE public.profiles FROM authenticated"
    );
    expect(migration).toContain(
      "GRANT UPDATE (display_name, avatar_url) ON TABLE public.profiles TO authenticated"
    );
  });
});
