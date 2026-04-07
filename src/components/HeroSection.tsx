import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-plants.jpg";
import { Leaf, Scan, Droplets, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Lush indoor plant collection"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-6 animate-fade-in-up">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary-foreground/90">AI-Powered Plant Intelligence</span>
          </div>

          <h1 className="font-heading text-5xl md:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Your Personal
            <br />
            <span className="text-primary">Botanist</span> in
            <br />
            Your Pocket
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-lg font-body leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Identify plants instantly, diagnose diseases with AI, design gardens in AR,
            and join a thriving community of plant lovers.
          </p>

          <div className="flex flex-wrap gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button asChild variant="hero" size="lg" className="h-14 px-8 text-base rounded-xl">
              <Link to="/register">Start Free — 10 AI Scans</Link>
            </Button>
            <Button asChild variant="heroOutline" size="lg" className="h-14 px-8 text-base rounded-xl border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <a href="#pricing">Explore Pro Features</a>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            {[
              { icon: Scan, label: "Plants Identified", value: "2.4M+" },
              { icon: Droplets, label: "Plants Saved", value: "890K+" },
              { icon: BookOpen, label: "Care Guides", value: "15K+" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-lg font-bold text-primary-foreground">{stat.value}</div>
                  <div className="text-xs text-primary-foreground/60">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative floating elements */}
      <div className="absolute right-10 top-1/4 w-20 h-20 rounded-full bg-primary/10 blur-2xl animate-float" />
      <div className="absolute right-32 bottom-1/4 w-32 h-32 rounded-full bg-secondary/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
    </section>
  );
};

export default HeroSection;
