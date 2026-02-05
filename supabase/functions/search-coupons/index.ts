import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation constants
const MAX_QUERY_LENGTH = 200;
const MAX_STORE_LENGTH = 100;
const MAX_CATEGORY_LENGTH = 50;

// Validate and sanitize string input
function sanitizeString(input: unknown, maxLength: number): string | null {
  if (typeof input !== "string") return null;
  // Remove potential SQL injection patterns and script tags
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>'";\\]/g, "")
    .replace(/--/g, "")
    .replace(/\/\*/g, "")
    .replace(/\*\//g, "")
    .trim()
    .slice(0, maxLength);
  return sanitized || null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Hibás kérés formátum", coupons: [] }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof body !== "object" || body === null) {
      return new Response(
        JSON.stringify({ error: "Hibás kérés", coupons: [] }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestBody = body as Record<string, unknown>;
    
    // Validate and sanitize inputs
    const query = sanitizeString(requestBody.query, MAX_QUERY_LENGTH);
    const store = sanitizeString(requestBody.store, MAX_STORE_LENGTH);
    const category = sanitizeString(requestBody.category, MAX_CATEGORY_LENGTH);
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Searching coupons:", { 
      query: query?.slice(0, 30), 
      store: store?.slice(0, 30), 
      category: category?.slice(0, 30) 
    });

    let queryBuilder = supabase
      .from("coupons")
      .select("*")
      .eq("is_active", true)
      .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`);

    // Filter by store if provided (using parameterized query via Supabase client)
    if (store) {
      queryBuilder = queryBuilder.ilike("store_name", `%${store}%`);
    }

    // Filter by category if provided
    if (category) {
      queryBuilder = queryBuilder.ilike("category", `%${category}%`);
    }

    // General search in description
    if (query && !store && !category) {
      queryBuilder = queryBuilder.or(`store_name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);
    }

    const { data: coupons, error } = await queryBuilder
      .order("discount_percent", { ascending: false, nullsFirst: false })
      .limit(10);

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    console.log(`Found ${coupons?.length || 0} coupons`);

    return new Response(
      JSON.stringify({ coupons: coupons || [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Search coupons error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Ismeretlen hiba", coupons: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
