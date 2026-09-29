import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Authentication required" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return json({ error: "Authentication required" }, 401);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("plant-identifier entitlement lookup failed:", profileError);
      return json({ error: "Unable to verify Pro access" }, 500);
    }

    if (profile?.subscription_tier !== "pro") {
      return json(
        {
          error: "Plant identifier requires PlantasticHaven Pro",
          code: "PRO_REQUIRED",
        },
        403
      );
    }

    const body = await req.json();
    const description =
      typeof body?.description === "string" ? body.description.trim() : "";

    if (!description || description.length > 2000) {
      return json(
        { error: "Please provide a plant description (max 2000 chars)" },
        400
      );
    }

    const AI_API_KEY =
      Deno.env.get("OPENAI_API_KEY") || Deno.env.get("AI_API_KEY");
    const AI_BASE_URL =
      Deno.env.get("AI_BASE_URL") ||
      "https://api.openai.com/v1/chat/completions";
    const AI_MODEL = Deno.env.get("AI_MODEL") || "gpt-4o-mini";

    if (!AI_API_KEY) {
      throw new Error("OPENAI_API_KEY or AI_API_KEY is not configured");
    }

    const response = await fetch(AI_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + AI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are an expert botanist and plant identifier. Identify the plant from the user's description. Return only the requested structured data. Do not invent certainty: when evidence is insufficient, clearly express uncertainty in the description and provide the most likely match.",
          },
          {
            role: "user",
            content: "Identify this plant: " + description,
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
                  difficulty: {
                    type: "string",
                    enum: ["Easy", "Moderate", "Hard", "Expert"],
                  },
                  light: { type: "string" },
                  water: { type: "string" },
                },
                required: [
                  "name",
                  "scientific_name",
                  "description",
                  "care_tips",
                  "toxicity",
                  "difficulty",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "identify_plant" },
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return json(
          { error: "Rate limit exceeded. Please try again in a moment." },
          429
        );
      }

      if (response.status === 402) {
        return json(
          { error: "AI credits exhausted. Please try again later." },
          402
        );
      }

      const responseText = await response.text();
      console.error(
        "AI gateway error:",
        response.status,
        responseText.slice(0, 500)
      );
      throw new Error("AI identification failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      return json(JSON.parse(toolCall.function.arguments));
    }

    const content = data.choices?.[0]?.message?.content || "{}";
    return json(JSON.parse(content));
  } catch (error) {
    console.error("plant-identifier error:", error);
    return json(
      {
        error:
          error instanceof Error ? error.message : "Unable to identify plant",
      },
      500
    );
  }
});
