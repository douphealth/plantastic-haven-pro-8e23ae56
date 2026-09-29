import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

  let reservedFreeScan = false;
  let userId: string | null = null;
  // Edge functions do not import the browser-generated Database type; keep the
  // privileged server client dynamically typed at this boundary and validate
  // every returned value before use.
  let admin: any = null;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Sign in to use the AI plant identifier" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: "Plant identifier is not configured" }, 503);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const token = authHeader.slice("Bearer ".length);
    const { data: userData, error: userError } =
      await authClient.auth.getUser(token);

    if (userError || !userData.user) {
      return json({ error: "Invalid or expired session" }, 401);
    }

    userId = userData.user.id;

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("subscription_tier")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("Profile lookup failed", profileError);
      return json({ error: "Unable to load your plan" }, 500);
    }

    const isPro = profile?.subscription_tier === "pro";
    let usage = { plan: isPro ? "pro" : "free", remaining: null as number | null };

    if (!isPro) {
      const { data: usageRows, error: usageError } = await admin.rpc(
        "consume_ai_scan",
        { p_user_id: userId }
      );

      if (usageError) {
        console.error("AI usage reservation failed", usageError);
        return json({ error: "Unable to verify AI scan allowance" }, 500);
      }

      const usageRow = Array.isArray(usageRows) ? usageRows[0] : usageRows;

      if (!usageRow?.allowed) {
        return json(
          {
            error:
              "You have used your 5 free AI scans for this month. Upgrade to Pro for unlimited scans.",
            code: "FREE_SCAN_LIMIT_REACHED",
            remaining: 0,
          },
          429
        );
      }

      reservedFreeScan = true;
      usage.remaining = Number(usageRow.remaining ?? 0);
    }

    const { description } = await req.json();

    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length < 4 ||
      description.length > 2000
    ) {
      if (reservedFreeScan && userId) {
        await admin.rpc("refund_ai_scan", { p_user_id: userId });
        reservedFreeScan = false;
      }
      return json(
        { error: "Please provide a plant description between 4 and 2000 characters" },
        400
      );
    }

    const aiApiKey =
      Deno.env.get("OPENAI_API_KEY") || Deno.env.get("AI_API_KEY");
    const aiBaseUrl =
      Deno.env.get("AI_BASE_URL") ||
      "https://api.openai.com/v1/chat/completions";
    const aiModel = Deno.env.get("AI_MODEL") || "gpt-4o-mini";

    if (!aiApiKey) {
      throw new Error("AI provider is not configured");
    }

    const response = await fetch(aiBaseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiModel,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are a cautious plant identification assistant. Identify only from the supplied visual description. State uncertainty when evidence is insufficient. Never invent a confident species ID from weak evidence. Return structured JSON through the provided function.",
          },
          {
            role: "user",
            content: `Identify this plant from the user's description and provide safe, practical care guidance: ${description.trim()}`,
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
                  confidence: {
                    type: "string",
                    enum: ["low", "medium", "high"],
                  },
                  description: { type: "string" },
                  care_tips: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 5,
                  },
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
                  "confidence",
                  "description",
                  "care_tips",
                  "toxicity",
                  "difficulty",
                  "light",
                  "water",
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
      const providerBody = await response.text();
      console.error("AI provider error", response.status, providerBody);
      throw new Error(
        response.status === 429
          ? "AI service is busy. Please retry shortly."
          : "AI identification failed. Please retry."
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("AI provider returned an invalid structured response");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return json({
      ...result,
      usage,
    });
  } catch (error) {
    if (reservedFreeScan && userId && admin) {
      const { error: refundError } = await admin.rpc("refund_ai_scan", {
        p_user_id: userId,
      });
      if (refundError) {
        console.error("Failed to refund unsuccessful AI scan", refundError);
      }
    }

    console.error("plant-identifier failed", error);
    return json(
      {
        error:
          error instanceof Error ? error.message : "Unable to identify plant",
      },
      500
    );
  }
});
