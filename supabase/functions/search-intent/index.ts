import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Missing query" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const categories = ["Divat", "Elektronika", "Sport", "Otthon", "Szépség", "Gyerek", "Autó & Szerszám"];

    const systemPrompt = `You are a search intent classifier for a Hungarian shopping website. 
Given a user's search query, determine:
1. "keywords": array of refined search keywords (Hungarian) that best describe what the user wants. Keep the original word but also add synonyms if helpful.
2. "preferred_categories": array of category names the user most likely wants. Pick from: ${JSON.stringify(categories)}
3. "excluded_categories": array of categories that are clearly irrelevant to this search.

Rules:
- "póló" = T-shirt/polo shirt → Divat. Exclude: Autó & Szerszám, Elektronika
- "nadrág" = pants → Divat
- "fülhallgató" = headphones → Elektronika  
- "cipő" = shoes → Divat
- "krém" = cream → Szépség
- If unsure, return empty arrays for preferred/excluded
- Be conservative: only exclude categories when you're very confident they're irrelevant

Respond ONLY with valid JSON, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      // Fallback: return empty intent so search proceeds normally
      return new Response(JSON.stringify({ keywords: [query], preferred_categories: [], excluded_categories: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", raw);
      parsed = { keywords: [query], preferred_categories: [], excluded_categories: [] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("search-intent error:", e);
    return new Response(JSON.stringify({ keywords: [], preferred_categories: [], excluded_categories: [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
