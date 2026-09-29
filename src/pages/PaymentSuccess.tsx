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

type VerificationState = "verifying" | "verified" | "failed";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerificationState>("verifying");
  const [message, setMessage] = useState(
    "Confirming your Stripe payment and activating Pro..."
  );

  const sessionId = searchParams.get("session_id");

  const verify = async () => {
    if (!sessionId) {
      setState("failed");
      setMessage(
        "This page is missing the Stripe Checkout session ID. Open Settings to refresh your plan status."
      );
      return;
    }

    setState("verifying");
    setMessage("Confirming your Stripe payment and activating Pro...");

    const { data, error } = await supabase.functions.invoke("check-payment", {
      body: { sessionId },
    });

    if (error || !data?.isPro) {
      setState("failed");
      setMessage(
        "The payment could not be verified yet. If Stripe completed the charge, retry verification or open Settings to refresh your entitlement."
      );
      return;
    }

    setState("verified");
    setMessage(
      "Payment verified. Pro is active on your PlantasticHaven account."
    );
  };

  useEffect(() => {
    verify();
  }, [sessionId]);

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto text-center py-16 space-y-6">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
            state === "failed" ? "bg-destructive/10" : "bg-primary/10"
          }`}
        >
          {state === "verifying" ? (
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          ) : state === "verified" ? (
            <CheckCircle className="w-10 h-10 text-primary" />
          ) : (
            <AlertTriangle className="w-10 h-10 text-destructive" />
          )}
        </div>

        <h1 className="font-heading text-4xl font-bold text-foreground">
          {state === "verifying"
            ? "Verifying payment"
            : state === "verified"
              ? "Pro activated"
              : "Verification needed"}
        </h1>

        <p className="text-muted-foreground text-lg">{message}</p>

        {state === "verified" && (
          <div className="bg-card rounded-2xl p-6 border border-border shadow-card text-left space-y-3">
            <h3 className="font-heading font-semibold text-card-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              Your Pro access
            </h3>
            {[
              "Unlimited AI plant scans",
              "Unlimited plants",
              "Premium care sequences",
              "Higher free-tier limits removed",
              "Lifetime access for this account",
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
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {state === "failed" && (
            <Button onClick={verify} variant="hero" className="rounded-xl">
              Retry verification
            </Button>
          )}

          <Button asChild variant={state === "verified" ? "hero" : "outline"} className="rounded-xl">
            <Link to="/dashboard">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>

          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/settings">Open Settings</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default PaymentSuccess;
