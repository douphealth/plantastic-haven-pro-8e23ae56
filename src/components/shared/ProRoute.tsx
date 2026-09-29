import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type ProRouteProps = {
  children: React.ReactNode;
};

const ProRoute = ({ children }: ProRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyEntitlement = useCallback(async () => {
    if (!user) return;

    setChecking(true);
    setError(null);

    const { data, error: invokeError } = await supabase.functions.invoke(
      "check-payment",
      { body: {} }
    );

    if (invokeError) {
      setError(
        invokeError.message ||
          "We could not verify your Pro access. Please retry."
      );
      setIsPro(false);
      setChecking(false);
      return;
    }

    setIsPro(Boolean(data?.isPro));
    setChecking(false);
  }, [user]);

  useEffect(() => {
    if (user) verifyEntitlement();
  }, [user, verifyEntitlement]);

  if (authLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(
      `${location.pathname}${location.search}`
    );
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Verifying Pro access…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4">
        <div className="max-w-md text-center space-y-4 bg-card border border-border rounded-2xl p-6 shadow-card">
          <h1 className="font-heading text-xl font-bold text-foreground">
            Pro verification unavailable
          </h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={verifyEntitlement} className="rounded-xl">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry verification
          </Button>
        </div>
      </div>
    );
  }

  if (!isPro) {
    return <Navigate to="/settings?upgrade=1" replace />;
  }

  return <>{children}</>;
};

export default ProRoute;
