import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getAdmitadToken(): Promise<string> {
  const clientId = Deno.env.get("ADMITAD_CLIENT_ID");
  const clientSecret = Deno.env.get("ADMITAD_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("ADMITAD_CLIENT_ID or ADMITAD_CLIENT_SECRET not configured");
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch("https://api.admitad.com/token/", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=advcampaigns_for_website products_for_website",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Admitad auth failed [${res.status}]: ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function fetchProducts(token: string, websiteId: string): Promise<any[]> {
  const url = `https://api.admitad.com/products/website/${websiteId}/?limit=50&order_by=-price`;

  const res = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Admitad products fetch failed [${res.status}]: ${text}`);
  }

  const data = await res.json();
  return data.results || [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      // body is optional
    }

    const websiteId = typeof body.website_id === "string" ? body.website_id : "";
    if (!websiteId) {
      return new Response(
        JSON.stringify({ error: "website_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching Admitad products for website:", websiteId);

    const token = await getAdmitadToken();
    const products = await fetchProducts(token, websiteId);

    console.log(`Fetched ${products.length} products from Admitad`);

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const rows = products.map((p: any) => ({
      name: (p.name || "Ismeretlen termék").slice(0, 500),
      price: parseFloat(p.price) || 0,
      currency: p.currency || "HUF",
      image_url: p.image || null,
      affiliate_url: p.goto_link || p.url || null,
      store_name: p.vendor || p.campaign_name || "Admitad",
    }));

    if (rows.length > 0) {
      const { error } = await supabase.from("products").insert(rows);
      if (error) {
        console.error("DB insert error:", error);
        throw error;
      }
      console.log(`Inserted ${rows.length} products into database`);
    }

    return new Response(
      JSON.stringify({ success: true, count: rows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Admitad sync error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
