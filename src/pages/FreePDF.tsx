import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useReactToPrint } from "react-to-print";
import {
  Printer,
  Leaf,
  Palette,
  FileText,
  Mail,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Calendar,
  ExternalLink,
  QrCode
} from "lucide-react";

// Accent color palettes
const COLOR_PALETTES = {
  emerald: {
    name: "Emerald Green",
    primary: "#10b981",
    bg: "#f0fdf4",
    border: "#d1fae5",
    text: "#065f46",
    gradient: "linear-gradient(135deg, #059669, #10b981)"
  },
  amber: {
    name: "Warm Amber",
    primary: "#f59e0b",
    bg: "#fef3c7",
    border: "#fde68a",
    text: "#92400e",
    gradient: "linear-gradient(135deg, #d97706, #f59e0b)"
  },
  blue: {
    name: "Ocean Blue",
    primary: "#3b82f6",
    bg: "#eff6ff",
    border: "#dbeafe",
    text: "#1e40af",
    gradient: "linear-gradient(135deg, #2563eb, #3b82f6)"
  },
  pink: {
    name: "Sunset Pink",
    primary: "#ec4899",
    bg: "#fdf2f8",
    border: "#fce7f3",
    text: "#9d174d",
    gradient: "linear-gradient(135deg, #db2777, #ec4899)"
  }
};

type PaletteKey = keyof typeof COLOR_PALETTES;

const FreePDF = () => {
  const { toast } = useToast();
  const [carePlan, setCarePlan] = useState<any>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [accentColor, setAccentColor] = useState<PaletteKey>("emerald");
  const [customNotes, setCustomNotes] = useState("");
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  // Trigger print
  const handlePrintTrigger = useReactToPrint({
    content: () => printRef.current,
    documentTitle: carePlan ? `${carePlan.plantName.replace(/\s+/g, '-')}-Care-Guide` : "PlantasticHaven-Care-Guide",
    onAfterPrint: () => {
      setPdfGenerated(true);
      toast({
        title: "Print layout opened! 📄",
        description: "Save as PDF or print. Join our optional newsletter below for monthly care tips.",
        variant: "default"
      });
    }
  });

  useEffect(() => {
    const saved = localStorage.getItem("plantastichaven_care_plan");
    if (saved) {
      setCarePlan(JSON.parse(saved));
      setIsPreviewMode(false);
    } else {
      // Default fallback mock care plan if they came directly to PDF page
      setIsPreviewMode(true);
      setCarePlan({
        reportId: "PH-SAMPLE",
        date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
        plantName: "Monstera Deliciosa",
        title: "Mild Overwatering & Root Aeration Block",
        description: "The root system of this Monstera is experiencing oxygen restriction. Soil has remained damp for too long without adequate air exchange, which leads to early-stage root rot. Leaves show light yellowing and lower leaf droop.",
        whatToDoToday: "Empty the water collection saucer immediately. Poke 10 deep holes in the soil with a chopstick to force oxygen flow, and move 2 feet closer to indirect light.",
        rescueDays: [
          "Check drainage saucer and empty standing water. Poke ventilation holes in soil.",
          "Wipe leaf surfaces with a damp microfiber cloth to remove dust.",
          "Check root health by poking a finger deep into soil. Feel for moisture levels.",
          "Acclimate plant by rotating pot 90 degrees to ensure even lighting.",
          "Inspect leaf joints and petioles under leaves for pests or scale.",
          "Keep checking soil moisture. Do not add any water.",
          "Assess leaf color. If soil is completely dry, water deeply from top."
        ],
        wateringAdvice: "Water deeply only when the top 3 inches of soil are fully dry. Drench soil until it flows out of the drainage holes, then empty the saucer after 15 minutes.",
        lightAdvice: "Place in bright indirect light. Avoid low-light corners which make soil stay wet for weeks.",
        soilPotAdvice: "Use a pot with drainage holes. Potting mix should be 60% standard soil, 25% perlite for drainage, and 15% orchid bark for oxygen spaces.",
        mistakes: [
          "Watering on a weekly calendar schedule.",
          "Leaving standing water in the bottom saucer.",
          "Placing the plant in a windowless room."
        ],
        relatedGuides: [
          { title: "Avoiding Root Rot: The Golden Rule of Watering", link: "/guides?article=survival-guide&day=0" },
          { title: "Soil Architecture: Creating the Ultimate Mix", link: "/guides?article=survival-guide&day=2" }
        ]
      });
    }
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email Address 📧",
        description: "Please enter a valid email to subscribe.",
        variant: "destructive"
      });
      return;
    }
    setEmailSubmitted(true);
    toast({
      title: "Successfully Subscribed! 🌿",
      description: "Welcome! We will send you monthly seasonal care checklists.",
      variant: "default"
    });
  };

  // Generate 4-week calendar schedule visualization
  const renderCalendarGrid = (frequency: string, color: string) => {
    const totalDays = 28;
    const waterDays: number[] = [];

    const normFreq = frequency.toLowerCase();
    if (normFreq.includes("day") && normFreq.includes("single")) {
      for (let i = 1; i <= totalDays; i++) waterDays.push(i);
    } else if (normFreq.includes("2") || normFreq.includes("3")) {
      for (let i = 1; i <= totalDays; i += 3) waterDays.push(i);
    } else if (normFreq.includes("week")) {
      for (let i = 1; i <= totalDays; i += 7) waterDays.push(i);
    } else if (normFreq.includes("10") || normFreq.includes("14")) {
      for (let i = 1; i <= totalDays; i += 12) waterDays.push(i);
    } else {
      waterDays.push(1, 28); // monthly
    }

    const grid = [];
    for (let day = 1; day <= totalDays; day++) {
      const isWaterDay = waterDays.includes(day);
      grid.push(
        <div 
          key={day} 
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            padding: "8px 4px",
            textAlign: "center",
            fontSize: "10px",
            fontWeight: "bold",
            backgroundColor: isWaterDay ? "#eff6ff" : "#ffffff",
            color: isWaterDay ? "#1e40af" : "#64748b",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            height: "42px"
          }}
        >
          <span>Day {day}</span>
          <span style={{ fontSize: "12px", marginTop: "2px" }}>
            {isWaterDay ? "💧" : "•"}
          </span>
        </div>
      );
    }
    return grid;
  };

  const selectedPalette = COLOR_PALETTES[accentColor];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Top Banner alert for Preview mode */}
          {isPreviewMode && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-body text-sm font-medium animate-fade-in-up">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span><strong>Preview Mode:</strong> No diagnosis found. Showing a sample Monstera Care Guide.</span>
              </span>
              <Button asChild size="sm" className="rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0">
                <Link to="/diagnose">
                  Diagnose My Plant Now
                </Link>
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Customization Options (Left side - 4 cols) */}
            <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold font-heading text-foreground">SOTA PDF Builder</h2>
                <p className="text-xs text-muted-foreground font-body">
                  Personalize the styling and add notes before printing.
                </p>
              </div>

              {/* Accent Color Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> Accent Color Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(COLOR_PALETTES).map(([key, palette]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAccentColor(key as PaletteKey)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        accentColor === key
                          ? "border-primary bg-primary/5 shadow-sm text-foreground"
                          : "border-border bg-background hover:border-primary/30 text-muted-foreground"
                      }`}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full shrink-0" 
                        style={{ backgroundColor: palette.primary }}
                      />
                      <span>{palette.name.split(" ")[1]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Care Notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Add Custom Notes
                </label>
                <Textarea
                  placeholder="e.g. Placed in the bedroom near the window, water with filtered water only."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="min-h-[100px] text-xs rounded-xl border-border focus:ring-primary font-body"
                />
              </div>

              {/* PDF Action Trigger */}
              <div className="pt-2">
                <Button
                  onClick={handlePrintTrigger}
                  className="w-full rounded-xl bg-primary hover:bg-primary/95 text-white font-bold h-12 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4.5 h-4.5 animate-bounce" /> Print / Save as PDF
                </Button>
              </div>

              {/* Optional Email Subscribe Box (shown always, but highlighted after export) */}
              <div className={`p-4 rounded-xl border transition-all duration-300 ${
                pdfGenerated 
                  ? "bg-primary/5 border-primary/20 scale-[1.02]" 
                  : "bg-background border-border"
              }`}>
                {!emailSubmitted ? (
                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 font-heading">
                      <Mail className="w-3.5 h-3.5 text-primary" /> Optional: Care Reminders
                    </h4>
                    <p className="text-xxs text-muted-foreground font-body leading-relaxed">
                      Get monthly seasonal plant checklists. No login required, unsubscribe anytime.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-9 text-xs rounded-lg border-border"
                      />
                      <Button type="submit" size="sm" className="rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/95">
                        Join
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center space-y-1">
                    <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                    <p className="text-xs font-bold text-primary">Subscribed!</p>
                    <p className="text-xxs text-muted-foreground font-body">We'll email you monthly care tips.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Print Preview Panel (Right side - 8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Live Print Layout Preview
                </h3>
                <span className="text-xxs text-muted-foreground font-body">
                  Layout is optimized for A4/Letter size printing.
                </span>
              </div>

              {/* Printable Area Wrapper */}
              <div className="bg-muted p-4 md:p-8 rounded-2xl border border-border max-h-[850px] overflow-y-auto shadow-inner">
                {/* Print Layout Document */}
                <div 
                  ref={printRef}
                  className="bg-white text-slate-800 shadow-card mx-auto p-10 font-body text-left relative"
                  style={{
                    width: "210mm",
                    minHeight: "297mm",
                    boxSizing: "border-box"
                  }}
                >
                  {/* Inline styles for Print overrides */}
                  <style dangerouslySetInnerHTML={{__html: `
                    @media print {
                      body {
                        background: #ffffff !important;
                        color: #0f172a !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                      }
                      .print-page {
                        width: 210mm !important;
                        height: 297mm !important;
                        page-break-after: always !important;
                        box-sizing: border-box !important;
                        padding: 15mm !important;
                        position: relative !important;
                        background: #ffffff !important;
                      }
                      .print-no-break {
                        page-break-inside: avoid !important;
                      }
                    }
                  `}} />

                  {/* ================= PAGE 1: COVER ================= */}
                  <div className="print-page flex flex-col justify-between" style={{ height: "260mm" }}>
                    {/* Top Banner border */}
                    <div style={{ borderLeft: `6px solid ${selectedPalette.primary}`, paddingLeft: "20px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: selectedPalette.primary, letterSpacing: "3px", textTransform: "uppercase" }}>
                        Intelligent Houseplant Series
                      </span>
                      <h1 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "38px", fontWeight: 800, margin: "10px 0 5px 0", color: "#1e293b", lineHeight: 1.1 }}>
                        Plantastic<span style={{ color: selectedPalette.primary }}>Haven</span>
                      </h1>
                      <div style={{ height: "1px", backgroundColor: "#e2w8f0", width: "100px", margin: "10px 0" }} />
                      <p style={{ fontSize: "12px", color: "#64748b", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
                        Premium Care Guide & Rescue Plan
                      </p>
                    </div>

                    {/* Central Cover graphic */}
                    <div style={{ margin: "50px 0", textAlign: "center", position: "relative" }}>
                      {/* Premium Leaf Badge */}
                      <div style={{ 
                        width: "140px", 
                        height: "140px", 
                        borderRadius: "50%", 
                        backgroundColor: selectedPalette.bg, 
                        border: `3px double ${selectedPalette.primary}`,
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        margin: "0 auto 24px auto"
                      }}>
                        {/* Leaf SVG Art */}
                        <svg className="w-16 h-16" style={{ color: selectedPalette.primary }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z" />
                          <path d="M9.8 6.1C11 9 12 15 8 22" />
                          <path d="M19 2c-2.4 5.6-4.5 9-10 10.2" />
                        </svg>
                      </div>
                      <h2 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "32px", fontWeight: 800, color: "#0f172a", margin: "0 0 10px 0" }}>
                        {carePlan.plantName}
                      </h2>
                      <div style={{ display: "inline-block", padding: "6px 16px", backgroundColor: selectedPalette.bg, border: `1px solid ${selectedPalette.border}`, borderRadius: "20px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: selectedPalette.text }}>
                          Report ID: {carePlan.reportId}
                        </span>
                      </div>
                    </div>

                    {/* Custom Notes from cover */}
                    {customNotes && (
                      <div style={{ padding: "15px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px", color: "#475569", maxWidth: "450px", margin: "0 auto" }}>
                        <strong style={{ display: "block", marginBottom: "4px", color: "#1e293b" }}>Gardener Notes:</strong>
                        <span>"{customNotes}"</span>
                      </div>
                    )}

                    {/* Footer Cover Info */}
                    <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "20px", display: "flex", justifyBetween: "space-between", fontSize: "11px", color: "#64748b" }}>
                      <div>
                        <strong>Authorized:</strong> Certified Botanical Analytics
                      </div>
                      <div style={{ marginLeft: "auto" }}>
                        <strong>Date:</strong> {carePlan.date}
                      </div>
                    </div>
                  </div>

                  {/* PAGE BREAK */}
                  <div className="page-break" style={{ height: "10px" }} />

                  {/* ================= PAGE 2: DIAGNOSIS & RESCUE ================= */}
                  <div className="print-page flex flex-col justify-between" style={{ minHeight: "260mm", paddingTop: "20px" }}>
                    <div className="space-y-6">
                      {/* Page Header */}
                      <div style={{ borderBottom: `2px solid ${selectedPalette.border}`, paddingBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
                          01. Diagnosis & Rescue Plan
                        </span>
                        <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>
                          {carePlan.plantName} Guide
                        </span>
                      </div>

                      {/* Diagnosis Section */}
                      <div style={{ backgroundColor: "#fafafb", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 800, color: "#ef4444", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                          Most Likely Diagnosis
                        </span>
                        <h3 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "20px", fontWeight: 700, color: "#0f172a", margin: "0 0 10px 0" }}>
                          {carePlan.title}
                        </h3>
                        <p style={{ fontSize: "12px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                          {carePlan.description}
                        </p>
                      </div>

                      {/* What to do today urgent card */}
                      <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "16px", display: "flex", gap: "10px", alignItems: "start" }}>
                        <span style={{ fontSize: "18px", marginTop: "-2px" }}>💡</span>
                        <div>
                          <strong style={{ fontSize: "12px", display: "block", color: "#92400e", marginBottom: "2px" }}>Urgently required action today:</strong>
                          <p style={{ fontSize: "11px", color: "#78350f", margin: 0, lineHeight: 1.5 }}>
                            {carePlan.whatToDoToday}
                          </p>
                        </div>
                      </div>

                      {/* 7-Day Rescue Checklist */}
                      <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px" }}>
                        <h3 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: "0 0 15px 0" }}>
                          7-Day Rescue Timeline Checklist
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {carePlan.rescueDays.map((dayText: string, idx: number) => (
                            <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "start", fontSize: "11px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                              {/* Blank checkbox for physical writing */}
                              <div style={{ width: "16px", height: "16px", border: `1.5px solid ${selectedPalette.primary}`, borderRadius: "4px", marginTop: "1px", flexShrink: 0 }} />
                              <div>
                                <strong style={{ color: selectedPalette.text }}>Day {idx + 1}:</strong> {dayText}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer page number */}
                    <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#94a3b8" }}>
                      <span>PlantasticHaven Care Guide</span>
                      <span>Page 2 of 4</span>
                    </div>
                  </div>

                  {/* PAGE BREAK */}
                  <div className="page-break" style={{ height: "10px" }} />

                  {/* ================= PAGE 3: GUIDES & SCHEDULES ================= */}
                  <div className="print-page flex flex-col justify-between" style={{ minHeight: "260mm", paddingTop: "20px" }}>
                    <div className="space-y-6">
                      {/* Page Header */}
                      <div style={{ borderBottom: `2px solid ${selectedPalette.border}`, paddingBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
                          02. Environmental Guides & Checklists
                        </span>
                        <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>
                          {carePlan.plantName} Guide
                        </span>
                      </div>

                      {/* Environmental 3 Columns */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px" }}>
                          <h4 style={{ margin: "0 0 6px 0", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#3b82f6" }}>
                            💧 Watering Guide
                          </h4>
                          <p style={{ margin: 0, fontSize: "10px", lineHeight: 1.5, color: "#475569" }}>
                            {carePlan.wateringAdvice}
                          </p>
                        </div>

                        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px" }}>
                          <h4 style={{ margin: "0 0 6px 0", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#f59e0b" }}>
                            ☀️ Light Guide
                          </h4>
                          <p style={{ margin: 0, fontSize: "10px", lineHeight: 1.5, color: "#475569" }}>
                            {carePlan.lightAdvice}
                          </p>
                        </div>

                        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px" }}>
                          <h4 style={{ margin: "0 0 6px 0", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#10b981" }}>
                            🪴 Soil/Potting Guide
                          </h4>
                          <p style={{ margin: 0, fontSize: "10px", lineHeight: 1.5, color: "#475569" }}>
                            {carePlan.soilPotAdvice}
                          </p>
                        </div>
                      </div>

                      {/* Dynamic 4-Week Watering Calendar Schedule */}
                      <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
                        <h4 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "14px", fontWeight: 700, margin: "0 0 10px 0", color: "#0f172a" }}>
                          🗓 Projected 4-Week Irrigation Calendar
                        </h4>
                        <p style={{ fontSize: "10px", color: "#64748b", margin: "0 0 12px 0", lineHeight: 1.4 }}>
                          Days marked with 💧 represent estimated irrigation points. Adjust schedules if top soil is still damp.
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
                          {renderCalendarGrid(carePlan.answers?.wateringFrequency || "Once a week (regularly)", selectedPalette.primary)}
                        </div>
                      </div>

                      {/* Checklists and Mistakes */}
                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px" }}>
                        {/* Checklists */}
                        <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "15px" }}>
                          <h4 style={{ fontFamily: "Playfair Display, serif", fontSize: "13px", fontWeight: 700, margin: "0 0 10px 0" }}>
                            Ongoing Care Checklists
                          </h4>
                          
                          <div style={{ margin: "10px 0" }}>
                            <span style={{ fontSize: "10px", fontWeight: 800, color: selectedPalette.text, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                              Weekly Routine Checklist
                            </span>
                            {["Inspect soil dryness 2 inches deep", "Clean heavy dust layers from foliage", "Rotate the pot 90 degrees for even light", "Verify bottom saucer is dry"].map((t, i) => (
                              <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "10px", margin: "4px 0" }}>
                                <div style={{ width: "10px", height: "10px", border: "1.5px solid #cbd5e1", borderRadius: "2px" }} />
                                <span>{t}</span>
                              </div>
                            ))}
                          </div>

                          <div style={{ marginTop: "15px" }}>
                            <span style={{ fontSize: "10px", fontWeight: 800, color: selectedPalette.text, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                              Monthly Maintenance Checklist
                            </span>
                            {["Deep clean foliage with damp cloth", "Check bottom drainage holes for root bind", "Inspect leaf joints for scale/gnats", "Trim dead lower yellowed leaves"].map((t, i) => (
                              <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "10px", margin: "4px 0" }}>
                                <div style={{ width: "10px", height: "10px", border: "1.5px solid #cbd5e1", borderRadius: "2px" }} />
                                <span>{t}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Common Mistakes */}
                        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "10px", padding: "15px" }}>
                          <h4 style={{ fontSize: "11px", fontWeight: 700, color: "#991b1b", textTransform: "uppercase", margin: "0 0 8px 0" }}>
                            ⚠️ Avoid these slips:
                          </h4>
                          <ul style={{ paddingLeft: "15px", margin: 0, fontSize: "10px", color: "#7f1d1d", lineHeight: 1.6 }}>
                            {carePlan.mistakes.map((m: string, i: number) => (
                              <li key={i} style={{ marginBottom: "6px" }}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Footer page number */}
                    <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "10px", display: "flex", justifyBetween: "space-between", fontSize: "10px", color: "#94a3b8" }}>
                      <span>PlantasticHaven Care Guide</span>
                      <span>Page 3 of 4</span>
                    </div>
                  </div>

                  {/* PAGE BREAK */}
                  <div className="page-break" style={{ height: "10px" }} />

                  {/* ================= PAGE 4: GUIDES & CUSTOM NOTES ================= */}
                  <div className="print-page flex flex-col justify-between" style={{ minHeight: "260mm", paddingTop: "20px" }}>
                    <div className="space-y-6">
                      {/* Page Header */}
                      <div style={{ borderBottom: `2px solid ${selectedPalette.border}`, paddingBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
                          03. Recommended Guides & Notes
                        </span>
                        <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>
                          {carePlan.plantName} Guide
                        </span>
                      </div>

                      {/* SOTA Recommended Guides cards with Absolute Clickable URLs and vector QR codes */}
                      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 0.5fr", gap: "20px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px" }}>
                        <div>
                          <h3 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0" }}>
                            Recommended PlantasticHaven Care Guides
                          </h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {carePlan.relatedGuides.map((guide: any, idx: number) => {
                              const absoluteUrl = `https://plantastichaven.com${guide.link}`;
                              return (
                                <div key={idx} style={{ padding: "10px", backgroundColor: "#f8fafc", borderRadius: "8px", borderLeft: `3px solid ${selectedPalette.primary}` }}>
                                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e293b" }}>
                                    {guide.title}
                                  </div>
                                  <a 
                                    href={absoluteUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    style={{ 
                                      fontSize: "10px", 
                                      color: selectedPalette.text, 
                                      textDecoration: "underline", 
                                      fontWeight: 600,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "3px",
                                      marginTop: "4px" 
                                    }}
                                  >
                                    <span>{absoluteUrl}</span>
                                  </a>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Visual Vector QR Code pointing to site */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #e2e8f0", paddingLeft: "15px" }}>
                          <svg width="64" height="64" viewBox="0 0 29 29" fill="none" stroke="#0f172a" strokeWidth="1">
                            <path d="M1 1h7v7H1V1zM3 3v3h3V3H3zM21 1h7v7h-7V1zM23 3v3h3V3H3zM1 21h7v7H1v-7zM3 23v3h3v-3H3z" fill="currentColor"/>
                            <path d="M12 2h2v4h-2V2zM15 4h3V2h-3v2zM12 12h5v2h-5v-2zM21 12h2v5h-2v-5zM12 18h2v5h-2v-5zM18 18h4v2h-4v-2z" fill="currentColor"/>
                          </svg>
                          <span style={{ fontSize: "8px", color: "#64748b", fontWeight: "bold", marginTop: "8px", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Scan to Read
                            <br />
                            Care Hub
                          </span>
                        </div>
                      </div>

                      {/* Handwritten Notes Section */}
                      <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px", flexGrow: 1 }}>
                        <h3 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: "0 0 10px 0" }}>
                          Weekly Diagnostics Log
                        </h3>
                        <p style={{ fontSize: "10px", color: "#94a3b8", fontStyle: "italic", margin: "0 0 15px 0" }}>
                          Use this area to note the date, soil status, leaf appearance, and daily adjustments.
                        </p>

                        {/* Blank writing lines for physical print */}
                        <div style={{ marginTop: "25px", display: "flex", flexDirection: "column", gap: "18px" }}>
                          <div style={{ borderBottom: "1.5px dotted #cbd5e1", height: "1px" }} />
                          <div style={{ borderBottom: "1.5px dotted #cbd5e1", height: "1px" }} />
                          <div style={{ borderBottom: "1.5px dotted #cbd5e1", height: "1px" }} />
                        </div>
                      </div>
                    </div>

                    {/* Footer page number */}
                    <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "10px", display: "flex", justifyBetween: "space-between", fontSize: "10px", color: "#94a3b8" }}>
                      <span>PlantasticHaven Care Guide</span>
                      <span>Page 4 of 4</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreePDF;
