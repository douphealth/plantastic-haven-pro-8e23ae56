import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { localUserId } from "@/lib/localDb";
import { clearLicense, readLicense, revalidateLicense, type StoredLicense } from "@/lib/proAccess";

// There are no passwords or accounts. Each browser has a local workspace id, and
// Pro is unlocked by a license tied to the email used at Stripe Checkout.
export type LocalUser = { id: string; email: string | null };

interface AuthContextType {
  user: LocalUser;
  loading: boolean;
  isPro: boolean;
  email: string | null;
  /** Re-read the stored license; pass true to re-check it with Stripe now. */
  refreshPro: (force?: boolean) => Promise<boolean>;
  /** Removes Pro from this browser only. The purchase can be restored by email. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [license, setLicense] = useState<StoredLicense | null>(() => readLicense());
  const [loading, setLoading] = useState(true);
  const userId = useMemo(() => localUserId(), []);

  const refreshPro = useCallback(async (force = false) => {
    const next = await revalidateLicense(force);
    setLicense(next);
    return Boolean(next);
  }, []);

  useEffect(() => {
    // Clean up flags left by older builds that faked Pro on the client.
    for (const key of ["guest_mode", "mock_session", "procare_pro"]) localStorage.removeItem(key);
    let active = true;
    void revalidateLicense().then((next) => {
      if (!active) return;
      setLicense(next);
      setLoading(false);
    });
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key.startsWith("ph_pro_license")) setLicense(readLicense());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const signOut = useCallback(async () => {
    clearLicense();
    setLicense(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user: { id: userId, email: license?.email ?? null },
      loading,
      isPro: Boolean(license),
      email: license?.email ?? null,
      refreshPro,
      signOut,
    }),
    [userId, license, loading, refreshPro, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
