import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, store, category } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Searching coupons:", { query, store, category });

    let queryBuilder = supabase
      .from("coupons")
      .select("*")
      .eq("is_active", true)
      .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`);

    // Filter by store if provided
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
