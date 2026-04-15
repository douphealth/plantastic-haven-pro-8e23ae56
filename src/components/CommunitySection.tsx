import { MessageCircle, Award, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  { value: "250K+", label: "Community Members" },
  { value: "1.2M", label: "Questions Answered" },
  { value: "50K+", label: "Plant Swaps" },
  { value: "4.9★", label: "App Store Rating" },
];

const CommunitySection = () => {
  return (
    <section id="community" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Community
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Grow <span className="text-primary">Together</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Join the world's most passionate plant community.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-3xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-2xl bg-card shadow-card border border-border">
              <div className="font-heading text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { icon: MessageCircle, title: "Ask Experts", description: "Get personalized advice from certified horticulturists within 24 hours." },
            { icon: MapPin, title: "Local Groups", description: "Find plant lovers near you for meetups, swaps, and shared garden projects." },
            { icon: Award, title: "Pro Badge", description: "Stand out with your verified Pro badge and share your expertise." },
          ].map((feature) => (
            <div key={feature.title} className="text-center p-8 rounded-2xl bg-card shadow-card border border-border hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-card-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild variant="hero" size="lg" className="h-14 px-8 rounded-xl">
            <Link to="/register">Join the Community <ArrowRight className="w-5 h-5 ml-2" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
