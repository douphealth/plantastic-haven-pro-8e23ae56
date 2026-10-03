import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PremiumRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkEntitlement = async () => {
      if (!user) {
        if (!cancelled) setChecking(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.subscription_tier === "pro") {
        if (!cancelled) {
          setIsPro(true);
          setChecking(false);
        }
        return;
      }

      const { data } = await supabase.functions.invoke("check-payment", {
        body: {},
      });

      if (!cancelled) {
        setIsPro(Boolean(data?.isPro));
        setChecking(false);
      }
    };

    if (!authLoading) {
      void checkEntitlement();
    }

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-primary font-medium">
          <Loader2 className="w-5 h-5 animate-spin" />
          Checking Pro access...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isPro) {
    return <Navigate to="/settings?upgrade=required" replace />;
  }

  return <>{children}</>;
};

export default PremiumRoute;
