import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Droplets, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/shared/AppLayout";

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
  const overdue = plants.filter((p) => p.next_water_date && new Date(p.next_water_date) < today);
  const todayPlants = plants.filter((p) => p.next_water_date && new Date(p.next_water_date).toDateString() === today.toDateString());
  const upcoming = plants.filter((p) => p.next_water_date && new Date(p.next_water_date) > today);
  const noSchedule = plants.filter((p) => !p.next_water_date);

  const Section = ({ title, items, urgent = false }: { title: string; items: any[]; urgent?: boolean }) => (
    items.length > 0 ? (
      <div>
        <h2 className={`font-heading text-lg font-semibold mb-3 ${urgent ? "text-bloom" : "text-card-foreground"}`}>{title} ({items.length})</h2>
        <div className="space-y-2">
          {items.map((plant) => (
            <div key={plant.id} className={`flex items-center justify-between p-4 rounded-xl border ${urgent ? "border-bloom/30 bg-bloom/5" : "border-border bg-card"}`}>
              <div>
                <div className="font-medium text-sm text-card-foreground">{plant.nickname}</div>
                <div className="text-xs text-muted-foreground">
                  {plant.location}{plant.room ? ` · ${plant.room}` : ""}
                  {plant.next_water_date && ` · Due ${new Date(plant.next_water_date).toLocaleDateString()}`}
                </div>
              </div>
              <Button size="sm" variant={urgent ? "hero" : "outline"} onClick={() => waterPlant(plant.id)} className="rounded-lg h-8 text-xs">
                <Droplets className="w-3 h-3 mr-1" /> Water
              </Button>
            </div>
          ))}
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

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading schedule...</div>
        ) : plants.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl shadow-card border border-border">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-muted-foreground">Add plants to see your care schedule</p>
          </div>
        ) : (
          <div className="space-y-6 bg-card rounded-2xl p-6 shadow-card border border-border">
            <Section title="🚨 Overdue" items={overdue} urgent />
            <Section title="📅 Today" items={todayPlants} />
            <Section title="🌤️ Upcoming" items={upcoming} />
            <Section title="⏸️ No Schedule" items={noSchedule} />
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CareCalendar;
