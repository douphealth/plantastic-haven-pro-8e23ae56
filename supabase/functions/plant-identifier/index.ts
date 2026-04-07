import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description } = await req.json();
    if (!description || typeof description !== "string" || description.length > 2000) {
      return new Response(JSON.stringify({ error: "Please provide a plant description (max 2000 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are an expert botanist and plant identifier. When given a plant description, identify the plant and return a JSON object with these fields:
- name: common name of the plant
- scientific_name: scientific/Latin name
- description: brief 2-3 sentence description
- care_tips: array of 3-5 care tips
- toxicity: toxicity info for pets and children (e.g. "Non-toxic" or "Toxic to cats and dogs")
- difficulty: care difficulty level ("Easy", "Moderate", "Hard", "Expert")
- light: light requirements
- water: watering frequency
Return ONLY valid JSON, no markdown or code blocks.`,
          },
          {
            role: "user",
            content: `Identify this plant: ${description}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "identify_plant",
              description: "Return structured plant identification data",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  scientific_name: { type: "string" },
                  description: { type: "string" },
                  care_tips: { type: "array", items: { type: "string" } },
                  toxicity: { type: "string" },
                  difficulty: { type: "string", enum: ["Easy", "Moderate", "Hard", "Expert"] },
                  light: { type: "string" },
                  water: { type: "string" },
                },
                required: ["name", "scientific_name", "description", "care_tips", "toxicity", "difficulty"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "identify_plant" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI identification failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try parsing content
    const content = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("plant-identifier error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
