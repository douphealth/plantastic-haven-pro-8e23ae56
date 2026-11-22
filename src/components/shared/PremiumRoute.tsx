import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PremiumRoute = ({ children }: { children: React.ReactNode }) => {
  const { isPro, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-primary font-medium">
          <Loader2 className="w-5 h-5 animate-spin" />
          Checking Pro access...
        </div>
      </div>
    );
  }

  if (!isPro) return <Navigate to="/settings?upgrade=required" replace />;
  return <>{children}</>;
};

export default PremiumRoute;
