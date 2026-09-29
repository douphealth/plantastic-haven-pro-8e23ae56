import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoLeaf from "@/assets/logo-leaf.png";

const safeNext = (value: string | null) => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    navigate(safeNext(searchParams.get("next")), { replace: true });
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
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your garden and Pro purchases
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl shadow-elevated p-8 border border-border space-y-5"
        >
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
            <div className="flex justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <Button
            type="submit"
            variant="hero"
            className="w-full h-12 rounded-xl"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link
              to={`/register?next=${encodeURIComponent(safeNext(searchParams.get("next")))}`}
              className="text-primary font-medium hover:underline"
            >
              Create a free account
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            Public diagnosis, care plans and PDF tools remain available without an account.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
