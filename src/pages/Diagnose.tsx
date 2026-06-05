import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Leaf,
  Activity,
  Sun,
  Droplets,
  Container,
  User,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileText,
  BookOpen,
  Calendar,
  XCircle,
  HelpCircle
} from "lucide-react";

// Types
interface QuizAnswers {
  plantName: string;
  mainProblem: string;
  lightLevel: string;
  wateringFrequency: string;
  potDrainage: string;
  soilMoisture: string;
  experienceLevel: string;
}

const POPULAR_PLANTS = [
  "Monstera Deliciosa",
  "Snake Plant (Sansevieria)",
  "Fiddle Leaf Fig (Ficus lyrata)",
  "Pothos (Devil's Ivy)",
  "ZZ Plant (Zamioculcas zamiifolia)",
  "Aloe Vera",
  "Peace Lily (Spathiphyllum)",
  "Calathea",
  "Spider Plant (Chlorophytum comosum)",
  "Boston Fern",
  "Rubber Plant (Ficus elastica)",
  "Jade Plant"
];

const Diagnose = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [showResults, setShowResults] = useState(false);

  const [answers, setAnswers] = useState<QuizAnswers>({
    plantName: "",
    mainProblem: "",
    lightLevel: "",
    wateringFrequency: "",
    potDrainage: "",
    soilMoisture: "",
    experienceLevel: ""
  });

  // Diagnostic Results State
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);

  // Loading animation facts
  const loadingFacts = [
    "Analyzing chlorophyll leaf index...",
    "Correlating sunlight metrics with moisture absorption...",
    "Simulating root respiration constraints...",
    "Consulting local botanical knowledge matrix...",
    "Synthesizing 7-day corrective action guidelines..."
  ];

  useEffect(() => {
    if (loading) {
      let factIndex = 0;
      setLoadingText(loadingFacts[0]);
      const textInterval = setInterval(() => {
        factIndex = (factIndex + 1) % loadingFacts.length;
        setLoadingText(loadingFacts[factIndex]);
      }, 700);

      const timer = setTimeout(() => {
        setLoading(false);
        generateDiagnosis();
        setShowResults(true);
      }, 3000);

      return () => {
        clearInterval(textInterval);
        clearTimeout(timer);
      };
    }
  }, [loading]);

  const updateAnswer = (key: keyof QuizAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !answers.plantName.trim()) {
      toast({
        title: "Plant Name Required 🌿",
        description: "Please select or type your plant's name to proceed.",
        variant: "destructive"
      });
      return;
    }
    if (step === 2 && !answers.mainProblem) {
      toast({
        title: "Please select a problem ⚠️",
        description: "Selecting your plant's symptom helps us diagnose correctly.",
        variant: "destructive"
      });
      return;
    }
    if (step === 3 && !answers.lightLevel) {
      toast({
        title: "Light level required ☀️",
        description: "Tell us how much sun your plant receives.",
        variant: "destructive"
      });
      return;
    }
    if (step === 4 && !answers.wateringFrequency) {
      toast({
        title: "Watering frequency required 💧",
        description: "How often do you usually water?",
        variant: "destructive"
      });
      return;
    }
    if (step === 5 && !answers.potDrainage) {
      toast({
        title: "Drainage details required 🪴",
        description: "Select your drainage option.",
        variant: "destructive"
      });
      return;
    }
    if (step === 6 && !answers.soilMoisture) {
      toast({
        title: "Soil moisture required 🟫",
        description: "How does the soil feel right now?",
        variant: "destructive"
      });
      return;
    }

    if (step < 7) {
      setStep(prev => prev + 1);
    } else {
      setLoading(true);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const generateDiagnosis = () => {
    const { plantName, mainProblem, lightLevel, wateringFrequency, potDrainage, soilMoisture, experienceLevel } = answers;
    const reportId = `PH-${Math.floor(100000 + Math.random() * 900000)}`;

    let title = "";
    let description = "";
    let whatToday = "";
    let rescueDays: string[] = [];
    let wateringAdvice = "";
    let lightAdvice = "";
    let soilPotAdvice = "";
    let mistakes: string[] = [];
    let relatedGuides: Array<{ title: string; link: string }> = [];

    // Diagnostic rules matching
    const isOverwatered = 
      mainProblem.includes("mushy") || 
      mainProblem.includes("root rot") ||
      (soilMoisture === "Always soggy, wet, or muddy") ||
      (potDrainage === "No drainage holes" && soilMoisture.includes("soggy")) ||
      (wateringFrequency === "Every single day" && !lightLevel.includes("Direct"));

    const isUnderwatered = 
      mainProblem.includes("wilting") || 
      soilMoisture === "Bone dry all the way down" || 
      (wateringFrequency.includes("monthly") && !mainProblem.includes("insects"));

    const isLowHumidity = 
      mainProblem.includes("tips") || 
      (plantName.toLowerCase().includes("calathea") && mainProblem.includes("brown")) || 
      (plantName.toLowerCase().includes("fern") && mainProblem.includes("brown"));

    const isLowLight = 
      lightLevel === "Low light / dark corner" && 
      (mainProblem.includes("slow") || mainProblem.includes("yellow"));

    const isPests = 
      mainProblem.includes("insects") || 
      mainProblem.includes("spots");

    if (isOverwatered) {
      title = "Overwatering & Root Rot Development";
      description = "Your plant's roots are suffocating due to prolonged saturation in waterlogged soil. Houseplant roots require oxygen pockets to breathe and absorb nutrients. When water fills these spaces permanently, anaerobic rot fungi thrive, turning healthy roots mushy and preventing water transport, which ironically makes the plant wilt as if it were dry.";
      whatToday = "Stop watering immediately. Slide the plant out of its pot. Inspect the roots: if they are dark brown, black, or slimy, trim them back to healthy cream-colored tissue with sterilized scissors. Leave the root ball on newspaper/towels for 24 hours to dry.";
      rescueDays = [
        "Inspect root system for mushy rot; trim affected roots and wash the pot with soapy water.",
        "Allow root ball to air dry on newspaper. Prepare clean soil mixed with 30% perlite.",
        "Repot the plant in a clean pot WITH drainage holes. Use dry, highly aerated soil mix.",
        "Place the plant in warm, bright indirect light. Do not water it yet.",
        "Monitor soil moisture. Use a wooden stick to test that the soil remains completely dry.",
        "If soil is bone dry all the way down, give a tiny sip (1/4 cup) of room-temperature water.",
        "Set up a strict rule: only water when the top 3 inches of soil feel completely dry."
      ];
      wateringAdvice = "Ditch the calendar. Always test the soil: stick a finger or wooden chopstick 2-3 inches deep. If it comes out with damp soil, do not water. Always empty the bottom drainage saucer after watering.";
      lightAdvice = "Move to bright, indirect light. Higher light levels increase the rate of photosynthesis, helping the plant process soil moisture much faster.";
      soilPotAdvice = "Ensure your pot has drainage holes. Add perlite, pumice, or orchid bark (25-30%) to standard potting soil to increase drainage and aeration.";
      mistakes = [
        "Watering on a set calendar schedule.",
        "Letting the pot sit in standing water in the saucer.",
        "Using heavy garden soil or dense potting mix without aeration."
      ];
      relatedGuides = [
        { title: "Avoiding Root Rot: The Golden Rule of Watering", link: "/guides?article=survival-guide&day=0" },
        { title: "Soil Architecture: Creating the Ultimate Mix", link: "/guides?article=survival-guide&day=2" }
      ];
    } else if (isUnderwatered) {
      title = "Severe Dehydration / Underwatering";
      description = "Your plant is suffering from chronic moisture deprivation. As the soil dries out completely, the plant's internal cell pressure (turgor pressure) drops, causing leaves to wilt, drop, or develop crisp brown margins. When soil becomes extremely dry, it can become hydrophobic, meaning water runs down the inner sides of the pot without actually soaking the roots.";
      whatToday = "Give your plant a deep bottom watering. Place the entire pot in a sink or tub filled with 2-3 inches of room-temperature water and let it soak from below for 45 minutes until the top soil feels damp.";
      rescueDays = [
        "Perform deep bottom-watering soak for 45 minutes. Drain thoroughly.",
        "Move the plant slightly back from hot direct sun to reduce transpiration stress.",
        "Snip off completely crispy or dead leaves at the base using clean shears.",
        "Wipe leaves with a damp cloth to clear dust and improve moisture capture.",
        "Check soil moisture. It should feel cool, moist, and loose now.",
        "If leaves have firmed up, move the plant back to its optimal light source.",
        "Resume watering deeply from the top whenever the top 2 inches feel dry."
      ];
      wateringAdvice = "When you water, saturate the soil completely until water flows freely out of the drainage holes. Avoid giving small, frequent splashes of water, which only wet the top layer and starve lower roots.";
      lightAdvice = "Avoid placing a dehydrated plant in scorching, hot direct sun, which accelerates moisture loss.";
      soilPotAdvice = "If your soil mix has compacted and shrunk away from the pot edges, poke holes in it with a chopstick to help water reach the root ball, or repot with organic coco coir.";
      mistakes = [
        "Giving small, shallow sips of water instead of saturating.",
        "Ignoring hydrophobic soil that refuses to absorb water.",
        "Placing dehydrated plants in hot direct window sunlight."
      ];
      relatedGuides = [
        { title: "Avoiding Root Rot: The Golden Rule of Watering", link: "/guides?article=survival-guide&day=0" },
        { title: "The Art of Humidity: Tropical Oasis Hacks", link: "/guides?article=survival-guide&day=3" }
      ];
    } else if (isLowHumidity) {
      title = "Low Ambient Humidity & Scorched Margins";
      description = "Tropical houseplants are native to high-humidity rainforests. Standard indoor air (especially with heaters or AC active) is often below 30% relative humidity. Dry air pulls moisture out of leaf tips faster than roots can draw it from the soil, causing cells at the leaf extremities to collapse, turn brown, and crisp.";
      whatToday = "Relocate the plant away from active air conditioning vents, heaters, or drafts. Snip off ugly, dry brown leaf tips, leaving a tiny brown margin so you don't cut into healthy green tissue.";
      rescueDays = [
        "Move the plant away from drafty windows, air vents, or heaters.",
        "Group this plant tightly with other houseplants to create a humid microclimate.",
        "Construct a pebble tray: fill a tray with stones, add water, and place the pot on top.",
        "Trim dry leaf tips with clean scissors, cutting just outside the green leaf tissue.",
        "Wipe leaves with a damp sponge to remove dust and support transpiration.",
        "Verify soil moisture. Low humidity areas dry out soil quicker.",
        "Evaluate the plant. If new tips are green, the environment has stabilized."
      ];
      wateringAdvice = "Water regularly when the top 2 inches of soil feel dry. Do not overwater the soil to compensate for dry air, as this leads to root rot.";
      lightAdvice = "Provide bright, filtered indirect light. Hot direct sunlight will exacerbate dry leaf tips.";
      soilPotAdvice = "Add organic compost or peat moss to the potting mix to hold moderate moisture, but ensure drainage remains excellent.";
      mistakes = [
        "Misting leaves with a spray bottle (which dries in minutes and invites fungal diseases).",
        "Placing tropical plants directly in front of dry air blowing from vents.",
        "Allowing soil to dry out completely for long periods."
      ];
      relatedGuides = [
        { title: "The Art of Humidity: Creating a Tropical Oasis", link: "/guides?article=survival-guide&day=3" },
        { title: "Demystifying Light Levels: Shadow Tests", link: "/guides?article=survival-guide&day=1" }
      ];
    } else if (isLowLight) {
      title = "Light Starvation / Photosynthesis Deficit";
      description = "Your plant is starving for energy. Sunlight drives photosynthesis, turning water and CO2 into sugars. In low light, the plant cannot process water, leading to yellowing foliage, slow/leggy growth (reaching for light), and soil that stays wet for weeks. This is a common precursor to root rot.";
      whatToday = "Move the plant immediately closer to a window, or to a room with bright indirect light. Wipe dust off the leaves with a damp cloth so they can absorb all available photons.";
      rescueDays = [
        "Move the plant to a spot directly facing an East or West window.",
        "Wipe leaves with a damp cloth to clear dust blocking light absorption.",
        "Rotate the pot 90 degrees to ensure all sides receive equal light.",
        "Inspect soil moisture. Note how long it takes to dry now.",
        "Do not fertilize. Starving plants cannot process nutrients; it will burn roots.",
        "Trim off completely yellowed lower leaves to redirect energy to new shoots.",
        "Consider adding an LED grow light if natural window light is limited."
      ];
      wateringAdvice = "Because a light-starved plant processes water extremely slowly, reduce watering frequency. Water only when the soil is dry at least halfway down the pot.";
      lightAdvice = "Acclimate the plant gradually. Moving a plant from a dark corner directly into scorching direct sun will sunburn the leaves.";
      soilPotAdvice = "Use a porous pot (like terra cotta) and a loose, fast-draining soil mix to offset the slower water absorption rate.";
      mistakes = [
        "Keeping plants in dark hallways or windowless bathrooms.",
        "Fertilizing a plant that isn't growing due to lack of light.",
        "Watering frequently in low-light environments."
      ];
      relatedGuides = [
        { title: "Demystifying Light Levels: What Bright Indirect Means", link: "/guides?article=survival-guide&day=1" },
        { title: "Nutrients 101: Fertilizer Science and Cycles", link: "/guides?article=survival-guide&day=4" }
      ];
    } else if (isPests) {
      title = "Pest Colonization or Fungal Pathogen";
      description = "Your plant is under attack by pests (such as spider mites, mealybugs, or fungus gnats) or a fungal disease like powdery mildew. Pests suck vital sap from plant cells, weakening the foliage and leaving spotted, sticky leaves. Fungal spores thrive in warm, stagnant air with wet foliage.";
      whatToday = "Isolate the plant immediately to protect your other plants. Wipe down leaves with a mild soapy water solution and prepare an organic pesticide (Neem oil or insecticidal soap).";
      rescueDays = [
        "Quarantine the plant. Wipe all leaves and stems thoroughly with soapy water.",
        "Spray the entire plant with Neem oil or insecticidal soap, especially leaf undersides.",
        "Dab visible cottony mealybugs directly with a cotton swab dipped in rubbing alcohol.",
        "Allow topsoil to dry out. Place yellow sticky cards to trap adult gnats.",
        "Prune and discard heavily infested leaves in the trash.",
        "Apply a second spray of insecticidal soap to catch newly hatched pests.",
        "Re-inspect the plant under bright light. Keep isolated until completely clear."
      ];
      wateringAdvice = "Let the soil dry out more than usual between waterings. Many pests and fungus gnats breed in damp, warm topsoil.";
      lightAdvice = "Place in bright indirect light. Healthy, well-lit plants possess stronger natural defense systems against pests.";
      soilPotAdvice = "If fungus gnats persist, add a 1/2-inch layer of dry sand to the topsoil to block their breeding cycle, or use mosquito dunks in watering.";
      mistakes = [
        "Leaving infested plants next to healthy ones.",
        "Spraying oil-based pesticides and putting the plant in direct hot sun (burns leaves).",
        "Keeping soil constantly wet, which invites fungus and gnats."
      ];
      relatedGuides = [
        { title: "Common Pests & How to Defeat Them Naturally", link: "/guides?article=survival-guide&day=5" },
        { title: "Avoiding Root Rot: The Golden Rule of Watering", link: "/guides?article=survival-guide&day=0" }
      ];
    } else {
      title = "Acclimation Stress & Mild Nutrient Deficiency";
      description = "Your plant is likely experiencing minor stress from home environment changes (drafts, seasonal shift) or has depleted the natural nutrients in its potting soil. pot soil loses mineral nutrients within 3-6 months, causing foliage to fade in color and growth to stall.";
      whatToday = "Clean the leaves to maximize light absorption. Check the soil moisture, and if it's the active growing season (spring/summer), prepare a diluted liquid fertilizer.";
      rescueDays = [
        "Position the plant in a stable location with bright indirect light and no drafts.",
        "Wipe dust off leaves to boost light capture and plant respiration.",
        "Verify soil moisture using the finger test.",
        "Apply an organic liquid fertilizer diluted to 1/4 strength to replenish nutrients.",
        "Rotate the pot 90 degrees to encourage balanced vertical growth.",
        "Inspect stems and leaf joints under a magnifying glass for early pest signs.",
        "Setup a weekly reminder to check soil moisture and inspect leaf health."
      ];
      wateringAdvice = "Water deeply only when the top 2 inches of soil feel dry. Always drain the saucer.";
      lightAdvice = "Ensure the plant gets 6-8 hours of bright, filtered indirect light daily.";
      soilPotAdvice = "Top-dress the soil with 1-2 inches of organic worm castings or compost to slowly release micronutrients.";
      mistakes = [
        "Applying full-strength fertilizer to dry soil (burns roots).",
        "Moving the plant to different rooms constantly.",
        "Over-fertilizing in winter months when the plant is dormant."
      ];
      relatedGuides = [
        { title: "Nutrients 101: Fertilizer Science and Cycles", link: "/guides?article=survival-guide&day=4" },
        { title: "Pruning, Propagating & Styling Your Plants", link: "/guides?article=survival-guide&day=6" }
      ];
    }

    const carePlan = {
      reportId,
      date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
      plantName,
      answers,
      title,
      description,
      whatToday,
      rescueDays,
      wateringAdvice,
      lightAdvice,
      soilPotAdvice,
      mistakes,
      relatedGuides,
      checklistState: Array(rescueDays.length).fill(false)
    };

    localStorage.setItem("plantastichaven_care_plan", JSON.stringify(carePlan));
    setDiagnosisResult(carePlan);
  };

  const currentProgress = (step / 7) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {!showResults && !loading && (
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card animate-fade-in-up">
              {/* Progress and Step */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Question {step} of 7
                </span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(currentProgress)}% Complete
                </span>
              </div>
              <Progress value={currentProgress} className="h-2 mb-8 bg-muted" />

              {/* Question 1: Plant Name */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold font-heading text-foreground">
                      What is your plant's name?
                    </h2>
                    <p className="text-sm text-muted-foreground font-body">
                      Select a popular houseplant or type its name below.
                    </p>
                  </div>
                  <Input
                    type="text"
                    placeholder="e.g. Fiddle Leaf Fig, Monstera..."
                    value={answers.plantName}
                    onChange={(e) => updateAnswer("plantName", e.target.value)}
                    className="h-12 rounded-xl border-border focus:ring-primary text-base"
                  />
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Popular Choices
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_PLANTS.map(plant => (
                        <button
                          key={plant}
                          type="button"
                          onClick={() => updateAnswer("plantName", plant)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                            answers.plantName === plant
                              ? "bg-primary border-primary text-white"
                              : "bg-background border-border text-foreground hover:border-primary/50"
                          }`}
                        >
                          {plant}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Question 2: Main Problem */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold font-heading text-foreground">
                      What is the main problem?
                    </h2>
                    <p className="text-sm text-muted-foreground font-body">
                      Select the primary symptom you see on your plant.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: "Yellowing leaves", label: "Leaves turning yellow" },
                      { value: "Brown leaf tips/edges", label: "Crispy brown leaf tips or outer edges" },
                      { value: "Wilting or drooping leaves", label: "Leaves drooping or wilting down" },
                      { value: "Slow growth or no new leaves", label: "Growth has stalled completely" },
                      { value: "White spots, powdery coating, or residue", label: "White spots or powdery coating" },
                      { value: "Visible tiny insects or pests", label: "Tiny bugs crawling or webbing on stems/leaves" },
                      { value: "Severe leaf drop", label: "Leaves falling off rapidly" },
                      { value: "Stems feeling mushy/dark at base (root rot signs)", label: "Mushy base or black, soft stems" }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateAnswer("mainProblem", opt.value)}
                        className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                          answers.mainProblem === opt.value
                            ? "bg-primary/5 border-primary text-primary shadow-sm"
                            : "bg-background border-border text-foreground hover:border-primary/30"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {answers.mainProblem === opt.value && <CheckCircle2 className="w-5 h-5 text-primary shrink-0 ml-2" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 3: Light Level */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold font-heading text-foreground">
                      What light level does it get?
                    </h2>
                    <p className="text-sm text-muted-foreground font-body">
                      Describe the light exposure in its current location.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: "Direct sun", label: "Direct Sun (hot rays shine directly on leaves)" },
                      { value: "Bright indirect", label: "Bright Indirect (well-lit, next to a window but no direct rays)" },
                      { value: "Medium / filtered light", label: "Medium / Filtered (a few feet away, or sheer curtains)" },
                      { value: "Low light / dark corner", label: "Low Light / Dark Corner (far from windows)" }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateAnswer("lightLevel", opt.value)}
                        className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                          answers.lightLevel === opt.value
                            ? "bg-primary/5 border-primary text-primary shadow-sm"
                            : "bg-background border-border text-foreground hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Sun className="w-4 h-4 text-muted-foreground" />
                          <span>{opt.label}</span>
                        </div>
                        {answers.lightLevel === opt.value && <CheckCircle2 className="w-5 h-5 text-primary shrink-0 ml-2" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 4: Watering Frequency */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold font-heading text-foreground">
                      How often do you water it?
                    </h2>
                    <p className="text-sm text-muted-foreground font-body">
                      Select your general watering schedule.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: "Every single day", label: "Every day" },
                      { value: "Every 2 to 3 days", label: "Every 2–3 days" },
                      { value: "Once a week (regularly)", label: "Once a week" },
                      { value: "Every 10 to 14 days (moderately)", label: "Every 10–14 days" },
                      { value: "Only when completely dry (every 3-4 weeks/monthly)", label: "Only when dry (monthly)" }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateAnswer("wateringFrequency", opt.value)}
                        className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                          answers.wateringFrequency === opt.value
                            ? "bg-primary/5 border-primary text-primary shadow-sm"
                            : "bg-background border-border text-foreground hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Droplets className="w-4 h-4 text-muted-foreground" />
                          <span>{opt.label}</span>
                        </div>
                        {answers.wateringFrequency === opt.value && <CheckCircle2 className="w-5 h-5 text-primary shrink-0 ml-2" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 5: Pot Drainage */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold font-heading text-foreground">
                      Does the pot have drainage holes?
                    </h2>
                    <p className="text-sm text-muted-foreground font-body">
                      Drainage is critical for root oxygen access.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: "Has drainage holes", label: "Yes, it has drainage holes (saucer below)" },
                      { value: "No drainage holes", label: "No, it has no drainage holes (closed bottom)" },
                      { value: "Self-watering pot", label: "Self-watering (built-in reservoir)" }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateAnswer("potDrainage", opt.value)}
                        className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                          answers.potDrainage === opt.value
                            ? "bg-primary/5 border-primary text-primary shadow-sm"
                            : "bg-background border-border text-foreground hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Container className="w-4 h-4 text-muted-foreground" />
                          <span>{opt.label}</span>
                        </div>
                        {answers.potDrainage === opt.value && <CheckCircle2 className="w-5 h-5 text-primary shrink-0 ml-2" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 6: Soil Moisture */}
              {step === 6 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold font-heading text-foreground">
                      How does the soil feel right now?
                    </h2>
                    <p className="text-sm text-muted-foreground font-body">
                      Touch the soil or use a finger to test it.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: "Always soggy, wet, or muddy", label: "Soggy / muddy (dripping wet)" },
                      { value: "Damp and moist", label: "Damp / moist (feels like a wrung-out sponge)" },
                      { value: "Bone dry all the way down", label: "Bone dry all the way down" },
                      { value: "Crusty/dry on top but wet/damp deep below", label: "Crusty on top but wet/damp below" }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateAnswer("soilMoisture", opt.value)}
                        className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                          answers.soilMoisture === opt.value
                            ? "bg-primary/5 border-primary text-primary shadow-sm"
                            : "bg-background border-border text-foreground hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Droplets className="w-4 h-4 text-muted-foreground" />
                          <span>{opt.label}</span>
                        </div>
                        {answers.soilMoisture === opt.value && <CheckCircle2 className="w-5 h-5 text-primary shrink-0 ml-2" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 7: Experience Level */}
              {step === 7 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold font-heading text-foreground">
                      What is your gardening experience?
                    </h2>
                    <p className="text-sm text-muted-foreground font-body">
                      Helps us adapt our advice to your level.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: "Complete Beginner", label: "Complete Beginner (I own 1–2 plants)" },
                      { value: "Intermediate", label: "Intermediate (I have successfully kept plants alive)" },
                      { value: "Advanced", label: "Advanced (I propagate and mix my own substrates)" }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateAnswer("experienceLevel", opt.value)}
                        className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                          answers.experienceLevel === opt.value
                            ? "bg-primary/5 border-primary text-primary shadow-sm"
                            : "bg-background border-border text-foreground hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{opt.label}</span>
                        </div>
                        {answers.experienceLevel === opt.value && <CheckCircle2 className="w-5 h-5 text-primary shrink-0 ml-2" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    className="rounded-xl flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                ) : (
                  <div />
                )}

                <Button
                  type="button"
                  onClick={handleNext}
                  className="rounded-xl bg-primary hover:bg-primary/95 text-white font-bold px-6 py-5 flex items-center gap-2"
                >
                  {step === 7 ? "Get Diagnosis" : "Next"} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Loading Animation */}
          {loading && (
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-card text-center space-y-6 animate-pulse-soft">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-spin border-t-primary" />
                <Leaf className="w-10 h-10 text-primary absolute inset-0 m-auto animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-heading text-foreground">Diagnosing Health Status...</h3>
                <p className="text-sm text-muted-foreground h-6 font-body transition-all duration-200">
                  {loadingText}
                </p>
              </div>
            </div>
          )}

          {/* Diagnosis Results Display */}
          {showResults && diagnosisResult && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Header Badge */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" /> Diagnosis Completed
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
                  Your {diagnosisResult.plantName} has:
                  <br />
                  <span className="text-red-600">{diagnosisResult.title}</span>
                </h2>

                <p className="text-sm text-muted-foreground font-body leading-relaxed border-t border-border pt-4">
                  {diagnosisResult.description}
                </p>
              </div>

              {/* What to do today */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 md:p-8 space-y-3">
                <h3 className="text-lg font-bold font-heading text-amber-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" /> WHAT TO DO TODAY:
                </h3>
                <p className="text-sm text-amber-900 font-body leading-relaxed font-medium">
                  {diagnosisResult.whatToDoToday}
                </p>
              </div>

              {/* 7-Day Rescue Plan Preview */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-4">
                <h3 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> 7-Day Rescue Sequence
                </h3>
                <p className="text-xs text-muted-foreground font-body mb-4">
                  We have saved this checklist. You can track your daily progress in the <Link to="/care-plan" className="text-primary hover:underline font-bold">Care Plan</Link> tab.
                </p>
                <div className="space-y-3">
                  {diagnosisResult.rescueDays.map((dayText: string, index: number) => (
                    <div key={index} className="flex gap-3 items-start text-sm border-b border-border/40 pb-2.5 last:border-0 last:pb-0">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-foreground/80 font-body font-medium">{dayText}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-2">
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 font-heading">
                    <Droplets className="w-4 h-4 text-blue-500" /> Watering Advice
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-body">
                    {diagnosisResult.wateringAdvice}
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-2">
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 font-heading">
                    <Sun className="w-4 h-4 text-amber-500" /> Light Advice
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-body">
                    {diagnosisResult.lightAdvice}
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-2">
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 font-heading">
                    <Container className="w-4 h-4 text-emerald-600" /> Soil & Pot Advice
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-body">
                    {diagnosisResult.soilPotAdvice}
                  </p>
                </div>
              </div>

              {/* Mistakes to avoid */}
              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 md:p-8 space-y-3">
                <h3 className="text-lg font-bold font-heading text-red-800 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" /> Mistakes to Avoid:
                </h3>
                <ul className="list-disc pl-5 text-sm text-red-900 font-body space-y-1.5">
                  {diagnosisResult.mistakes.map((mistake: string, idx: number) => (
                    <li key={idx}>{mistake}</li>
                  ))}
                </ul>
              </div>

              {/* Related Articles */}
              {diagnosisResult.relatedGuides && diagnosisResult.relatedGuides.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-4">
                  <h3 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" /> Recommended Care Guides
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {diagnosisResult.relatedGuides.map((guide: any, idx: number) => (
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  asChild
                  size="lg"
                  className="flex-1 rounded-xl bg-primary text-white font-bold h-14 hover:scale-[1.02] transition-transform shadow-md"
                >
                  <Link to="/free-pdf" className="flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5" /> Generate Free PDF Care Guide
                  </Link>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep(1);
                    setShowResults(false);
                    setAnswers({
                      plantName: "",
                      mainProblem: "",
                      lightLevel: "",
                      wateringFrequency: "",
                      potDrainage: "",
                      soilMoisture: "",
                      experienceLevel: ""
                    });
                  }}
                  className="rounded-xl border-border hover:bg-accent font-semibold h-14"
                >
                  Diagnose Another Plant
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Diagnose;
