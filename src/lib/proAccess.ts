// Pro access on this device. The license is a token signed by the procare Worker
// after it has verified a paid Stripe Checkout Session. It is re-checked against
// Stripe periodically, so a refund or chargeback removes Pro.

const LICENSE_KEY = "ph_pro_license_v1";
export const REVALIDATE_AFTER_MS = 12 * 60 * 60 * 1000;

export type StoredLicense = {
  license: string;
  email: string;
  checkedAt: number;
};

export type ApiResult<T> = { data: T | null; error: string | null; status: number; code?: string };

export async function postApi<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        data: null,
        error: (data && typeof data.error === "string" && data.error) || "Request failed. Please try again.",
        status: response.status,
        code: data?.code,
      };
    }
    return { data: data as T, error: null, status: response.status };
  } catch {
    return { data: null, error: "You appear to be offline. Check your connection and try again.", status: 0 };
  }
}

export function readLicense(): StoredLicense | null {
  try {
    const raw = localStorage.getItem(LICENSE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredLicense;
    if (typeof parsed?.license !== "string" || typeof parsed?.email !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveLicense(license: string, email: string): StoredLicense {
  const stored = { license, email, checkedAt: Date.now() };
  localStorage.setItem(LICENSE_KEY, JSON.stringify(stored));
  return stored;
}

export function clearLicense() {
  localStorage.removeItem(LICENSE_KEY);
}

type GrantResponse = { isPro: boolean; license?: string; email?: string; reason?: string };

/** Checks the stored license with the server when it is stale. Offline keeps access. */
export async function revalidateLicense(force = false): Promise<StoredLicense | null> {
  const stored = readLicense();
  if (!stored) return null;
  if (!force && Date.now() - stored.checkedAt < REVALIDATE_AFTER_MS) return stored;

  const result = await postApi<GrantResponse>("/api/entitlement", { license: stored.license });
  if (result.error || !result.data) return stored; // network or server trouble: keep access
  if (!result.data.isPro) {
    clearLicense();
    return null;
  }
  return saveLicense(stored.license, stored.email);
}

export async function startCheckout(email: string) {
  return postApi<{ url: string }>("/api/checkout", { email });
}

export async function verifyCheckout(sessionId: string) {
  const result = await postApi<GrantResponse>("/api/verify", { sessionId });
  if (result.data?.isPro && result.data.license && result.data.email) {
    saveLicense(result.data.license, result.data.email);
  }
  return result;
}

export async function requestRestore(email: string) {
  return postApi<{ ok: boolean }>("/api/restore", { email });
}

export async function confirmRestore(token: string) {
  const result = await postApi<GrantResponse>("/api/restore/confirm", { token });
  if (result.data?.isPro && result.data.license && result.data.email) {
    saveLicense(result.data.license, result.data.email);
  }
  return result;
}
