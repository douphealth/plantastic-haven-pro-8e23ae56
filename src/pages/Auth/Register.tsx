import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoLeaf from "@/assets/logo-leaf.png";

const Register = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, displayName);
    setLoading(false);
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome to PlantasticHaven! 🌿", description: "Check your email to confirm your account." });
      navigate("/dashboard");
    }
  };

  const freePerks = ["15 plants on your shelf", "5 AI plant scans/month", "Smart watering reminders", "Community access"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logoLeaf} alt="PlantasticHaven" className="w-10 h-10" />
            <span className="font-heading text-2xl font-bold text-foreground">
              Plantastic<span className="text-primary">Haven</span>
            </span>
          </Link>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Join PlantasticHaven</h1>
          <p className="text-muted-foreground">Start your free plant care journey</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-elevated p-8 border border-border space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Plant Lover" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-accent/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-accent-foreground mb-2">Free tier includes:</p>
            {freePerks.map((perk) => (
              <div key={perk} className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Check className="w-3 h-3 text-primary" />
                <span>{perk}</span>
              </div>
            ))}
          </div>

          <Button type="submit" variant="hero" className="w-full h-12 rounded-xl" disabled={loading}>
            {loading ? "Creating account..." : "Get Started Free"}
          </Button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <Button 
            type="button" 
            variant="heroOutline" 
            onClick={() => {
              localStorage.setItem("guest_mode", "true");
              window.location.href = "/dashboard";
            }}
            className="w-full h-12 rounded-xl border-dashed border-primary text-primary hover:bg-primary/5 flex items-center justify-center gap-2 font-bold"
          >
            ⚡ Continue as Guest (No Account Required)
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
