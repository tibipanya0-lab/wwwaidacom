import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { batch_size = 50 } = await req.json().catch(() => ({}));

    const { data: products, error } = await supabase
      .from("products")
      .select("id, title, original_title, category, subcategory, tags")
      .is("embedding", null)
      .limit(batch_size);

    if (error) throw error;
    if (!products || products.length === 0) {
      return new Response(JSON.stringify({ message: "All products have embeddings", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;
    let errors = 0;

    for (const product of products) {
      try {
        const parts = [
          product.title,
          product.original_title || "",
          product.category || "",
          product.subcategory || "",
          ...(product.tags || []),
        ].filter(Boolean);
        const text = parts.join(" | ");

        const embedding = await generateEmbedding(text, GEMINI_API_KEY);

        const { error: updateError } = await supabase
          .from("products")
          .update({ embedding: JSON.stringify(embedding) })
          .eq("id", product.id);

        if (updateError) {
          console.error(`Save error for ${product.id}:`, updateError);
          errors++;
        } else {
          processed++;
        }

        await new Promise((r) => setTimeout(r, 100));
      } catch (e) {
        console.error(`Embedding error for ${product.id}:`, e);
        errors++;
      }
    }

    return new Response(
      JSON.stringify({ processed, errors, total_in_batch: products.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-embeddings error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
