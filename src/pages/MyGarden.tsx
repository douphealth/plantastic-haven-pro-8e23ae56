import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Droplets, Trash2, Edit2, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/shared/AppLayout";
import { Link } from "react-router-dom";

const MyGarden = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ nickname: "", location: "Indoor", room: "", notes: "" });

  const fetchPlants = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_plants")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setPlants(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPlants(); }, [user]);

  const addPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("user_plants").insert({
      user_id: user.id,
      nickname: form.nickname,
      location: form.location,
      room: form.room || null,
      notes: form.notes || null,
      health_score: 100,
      last_watered: new Date().toISOString(),
      next_water_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Plant added! 🌱" });
      setForm({ nickname: "", location: "Indoor", room: "", notes: "" });
      setShowAdd(false);
      fetchPlants();
    }
  };

  const deletePlant = async (id: string) => {
    await supabase.from("user_plants").delete().eq("id", id);
    toast({ title: "Plant removed" });
    fetchPlants();
  };

  const waterPlant = async (id: string) => {
    await supabase.from("user_plants").update({
      last_watered: new Date().toISOString(),
      next_water_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    }).eq("id", id);
    toast({ title: "Watered! 💧" });
    fetchPlants();
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">My Garden</h1>
            <p className="text-muted-foreground text-sm">{plants.length} plants on your shelf</p>
          </div>
          <Button variant="hero" onClick={() => setShowAdd(true)} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add Plant
          </Button>
        </div>

        {/* Add plant form */}
        {showAdd && (
          <form onSubmit={addPlant} className="bg-card rounded-2xl p-6 shadow-elevated border border-border space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-heading text-xl font-semibold">Add New Plant</h2>
              <button type="button" onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nickname *</Label>
                <Input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="e.g. Monty" required />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option>Indoor</option>
                  <option>Outdoor</option>
                  <option>Balcony</option>
                  <option>Office</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Room</Label>
                <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="e.g. Living room" />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any notes..." />
              </div>
            </div>
            <Button type="submit" variant="hero" className="rounded-xl">Add to Garden</Button>
          </form>
        )}

        {/* Plant grid */}
        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading your garden...</div>
        ) : plants.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl shadow-card border border-border">
            <div className="text-5xl mb-4">🌿</div>
            <h2 className="font-heading text-2xl font-semibold text-card-foreground mb-2">Your garden is empty</h2>
            <p className="text-muted-foreground mb-6">Add your first plant to get started!</p>
            <Button variant="hero" onClick={() => setShowAdd(true)} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Add Your First Plant
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plants.map((plant) => {
              const needsWater = plant.next_water_date && new Date(plant.next_water_date) <= new Date();
              return (
                <div key={plant.id} className="bg-card rounded-2xl p-5 shadow-card border border-border hover:shadow-elevated transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-card-foreground">{plant.nickname}</h3>
                      <p className="text-xs text-muted-foreground">{plant.location}{plant.room ? ` · ${plant.room}` : ""}</p>
                    </div>
                    <button onClick={() => deletePlant(plant.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Health bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Health</span>
                      <span className="font-bold text-primary">{plant.health_score}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${plant.health_score}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {plant.last_watered ? `Watered ${new Date(plant.last_watered).toLocaleDateString()}` : "Never watered"}
                    </div>
                    <Button size="sm" variant={needsWater ? "hero" : "outline"} onClick={() => waterPlant(plant.id)} className="rounded-lg text-xs h-8">
                      <Droplets className="w-3 h-3 mr-1" /> {needsWater ? "Water Now!" : "Water"}
                    </Button>
                  </div>

                  <Link to={`/plant/${plant.id}`} className="block mt-3 text-xs text-primary hover:underline text-center">
                    View Details →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MyGarden;
