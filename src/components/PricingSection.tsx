import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const freeTier = [
  "10 AI plant scans/month",
  "5 plants on your shelf",
  "Basic watering reminders",
  "Learning Hub access",
  "Basic garden journal",
  "Community forum (read + 3 posts/mo)",
];

const proTier = [
  "Unlimited AI scans & diagnostics",
  "Unlimited plants",
  "Hyper-personalized care engine",
  "AR Garden Designer",
  "Advanced analytics & reports",
  "Masterclass video library",
  "Pro marketplace discounts (10-25%)",
  "Expert consultations (3/mo)",
  "Web dashboard access",
  "Team collaboration tools",
];

const PricingSection = () => {
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
            <Button variant="heroOutline" className="w-full h-12 rounded-xl">
              Get Started Free
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
              <span className="font-heading text-5xl font-bold">$99</span>
              <span className="text-primary-foreground/70 ml-2">/year</span>
              <div className="text-sm text-primary-foreground/60 mt-1">$900+ value — save 88%</div>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {proTier.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                  <span className="text-sm text-primary-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
            <Button variant="gold" className="w-full h-12 rounded-xl text-base">
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
