import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/shared/AppLayout";
import {
  User,
  Crown,
  Shield,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (cancelled) return;

      setProfile(profileData);
      setDisplayName(profileData?.display_name || "");

      if (profileData?.subscription_tier !== "pro") {
        const { data } = await supabase.functions.invoke("check-payment", {
          body: {},
        });

        if (!cancelled && data?.isPro) {
          setProfile((previous: any) => ({
            ...(previous || profileData),
            subscription_tier: "pro",
          }));
        }
      }

      if (!cancelled) setCheckingPayment(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (searchParams.get("checkout") === "cancelled") {
      toast({
        title: "Checkout cancelled",
        description: "No charge was made. You can upgrade whenever you are ready.",
      });
    } else if (searchParams.get("upgrade") === "required") {
      toast({
        title: "Pro access required",
        description: "Unlock Pro to use the personal plant-care workspace.",
      });
    }
  }, [searchParams, toast]);

  const updateProfile = async () => {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("user_id", user.id);
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Profile updated" });
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {},
      });

      if (error) throw error;
      if (!data?.url) throw new Error("Stripe Checkout URL was not returned");

      window.location.assign(data.url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to start checkout";
      toast({
        title: "Payment error",
        description: message,
        variant: "destructive",
      });
      setUpgrading(false);
    }
  };

  const isPro = profile?.subscription_tier === "pro";

  const proFeatures = [
    "Personal plant dashboard",
    "Saved garden and plant records",
    "Care calendar and watering schedule",
    "AI plant identifier",
    "Plant health tracking and journal",
    "Community posting and discussions",
    "Premium care sequences",
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Settings
        </h1>

        <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4">
          <h2 className="font-heading text-xl font-semibold text-card-foreground flex items-center gap-2">
            <User className="w-5 h-5" /> Profile
          </h2>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </div>
            <Button
              variant="hero"
              onClick={updateProfile}
              disabled={loading}
              className="rounded-xl"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4">
          <h2 className="font-heading text-xl font-semibold text-card-foreground flex items-center gap-2">
            <Crown className="w-5 h-5 text-secondary" /> Pro access
          </h2>

          {checkingPayment ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking your purchase status...
            </div>
          ) : isPro ? (
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-5 border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-heading font-bold text-card-foreground">
                    Pro lifetime access
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Stripe payment verified
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {proFeatures.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <Check className="w-3 h-3 text-primary shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="font-medium text-card-foreground">
                  Free tools remain available
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Diagnosis, rescue care plan, PDF export, and guides do not
                  require Pro.
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-secondary" />
                  <span className="text-xs font-bold text-secondary uppercase">
                    Unlock Pro
                  </span>
                </div>
                <h3 className="font-heading text-2xl font-bold mb-1">
                  PlantasticHaven Pro
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$7.99</span>
                  <span className="text-primary-foreground/70 text-sm ml-1">
                    one-time · lifetime access
                  </span>
                </div>
                <ul className="space-y-2 mb-5">
                  {proFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-primary-foreground/90"
                    >
                      <Check className="w-4 h-4 text-secondary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="gold"
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full h-12 rounded-xl text-base"
                >
                  {upgrading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Opening secure checkout...
                    </>
                  ) : (
                    <>
                      Unlock Pro — $7.99
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-primary-foreground/60 mt-3">
                  Secure Stripe Checkout. One payment. No subscription.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <h2 className="font-heading text-xl font-semibold text-destructive mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Account
          </h2>
          <Button
            variant="destructive"
            onClick={signOut}
            className="rounded-xl"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
