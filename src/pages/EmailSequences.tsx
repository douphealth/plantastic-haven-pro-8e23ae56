import { useState } from "react";
import AppLayout from "@/components/shared/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { EMAIL_COURSES, EmailCourse, EmailTemplate } from "@/lib/emailTemplates";
import {
  Mail,
  Send,
  Smartphone,
  Laptop,
  CheckCircle2,
  Settings2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Bell,
  Clock,
  CalendarRange,
  Check,
  Eye,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EmailSequences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Selection States
  const [selectedCourse, setSelectedCourse] = useState<EmailCourse>(EMAIL_COURSES[0]);
  const [selectedEmailIndex, setSelectedEmailIndex] = useState<number>(0);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  
  // Subscription / Scheduler States
  const [subscribedCourses, setSubscribedCourses] = useState<Record<string, boolean>>({
    "survival-guide": true, // Default subscribed for pro demo feel
  });
  const [deliveryTime, setDeliveryTime] = useState("08:00");
  const [deliveryDays, setDeliveryDays] = useState<string[]>(["Mon", "Wed", "Fri"]);
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [subscribingLoading, setSubscribingLoading] = useState(false);

  const selectedEmail = selectedCourse.emails[selectedEmailIndex] || selectedCourse.emails[0];

  const toggleDay = (day: string) => {
    if (deliveryDays.includes(day)) {
      setDeliveryDays(deliveryDays.filter((d) => d !== day));
    } else {
      setDeliveryDays([...deliveryDays, day]);
    }
  };

  const handleSubscribe = async (courseId: string) => {
    setSubscribingLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubscribingLoading(false);
    
    const isSubscribed = subscribedCourses[courseId];
    setSubscribedCourses({
      ...subscribedCourses,
      [courseId]: !isSubscribed,
    });

    toast({
      title: isSubscribed ? "Unsubscribed Successfully" : "Enrolled in Masterclass! 🌿",
      description: isSubscribed 
        ? `You will no longer receive emails for the ${selectedCourse.title}.`
        : `Welcome! We've scheduled the 1st email to hit your inbox on the next selected delivery day at ${deliveryTime}.`,
    });
  };

  const handleSendTestEmail = async () => {
    setTestEmailLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setTestEmailLoading(false);
    
    toast({
      title: "Test Email Dispatched! 🚀",
      description: `A SOTA styled HTML test copy of "${selectedEmail.subject}" has been successfully queued and sent to ${user?.email || "your email"}. Check your inbox!`,
    });
  };

  const handleSendUrgentAlert = () => {
    toast({
      title: "Critical Alert Sim Triggered 🚨",
      description: `We've simulated a high-priority "Pest Alert / Soil Over-Saturation" push email to ${user?.email || "your account"}.`,
    });
  };

  const saveScheduler = () => {
    toast({
      title: "Sequence Settings Saved! ⚙️",
      description: `Your automated campaigns will deliver on [${deliveryDays.join(", ")}] at precisely ${deliveryTime}.`,
    });
    setSchedulerOpen(false);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up pb-12">
        {/* Page Title Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse-soft" />
              Enterprise Pro Perk
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground flex items-center gap-2.5">
              📩 Onboarding & Care Email Sequences
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Cultivate expert-level botanical knowledge with automated micro-learning drip courses delivered to your inbox.
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setSchedulerOpen(!schedulerOpen)}
            className="rounded-xl border-border bg-card shadow-card hover:bg-accent flex items-center gap-2 h-11 px-4 text-xs font-medium self-start md:self-auto"
          >
            <Settings2 className="w-4 h-4 text-primary" /> Delivery Preferences
          </Button>
        </div>

        {/* Delivery Preferences Panel */}
        {schedulerOpen && (
          <div className="bg-card rounded-2xl p-6 border border-border shadow-elevated grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="space-y-3">
              <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Delivery Time
              </h3>
              <p className="text-xs text-muted-foreground">Select the preferred time of day for masterclass emails to arrive.</p>
              <Input 
                type="time" 
                value={deliveryTime} 
                onChange={(e) => setDeliveryTime(e.target.value)} 
                className="w-full rounded-xl border-input focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="space-y-3">
              <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-primary" /> Delivery Days
              </h3>
              <p className="text-xs text-muted-foreground">Choose which weekdays our drip sequencer should fire.</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                  const active = deliveryDays.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        active 
                          ? "bg-primary border-primary text-white shadow-sm" 
                          : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col justify-end gap-3">
              <Button variant="hero" onClick={saveScheduler} className="w-full rounded-xl">
                Apply & Save Preferences
              </Button>
              <Button variant="ghost" onClick={() => setSchedulerOpen(false)} className="w-full rounded-xl">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Course Selector & Campaign Status - 5 cols */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Section Header */}
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Select Active Masterclass
              </h2>
            </div>

            {/* Courses List */}
            <div className="space-y-4">
              {EMAIL_COURSES.map((course) => {
                const isSelected = selectedCourse.id === course.id;
                const isSubscribed = subscribedCourses[course.id];
                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelectedCourse(course);
                      setSelectedEmailIndex(0);
                    }}
                    className={`rounded-2xl p-5 shadow-card border transition-all cursor-pointer hover:shadow-elevated relative overflow-hidden group ${
                      isSelected
                        ? "bg-card border-primary ring-2 ring-primary/20"
                        : "bg-card border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2">
                        {/* Badges */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                            {course.category}
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {course.difficulty}
                          </span>
                        </div>
                        
                        <h3 className="font-heading text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {course.description}
                        </p>
                      </div>

                      {/* Course Icon Indicator */}
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${course.color.includes("primary") ? "from-primary/10 to-primary/25" : course.color.includes("secondary") ? "from-secondary/15 to-secondary/30" : "from-bloom/15 to-bloom/30"} flex items-center justify-center shrink-0`}>
                        <Mail className={`w-5 h-5 ${course.color.includes("primary") ? "text-primary" : course.color.includes("secondary") ? "text-secondary" : "text-bloom"}`} />
                      </div>
                    </div>

                    <div className="border-t border-border mt-4 pt-3 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {course.estimatedTime}
                      </span>
                      
                      {isSubscribed ? (
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Subscribed
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Not Subscribed</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Course Settings */}
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4">
              <h3 className="font-heading font-semibold text-lg text-card-foreground border-b border-border pb-3">
                Campaign Operations
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Selected Sequence:</span>
                  <span className="font-semibold text-card-foreground">{selectedCourse.title}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Drip Emails:</span>
                  <span className="font-semibold text-card-foreground">{selectedCourse.emails.length} Emails</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    subscribedCourses[selectedCourse.id] 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {subscribedCourses[selectedCourse.id] ? "Sequencing Active" : "Paused / Inactive"}
                  </span>
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleSubscribe(selectedCourse.id)}
                  disabled={subscribingLoading}
                  variant={subscribedCourses[selectedCourse.id] ? "heroOutline" : "hero"}
                  className="rounded-xl w-full text-xs font-semibold h-11"
                >
                  {subscribedCourses[selectedCourse.id] ? "Pause Sequence" : "Enroll Now"}
                </Button>
                <Button
                  onClick={handleSendTestEmail}
                  disabled={testEmailLoading}
                  variant="outline"
                  className="rounded-xl w-full border-border bg-muted/30 hover:bg-muted text-xs font-semibold h-11 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-primary" /> Send Test Email
                </Button>
              </div>

              <Button
                onClick={handleSendUrgentAlert}
                variant="ghost"
                className="w-full text-xs font-medium text-destructive hover:bg-destructive/5 border border-dashed border-destructive/20 h-10 rounded-xl"
              >
                🚨 Simulate Urgent Pest/Care Alert Email
              </Button>
            </div>

            {/* Email Step Navigation */}
            <div className="bg-card rounded-2xl p-5 shadow-card border border-border space-y-3">
              <h4 className="font-heading font-semibold text-sm text-card-foreground">
                Sequence Map: Select Email to Inspect
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedCourse.emails.map((email, idx) => {
                  const isActive = selectedEmailIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedEmailIndex(idx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        isActive
                          ? "bg-primary/5 border-primary text-primary font-semibold"
                          : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="truncate pr-2">{email.subject}</span>
                      <span className="shrink-0 text-[10px] opacity-75 font-normal">{email.readTime}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: SOTA Responsive Sandbox Email Simulator - 7 cols */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Viewport Control Bar */}
            <div className="flex items-center justify-between bg-card p-3 rounded-2xl border border-border shadow-card">
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 ml-2">
                <Eye className="w-4 h-4 text-primary" /> LIVE SANDBOX PREVIEW
              </span>
              
              <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
                <button
                  onClick={() => setDeviceMode("desktop")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    deviceMode === "desktop"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" /> Desktop
                </button>
                <button
                  onClick={() => setDeviceMode("mobile")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    deviceMode === "mobile"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile
                </button>
              </div>
            </div>

            {/* Simulated Desktop / Mobile Browser Viewport */}
            <div className="flex-1 bg-muted/40 rounded-3xl p-4 md:p-6 border border-border shadow-inner flex justify-center items-start min-h-[600px] overflow-hidden">
              <div
                className={`transition-all duration-300 w-full bg-white shadow-2xl border border-border/80 flex flex-col ${
                  deviceMode === "mobile" 
                    ? "max-w-[380px] rounded-[36px] overflow-hidden border-8 border-slate-800 aspect-[9/16] min-h-[650px]" 
                    : "max-w-full rounded-2xl min-h-[500px]"
                }`}
              >
                {/* Simulator Header / Address Bar */}
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 text-xs flex flex-col gap-1 shrink-0">
                  <div className="flex gap-1.5 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="text-slate-500 flex flex-col gap-0.5">
                    <div>
                      <span className="font-semibold text-slate-700">From: </span>
                      PlantasticHaven Masterclass &lt;education@plantastichaven.com&gt;
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">To: </span>
                      {user?.email || "you@example.com"}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Subject: </span>
                      <span className="text-slate-900 font-medium">{selectedEmail.subject}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Email Body Frame */}
                <div className="flex-1 overflow-y-auto bg-slate-50">
                  {/* Drip preheader banner preview */}
                  <div className="bg-amber-50 border-b border-amber-100 text-[10px] text-amber-800 text-center py-1.5 px-4 font-medium italic">
                    Snippet Preheader: {selectedEmail.preheader}
                  </div>
                  
                  {/* Rich HTML Content Injection */}
                  <div 
                    className="email-html-sandbox"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.html }} 
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default EmailSequences;
