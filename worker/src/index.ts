// procare.plantastichaven.com — static app + payment/identifier API in one Worker.
// Stripe is the only system of record for Pro. No database, no third-party auth.
import { decideEntitlement, sessionEmail, chargeOf, type SessionLike } from "./entitlement";
import { signToken, verifyToken } from "./tokens";

type Fetcher = { fetch: (request: Request) => Promise<Response> };
type Ai = { run: (model: string, input: unknown) => Promise<any> };

export interface Env {
  ASSETS: Fetcher;
  AI?: Ai;
  STRIPE_SECRET_KEY: string;
  LICENSE_SECRET: string;
  BREVO_API_KEY?: string;
  STRIPE_PRICE_ID: string;
  LEGACY_PRICE_IDS?: string;
  APP_URL: string;
  RESTORE_FROM_EMAIL?: string;
}

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
const RESTORE_TTL_MS = 60 * 60 * 1000;
const IDENTIFY_DAILY_LIMIT = 25;

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extra,
    },
  });

const fail = (message: string, status: number, code?: string) =>
  json({ error: message, ...(code ? { code } : {}) }, status);

class StripeError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function form(params: Record<string, string | number | undefined>): string {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) body.append(key, String(value));
  }
  return body.toString();
}

async function stripe(env: Env, method: "GET" | "POST", path: string, params: Record<string, string | number | undefined> = {}) {
  if (!env.STRIPE_SECRET_KEY) throw new StripeError(500, "Stripe is not configured");
  const encoded = form(params);
  const url = "https://api.stripe.com/v1" + path + (method === "GET" && encoded ? "?" + encoded : "");
  const response = await fetch(url, {
    method,
    headers: {
      authorization: "Bearer " + env.STRIPE_SECRET_KEY,
      "content-type": "application/x-www-form-urlencoded",
      "stripe-version": "2025-08-27.basil",
    },
    body: method === "POST" ? encoded : undefined,
  });
  const data: any = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new StripeError(response.status, data?.error?.message || "Stripe request failed");
  }
  return data;
}

const priceIds = (env: Env) => [
  env.STRIPE_PRICE_ID,
  ...(env.LEGACY_PRICE_IDS || "").split(",").map((id) => id.trim()).filter(Boolean),
];

const appUrl = (env: Env) => (env.APP_URL || "https://procare.plantastichaven.com").replace(/\/$/, "");

async function loadSession(env: Env, sessionId: string): Promise<SessionLike> {
  return stripe(env, "GET", "/checkout/sessions/" + encodeURIComponent(sessionId), {
    "expand[0]": "line_items",
    "expand[1]": "payment_intent.latest_charge",
  });
}

async function evaluate(env: Env, session: SessionLike) {
  const charge = chargeOf(session);
  let disputes: string[] | null = null;
  if (charge?.disputed && charge.id) {
    const list = await stripe(env, "GET", "/disputes", { charge: charge.id, limit: 10 });
    disputes = (list.data || []).map((d: any) => String(d.status || ""));
  }
  const reason = decideEntitlement(session, priceIds(env), disputes);
  return { granted: reason === "granted", reason, email: sessionEmail(session) };
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  if (request.method !== "POST") throw new StripeError(405, "Method not allowed");
  const length = Number(request.headers.get("content-length") || "0");
  if (length > 2_500_000) throw new StripeError(413, "Request too large");
  const body = await request.json().catch(() => null);
  return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && EMAIL_RE.test(email) ? email : null;
}

// Paid Pro sessions for an email (checks the exact and lowercase spellings Stripe may hold).
async function findPaidSession(env: Env, email: string): Promise<SessionLike | null> {
  const seen = new Set<string>();
  for (const candidate of new Set([email, email.toLowerCase()])) {
    const list = await stripe(env, "GET", "/checkout/sessions", {
      "customer_details[email]": candidate,
      status: "complete",
      limit: 20,
    });
    for (const summary of list.data || []) {
      if (seen.has(summary.id) || summary.payment_status !== "paid") continue;
      seen.add(summary.id);
      const session = await loadSession(env, summary.id);
      if ((await evaluate(env, session)).granted) return session;
    }
  }
  return null;
}

async function issueLicense(env: Env, session: SessionLike, email: string) {
  return signToken({ typ: "license", sid: session.id, email, iat: Date.now() }, env.LICENSE_SECRET);
}

async function sendRestoreEmail(env: Env, email: string, link: string) {
  if (!env.BREVO_API_KEY) throw new StripeError(503, "Email delivery is not configured");
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1f2d1f;line-height:1.5">
<p>Hi,</p>
<p>Use the button below to unlock PlantasticHaven Pro on this device. The link works for one hour.</p>
<p><a href="${link}" style="display:inline-block;background:#2f6b3a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Unlock Pro on this device</a></p>
<p>If you did not ask for this, you can ignore this email. Nobody can use the link without access to your inbox.</p>
<p>PlantasticHaven</p></body></html>`;
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "content-type": "application/json", "api-key": env.BREVO_API_KEY },
    body: JSON.stringify({
      sender: { name: "PlantasticHaven", email: env.RESTORE_FROM_EMAIL || "info@plantastichaven.com" },
      to: [{ email }],
      subject: "Your PlantasticHaven Pro access link",
      htmlContent: html,
      textContent:
        "Use this link to unlock PlantasticHaven Pro on this device. It works for one hour:\n\n" +
        link +
        "\n\nIf you did not ask for this, you can ignore this email.\n\nPlantasticHaven",
      tags: ["procare-restore"],
    }),
  });
  if (!response.ok) {
    console.error("brevo restore email failed", response.status, (await response.text()).slice(0, 300));
    throw new StripeError(502, "We could not send the email. Please try again in a few minutes.");
  }
}

// ---------- route handlers ----------

async function checkout(request: Request, env: Env) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  if (!email) return fail("Enter a valid email address. Your Pro access is tied to it.", 400);

  const existing = await findPaidSession(env, email);
  if (existing) {
    const token = await signToken(
      { typ: "restore", sid: existing.id, email, exp: Date.now() + RESTORE_TTL_MS },
      env.LICENSE_SECRET
    );
    await sendRestoreEmail(env, email, appUrl(env) + "/restore?token=" + encodeURIComponent(token));
    return fail(
      "This email already has Pro. We sent you a link to unlock it on this device. No new charge was made.",
      409,
      "ALREADY_PRO"
    );
  }

  const meta = { app: "plantastic-procare", entitlement: "pro" };
  const session = await stripe(env, "POST", "/checkout/sessions", {
    mode: "payment",
    "line_items[0][price]": env.STRIPE_PRICE_ID,
    "line_items[0][quantity]": 1,
    customer_email: email,
    customer_creation: "always",
    allow_promotion_codes: "false",
    success_url: appUrl(env) + "/payment-success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: appUrl(env) + "/settings?checkout=cancelled",
    "metadata[app]": meta.app,
    "metadata[entitlement]": meta.entitlement,
    "payment_intent_data[metadata][app]": meta.app,
    "payment_intent_data[metadata][entitlement]": meta.entitlement,
    "payment_intent_data[description]": "PlantasticHaven Pro (lifetime)",
  });
  if (!session.url) return fail("Stripe did not return a checkout page. Please try again.", 502);
  return json({ url: session.url });
}

async function verify(request: Request, env: Env) {
  const body = await readJson(request);
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(sessionId)) {
    return fail("Missing or invalid checkout reference.", 400);
  }
  let session: SessionLike;
  try {
    session = await loadSession(env, sessionId);
  } catch (error) {
    if (error instanceof StripeError && error.status === 404) return json({ isPro: false, reason: "not_found" });
    throw error;
  }
  const result = await evaluate(env, session);
  if (!result.granted) return json({ isPro: false, reason: result.reason });
  return json({ isPro: true, email: result.email, license: await issueLicense(env, session, result.email) });
}

async function entitlement(request: Request, env: Env) {
  const body = await readJson(request);
  const license = await verifyToken(body.license, env.LICENSE_SECRET, "license");
  if (!license) return json({ isPro: false, reason: "invalid_license" });
  const result = await evaluate(env, await loadSession(env, license.sid));
  return json({ isPro: result.granted, reason: result.reason, email: license.email });
}

async function restore(request: Request, env: Env) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  if (!email) return fail("Enter the email you used at checkout.", 400);
  const session = await findPaidSession(env, email);
  if (session) {
    const token = await signToken(
      { typ: "restore", sid: session.id, email, exp: Date.now() + RESTORE_TTL_MS },
      env.LICENSE_SECRET
    );
    await sendRestoreEmail(env, email, appUrl(env) + "/restore?token=" + encodeURIComponent(token));
  }
  // Same answer either way so the form cannot be used to look up who bought Pro.
  return json({ ok: true });
}

async function restoreConfirm(request: Request, env: Env) {
  const body = await readJson(request);
  const token = await verifyToken(body.token, env.LICENSE_SECRET, "restore");
  if (!token) return fail("This link has expired or is not valid. Request a new one.", 400, "EXPIRED");
  const session = await loadSession(env, token.sid);
  const result = await evaluate(env, session);
  if (!result.granted) return json({ isPro: false, reason: result.reason });
  return json({ isPro: true, email: token.email, license: await issueLicense(env, session, token.email) });
}

// ---------- AI identifier (Workers AI) ----------

const IDENTIFY_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    scientific_name: { type: "string" },
    description: { type: "string" },
    care_tips: { type: "array", items: { type: "string" } },
    toxicity: { type: "string" },
    difficulty: { type: "string", enum: ["Easy", "Moderate", "Hard", "Expert"] },
    light: { type: "string" },
    water: { type: "string" },
  },
  required: ["name", "scientific_name", "description", "care_tips", "toxicity", "difficulty", "light", "water"],
};

const SYSTEM_PROMPT =
  "You are a careful botanist. Identify the houseplant from the evidence given. " +
  "Reply with JSON only, matching the schema. When the evidence is weak, say so plainly in the description " +
  "and give the most likely match. Keep care tips short and practical. Never claim certainty you do not have.";

function parseModelJson(output: any): Record<string, unknown> | null {
  const raw = output?.response ?? output?.result?.response ?? output;
  if (raw && typeof raw === "object") return raw;
  if (typeof raw !== "string") return null;
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function dailyCount(key: string, increment: boolean): Promise<number> {
  const cache = (caches as any).default as Cache;
  const url = "https://procare-ratelimit.internal/" + encodeURIComponent(key);
  const hit = await cache.match(url);
  const count = hit ? Number(await hit.text()) || 0 : 0;
  if (increment) {
    await cache.put(url, new Response(String(count + 1), { headers: { "cache-control": "max-age=90000" } }));
  }
  return count;
}

async function identify(request: Request, env: Env) {
  const body = await readJson(request);
  const license = await verifyToken(body.license, env.LICENSE_SECRET, "license");
  if (!license) return fail("Plant identifier requires PlantasticHaven Pro.", 403, "PRO_REQUIRED");
  const ent = await evaluate(env, await loadSession(env, license.sid));
  if (!ent.granted) return fail("Plant identifier requires PlantasticHaven Pro.", 403, "PRO_REQUIRED");
  if (!env.AI) return fail("Plant identifier is temporarily unavailable.", 503);

  const description = typeof body.description === "string" ? body.description.trim() : "";
  const image = typeof body.image === "string" ? body.image.trim() : "";
  if (description.length > 2000) return fail("Please keep the description under 2000 characters.", 400);
  if (image && (!/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image) || image.length > 1_800_000)) {
    return fail("Use a JPEG, PNG, or WebP photo under about 1 MB.", 400);
  }
  if (!description && !image) return fail("Add a photo or a short description of the plant.", 400);

  const day = new Date().toISOString().slice(0, 10);
  const counterKey = license.sid + ":" + day;
  if ((await dailyCount(counterKey, false)) >= IDENTIFY_DAILY_LIMIT) {
    return fail("Daily identification limit reached. Try again tomorrow.", 429, "RATE_LIMIT");
  }

  const prompt = image
    ? "Identify this plant from the photo." + (description ? " Owner's notes: " + description : "")
    : "Identify this plant: " + description;

  let parsed: Record<string, unknown> | null = null;
  try {
    const content = image
      ? [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: image } }]
      : prompt;
    const output = await env.AI.run("@cf/meta/llama-4-scout-17b-16e-instruct", {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content },
      ],
      response_format: { type: "json_schema", json_schema: IDENTIFY_SCHEMA },
      max_tokens: 900,
    });
    parsed = parseModelJson(output);
  } catch (error) {
    console.error("identify: primary model failed", String(error).slice(0, 300));
  }

  if (!parsed && image) {
    // Fallback: describe the photo, then identify from the description.
    try {
      const bytes = Uint8Array.from(atob(image.split(",")[1]), (c) => c.charCodeAt(0));
      const seen = await env.AI.run("@cf/llava-hf/llava-1.5-7b-hf", {
        image: [...bytes],
        prompt: "Describe this plant's leaves, stems, shape, colours and pattern in detail.",
        max_tokens: 300,
      });
      const observed = String(seen?.description || seen?.response || "");
      const output = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: "Identify this plant. Photo description: " + observed + (description ? " Owner's notes: " + description : "") },
        ],
        response_format: { type: "json_schema", json_schema: IDENTIFY_SCHEMA },
        max_tokens: 900,
      });
      parsed = parseModelJson(output);
    } catch (error) {
      console.error("identify: fallback failed", String(error).slice(0, 300));
    }
  }

  if (!parsed || typeof parsed.name !== "string" || !parsed.name.trim()) {
    return fail("The identifier could not name a plant. Try a clearer photo or add a description.", 502);
  }
  await dailyCount(counterKey, true);

  const text = (value: unknown) => (typeof value === "string" ? value : "");
  return json({
    name: parsed.name,
    scientific_name: text(parsed.scientific_name),
    description: text(parsed.description),
    care_tips: Array.isArray(parsed.care_tips) ? parsed.care_tips.filter((t) => typeof t === "string").slice(0, 8) : [],
    toxicity: text(parsed.toxicity),
    difficulty: text(parsed.difficulty),
    light: text(parsed.light),
    water: text(parsed.water),
  });
}

// ---------- newsletter capture (kept from the previous Worker) ----------

async function lead(request: Request, env: Env) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  if (!email) return fail("Enter a valid email address.", 400);
  let brevo = false;
  if (env.BREVO_API_KEY) {
    try {
      const res = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: { "content-type": "application/json", "api-key": env.BREVO_API_KEY },
        body: JSON.stringify({
          email,
          attributes: { FIRSTNAME: "Plant", SOURCE: "procare-newsletter", LAST_PLANT_OPTIN_AT: new Date().toISOString() },
          listIds: [8],
          updateEnabled: true,
        }),
      });
      brevo = res.ok || res.status === 204;
    } catch {
      brevo = false;
    }
  }
  return json({ ok: brevo });
}

const ROUTES: Record<string, (request: Request, env: Env) => Promise<Response>> = {
  "/api/checkout": checkout,
  "/api/verify": verify,
  "/api/entitlement": entitlement,
  "/api/restore": restore,
  "/api/restore/confirm": restoreConfirm,
  "/api/identify": identify,
  "/api/procare-lead": lead,
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      const handler = ROUTES[url.pathname];
      if (!handler) return fail("Not found", 404);
      if (request.method === "OPTIONS") return new Response(null, { status: 204 });
      const origin = request.headers.get("origin");
      if (origin && origin !== appUrl(env) && !origin.startsWith("http://localhost")) {
        return fail("Forbidden", 403);
      }
      try {
        return await handler(request, env);
      } catch (error) {
        if (error instanceof StripeError && error.status < 500 && error.status !== 404 && error.status !== 401) {
          return fail(error.message, error.status);
        }
        console.error("api error", url.pathname, error instanceof Error ? error.message : String(error));
        if (error instanceof StripeError && (error.status === 502 || error.status === 503)) {
          return fail(error.message, error.status);
        }
        return fail("Something went wrong on our side. Please try again.", 500);
      }
    }
    return env.ASSETS.fetch(request);
  },
};
