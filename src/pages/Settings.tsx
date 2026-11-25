import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/shared/AppLayout";
import { Crown, Check, Loader2, ExternalLink, Download, Upload, Mail, Shield } from "lucide-react";
import { REMINDER_PREFERENCE_KEY } from "@/lib/reminders";
import { emailProblem, requestRestore, startCheckout } from "@/lib/proAccess";
import { exportLocalData, importLocalData } from "@/lib/localDb";

const PRO_FEATURES = [
  "Personal plant dashboard",
  "Saved garden and plant records",
  "Care calendar and watering schedule",
  "AI plant identifier",
  "Plant health tracking and journal",
  "Saved progress through the care lessons",
];

const Settings = () => {
  const { isPro, email, loading, signOut, refreshPro } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [restoreEmail, setRestoreEmail] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSent, setRestoreSent] = useState(false);
  const [rechecking, setRechecking] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const checkoutEmailInput = useRef<HTMLInputElement>(null);
  const restoreEmailInput = useRef<HTMLInputElement>(null);

  // Coming back from Stripe with the browser's Back button restores this page from the
  // back/forward cache with the button still spinning. Reset it so the user can retry.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setUpgrading(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);
  const [remindersOn, setRemindersOn] = useState(
    () => localStorage.getItem(REMINDER_PREFERENCE_KEY) === "on"
  );

  useEffect(() => {
    if (searchParams.get("checkout") === "cancelled") {
      toast({
        title: "Checkout cancelled",
        description: "No charge was made. You can upgrade whenever you are ready.",
      });
    } else if (searchParams.get("upgrade") === "required") {
      toast({
        title: "Pro access required",
        description: "Unlock Pro to use the personal plant-care workspace, or restore a purchase.",
      });
    }
  }, [searchParams, toast]);

  // The forms use noValidate: the browser's own "Please fill out this field" bubble is
  // easy to miss and made "Unlock Pro" look dead. Problems are shown inline instead.
  const handleUpgrade = async (event: React.FormEvent) => {
    event.preventDefault();
    if (upgrading) return;
    const problem = emailProblem(checkoutEmail, "Enter your email to continue. It is how you restore Pro later.");
    if (problem) {
      setCheckoutError(problem);
      checkoutEmailInput.current?.focus();
      return;
    }
    setCheckoutError(null);
    setUpgrading(true);
    const result = await startCheckout(checkoutEmail);
    if (result.data?.url) {
      window.location.assign(result.data.url);
      return;
    }
    setUpgrading(false);
    if (result.code === "ALREADY_PRO") {
      setRestoreSent(true);
      toast({ title: "You already have Pro", description: result.error || undefined });
      return;
    }
    const message = result.error || "Checkout did not start. Please try again.";
    setCheckoutError(message);
    toast({ title: "Checkout did not start", description: message, variant: "destructive" });
  };

  const handleRestore = async (event: React.FormEvent) => {
    event.preventDefault();
    if (restoring) return;
    const problem = emailProblem(restoreEmail, "Enter the email you used at checkout.");
    if (problem) {
      setRestoreError(problem);
      restoreEmailInput.current?.focus();
      return;
    }
    setRestoreError(null);
    setRestoring(true);
    const result = await requestRestore(restoreEmail);
    setRestoring(false);
    if (result.error) {
      setRestoreError(result.error);
      toast({ title: "Could not send the link", description: result.error, variant: "destructive" });
      return;
    }
    setRestoreSent(true);
  };

  const recheck = async () => {
    setRechecking(true);
    const stillPro = await refreshPro(true);
    setRechecking(false);
    toast({
      title: stillPro ? "Pro is active" : "Pro is not active",
      description: stillPro
        ? "Stripe confirmed your payment."
        : "Stripe no longer shows an active Pro payment for this license.",
    });
  };

  const backup = () => {
    const blob = new Blob([JSON.stringify(exportLocalData(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `plantastichaven-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreBackup = async (file?: File) => {
    if (!file) return;
    try {
      const count = importLocalData(JSON.parse(await file.text()));
      toast({ title: "Backup restored", description: `${count} saved items were loaded into this browser.` });
    } catch (error) {
      toast({
        title: "Backup not restored",
        description: error instanceof Error ? error.message : "That file could not be read.",
        variant: "destructive",
      });
    }
    if (fileInput.current) fileInput.current.value = "";
  };

  const enableReminders = async () => {
    if (typeof Notification === "undefined") {
      toast({
        title: "This browser cannot show notifications",
        description: "The in-app list still appears when a plant is overdue.",
      });
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      localStorage.setItem(REMINDER_PREFERENCE_KEY, "off");
      setRemindersOn(false);
      toast({
        title: "Browser notifications stay off",
        description: "You can still see overdue plants in the app.",
      });
      return;
    }
    localStorage.setItem(REMINDER_PREFERENCE_KEY, "on");
    setRemindersOn(true);
    toast({
      title: "Browser reminders on",
      description: "A notification can appear once a day per overdue plant while this site is open.",
    });
  };

  const disableReminders = () => {
    localStorage.setItem(REMINDER_PREFERENCE_KEY, "off");
    setRemindersOn(false);
  };

  const restoreForm = restoreSent ? (
    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-card-foreground flex gap-2">
      <Mail className="w-4 h-4 mt-0.5 text-primary shrink-0" />
      If that email has a Pro purchase, a link to unlock it is on its way. Open it in this browser. It works for one hour.
    </div>
  ) : (
    <form onSubmit={handleRestore} noValidate className="space-y-2">
      <Label htmlFor="restore-email">Already bought Pro? Restore it on this device</Label>
      <div className="flex gap-2">
        <Input
          ref={restoreEmailInput}
          id="restore-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Email used at checkout"
          value={restoreEmail}
          aria-invalid={restoreError ? true : undefined}
          aria-describedby={restoreError ? "restore-email-error" : undefined}
          onChange={(event) => {
            setRestoreEmail(event.target.value);
            if (restoreError) setRestoreError(null);
          }}
        />
        <Button type="submit" variant="outline" disabled={restoring} className="rounded-xl shrink-0">
          {restoring ? <Loader2 className="w-4 h-4 animate-spin" aria-label="Sending" /> : "Email me a link"}
        </Button>
      </div>
      {restoreError && (
        <p id="restore-email-error" role="alert" className="text-sm text-destructive">
          {restoreError}
        </p>
      )}
    </form>
  );

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">Settings</h1>

        <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4">
          <h2 className="font-heading text-xl font-semibold text-card-foreground flex items-center gap-2">
            <Crown className="w-5 h-5 text-secondary" /> Pro access
          </h2>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking your purchase status...
            </div>
          ) : isPro ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-5 border border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <Crown className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-card-foreground">Pro lifetime access</div>
                    <div className="text-xs text-muted-foreground">Stripe payment verified · {email}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRO_FEATURES.map((feature) => (
                    <div key={feature} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-primary shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                To use Pro on another phone or computer, open Settings there and choose “Email me a link” with {email}.
              </p>
              <Button type="button" variant="outline" onClick={recheck} disabled={rechecking} className="rounded-xl">
                {rechecking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Re-check purchase
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="font-medium text-card-foreground">Free tools remain available</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Diagnosis, rescue care plan, PDF export, and guides do not require Pro or an email.
                </div>
              </div>

              <form
                onSubmit={handleUpgrade}
                noValidate
                aria-busy={upgrading}
                className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-secondary" />
                  <span className="text-xs font-bold text-secondary uppercase">Unlock Pro</span>
                </div>
                <h3 className="font-heading text-2xl font-bold mb-1">PlantasticHaven Pro</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$7.99</span>
                  <span className="text-primary-foreground/70 text-sm ml-1">one-time · lifetime access</span>
                </div>
                <ul className="space-y-2 mb-5">
                  {PRO_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-primary-foreground/90">
                      <Check className="w-4 h-4 text-secondary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Label htmlFor="checkout-email" className="text-primary-foreground/90">
                  Your email (used to restore Pro on other devices)
                </Label>
                <Input
                  ref={checkoutEmailInput}
                  id="checkout-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={checkoutEmail}
                  aria-invalid={checkoutError ? true : undefined}
                  aria-describedby={checkoutError ? "checkout-email-error" : undefined}
                  onChange={(event) => {
                    setCheckoutEmail(event.target.value);
                    if (checkoutError) setCheckoutError(null);
                  }}
                  className="mt-1.5 bg-background text-foreground"
                />
                {checkoutError && (
                  <p
                    id="checkout-email-error"
                    role="alert"
                    className="mt-2 rounded-lg bg-background px-3 py-2 text-sm font-medium text-destructive"
                  >
                    {checkoutError}
                  </p>
                )}
                <div className="mb-4" />
                <Button type="submit" variant="gold" disabled={upgrading} className="w-full h-12 rounded-xl text-base">
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
                  Secure Stripe Checkout. One payment. No subscription. No password to remember.
                </p>
              </form>

              {restoreForm}
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-3">
          <h2 className="font-heading text-xl font-semibold text-card-foreground">Your saved data</h2>
          <p className="text-sm text-muted-foreground">
            Your garden, photos, journal, and lesson progress are stored only in this browser. Download a
            backup to keep a copy or to move them to another device.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={backup} className="rounded-xl">
              <Download className="w-4 h-4 mr-2" /> Download backup
            </Button>
            <Button type="button" variant="outline" onClick={() => fileInput.current?.click()} className="rounded-xl">
              <Upload className="w-4 h-4 mr-2" /> Load a backup
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => void restoreBackup(event.target.files?.[0])}
            />
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-3">
          <h2 className="font-heading text-xl font-semibold text-card-foreground">Watering reminders</h2>
          <p className="text-sm text-muted-foreground">
            Overdue plants are listed in the app whenever you open the dashboard or care calendar.
            A browser notification is optional and only appears while this site is open in this browser,
            at most once a day for each overdue plant. Nothing is emailed.
          </p>
          {remindersOn ? (
            <Button type="button" variant="outline" onClick={disableReminders} className="rounded-xl">
              Turn off browser notifications
            </Button>
          ) : (
            <Button type="button" variant="hero" onClick={enableReminders} className="rounded-xl">
              Allow browser notifications
            </Button>
          )}
        </div>

        {isPro && (
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-3">
            <h2 className="font-heading text-xl font-semibold text-card-foreground flex items-center gap-2">
              <Shield className="w-5 h-5" /> This device
            </h2>
            <p className="text-sm text-muted-foreground">
              Use this on a shared computer. It removes Pro from this browser only. Your purchase stays
              active and can be restored by email. Saved plants stay in this browser.
            </p>
            <Button type="button" variant="outline" onClick={signOut} className="rounded-xl">
              Remove Pro from this browser
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          <Link to="/privacy" className="underline">Privacy</Link> · <Link to="/terms" className="underline">Terms</Link>
        </p>
      </div>
    </AppLayout>
  );
};

export default Settings;
