import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/shared/AppLayout";

const PaymentSuccess = () => {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        await supabase.functions.invoke("check-payment");
        setVerified(true);
      } catch {
        setVerified(true);
      }
    };
    verify();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto text-center py-16 space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h1 className="font-heading text-4xl font-bold text-foreground">
          Welcome to <span className="text-primary">Pro</span>! 🎉
        </h1>
        <p className="text-muted-foreground text-lg">
          You now have unlimited access to every feature in PlantasticHaven. Let's grow something amazing.
        </p>
        <div className="bg-card rounded-2xl p-6 border border-border shadow-card text-left space-y-3">
          <h3 className="font-heading font-semibold text-card-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" /> Your Pro Perks
          </h3>
          {[
            "Unlimited AI plant scans & diagnostics",
            "Unlimited plants on your shelf",
            "Disease & pest AI diagnosis",
            "Advanced analytics & growth charts",
            "Premium themes & ad-free experience",
            "Priority community support",
          ].map((perk) => (
            <div key={perk} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" /> {perk}
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/dashboard">
            <Button variant="hero" className="rounded-xl">
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/plant-identifier">
            <Button variant="outline" className="rounded-xl">
              Try AI Scanner
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default PaymentSuccess;
