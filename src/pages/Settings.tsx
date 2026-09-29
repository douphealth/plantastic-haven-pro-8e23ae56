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
  Check,
  Loader2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingPlan, setCheckingPlan] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  const loadProfileAndPlan = async () => {
    if (!user) return;

    setCheckingPlan(true);

    const [profileResult, entitlementResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single(),
      supabase.functions.invoke("check-payment", { body: {} }),
    ]);

    if (profileResult.data) {
      const nextProfile = {
        ...profileResult.data,
        subscription_tier: entitlementResult.data?.isPro
          ? "pro"
          : profileResult.data.subscription_tier,
      };
      setProfile(nextProfile);
      setDisplayName(nextProfile.display_name || "");
    }

    if (entitlementResult.error) {
      toast({
        title: "Plan verification issue",
        description:
          "Your account loaded, but live payment status could not be refreshed.",
        variant: "destructive",
      });
    }

    setCheckingPlan(false);
  };

  useEffect(() => {
    loadProfileAndPlan();
  }, [user]);

  useEffect(() => {
    if (searchParams.get("payment") === "cancelled") {
      toast({
        title: "Checkout cancelled",
        description: "No charge was made. You can upgrade whenever you are ready.",
      });
    }
  }, [searchParams, toast]);

  const updateProfile = async () => {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("user_id", user.id);
    setLoading(false);

    if (error) {
      toast({
        title: "Unable to save profile",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Profile updated" });
  };

  const handleUpgrade = async () => {
    setUpgrading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "create-payment",
        { body: {} }
      );

      if (error) {
        let serverMessage = error.message;
        try {
          const payload = await (error as any)?.context?.json?.();
          if (payload?.error) serverMessage = payload.error;
        } catch {
          // Use SDK message.
        }
        throw new Error(serverMessage);
      }

      if (!data?.url) {
        throw new Error("Checkout URL was not returned.");
      }

      window.location.assign(data.url);
    } catch (err: any) {
      setUpgrading(false);
      toast({
        title: "Unable to start checkout",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const isPro = profile?.subscription_tier === "pro";

  const proFeatures = [
    "Unlimited AI plant scans",
    "Unlimited plants",
    "Premium care sequences",
    "Higher-capacity community participation",
    "Lifetime Pro entitlement for this account",
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile and verified Pro entitlement.
          </p>
        </div>

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
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
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
            <Crown className="w-5 h-5 text-secondary" /> Plan
          </h2>

          {checkingPlan ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying current entitlement...
            </div>
          ) : isPro ? (
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-5 border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-heading font-bold text-card-foreground">
                    Pro active
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Server-verified lifetime access
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {proFeatures.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/50 border border-border p-4">
                <div className="font-medium text-card-foreground">Free plan</div>
                <div className="text-xs text-muted-foreground mt-1">
                  5 AI scans/month · 15 plants · 5 community posts/month
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-secondary" />
                  <span className="text-xs font-bold text-secondary uppercase">
                    One-time upgrade
                  </span>
                </div>
                <h3 className="font-heading text-2xl font-bold mb-1">
                  PlantasticHaven Pro
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$7.99</span>
                  <span className="text-primary-foreground/70 text-sm ml-1">
                    one-time
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
                      Upgrade to Pro — $7.99
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-primary-foreground/60 mt-3 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Stripe-hosted checkout. No recurring subscription.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
