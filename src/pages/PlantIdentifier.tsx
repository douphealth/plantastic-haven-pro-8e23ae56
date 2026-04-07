import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Scan, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/shared/AppLayout";

const PlantIdentifier = () => {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const identify = async () => {
    if (!description.trim()) {
      toast({ title: "Describe your plant", description: "Tell us what the plant looks like", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("plant-identifier", {
        body: { description },
      });
      if (error) throw error;
      setResult(data);
    } catch (err: any) {
      toast({ title: "Identification failed", description: err.message || "Please try again", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">🔍 AI Plant Identifier</h1>
          <p className="text-muted-foreground text-sm">Describe a plant and let AI identify it for you</p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-elevated border border-border space-y-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the plant you want to identify... e.g. 'Large green leaves with holes, looks like a Swiss cheese plant, about 3 feet tall'"
            className="w-full h-32 rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button variant="hero" onClick={identify} disabled={loading} className="w-full rounded-xl h-12">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Identifying...</> : <><Scan className="w-4 h-4 mr-2" /> Identify Plant</>}
          </Button>
        </div>

        {result && (
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4 animate-fade-in-up">
            <h2 className="font-heading text-2xl font-bold text-primary">{result.name || "Unknown Plant"}</h2>
            {result.scientific_name && <p className="text-sm italic text-muted-foreground">{result.scientific_name}</p>}

            {result.description && (
              <div>
                <h3 className="text-sm font-semibold text-card-foreground mb-1">About</h3>
                <p className="text-sm text-muted-foreground">{result.description}</p>
              </div>
            )}

            {result.care_tips && (
              <div>
                <h3 className="text-sm font-semibold text-card-foreground mb-1">Care Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {(Array.isArray(result.care_tips) ? result.care_tips : [result.care_tips]).map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.toxicity && (
              <div className={`p-3 rounded-xl text-sm ${result.toxicity.includes("toxic") || result.toxicity.includes("Toxic") ? "bg-bloom/10 text-bloom" : "bg-accent text-accent-foreground"}`}>
                ⚠️ Toxicity: {result.toxicity}
              </div>
            )}

            {result.difficulty && (
              <div className="text-xs text-muted-foreground">Care difficulty: <span className="font-semibold text-card-foreground">{result.difficulty}</span></div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PlantIdentifier;
