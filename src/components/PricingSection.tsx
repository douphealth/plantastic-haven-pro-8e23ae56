import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const freeTier = [
  "5 AI plant scans/month",
  "15 plants on your shelf",
  "Smart watering reminders",
  "Basic care calendar",
  "Learning Hub access",
  "Community forum (read + 5 posts/mo)",
];

const proTier = [
  "Unlimited AI scans & diagnostics",
  "Unlimited plants",
  "Disease & pest AI diagnosis",
  "Advanced care tools",
  "Growth tracking",
  "Premium care sequences",
  "Exportable care resources",
  "Priority feature access",
];

const PricingSection = () => {
  const { user } = useAuth();
  const freeCtaHref = user ? "/dashboard" : "/register";
  const proCtaHref = user ? "/settings?upgrade=1" : "/register?next=%2Fsettings%3Fupgrade%3D1";

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Simple Pricing
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Start free. Upgrade only when you need more.
          </h2>
          <p className="text-muted-foreground text-lg">
            The free plan is functional on its own. Pro is a one-time upgrade for higher limits and premium tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="rounded-2xl bg-card p-8 shadow-card border border-border flex flex-col">
            <div className="mb-6">
              <h3 className="font-heading text-2xl font-bold text-card-foreground">Essentials</h3>
              <p className="text-muted-foreground text-sm mt-1">Useful plant care without payment</p>
            </div>
            <div className="mb-8">
              <span className="font-heading text-5xl font-bold text-card-foreground">$0</span>
              <span className="text-muted-foreground ml-2">forever</span>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {freeTier.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-card-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="heroOutline" className="w-full h-12 rounded-xl">
              <Link to={freeCtaHref}>{user ? "Open Free Dashboard" : "Create Free Account"}</Link>
            </Button>
          </div>

          <div className="rounded-2xl p-8 shadow-elevated flex flex-col relative overflow-hidden bg-primary text-primary-foreground border-2 border-primary">
            <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
              <Star className="w-3 h-3" />
              ONE-TIME
            </div>
            <div className="mb-6">
              <h3 className="font-heading text-2xl font-bold">Pro</h3>
              <p className="text-primary-foreground/70 text-sm mt-1">For larger collections and deeper care workflows</p>
            </div>
            <div className="mb-8">
              <span className="font-heading text-5xl font-bold">$7.99</span>
              <span className="text-primary-foreground/70 ml-2">one-time</span>
              <div className="text-sm text-primary-foreground/60 mt-1">Lifetime Pro access for this account</div>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {proTier.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                  <span className="text-sm text-primary-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="gold" className="w-full h-12 rounded-xl text-base">
              <Link to={proCtaHref}>Upgrade to Pro — $7.99</Link>
            </Button>
            <p className="text-center text-xs text-primary-foreground/60 mt-3">
              Secure Stripe Checkout. No recurring subscription.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
