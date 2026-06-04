import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_USER: User = {
  id: "guest-user-id",
  email: "guest-gardener@plantastichaven.com",
  user_metadata: { display_name: "Premium Guest Gardener" },
  role: "authenticated",
  aud: "authenticated",
  created_at: new Date().toISOString(),
  app_metadata: {},
} as any;

const GUEST_SESSION: Session = {
  access_token: "mock-token",
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "mock-refresh-token",
  user: GUEST_USER,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with the guest user immediately to bypass all login/signup screens
  const [user, setUser] = useState<User | null>(GUEST_USER);
  const [session, setSession] = useState<Session | null>(GUEST_SESSION);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Keep local storage guest mode enabled
    localStorage.setItem("guest_mode", "true");
    localStorage.setItem("mock_session", JSON.stringify(GUEST_SESSION));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        setUser(session.user);
      } else {
        // Fallback to guest session if logged out
        setSession(GUEST_SESSION);
        setUser(GUEST_USER);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    // Always succeed in guest mode
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    // Always succeed in guest mode
    return { error: null };
  };

  const signOut = async () => {
    // Keep user authenticated in guest mode, do not log out
    console.log("Sign out requested, maintaining guest session.");
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
