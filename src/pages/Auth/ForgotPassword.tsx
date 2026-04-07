import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import logoLeaf from "@/assets/logo-leaf.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logoLeaf} alt="PlantasticHaven" className="w-10 h-10" />
            <span className="font-heading text-2xl font-bold text-foreground">
              Plantastic<span className="text-primary">Haven</span>
            </span>
          </Link>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Reset Password</h1>
          <p className="text-muted-foreground">We'll send you a reset link</p>
        </div>

        <div className="bg-card rounded-2xl shadow-elevated p-8 border border-border">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📧</div>
              <h2 className="font-heading text-xl font-semibold text-card-foreground">Check your inbox</h2>
              <p className="text-sm text-muted-foreground">We sent a password reset link to <strong>{email}</strong></p>
              <Link to="/login" className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <Button type="submit" variant="hero" className="w-full h-12 rounded-xl" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              <p className="text-center">
                <Link to="/login" className="text-sm text-primary font-medium hover:underline">Back to sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
