import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { confirmRestore, requestRestore } from "@/lib/proAccess";

type State = "form" | "sent" | "confirming" | "done" | "failed";

// /restore?token=… comes from the emailed link. /restore (and old /login links)
// shows the form that sends that link.
const Restore = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { refreshPro, isPro, email: proEmail } = useAuth();
  const [state, setState] = useState<State>(token ? "confirming" : "form");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void confirmRestore(token).then(async (result) => {
      if (cancelled) return;
      if (result.data?.isPro) {
        await refreshPro();
        setMessage(`Pro is active in this browser for ${result.data.email}.`);
        setState("done");
        window.history.replaceState(null, "", "/restore");
      } else {
        setMessage(
          result.error ||
            (result.data?.reason === "refunded"
              ? "That payment was refunded, so Pro cannot be restored."
              : "We could not confirm an active Pro purchase for this link.")
        );
        setState("failed");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [token, refreshPro]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const result = await requestRestore(email);
    setBusy(false);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    setMessage("");
    setState("sent");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-card rounded-2xl p-8 shadow-card border border-border space-y-5 text-center">
            {state === "confirming" && (
              <>
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                <h1 className="font-heading text-2xl font-bold text-foreground">Unlocking Pro…</h1>
                <p className="text-muted-foreground text-sm">Checking your purchase with Stripe.</p>
              </>
            )}

            {state === "done" && (
              <>
                <CheckCircle className="w-12 h-12 text-primary mx-auto" />
                <h1 className="font-heading text-2xl font-bold text-foreground">Pro restored</h1>
                <p className="text-muted-foreground text-sm">{message}</p>
                <Button variant="hero" className="rounded-xl" onClick={() => navigate("/dashboard")}>
                  Open my dashboard
                </Button>
              </>
            )}

            {state === "failed" && (
              <>
                <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
                <h1 className="font-heading text-2xl font-bold text-foreground">Link not accepted</h1>
                <p className="text-muted-foreground text-sm">{message}</p>
                <Button variant="outline" className="rounded-xl" onClick={() => setState("form")}>
                  Send a new link
                </Button>
              </>
            )}

            {state === "sent" && (
              <>
                <Mail className="w-12 h-12 text-primary mx-auto" />
                <h1 className="font-heading text-2xl font-bold text-foreground">Check your email</h1>
                <p className="text-muted-foreground text-sm">
                  If {email} has a Pro purchase, a link to unlock it is on its way. Open it in this browser
                  within one hour. Check spam if it does not arrive in a few minutes.
                </p>
              </>
            )}

            {state === "form" && (
              <>
                <h1 className="font-heading text-2xl font-bold text-foreground">Restore Pro</h1>
                {isPro ? (
                  <p className="text-muted-foreground text-sm">
                    Pro is already active in this browser for {proEmail}.{" "}
                    <Link to="/dashboard" className="text-primary underline">Open the dashboard</Link>.
                  </p>
                ) : (
                  <form onSubmit={submit} className="space-y-3 text-left">
                    <p className="text-muted-foreground text-sm text-center">
                      There are no passwords. Enter the email you used at checkout and we will email you a
                      one-hour link that unlocks Pro in this browser.
                    </p>
                    <Label htmlFor="email">Email used at checkout</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                    {message && <p className="text-sm text-destructive">{message}</p>}
                    <Button type="submit" variant="hero" disabled={busy} className="w-full rounded-xl">
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Email me a link"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Not a Pro member yet? <Link to="/settings" className="text-primary underline">Unlock Pro for $7.99</Link>
                    </p>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Restore;
