import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === "test" ? [] : sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });

describe("payment and entitlement security invariants", () => {
  it("never grants Pro from a client-side flag", () => {
    for (const file of sourceFiles("src")) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/setItem\(\s*["']procare_pro["']/);
      expect(source, file).not.toContain("GUEST_SESSION");
      expect(source, file).not.toContain('subscription_tier: "pro"');
    }
    // Pro in the UI is derived only from the server-signed license.
    expect(read("src/lib/localDb.ts")).toContain('subscription_tier: license ? "pro" : "free"');
  });

  it("no longer depends on the retired Supabase project", () => {
    expect(existsSync("src/integrations/supabase")).toBe(false);
    for (const file of sourceFiles("src")) {
      expect(readFileSync(file, "utf8"), file).not.toContain("sesleusxaskzjtlifzgp");
    }
    expect(read("package.json")).not.toContain("@supabase/supabase-js");
  });

  it("creates checkout on the server with the configured Pro price only", () => {
    const worker = read("worker/src/index.ts");
    const config = read("wrangler.jsonc");
    expect(worker).toContain('"line_items[0][price]": env.STRIPE_PRICE_ID');
    expect(worker).not.toMatch(/body\.(price|priceId|amount)/);
    expect(config).toContain('"STRIPE_PRICE_ID": "price_1TJZHkGCqwm95OGXjymU2Vuw"');
    expect(read("src/lib/stripe-config.ts")).toContain("price_1TJZHkGCqwm95OGXjymU2Vuw");
  });

  it("keeps Stripe and email secrets out of the bundle and the repo", () => {
    for (const file of [...sourceFiles("src"), ...sourceFiles("worker"), "wrangler.jsonc"]) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/\b(sk|rk)_(live|test)_[A-Za-z0-9]{10,}/);
      expect(source, file).not.toMatch(/xkeysib-[a-f0-9]{20,}/);
    }
  });

  it("re-checks Stripe before the paid AI identifier runs", () => {
    const worker = read("worker/src/index.ts");
    const identify = worker.slice(worker.indexOf("async function identify"));
    expect(identify).toContain('verifyToken(body.license, env.LICENSE_SECRET, "license")');
    expect(identify).toContain("await evaluate(env, await loadSession(env, license.sid))");
    expect(identify).toContain('"PRO_REQUIRED"');
    expect(identify).toContain('"RATE_LIMIT"');
  });

  it("does not reveal whether an email bought Pro from the restore form", () => {
    const worker = read("worker/src/index.ts");
    const restore = worker.slice(
      worker.indexOf("async function restore("),
      worker.indexOf("async function restoreConfirm")
    );
    expect(restore).toContain("return json({ ok: true });");
    expect(restore).not.toContain("isPro");
  });

  it("protects paid application routes", () => {
    const app = read("src/App.tsx");
    for (const route of ["/dashboard", "/my-garden", "/care-calendar", "/plant-identifier", "/email-sequences"]) {
      expect(app).toContain(`path="${route}"`);
    }
    expect(app).toContain("<PremiumRoute>");
  });

  it("does not pretend to send care-sequence email", () => {
    const source = read("src/pages/EmailSequences.tsx");
    expect(source).toContain("Nothing here sends email");
    expect(source).not.toContain("Test Email Dispatched");
    expect(source).not.toContain("Simulate Urgent");
  });
});
