import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/shared/AppLayout";
import { User, Crown } from "lucide-react";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      setProfile(data);
      setDisplayName(data?.display_name || "");
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

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">Settings</h1>

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

        <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4">
          <h2 className="font-heading text-xl font-semibold text-card-foreground flex items-center gap-2">
            <Crown className="w-5 h-5 text-secondary" /> Subscription
          </h2>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
            <div className="flex-1">
              <div className="font-medium text-card-foreground capitalize">{profile?.subscription_tier || "Free"} Plan</div>
              <div className="text-xs text-muted-foreground">
                {profile?.subscription_tier === "pro" ? "You have full access to all features" : "Upgrade to unlock AI diagnostics, unlimited plants, and more"}
              </div>
            </div>
            {profile?.subscription_tier !== "pro" && (
              <Button variant="gold" size="sm" className="rounded-lg">Upgrade to Pro — $7.99</Button>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <h2 className="font-heading text-xl font-semibold text-destructive mb-3">Danger Zone</h2>
          <Button variant="destructive" onClick={signOut} className="rounded-xl">Sign Out</Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
