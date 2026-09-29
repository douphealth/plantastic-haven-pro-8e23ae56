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
  });

  it("verifies payment, user ownership, and the exact Pro line item", () => {
    const source = read("supabase/functions/check-payment/index.ts");

    expect(source).toContain('session.payment_status !== "paid"');
    expect(source).toContain("session.metadata?.user_id !== user.id");
    expect(source).toContain("item.price?.id === PRO_PRICE_ID");
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

  it("prevents clients from editing the entitlement column", () => {
    const migration = read(
      "supabase/migrations/20260929190000_lock_profile_entitlements.sql"
    );

    expect(migration).toContain(
      "REVOKE UPDATE ON TABLE public.profiles FROM authenticated"
    );
    expect(migration).toContain(
      "GRANT UPDATE (display_name, avatar_url) ON TABLE public.profiles TO authenticated"
    );
  });
});
