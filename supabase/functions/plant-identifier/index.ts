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
    const image = typeof body?.image === "string" ? body.image.trim() : "";
    const imagePattern =
      /^data:image\/(jpeg|jpg|png|webp);base64,[a-z0-9+/=\r\n]+$/i;

    if (description.length > 2000) {
      return json(
        { error: "Please keep the description under 2000 characters" },
        400
      );
    }

    if (image && (!imagePattern.test(image) || image.length > 1_800_000)) {
      return json(
        { error: "Use a JPEG, PNG, or WebP photo under about 1 MB" },
        400
      );
    }

    if (!description && !image) {
      return json(
        { error: "Add a photo or a short description of the plant" },
        400
      );
    }

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (serviceRoleKey) {
      const admin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        serviceRoleKey,
        { auth: { persistSession: false } }
      );
      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);
      const { count, error: usageError } = await admin
        .from("ai_identification_log")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfDay.toISOString());

      if (!usageError && (count ?? 0) >= 25) {
        return json(
          {
            error: "Daily identification limit reached. Try again tomorrow.",
            code: "RATE_LIMIT",
          },
          429
        );
      }

      if (!usageError) {
        await admin.from("ai_identification_log").insert({ user_id: user.id });
      }
    }

    const AI_API_KEY =
      Deno.env.get("OPENAI_API_KEY") || Deno.env.get("AI_API_KEY");
    const AI_BASE_URL =
      Deno.env.get("AI_BASE_URL") ||
      "https://api.openai.com/v1/chat/completions";
    const AI_MODEL =
      (image ? Deno.env.get("AI_VISION_MODEL") : null) ||
      Deno.env.get("AI_MODEL") ||
      "gpt-4o-mini";

    if (!AI_API_KEY) {
      console.error("plant-identifier AI key is not configured");
      return json(
        { error: "Plant identifier is temporarily unavailable" },
        503
      );
    }

    const userContent = image
      ? [
          {
            type: "text",
            text: description
              ? "Identify this plant. The photo is the evidence. Extra notes from the owner: " +
                description
              : "Identify this plant from the photo. If the photo is unclear, say so in the description.",
          },
          { type: "image_url", image_url: { url: image } },
        ]
      : "Identify this plant: " + description;

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
              "You are an expert botanist and plant identifier. Identify the plant from the user's description and photo when one is attached. Return only the requested structured data. Do not invent certainty: when evidence is insufficient, clearly express uncertainty in the description and provide the most likely match.",
          },
          {
            role: "user",
            content: userContent,
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
    const raw = toolCall?.function?.arguments || data.choices?.[0]?.message?.content;

    if (typeof raw !== "string") {
      return json({ error: "The identifier returned an unreadable result" }, 502);
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      console.error("plant-identifier parse failed:", parseError);
      return json({ error: "The identifier returned an unreadable result" }, 502);
    }

    if (typeof parsed.name !== "string" || !parsed.name.trim()) {
      return json({ error: "The identifier could not name a plant" }, 502);
    }

    return json({
      name: parsed.name,
      scientific_name: parsed.scientific_name ?? "",
      description: parsed.description ?? "",
      care_tips: parsed.care_tips ?? [],
      toxicity: parsed.toxicity ?? "",
      difficulty: parsed.difficulty ?? "",
      light: parsed.light ?? "",
      water: parsed.water ?? "",
    });
  } catch (error) {
    console.error("plant-identifier error:", error);
    return json({ error: "Unable to identify plant" }, 500);
  }
});
