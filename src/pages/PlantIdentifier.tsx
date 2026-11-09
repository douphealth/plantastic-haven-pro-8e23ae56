import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scan, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/shared/AppLayout";
import PDFExporter from "@/components/shared/PDFExporter";
import { messageFromFunctionError } from "@/lib/functionError";
import { useAuth } from "@/contexts/AuthContext";
import { WATER_INTERVALS, insertGardenPlant } from "@/lib/plantCare";
import { matchCatalogPlant, toxicityLabel, type CatalogPlant } from "@/lib/plantCatalog";

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [catalog, setCatalog] = useState<CatalogPlant[]>([]);
  const [intervalDays, setIntervalDays] = useState(7);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase
      .from("plants")
      .select("id, name, scientific_name, common_names, light_needs, water_frequency_days, water_guidance, care_source, toxicity_pets, toxicity_children, humidity, description, care_difficulty")
      .then(({ data }) => setCatalog((data || []) as CatalogPlant[]));
  }, []);

  const matched = result ? matchCatalogPlant(catalog, result) : null;

  useEffect(() => {
    if (matched?.water_frequency_days) setIntervalDays(matched.water_frequency_days);
  }, [matched?.id, matched?.water_frequency_days]);

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

  const saveToGarden = async () => {
    if (!user || !result?.name) return;
    setSaving(true);
    const careNotes = [
      result.description,
      Array.isArray(result.care_tips) ? result.care_tips.filter(Boolean).join(" ") : "",
      result.toxicity ? `Identifier toxicity note: ${result.toxicity}` : "",
      matched?.water_guidance ? `Catalog water guidance: ${matched.water_guidance}` : "",
      "The identifier is a best guess. Sourced light and toxicity below come from the catalog match only.",
    ].filter(Boolean).join("\n\n");

    let photoUrl: string | null = null;
    if (image) {
      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const blob = await fetch(image).then((response) => response.blob());
      const upload = await supabase.storage.from("plant-photos").upload(path, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });
      if (!upload.error) {
        photoUrl = supabase.storage.from("plant-photos").getPublicUrl(path).data.publicUrl;
      }
    }

    const inserted = await insertGardenPlant({
      userId: user.id,
      nickname: result.name,
      location: "Indoor",
      notes: careNotes,
      waterIntervalDays: intervalDays,
      plantId: matched?.id || null,
    });
    setSaving(false);
    if (inserted.error) {
      toast({ title: "Could not save this plant", description: inserted.error.message, variant: "destructive" });
      return;
    }
    if (photoUrl && inserted.data?.[0]?.id) {
      await supabase.from("user_plants").update({ photo_url: photoUrl }).eq("id", inserted.data[0].id);
    }
    toast({
      title: matched ? "Saved with catalog care" : "Saved to your garden",
      description: matched
        ? "Light and toxicity on the plant page come from the matched catalog entry."
        : "No catalog entry matched this name, so the reminder interval is the one you chose.",
    });
    navigate("/my-garden");
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

            <div className="rounded-xl border border-border p-4 space-y-3">
              <h3 className="font-heading font-semibold text-foreground">Save to your garden</h3>
              {matched ? (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Matched catalog entry: {matched.name} ({matched.scientific_name}).</p>
                  <p>Light: {matched.light_needs}</p>
                  <p>Water: {matched.water_guidance}</p>
                  <p>{toxicityLabel(matched)}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No catalog species matched this name exactly. The reminder interval below is your choice, not a sourced schedule. The identifier text is saved as a note.
                </p>
              )}
              <label className="block text-sm" htmlFor="save-interval">
                Reminder every
                <select
                  id="save-interval"
                  value={intervalDays}
                  onChange={(event) => setIntervalDays(Number(event.target.value))}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {WATER_INTERVALS.map((days) => (
                    <option key={days} value={days}>{days} days</option>
                  ))}
                </select>
              </label>
              <Button type="button" variant="hero" onClick={saveToGarden} disabled={saving} className="rounded-xl">
                {saving ? "Saving..." : "Save this plant"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PlantIdentifier;
