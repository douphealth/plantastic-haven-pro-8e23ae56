import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/shared/AppLayout";
import { User, Crown, Shield, Check, Loader2, ExternalLink } from "lucide-react";
import { STRIPE_CONFIG } from "@/lib/stripe-config";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      setProfile(data);
      setDisplayName(data?.display_name || "");
    });
    // Check payment status on load
    supabase.functions.invoke("check-payment").then(({ data }) => {
      if (data?.isPro) {
        setProfile((prev: any) => prev ? { ...prev, subscription_tier: "pro" } : prev);
      }
    });
  }, [user]);

  const updateProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("user_id", user.id);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated! ✨" });
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { priceId: STRIPE_CONFIG.pro.price_id },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({ title: "Payment Error", description: err.message || "Something went wrong", variant: "destructive" });
    }
    setUpgrading(false);
  };

  const isPro = profile?.subscription_tier === "pro";

  const proFeatures = [
    "Unlimited AI plant scans & diagnostics",
    "Unlimited plants on your shelf",
    "Disease & pest AI diagnosis",
    "Advanced analytics dashboard",
    "Growth trend charts",
    "Garden space planner",
    "Premium themes & customization",
    "Ad-free experience",
    "Export plant cards (no watermark)",
    "Priority community support",
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">Settings</h1>

        {/* Profile */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4">
          <h2 className="font-heading text-xl font-semibold text-card-foreground flex items-center gap-2">
            <User className="w-5 h-5" /> Profile
          </h2>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <Button variant="hero" onClick={updateProfile} disabled={loading} className="rounded-xl">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4">
          <h2 className="font-heading text-xl font-semibold text-card-foreground flex items-center gap-2">
            <Crown className="w-5 h-5 text-secondary" /> Subscription
          </h2>

          {isPro ? (
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-5 border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-heading font-bold text-card-foreground">Pro Member</div>
                  <div className="text-xs text-muted-foreground">Lifetime access · All features unlocked</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {proFeatures.slice(0, 6).map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-primary shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <div className="flex-1">
                  <div className="font-medium text-card-foreground">Free Plan</div>
                  <div className="text-xs text-muted-foreground">5 AI scans/month · 15 plants max</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-secondary" />
                  <span className="text-xs font-bold text-secondary uppercase">Upgrade</span>
                </div>
                <h3 className="font-heading text-2xl font-bold mb-1">PlantasticHaven Pro</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$7.99</span>
                  <span className="text-primary-foreground/70 text-sm ml-1">one-time · lifetime access</span>
                </div>
                <ul className="space-y-2 mb-5">
                  {proFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-primary-foreground/90">
                      <Check className="w-4 h-4 text-secondary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button variant="gold" onClick={handleUpgrade} disabled={upgrading} className="w-full h-12 rounded-xl text-base">
                  {upgrading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    <>Upgrade to Pro — $7.99 <ExternalLink className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
                <p className="text-center text-xs text-primary-foreground/50 mt-3">
                  Secure payment via Stripe. One-time payment, no subscriptions.
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
