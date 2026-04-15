import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Droplets, Check, AlertTriangle, Clock, CalendarDays, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/shared/AppLayout";
import { Link } from "react-router-dom";

const CareCalendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlants = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_plants")
      .select("*")
      .eq("user_id", user.id)
      .order("next_water_date", { ascending: true });
    setPlants(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPlants(); }, [user]);

  const waterPlant = async (id: string) => {
    await supabase.from("user_plants").update({
      last_watered: new Date().toISOString(),
      next_water_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    }).eq("id", id);
    toast({ title: "Watered! 💧" });
    fetchPlants();
  };

  const today = new Date();
  const todayStr = today.toDateString();

  const overdue = plants.filter(
    (p) => p.next_water_date && new Date(p.next_water_date) < today && new Date(p.next_water_date).toDateString() !== todayStr
  );
  const todayPlants = plants.filter(
    (p) => p.next_water_date && new Date(p.next_water_date).toDateString() === todayStr
  );
  const upcoming = plants.filter(
    (p) => p.next_water_date && new Date(p.next_water_date) > today && new Date(p.next_water_date).toDateString() !== todayStr
  );
  const noSchedule = plants.filter((p) => !p.next_water_date);

  const Section = ({ title, icon: Icon, items, urgent = false }: { title: string; icon: any; items: any[]; urgent?: boolean }) => (
    items.length > 0 ? (
      <div>
        <h2 className={`font-heading text-lg font-semibold mb-3 flex items-center gap-2 ${urgent ? "text-bloom" : "text-card-foreground"}`}>
          <Icon className="w-5 h-5" /> {title} <span className="text-xs font-normal text-muted-foreground">({items.length})</span>
        </h2>
        <div className="space-y-2">
          {items.map((plant) => {
            const daysOverdue = plant.next_water_date
              ? Math.abs(Math.ceil((new Date(plant.next_water_date).getTime() - Date.now()) / 86400000))
              : 0;
            return (
              <div key={plant.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-card ${urgent ? "border-bloom/30 bg-bloom/5" : "border-border bg-card"}`}>
                <Link to={`/plant/${plant.id}`} className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-card-foreground">{plant.nickname}</div>
                  <div className="text-xs text-muted-foreground">
                    {plant.location}{plant.room ? ` · ${plant.room}` : ""}
                    {plant.next_water_date && (
                      <span className={urgent ? " text-bloom font-medium" : ""}>
                        {" · "}{urgent ? `${daysOverdue}d overdue` : `Due ${new Date(plant.next_water_date).toLocaleDateString()}`}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground hidden sm:block">Health: {plant.health_score}%</div>
                  <Button size="sm" variant={urgent ? "hero" : "outline"} onClick={() => waterPlant(plant.id)} className="rounded-lg h-8 text-xs">
                    <Droplets className="w-3 h-3 mr-1" /> Water
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ) : null
  );

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Care Calendar</h1>
          <p className="text-muted-foreground text-sm">Keep your plants happy with timely care</p>
        </div>

        {/* Summary stats */}
        {!loading && plants.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Overdue", value: overdue.length, color: "text-bloom", bg: "bg-bloom/10" },
              { label: "Today", value: todayPlants.length, color: "text-primary", bg: "bg-primary/10" },
              { label: "Upcoming", value: upcoming.length, color: "text-sky", bg: "bg-sky/10" },
              { label: "Total", value: plants.length, color: "text-muted-foreground", bg: "bg-muted" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : plants.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl shadow-card border border-border">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="font-heading text-lg font-semibold text-card-foreground mb-2">No plants yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Add plants to see your care schedule</p>
            <Button asChild variant="hero" className="rounded-xl">
              <Link to="/my-garden">Go to My Garden</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6 bg-card rounded-2xl p-6 shadow-card border border-border">
            <Section title="Overdue" icon={AlertTriangle} items={overdue} urgent />
            <Section title="Today" icon={CalendarDays} items={todayPlants} />
            <Section title="Upcoming" icon={Clock} items={upcoming} />
            <Section title="No Schedule" icon={Pause} items={noSchedule} />
            {overdue.length === 0 && todayPlants.length === 0 && (
              <div className="text-center py-4">
                <Check className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All caught up! No plants need attention today.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CareCalendar;
