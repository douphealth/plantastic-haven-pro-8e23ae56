import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar,
  Leaf,
  Droplets,
  Sun,
  Container,
  FileText,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  XCircle,
  ArrowRight
} from "lucide-react";

interface SavedCarePlan {
  reportId: string;
  date: string;
  plantName: string;
  answers: any;
  title: string;
  description: string;
  whatToDoToday: string;
  rescueDays: string[];
  wateringAdvice: string;
  lightAdvice: string;
  soilPotAdvice: string;
  mistakes: string[];
  relatedGuides: any[];
  checklistState: boolean[];
}

const CarePlan = () => {
  const { toast } = useToast();
  const [carePlan, setCarePlan] = useState<SavedCarePlan | null>(null);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = () => {
    try {
      const saved = localStorage.getItem("plantastichaven_care_plan");
      if (saved) {
        setCarePlan(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error parsing saved care plan", e);
    }
  };

  const handleCheckboxChange = (index: number, checked: boolean) => {
    if (!carePlan) return;

    const updatedStates = [...carePlan.checklistState];
    updatedStates[index] = checked;

    const updatedPlan = {
      ...carePlan,
      checklistState: updatedStates
    };

    setCarePlan(updatedPlan);
    localStorage.setItem("plantastichaven_care_plan", JSON.stringify(updatedPlan));

    if (checked) {
      toast({
        title: `Day ${index + 1} Completed! 🌱`,
        description: "Excellent progress. Keep going to rescue your plant!",
        variant: "default"
      });
    }
  };

  const completedDaysCount = carePlan?.checklistState.filter(Boolean).length || 0;
  const progressPercent = carePlan ? (completedDaysCount / carePlan.rescueDays.length) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {carePlan ? (
            <div className="space-y-8 animate-fade-in-up">
              {/* Header Title Dashboard */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Leaf className="w-3.5 h-3.5" /> Active Care Plan
                  </div>
                  <h1 className="text-3xl font-extrabold font-heading text-foreground">
                    {carePlan.plantName} Rescue Plan
                  </h1>
                  <p className="text-sm text-muted-foreground font-body">
                    Diagnosed on {carePlan.date} • Report ID: <strong>{carePlan.reportId}</strong>
                  </p>
                </div>

                <div className="flex gap-3 shrink-0">
                  <Button asChild size="sm" className="rounded-xl font-bold bg-primary text-white hover:bg-primary/95 flex items-center gap-2">
                    <Link to="/free-pdf">
                      <FileText className="w-4 h-4" /> Download PDF
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="rounded-xl font-semibold border-border hover:bg-accent flex items-center gap-2">
                    <Link to="/diagnose">
                      <RefreshCw className="w-3.5 h-3.5" /> Diagnose New
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Progress Summary and 7-day checklist */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 7-Day Checklist card (Left) */}
                <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" /> 7-Day Rescue Timeline
                    </h3>
                    <span className="text-sm font-semibold text-primary">
                      {completedDaysCount} of 7 Done
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all duration-500 ease-out" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xxs font-bold text-muted-foreground uppercase tracking-wider block">
                      Rescue Mission Progress
                    </span>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-4 pt-2">
                    {carePlan.rescueDays.map((dayText, index) => {
                      const isChecked = carePlan.checklistState[index];
                      return (
                        <div 
                          key={index} 
                          className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
                            isChecked 
                              ? "bg-primary/5 border-primary/20 text-muted-foreground" 
                              : "bg-background border-border text-foreground hover:border-border-hover"
                          }`}
                        >
                          <Checkbox
                            id={`day-${index}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => handleCheckboxChange(index, !!checked)}
                            className="mt-0.5 w-5 h-5 rounded-md border-border-hover data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <div className="space-y-1">
                            <label 
                              htmlFor={`day-${index}`}
                              className={`text-sm font-bold block cursor-pointer select-none ${
                                isChecked ? "line-through text-muted-foreground" : "text-foreground"
                              }`}
                            >
                              Day {index + 1}
                            </label>
                            <p className={`text-xs leading-relaxed font-body ${isChecked ? "text-muted-foreground/80" : "text-muted-foreground"}`}>
                              {dayText}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Diagnosis Summary (Right) */}
                <div className="space-y-6">
                  {/* Diagnosis Result */}
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" /> Root Cause
                    </div>
                    <h3 className="text-xl font-bold font-heading text-foreground leading-tight">
                      {carePlan.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-body">
                      {carePlan.description}
                    </p>
                  </div>

                  {/* Today's Urgent Action */}
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 shadow-sm space-y-3">
                    <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                      <CheckCircle className="w-4 h-4 text-amber-600" /> Today's Action Required
                    </h4>
                    <p className="text-xs text-amber-900 leading-relaxed font-medium font-body">
                      {carePlan.whatToDoToday}
                    </p>
                  </div>

                  {/* Mistakes to Avoid */}
                  <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 shadow-sm space-y-3">
                    <h4 className="text-sm font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                      <XCircle className="w-4 h-4 text-red-500" /> Mistakes to Avoid
                    </h4>
                    <ul className="list-disc pl-4 text-xs text-red-900 font-body space-y-1.5">
                      {carePlan.mistakes.map((mistake, idx) => (
                        <li key={idx}>{mistake}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Environmental Guidelines Section */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-6">
                <h3 className="text-xl font-bold font-heading text-foreground">
                  Environmental Requirements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-background rounded-xl p-5 border border-border space-y-2">
                    <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 font-heading">
                      <Droplets className="w-4 h-4 text-blue-500" /> Watering Guide
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-body">
                      {carePlan.wateringAdvice}
                    </p>
                  </div>

                  <div className="bg-background rounded-xl p-5 border border-border space-y-2">
                    <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 font-heading">
                      <Sun className="w-4 h-4 text-amber-500" /> Light Guide
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-body">
                      {carePlan.lightAdvice}
                    </p>
                  </div>

                  <div className="bg-background rounded-xl p-5 border border-border space-y-2">
                    <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 font-heading">
                      <Container className="w-4 h-4 text-emerald-600" /> Soil & Potting Guide
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-body">
                      {carePlan.soilPotAdvice}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommended Articles */}
              {carePlan.relatedGuides && carePlan.relatedGuides.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-4">
                  <h3 className="text-lg font-bold font-heading text-foreground">
                    Recommended Reading
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {carePlan.relatedGuides.map((guide, idx) => (
                      <Link
                        key={idx}
                        to={guide.link}
                        className="p-3.5 rounded-xl border border-border hover:border-primary/40 bg-background hover:bg-primary/5 transition-all text-sm font-semibold flex items-center justify-between text-foreground hover:text-primary"
                      >
                        <span>{guide.title}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-card text-center space-y-6 max-w-xl mx-auto animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mx-auto">
                <HelpCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-heading text-foreground">No Active Care Plan</h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto font-body">
                  You haven't generated a plant diagnosis yet. Take our 60-second quiz to create your customized rescue guide.
                </p>
              </div>
              <Button asChild size="lg" className="rounded-xl font-bold bg-primary text-white hover:bg-primary/95 shadow-sm px-8">
                <Link to="/diagnose">
                  Diagnose My Plant
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CarePlan;
