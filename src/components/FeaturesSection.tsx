import { Scan, Droplets, BookOpen, Camera, Brain, ShoppingBag, Users, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "AI Plant Identifier",
    description: "Snap a photo and instantly identify any plant species, toxicity level, and get a complete care summary.",
    tier: "free",
  },
  {
    icon: Droplets,
    title: "Smart Watering",
    description: "Dynamic watering schedules that adapt to your local weather, humidity, and each plant's unique needs.",
    tier: "free",
  },
  {
    icon: BookOpen,
    title: "Learning Hub",
    description: "Curated articles, seasonal calendars, and weekly plant spotlights to grow your botanical knowledge.",
    tier: "free",
  },
  {
    icon: Brain,
    title: "AI Health Scanner",
    description: "Diagnose diseases, pests, and nutrient deficiencies with 95%+ accuracy and get treatment plans.",
    tier: "pro",
  },
  {
    icon: Camera,
    title: "AR Garden Designer",
    description: "Point your camera at any space and design your dream garden with 3D plant models at real scale.",
    tier: "pro",
  },
  {
    icon: BarChart3,
    title: "Growth Analytics",
    description: "Track height, bloom cycles, and harvest yields with beautiful charts and exportable PDF reports.",
    tier: "pro",
  },
  {
    icon: ShoppingBag,
    title: "Pro Marketplace",
    description: "Exclusive 10-25% discounts, rare plant alerts, and a plant swap board for your local community.",
    tier: "pro",
  },
  {
    icon: Users,
    title: "Expert Network",
    description: "Get 24hr responses from certified botanists, join local plant groups, and earn your Pro badge.",
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
