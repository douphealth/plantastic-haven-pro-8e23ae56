import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoLeaf from "@/assets/logo-leaf.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        setReady(true);
        setChecking(false);
      }
    });

    const timeout = window.setTimeout(() => {
      if (mounted) setChecking(false);
    }, 1500);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoLeaf} alt="PlantasticHaven" className="w-10 h-10 mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">New password</h1>
          <p className="text-muted-foreground">Choose a new password for your account</p>
        </div>
        {checking ? (
          <div className="bg-card rounded-2xl shadow-elevated p-8 border border-border text-sm text-muted-foreground">
            Checking your reset link...
          </div>
        ) : ready ? (
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-elevated p-8 border border-border space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required />
            </div>
            <Button type="submit" variant="hero" className="w-full h-12 rounded-xl" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </Button>
          </form>
        ) : (
          <div className="bg-card rounded-2xl shadow-elevated p-8 border border-border space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              This reset link is missing or expired. Request a new one and open it on this device.
            </p>
            <Link to="/forgot-password" className="text-sm text-primary font-medium hover:underline">
              Request a new link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
