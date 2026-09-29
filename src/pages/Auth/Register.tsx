import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoLeaf from "@/assets/logo-leaf.png";

const safeNext = (value: string | null) => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
};

const Register = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const next = safeNext(searchParams.get("next"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({
        title: "Use a stronger password",
        description: "Use at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error, requiresEmailConfirmation } = await signUp(
      email.trim(),
      password,
      displayName
    );
    setLoading(false);

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (requiresEmailConfirmation) {
      toast({
        title: "Check your inbox",
        description:
          "Confirm your email, then sign in to continue. Your requested destination will be preserved.",
      });
      navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
      return;
    }

    navigate(next, { replace: true });
  };

  const freePerks = [
    "15 plants on your shelf",
    "5 AI plant scans/month",
    "Smart watering reminders",
    "Community access",
  ];

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
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            Create your free account
          </h1>
          <p className="text-muted-foreground">
            Sync your garden and keep purchases tied to you
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl shadow-elevated p-8 border border-border space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Plant Lover"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-accent/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-accent-foreground mb-2">
              Free tier includes:
            </p>
            {freePerks.map((perk) => (
              <div
                key={perk}
                className="flex items-center gap-2 text-xs text-muted-foreground mb-1"
              >
                <Check className="w-3 h-3 text-primary" />
                <span>{perk}</span>
              </div>
            ))}
          </div>

          <Button
            type="submit"
            variant="hero"
            className="w-full h-12 rounded-xl"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Free Account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to={`/login?next=${encodeURIComponent(next)}`}
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            You can still use the public diagnosis and care-plan tools without signing up.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
