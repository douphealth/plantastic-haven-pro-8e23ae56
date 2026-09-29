import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scan, Loader2, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/shared/AppLayout";
import PDFExporter from "@/components/shared/PDFExporter";

const PlantIdentifier = () => {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const identify = async () => {
    if (!description.trim()) {
      toast({
        title: "Describe your plant",
        description: "Tell us what the plant looks like.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        "plant-identifier",
        { body: { description } }
      );

      if (error) {
        let serverMessage = error.message;
        try {
          const payload = await (error as any)?.context?.json?.();
          if (payload?.error) serverMessage = payload.error;
        } catch {
          // Fall back to the SDK error message.
        }
        throw new Error(serverMessage);
      }

      setResult(data);
    } catch (err: any) {
      toast({
        title: "Identification failed",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            AI Plant Identifier
          </h1>
          <p className="text-muted-foreground text-sm">
            Free accounts include 5 successful AI scans per month. Pro is unlimited.
          </p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-elevated border border-border space-y-4">
          <textarea
            value={description}
            maxLength={2000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe leaf shape, color, pattern, growth habit, stem, flowers, size, and anything distinctive."
            className="w-full h-32 rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>More visual detail improves identification quality.</span>
            <span>{description.length}/2000</span>
          </div>
          <Button
            variant="hero"
            onClick={identify}
            disabled={loading}
            className="w-full rounded-xl h-12"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Identifying...
              </>
            ) : (
              <>
                <Scan className="w-4 h-4 mr-2" />
                Identify Plant
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4 animate-fade-in-up">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-primary">
                  {result.name || "Unknown Plant"}
                </h2>
                {result.scientific_name && (
                  <p className="text-sm italic text-muted-foreground">
                    {result.scientific_name}
                  </p>
                )}
                {result.confidence && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Identification confidence:{" "}
                    <span className="font-semibold capitalize">
                      {result.confidence}
                    </span>
                  </p>
                )}
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
                  care_tips: Array.isArray(result.care_tips)
                    ? result.care_tips
                    : [result.care_tips],
                  notes: `AI identification based on: "${description}"`,
                }}
                triggerText="Export AI Scan PDF"
                variant="outline"
              />
            </div>

            {result.usage?.plan === "free" && (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 border border-border p-3 text-xs">
                <span className="text-muted-foreground">
                  {result.usage.remaining} free AI scan
                  {result.usage.remaining === 1 ? "" : "s"} remaining this month.
                </span>
                <Button asChild size="sm" variant="outline" className="rounded-lg h-8">
                  <Link to="/settings?upgrade=1">
                    <Crown className="w-3.5 h-3.5 mr-1.5" />
                    Go unlimited
                  </Link>
                </Button>
              </div>
            )}

            {result.description && (
              <div>
                <h3 className="text-sm font-semibold text-card-foreground mb-1">
                  About
                </h3>
                <p className="text-sm text-muted-foreground">
                  {result.description}
                </p>
              </div>
            )}

            {result.care_tips && (
              <div>
                <h3 className="text-sm font-semibold text-card-foreground mb-1">
                  Care Tips
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {(Array.isArray(result.care_tips)
                    ? result.care_tips
                    : [result.care_tips]
                  ).map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.toxicity && (
              <div className="p-3 rounded-xl text-sm bg-accent text-accent-foreground">
                Toxicity: {result.toxicity}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {result.difficulty && (
                <div className="rounded-xl bg-muted/40 p-3">
                  <div className="text-muted-foreground">Difficulty</div>
                  <div className="font-semibold text-card-foreground">
                    {result.difficulty}
                  </div>
                </div>
              )}
              {result.light && (
                <div className="rounded-xl bg-muted/40 p-3">
                  <div className="text-muted-foreground">Light</div>
                  <div className="font-semibold text-card-foreground">
                    {result.light}
                  </div>
                </div>
              )}
              {result.water && (
                <div className="rounded-xl bg-muted/40 p-3">
                  <div className="text-muted-foreground">Water</div>
                  <div className="font-semibold text-card-foreground">
                    {result.water}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PlantIdentifier;
