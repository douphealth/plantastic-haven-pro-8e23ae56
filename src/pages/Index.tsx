import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Leaf, 
  FileText, 
  Download, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";

const Index = () => {
  const [hasCarePlan, setHasCarePlan] = useState(false);
  const [savedPlantName, setSavedPlantName] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("plantastichaven_care_plan");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.plantName) {
          setHasCarePlan(true);
          setSavedPlantName(parsed.plantName);
        }
      }
    } catch (e) {
      console.error("Error reading care plan from localStorage", e);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/5 blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary">No Signup Required • 100% Instant Value</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground tracking-tight mb-6 animate-fade-in-up">
            Thrive, Don't Just
            <br />
            <span className="text-gradient-primary">Survive.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 md:mb-12 font-body">
            Get professional plant diagnostics and a personalized 7-day rescue care plan in under 60 seconds. Free, simple, and tailored specifically to your plant.
          </p>

          {/* Action CTAs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16 text-left">
            {/* CTA 1: Diagnose Plant */}
            <div className="group relative bg-card hover:bg-card/80 border border-border hover:border-primary/30 rounded-2xl p-6 md:p-8 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full group-hover:bg-primary/10 transition-colors" />
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-heading text-foreground mb-2 group-hover:text-primary transition-colors">
                  Diagnose My Plant
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-body">
                  Experiencing yellow leaves, spots, or wilting? Answer 7 quick questions to identify the root cause instantly.
                </p>
              </div>
              <Button asChild size="lg" className="w-full justify-between rounded-xl font-bold bg-primary text-white hover:bg-primary/95 group-hover:scale-[1.01] transition-transform">
                <Link to="/diagnose">
                  Start Quiz <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* CTA 2: Create Free PDF */}
            <div className="group relative bg-card hover:bg-card/80 border border-border hover:border-primary/30 rounded-2xl p-6 md:p-8 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-full group-hover:bg-secondary/10 transition-colors" />
              <div>
                <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary-foreground mb-6">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-heading text-foreground mb-2 group-hover:text-secondary-foreground transition-colors">
                  Create Free PDF
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-body">
                  Generate a beautifully formatted, premium plant care PDF. Includes checklists, guides, and notes without signing up.
                </p>
              </div>
              <Button asChild variant="secondary" size="lg" className="w-full justify-between rounded-xl font-bold group-hover:scale-[1.01] transition-transform">
                <Link to="/free-pdf">
                  Customize PDF <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* CTA 3: Care Plan (Conditional) */}
            <div className="group relative bg-card hover:bg-card/80 border border-border hover:border-primary/30 rounded-2xl p-6 md:p-8 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full group-hover:bg-emerald-500/10 transition-colors" />
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6">
                  <Download className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-heading text-foreground mb-2 group-hover:text-emerald-600 transition-colors">
                  {hasCarePlan ? "Download My Care Plan" : "My Care Plan"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-body">
                  {hasCarePlan 
                    ? `Retrieve your saved care plan and 7-day checklist for your ${savedPlantName}.`
                    : "No active care plan found yet. Complete a diagnosis to generate and track your plant rescue plan here."
                  }
                </p>
              </div>
              {hasCarePlan ? (
                <Button asChild variant="outline" size="lg" className="w-full justify-between rounded-xl font-bold border-emerald-600/30 text-emerald-700 hover:bg-emerald-500/5 hover:text-emerald-800">
                  <Link to="/care-plan">
                    View Plan ({savedPlantName}) <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" size="lg" className="w-full justify-between rounded-xl font-bold border-border text-muted-foreground hover:bg-accent hover:text-foreground">
                  <Link to="/diagnose">
                    Diagnose First <HelpCircle className="w-4 h-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Value Steps Section */}
          <div className="mt-8 border-t border-border pt-16 max-w-4xl mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-12">
              Value in Under 60 Seconds
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg mb-4">
                  1
                </div>
                <h4 className="font-bold text-foreground mb-2">Identify Problem</h4>
                <p className="text-sm text-muted-foreground font-body">
                  Answer 7 questions about soil, water, drainage, and symptoms.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg mb-4">
                  2
                </div>
                <h4 className="font-bold text-foreground mb-2">Get Actionable Steps</h4>
                <p className="text-sm text-muted-foreground font-body">
                  Instantly receive your 7-day rescue checklist and advice.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg mb-4">
                  3
                </div>
                <h4 className="font-bold text-foreground mb-2">Download Premium PDF</h4>
                <p className="text-sm text-muted-foreground font-body">
                  Save your personalized care calendar offline as a beautiful PDF guide.
                </p>
              </div>
            </div>
          </div>

          {/* Quick FAQ / Proof Section */}
          <div className="mt-16 bg-card border border-border rounded-2xl p-6 md:p-10 max-w-4xl mx-auto text-left flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 max-w-md">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Private & Zero Obligation</span>
              </div>
              <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground">
                No credit cards. No passwords. Just care.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-body">
                We believe plant care should be instant and friction-free. We save your diagnosis strictly on your local browser database, so your data stays entirely yours.
              </p>
            </div>
            <div className="flex flex-row md:flex-col gap-4 w-full md:w-auto">
              <div className="bg-background rounded-xl p-3 border border-border text-center flex-1 md:flex-none">
                <div className="text-2xl font-black text-primary">60s</div>
                <div className="text-xxs uppercase tracking-wider text-muted-foreground">Time to PDF</div>
              </div>
              <div className="bg-background rounded-xl p-3 border border-border text-center flex-1 md:flex-none">
                <div className="text-2xl font-black text-secondary-foreground">100%</div>
                <div className="text-xxs uppercase tracking-wider text-muted-foreground">Free Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
