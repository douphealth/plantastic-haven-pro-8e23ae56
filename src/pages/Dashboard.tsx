import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Droplets, Leaf, Flame, Sun, Plus, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AppLayout from "@/components/shared/AppLayout";

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [profileRes, plantsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("user_plants").select("*").eq("user_id", user.id).order("next_water_date", { ascending: true }).limit(5),
      ]);
      setProfile(profileRes.data);
      setPlants(plantsRes.data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const needsWater = plants.filter(
    (p) => p.next_water_date && new Date(p.next_water_date) <= new Date()
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Welcome back, <span className="text-primary">{profile?.display_name || "Plant Lover"}</span> 🌿
          </h1>
          <p className="text-muted-foreground mt-1">Here's your garden at a glance.</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Leaf, label: "My Plants", value: plants.length, color: "text-primary" },
            { icon: Droplets, label: "Need Water", value: needsWater.length, color: "text-sky" },
            { icon: Flame, label: "Care Streak", value: `${profile?.care_streak || 0} days`, color: "text-bloom" },
            { icon: Sun, label: "Tier", value: profile?.subscription_tier || "Free", color: "text-secondary" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl p-5 shadow-card border border-border">
              <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
              <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/my-garden" className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-elevated transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary transition-colors">
                <Plus className="w-6 h-6 text-accent-foreground group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-card-foreground">Add a Plant</h3>
                <p className="text-sm text-muted-foreground">Start tracking a new green friend</p>
              </div>
            </div>
          </Link>
          <Link to="/plant-identifier" className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-elevated transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary transition-colors">
                <Scan className="w-6 h-6 text-accent-foreground group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-card-foreground">Identify a Plant</h3>
                <p className="text-sm text-muted-foreground">Use AI to identify any plant species</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Upcoming watering */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <h2 className="font-heading text-xl font-semibold text-card-foreground mb-4">🚿 Upcoming Watering</h2>
          {plants.length === 0 ? (
            <p className="text-muted-foreground text-sm">No plants yet. <Link to="/my-garden" className="text-primary hover:underline">Add your first plant!</Link></p>
          ) : (
            <div className="space-y-3">
              {plants.map((plant) => (
                <div key={plant.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Droplets className={`w-5 h-5 ${plant.next_water_date && new Date(plant.next_water_date) <= new Date() ? "text-bloom" : "text-sky"}`} />
                    <div>
                      <div className="font-medium text-sm text-card-foreground">{plant.nickname}</div>
                      <div className="text-xs text-muted-foreground">{plant.location}{plant.room ? ` · ${plant.room}` : ""}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {plant.next_water_date
                      ? new Date(plant.next_water_date) <= new Date()
                        ? "Needs water now!"
                        : `In ${Math.ceil((new Date(plant.next_water_date).getTime() - Date.now()) / 86400000)} days`
                      : "No schedule"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
