import { Scan, Droplets, BookOpen, Camera, Brain, ShoppingBag, Users, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "AI Plant Identifier",
    description: "Pro can send a photo or a description to the configured identifier. The answer is a best guess.",
    tier: "pro",
  },
  {
    icon: Droplets,
    title: "Care calendar",
    description: "Pro plants keep a watering interval you choose. The calendar does not read local weather.",
    tier: "pro",
  },
  {
    icon: BookOpen,
    title: "Care guides",
    description: "The lesson library is free to read. Pro can mark lessons complete.",
    tier: "free",
  },
  {
    icon: Brain,
    title: "Problem checklist",
    description: "The free quiz matches your answers to common care problems. It does not claim a measured accuracy rate.",
    tier: "free",
  },
  {
    icon: Camera,
    title: "Plant photos",
    description: "The identifier accepts a photo. There is no augmented-reality garden designer.",
    tier: "pro",
  },
  {
    icon: BarChart3,
    title: "Health rating",
    description: "You set thriving, okay, or struggling. The dashboard averages those ratings.",
    tier: "pro",
  },
  {
    icon: ShoppingBag,
    title: "No marketplace",
    description: "This app does not sell plants or offer discount codes.",
    tier: "free",
  },
  {
    icon: Users,
    title: "Community",
    description: "Pro members can post. There is no certified-botanist response time.",
    tier: "pro",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Everything You Need
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            One App, Endless <span className="text-primary">Green</span> Possibilities
          </h2>
          <p className="text-muted-foreground text-lg">
            From beginner tips to professional-grade tools — PlantasticHaven grows with you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border border-border"
            >
              {feature.tier === "pro" && (
                <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
                  Pro
                </span>
              )}
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-accent-foreground group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-card-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
