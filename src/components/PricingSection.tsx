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
  "Advanced analytics dashboard",
  "Growth trend charts",
  "Garden space planner",
  "Premium themes & customization",
  "Ad-free experience",
  "Export plant cards (no watermark)",
  "Priority community support",
];

const PricingSection = () => {
  const { user } = useAuth();
  const proCtaHref = user ? "/settings" : "/register";

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Simple Pricing
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Invest in Your <span className="text-primary">Green</span> Journey
          </h2>
          <p className="text-muted-foreground text-lg">
            Start free, upgrade when you're ready for professional-grade tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl bg-card p-8 shadow-card border border-border flex flex-col">
            <div className="mb-6">
              <h3 className="font-heading text-2xl font-bold text-card-foreground">Essentials</h3>
              <p className="text-muted-foreground text-sm mt-1">Perfect for getting started</p>
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
              <Link to="/register">Get Started Free</Link>
            </Button>
          </div>

          {/* Pro */}
          <div className="rounded-2xl p-8 shadow-elevated flex flex-col relative overflow-hidden bg-primary text-primary-foreground border-2 border-primary">
            <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
              <Star className="w-3 h-3" />
              BEST VALUE
            </div>
            <div className="mb-6">
              <h3 className="font-heading text-2xl font-bold">Pro</h3>
              <p className="text-primary-foreground/70 text-sm mt-1">For serious plant enthusiasts</p>
            </div>
            <div className="mb-8">
              <span className="font-heading text-5xl font-bold">$7.99</span>
              <span className="text-primary-foreground/70 ml-2">one-time</span>
              <div className="text-sm text-primary-foreground/60 mt-1">$200+ value — unlock everything</div>
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
            <p className="text-center text-xs text-primary-foreground/50 mt-3">One-time payment. No subscriptions.</p>
          </div>
        </div>

        {/* Bumps preview */}
        <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-card p-5 shadow-card border border-border">
            <div className="text-xs font-bold text-secondary uppercase mb-1">Add-on</div>
            <h4 className="font-heading text-lg font-semibold text-card-foreground">Masterclass Bundle</h4>
            <p className="text-sm text-muted-foreground mb-2">10+ premium video courses, PDF cheat sheets, and printable care labels</p>
            <div className="font-bold text-card-foreground">$4.99 <span className="line-through text-muted-foreground text-xs font-normal">$19.99</span></div>
          </div>
          <div className="rounded-xl bg-card p-5 shadow-card border border-border">
            <div className="text-xs font-bold text-bloom uppercase mb-1">Add-on</div>
            <h4 className="font-heading text-lg font-semibold text-card-foreground">Expert Access Pass</h4>
            <p className="text-sm text-muted-foreground mb-2">3 expert consultations/mo, priority support, and monthly live Q&A sessions</p>
            <div className="font-bold text-card-foreground">$9.99<span className="text-muted-foreground text-xs font-normal">/month</span></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
