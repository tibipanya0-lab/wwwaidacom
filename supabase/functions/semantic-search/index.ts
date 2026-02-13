import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        outputDimensionality: 768,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Embedding API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.embedding.values;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, match_count = 100, match_threshold = 0.3, filter_category = null } = await req.json();
    
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Missing query" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const queryEmbedding = await generateEmbedding(query, GEMINI_API_KEY);

    const { data, error } = await supabase.rpc("semantic_search", {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold,
      match_count,
      filter_category,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ results: data || [], query }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("semantic-search error:", e);
    return new Response(JSON.stringify({ error: e.message, results: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
