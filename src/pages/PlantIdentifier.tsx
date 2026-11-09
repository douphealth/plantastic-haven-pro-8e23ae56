import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Scan, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/shared/AppLayout";
import PDFExporter from "@/components/shared/PDFExporter";
import { messageFromFunctionError } from "@/lib/functionError";

const fileToJpegDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Use a JPEG, PNG, or WebP photo"));
      return;
    }
    if (file.size > 8_000_000) {
      reject(new Error("Choose a photo under 8 MB"));
      return;
    }
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(1, 1024 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read that photo"));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that photo"));
    };
    image.src = url;
  });

const PlantIdentifier = () => {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onPhoto = async (file?: File) => {
    if (!file) {
      setImage("");
      return;
    }
    try {
      setImage(await fileToJpegDataUrl(file));
    } catch (error) {
      setImage("");
      toast({
        title: "Photo not added",
        description: error instanceof Error ? error.message : "Try another photo",
        variant: "destructive",
      });
    }
  };

  const identify = async () => {
    if (!description.trim() && !image) {
      toast({ title: "Add a photo or a description", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("plant-identifier", {
        body: { description, image: image || undefined },
      });
      if (error) throw error;
      if (!data?.name) throw new Error("The identifier could not name a plant");
      setResult(data);
    } catch (err: unknown) {
      toast({
        title: "Identification failed",
        description: await messageFromFunctionError(err, "Please try again"),
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Plant identifier</h1>
          <p className="text-muted-foreground text-sm">
            Add a photo, a description, or both. The result is a best guess, not a confirmed identification. Pro accounts are limited to 25 requests per day.
          </p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-elevated border border-border space-y-4">
          <label className="block text-sm font-medium text-foreground">
            Photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-2 block w-full text-sm text-muted-foreground"
              onChange={(event) => onPhoto(event.target.files?.[0])}
            />
          </label>
          {image && (
            <img src={image} alt="Selected plant" className="w-full max-h-64 object-cover rounded-xl" />
          )}
          <label className="block text-sm font-medium text-foreground" htmlFor="plant-description">
            Description
          </label>
          <textarea
            id="plant-description"
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
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-primary">{result.name || "Unknown Plant"}</h2>
                {result.scientific_name && <p className="text-sm italic text-muted-foreground">{result.scientific_name}</p>}
              </div>
              <PDFExporter 
                plant={{
                  nickname: result.name || "Identified Plant",
                  scientific_name: result.scientific_name,
                  health_score: 100,
                  difficulty: result.difficulty,
                  light: result.light,
                  water: result.water,
                  toxicity: result.toxicity,
                  care_tips: Array.isArray(result.care_tips) ? result.care_tips : [result.care_tips],
                  notes: `AI Scanner Diagnosis for: "${description}"`
                }} 
                triggerText="Export AI Scan PDF" 
                variant="outline" 
              />
            </div>

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
