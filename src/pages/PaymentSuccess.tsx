import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/shared/AppLayout";

type VerifyState = "checking" | "verified" | "failed";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerifyState>("checking");
  const [message, setMessage] = useState("Verifying your Stripe payment...");

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      const sessionId = searchParams.get("session_id");
      const { data, error } = await supabase.functions.invoke("check-payment", {
        body: sessionId ? { sessionId } : {},
      });

      if (cancelled) return;

      if (error || !data?.isPro) {
        setState("failed");
        setMessage(
          "We could not verify a completed Pro payment for this account. No Pro access has been granted."
        );
        return;
      }

      setState("verified");
      setMessage(
        "Payment verified. Your PlantasticHaven Pro lifetime access is active."
      );
    };

    void verify();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (state === "checking") {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto text-center py-20 space-y-5">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Confirming your purchase
          </h1>
          <p className="text-muted-foreground">{message}</p>
        </div>
      </AppLayout>
    );
  }

  if (state === "failed") {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto text-center py-20 space-y-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Payment not verified
          </h1>
          <p className="text-muted-foreground">{message}</p>
          <div className="flex gap-3 justify-center">
            <Button asChild variant="hero" className="rounded-xl">
              <Link to="/settings">Return to Pro settings</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/">Use free tools</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto text-center py-16 space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h1 className="font-heading text-4xl font-bold text-foreground">
          Pro is active
        </h1>
        <p className="text-muted-foreground text-lg">{message}</p>
        <div className="bg-card rounded-2xl p-6 border border-border shadow-card text-left space-y-3">
          <h3 className="font-heading font-semibold text-card-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" /> Your Pro workspace
          </h3>
          {[
            "Personal plant dashboard",
            "Saved garden and care calendar",
            "AI plant identifier",
            "Plant health journal",
            "Community access",
            "Premium care sequences",
          ].map((perk) => (
            <div
              key={perk}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              {perk}
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="hero" className="rounded-xl">
            <Link to="/dashboard">
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/plant-identifier">Try AI Scanner</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default PaymentSuccess;
