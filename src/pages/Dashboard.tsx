import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Droplets, Leaf, Flame, Sun, Plus, Scan, TrendingUp, Calendar, Award, Crown, ArrowRight, Sparkles, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AppLayout from "@/components/shared/AppLayout";

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [plants, setPlants] = useState<any[]>([]);
  const [allPlants, setAllPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [profileRes, plantsRes, allPlantsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("user_plants").select("*").eq("user_id", user.id).order("next_water_date", { ascending: true }).limit(5),
        supabase.from("user_plants").select("*").eq("user_id", user.id),
      ]);
      setProfile(profileRes.data);
      setPlants(plantsRes.data || []);
      setAllPlants(allPlantsRes.data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const needsWater = plants.filter(
    (p) => p.next_water_date && new Date(p.next_water_date) <= new Date()
  );

  const avgHealth = allPlants.length > 0
    ? Math.round(allPlants.reduce((s, p) => s + (p.health_score || 0), 0) / allPlants.length)
    : 0;

  const healthyCount = allPlants.filter(p => p.health_score >= 80).length;
  const isPro = profile?.subscription_tier === "pro";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Skeleton header */}
          <div className="animate-pulse">
            <div className="h-10 bg-muted rounded-lg w-80 mb-2" />
            <div className="h-5 bg-muted rounded w-60" />
          </div>
          {/* Skeleton stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-5 border border-border animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-xl mb-3" />
                <div className="h-7 bg-muted rounded w-16 mb-1" />
                <div className="h-3 bg-muted rounded w-20" />
              </div>
            ))}
          </div>
          {/* Skeleton cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-5 border border-border animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-xl mb-3" />
                <div className="h-4 bg-muted rounded w-24 mb-1" />
                <div className="h-3 bg-muted rounded w-32" />
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              {getGreeting()}, <span className="text-primary">{profile?.display_name || "Plant Lover"}</span> 🌿
            </h1>
            <p className="text-muted-foreground mt-1">
              {allPlants.length === 0
                ? "Ready to start your plant journey?"
                : `You're caring for ${allPlants.length} plant${allPlants.length > 1 ? "s" : ""}. ${needsWater.length > 0 ? `${needsWater.length} need${needsWater.length > 1 ? "" : "s"} water today!` : "All plants are happy! 🎉"}`}
            </p>
          </div>
          {!isPro && (
            <Link to="/settings">
              <Button variant="gold" className="rounded-xl">
                <Crown className="w-4 h-4 mr-2" /> Upgrade to Pro
              </Button>
            </Link>
          )}
          {isPro && (
            <span className="flex items-center gap-2 text-sm font-semibold text-secondary bg-secondary/10 px-4 py-2 rounded-full">
              <Crown className="w-4 h-4" /> Pro Member
            </span>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Leaf, label: "Total Plants", value: allPlants.length, color: "text-primary", bg: "bg-primary/10" },
            { icon: Droplets, label: "Need Water", value: needsWater.length, color: "text-sky", bg: "bg-sky/10" },
            { icon: Flame, label: "Care Streak", value: `${profile?.care_streak || 0}d`, color: "text-bloom", bg: "bg-bloom/10" },
            { icon: TrendingUp, label: "Avg Health", value: `${avgHealth}%`, color: "text-primary", bg: "bg-primary/10" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl p-5 shadow-card border border-border hover:shadow-elevated transition-all">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: "/my-garden", icon: Plus, title: "Add Plant", desc: "Track a new plant", color: "group-hover:bg-primary" },
            { to: "/plant-identifier", icon: Scan, title: "AI Scanner", desc: "Identify any plant", color: "group-hover:bg-sky" },
            { to: "/care-calendar", icon: Calendar, title: "Care Calendar", desc: "View schedule", color: "group-hover:bg-bloom" },
            { to: "/community", icon: Award, title: "Community", desc: "Share & learn", color: "group-hover:bg-secondary" },
          ].map((action) => (
            <Link key={action.to} to={action.to} className="bg-card rounded-2xl p-5 shadow-card border border-border hover:shadow-elevated transition-all group">
              <div className={`w-10 h-10 rounded-xl bg-accent flex items-center justify-center ${action.color} transition-colors mb-3`}>
                <action.icon className="w-5 h-5 text-accent-foreground group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-heading text-sm font-semibold text-card-foreground">{action.title}</h3>
              <p className="text-xs text-muted-foreground">{action.desc}</p>
            </Link>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Watering schedule - 2/3 */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-semibold text-card-foreground flex items-center gap-2">
                <Droplets className="w-5 h-5 text-sky" /> Watering Schedule
              </h2>
              <Link to="/care-calendar" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {plants.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🌱</div>
                <p className="text-muted-foreground text-sm mb-4">No plants yet. Start your green journey!</p>
                <Link to="/my-garden">
                  <Button variant="hero" size="sm" className="rounded-xl">
                    <Plus className="w-4 h-4 mr-1" /> Add First Plant
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {plants.map((plant) => {
                  const overdue = plant.next_water_date && new Date(plant.next_water_date) <= new Date();
                  const daysUntil = plant.next_water_date
                    ? Math.ceil((new Date(plant.next_water_date).getTime() - Date.now()) / 86400000)
                    : null;
                  return (
                    <Link key={plant.id} to={`/plant/${plant.id}`} className={`flex items-center justify-between p-3 rounded-xl transition-all hover:bg-accent/50 ${overdue ? "bg-bloom/5 border border-bloom/20" : "bg-muted/30"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${overdue ? "bg-bloom/10" : "bg-sky/10"}`}>
                          <Droplets className={`w-4 h-4 ${overdue ? "text-bloom" : "text-sky"}`} />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-card-foreground">{plant.nickname}</div>
                          <div className="text-xs text-muted-foreground">{plant.location}{plant.room ? ` · ${plant.room}` : ""}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`text-xs font-semibold ${overdue ? "text-bloom" : "text-muted-foreground"}`}>
                            {overdue ? "Overdue!" : daysUntil !== null ? `${daysUntil}d` : "—"}
                          </div>
                          <div className="text-[10px] text-muted-foreground">Health: {plant.health_score}%</div>
                        </div>
                        <div className="w-1.5 h-8 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`w-full rounded-full transition-all ${plant.health_score >= 80 ? "bg-primary" : plant.health_score >= 50 ? "bg-secondary" : "bg-bloom"}`}
                            style={{ height: `${plant.health_score}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Garden health - 1/3 */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
              <h2 className="font-heading text-lg font-semibold text-card-foreground flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" /> Garden Health
              </h2>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className="stroke-muted" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className="stroke-primary" strokeWidth="3" strokeDasharray={`${avgHealth}, 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-card-foreground">{avgHealth}%</div>
                    <div className="text-[10px] text-muted-foreground">Average</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-primary/5 rounded-xl p-2">
                  <div className="text-lg font-bold text-primary">{healthyCount}</div>
                  <div className="text-[10px] text-muted-foreground">Thriving</div>
                </div>
                <div className="bg-bloom/5 rounded-xl p-2">
                  <div className="text-lg font-bold text-bloom">{allPlants.length - healthyCount}</div>
                  <div className="text-[10px] text-muted-foreground">Need Care</div>
                </div>
              </div>
            </div>

            {/* Pro upsell */}
            {!isPro && (
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground">
                <Sparkles className="w-6 h-6 mb-2 text-secondary" />
                <h3 className="font-heading font-bold text-lg mb-1">Go Pro</h3>
                <p className="text-xs text-primary-foreground/70 mb-3">
                  Unlimited AI scans, disease diagnosis, advanced analytics & more
                </p>
                <Link to="/settings">
                  <Button variant="gold" size="sm" className="rounded-lg w-full">
                    Upgrade — $7.99
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
