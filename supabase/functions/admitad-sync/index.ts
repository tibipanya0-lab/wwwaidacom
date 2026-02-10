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

  const res = await fetch("https://api.admitad.com/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&scope=advcampaigns_for_website products_for_website`,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Admitad auth failed [${res.status}]: ${text}`);
  }

  return JSON.parse(text).access_token;
}

interface Campaign {
  id: number;
  name: string;
  products_xml_link?: string;
  show_products_links?: boolean;
}

async function fetchCampaigns(token: string, websiteId: string): Promise<Campaign[]> {
  const url = `https://api.admitad.com/advcampaigns/website/${websiteId}/?limit=100&connection_status=active&has_tool=products`;
  
  const res = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Admitad campaigns fetch failed [${res.status}]: ${text}`);
  }

  const data = await res.json();
  return data.results || [];
}

function parseXmlProducts(xml: string, campaignName: string): any[] {
  const products: any[] = [];
  // Simple XML parsing for <offer> elements in Admitad product feeds
  const offerRegex = /<offer[^>]*>([\s\S]*?)<\/offer>/gi;
  let match;
  let count = 0;

  while ((match = offerRegex.exec(xml)) !== null && count < 50) {
    const offer = match[1];
    
    const getName = (s: string) => {
      const m = s.match(/<name>([\s\S]*?)<\/name>/i);
      return m ? m[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : null;
    };
    const getTag = (tag: string, s: string) => {
      const m = s.match(new RegExp(`<${tag}>(.*?)<\\/${tag}>`, "is"));
      return m ? m[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : null;
    };
    const getUrl = (s: string) => {
      const m = s.match(/<url>([\s\S]*?)<\/url>/i);
      return m ? m[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : null;
    };
    const getPicture = (s: string) => {
      const m = s.match(/<picture>([\s\S]*?)<\/picture>/i);
      return m ? m[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : null;
    };

    const name = getName(offer);
    const price = getTag("price", offer);
    const currency = getTag("currencyId", offer) || "HUF";
    const url = getUrl(offer);
    const image = getPicture(offer);

    if (name && price) {
      products.push({
        name: name.slice(0, 500),
        price: parseFloat(price) || 0,
        currency,
        image_url: image || null,
        affiliate_url: url || null,
        store_name: campaignName || "Admitad",
      });
      count++;
    }
  }

  return products;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: Record<string, unknown> = {};
    try { body = await req.json(); } catch { /* optional */ }

    const websiteId = typeof body.website_id === "string" ? body.website_id : "";
    if (!websiteId) {
      return new Response(
        JSON.stringify({ error: "website_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching Admitad campaigns for website:", websiteId);

    const token = await getAdmitadToken();
    const campaigns = await fetchCampaigns(token, websiteId);

    console.log(`Found ${campaigns.length} active campaigns with product feeds`);

    // Filter campaigns that have product feed links
    const feedCampaigns = campaigns.filter(c => c.show_products_links && c.products_xml_link);
    console.log(`${feedCampaigns.length} campaigns have XML product feeds`);

    let allProducts: any[] = [];

    for (const campaign of feedCampaigns.slice(0, 5)) { // Limit to 5 feeds
      try {
        console.log(`Fetching feed for: ${campaign.name} (${campaign.id})`);
        const feedRes = await fetch(campaign.products_xml_link!, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        
        if (!feedRes.ok) {
          console.error(`Feed fetch failed for ${campaign.name}: ${feedRes.status}`);
          continue;
        }

        const xml = await feedRes.text();
        const products = parseXmlProducts(xml, campaign.name);
        console.log(`Parsed ${products.length} products from ${campaign.name}`);
        allProducts = allProducts.concat(products);
      } catch (e) {
        console.error(`Error processing feed ${campaign.name}:`, e);
      }
    }

    // If no XML feeds available, return campaign info
    if (feedCampaigns.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          count: 0, 
          campaigns_found: campaigns.length,
          campaigns_with_feeds: 0,
          message: "No campaigns with product feeds found. Campaigns available: " + 
            campaigns.slice(0, 10).map(c => c.name).join(", ")
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save to database
    if (allProducts.length > 0) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase.from("products").insert(allProducts);
      if (error) {
        console.error("DB insert error:", error);
        throw error;
      }
      console.log(`Inserted ${allProducts.length} products into database`);
    }

    return new Response(
      JSON.stringify({ success: true, count: allProducts.length }),
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
