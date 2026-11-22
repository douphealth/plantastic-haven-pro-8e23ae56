// Compact HMAC-SHA256 signed tokens (payload.signature, both base64url).
// A license token proves which paid Checkout Session a device unlocked with; the
// Worker still re-checks that session with Stripe, so refunds revoke access.

export type LicensePayload = { typ: "license"; sid: string; email: string; iat: number };
export type RestorePayload = { typ: "restore"; sid: string; email: string; exp: number };
export type TokenPayload = LicensePayload | RestorePayload;

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  if (!secret || secret.length < 32) throw new Error("Signing secret is not configured");
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signToken(payload: TokenPayload, secret: string): Promise<string> {
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const key = await hmacKey(secret);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(body)));
  return body + "." + toBase64Url(signature);
}

export async function verifyToken<T extends TokenPayload["typ"]>(
  token: unknown,
  secret: string,
  typ: T,
  now = Date.now()
): Promise<Extract<TokenPayload, { typ: T }> | null> {
  if (typeof token !== "string" || token.length > 2048) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  try {
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(parts[1]),
      encoder.encode(parts[0])
    );
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(parts[0])));
    if (!payload || payload.typ !== typ) return null;
    if (typeof payload.sid !== "string" || !payload.sid.startsWith("cs_")) return null;
    if (typeof payload.email !== "string") return null;
    if (typ === "restore" && !(typeof payload.exp === "number" && payload.exp > now)) return null;
    return payload;
  } catch {
    return null;
  }
}
