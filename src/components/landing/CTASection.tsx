import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Plant Care?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Join 250,000+ plant lovers who trust PlantasticHaven to keep their green friends thriving. Start free today.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link to="/register">
              <Button variant="gold" size="lg" className="h-14 px-8 rounded-xl text-base">
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="heroOutline" size="lg" className="h-14 px-8 rounded-xl text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-primary-foreground/70">
            {[
              { icon: Leaf, text: "No credit card required" },
              { icon: Shield, text: "Your data is secure" },
              { icon: Zap, text: "Set up in 30 seconds" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2">
                <item.icon className="w-4 h-4" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
