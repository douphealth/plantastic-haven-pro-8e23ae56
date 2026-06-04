import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droplets, Sun, Heart, ArrowLeft, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/shared/AppLayout";
import PDFExporter from "@/components/shared/PDFExporter";

const PlantDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [plant, setPlant] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    const load = async () => {
      const [plantRes, entriesRes] = await Promise.all([
        supabase.from("user_plants").select("*").eq("id", id).eq("user_id", user.id).single(),
        supabase.from("plant_journal_entries").select("*").eq("user_plant_id", id).eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setPlant(plantRes.data);
      setEntries(entriesRes.data || []);
      setLoading(false);
    };
    load();
  }, [user, id]);

  const addEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !newNote.trim()) return;
    const { error } = await supabase.from("plant_journal_entries").insert({
      user_plant_id: id,
      user_id: user.id,
      note: newNote,
      milestone_type: "general",
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewNote("");
      const { data } = await supabase.from("plant_journal_entries").select("*").eq("user_plant_id", id).order("created_at", { ascending: false });
      setEntries(data || []);
    }
  };

  const waterPlant = async () => {
    if (!id) return;
    await supabase.from("user_plants").update({
      last_watered: new Date().toISOString(),
      next_water_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    }).eq("id", id);
    toast({ title: "Watered! 💧" });
    const { data } = await supabase.from("user_plants").select("*").eq("id", id).single();
    setPlant(data);
  };

  if (loading) return <AppLayout><div className="text-center text-muted-foreground py-12">Loading...</div></AppLayout>;
  if (!plant) return <AppLayout><div className="text-center py-12"><p className="text-muted-foreground">Plant not found</p><Link to="/my-garden" className="text-primary hover:underline text-sm">Back to garden</Link></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/my-garden" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Back to My Garden
        </Link>

        <div className="bg-card rounded-2xl p-6 shadow-elevated border border-border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-card-foreground flex items-center gap-2">
                {plant.nickname} <Heart className="w-6 h-6 text-bloom" />
              </h1>
              <p className="text-muted-foreground text-sm">{plant.location}{plant.room ? ` · ${plant.room}` : ""}</p>
            </div>
            <div className="flex gap-2">
              <PDFExporter 
                plant={plant} 
                journalEntries={entries} 
                triggerText="Export Care Guide" 
                variant="outline" 
              />
              <Button variant="hero" onClick={waterPlant} className="rounded-xl">
                <Droplets className="w-4 h-4 mr-2" /> Water Now
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Health Score</span>
              <span className="font-bold text-primary">{plant.health_score}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${plant.health_score}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <Droplets className="w-5 h-5 mx-auto mb-1 text-sky" />
              <div className="text-xs text-muted-foreground">Last Watered</div>
              <div className="text-sm font-semibold text-card-foreground">{plant.last_watered ? new Date(plant.last_watered).toLocaleDateString() : "Never"}</div>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <Sun className="w-5 h-5 mx-auto mb-1 text-secondary" />
              <div className="text-xs text-muted-foreground">Next Water</div>
              <div className="text-sm font-semibold text-card-foreground">{plant.next_water_date ? new Date(plant.next_water_date).toLocaleDateString() : "Not set"}</div>
            </div>
          </div>

          {plant.notes && <p className="mt-4 text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl">{plant.notes}</p>}
        </div>

        {/* Journal */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <h2 className="font-heading text-xl font-semibold text-card-foreground mb-4">📖 Plant Journal</h2>
          <form onSubmit={addEntry} className="flex gap-2 mb-4">
            <Input value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a note..." className="flex-1" />
            <Button type="submit" variant="hero" size="sm" className="rounded-lg">
              <Plus className="w-4 h-4" />
            </Button>
          </form>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No journal entries yet. Start documenting your plant's journey!</p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="p-3 rounded-xl bg-muted/30 border border-border">
                  <p className="text-sm text-card-foreground">{entry.note}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {entry.milestone_type && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground uppercase font-medium">{entry.milestone_type}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</span>
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

export default PlantDetail;
