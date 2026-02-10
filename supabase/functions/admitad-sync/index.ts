import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FEED_URL =
  "https://export.admitad.com/en/webmaster/websites/2911916/products/export_adv_products/?user=tibi_panya8a6c9&code=wdtuok4g5a&format=xml&currency=&feed_id=15830&last_import=2026.02.10.00.00";

const USD_TO_HUF = 380;

function parseXmlProducts(xml: string): any[] {
  const products: any[] = [];
  const offerRegex = /<offer[^>]*>([\s\S]*?)<\/offer>/gi;
  let match;
  let count = 0;

  while ((match = offerRegex.exec(xml)) !== null && count < 50) {
    const offer = match[1];

    const getTag = (tag: string, s: string) => {
      const m = s.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
      return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() : null;
    };

    const name = getTag("name", offer);
    const priceRaw = getTag("price", offer);
    const url = getTag("url", offer);
    const picture = getTag("picture", offer);
    const currencyId = getTag("currencyId", offer);
    const vendor = getTag("vendor", offer);

    if (name && priceRaw) {
      const priceUsd = parseFloat(priceRaw.replace(/[^\d.]/g, "")) || 0;
      const priceHuf = Math.round(priceUsd * USD_TO_HUF);
      products.push({
        name: name.slice(0, 500),
        price: priceHuf,
        currency: "HUF",
        image_url: picture || null,
        affiliate_url: url || null,
        store_name: vendor || "AliExpress",
      });
      count++;
    }
  }

  return products;
}

async function translateBatch(names: string[]): Promise<string[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.warn("LOVABLE_API_KEY not set, skipping translation");
    return names;
  }

  const prompt = `Fordítsd le az alábbi angol termékneveket magyarra. Csak a fordított neveket add vissza, soronként egyet, ugyanabban a sorrendben. Ne adj hozzá sorszámot, kötőjelet vagy egyéb formázást. Pontosan ${names.length} sort adj vissza.

${names.map((n, i) => `${i + 1}. ${n}`).join("\n")}`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Te egy professzionális termékfordító vagy. Rövid, tömör magyar termékneveket adsz vissza. Semmilyen extra szöveget vagy formázást ne adj hozzá." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      console.error(`Translation API error [${res.status}]`);
      return names;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    const lines = content.split("\n").map((l: string) => l.replace(/^\d+[\.\)\-]\s*/, "").trim()).filter((l: string) => l.length > 0);

    if (lines.length === names.length) {
      return lines;
    }
    console.warn(`Translation returned ${lines.length} lines, expected ${names.length}. Using originals.`);
    return names;
  } catch (e) {
    console.error("Translation error:", e);
    return names;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fetching Admitad XML feed (streaming)...");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const feedRes = await fetch(FEED_URL, { signal: controller.signal });
    clearTimeout(timeout);

    if (!feedRes.ok) {
      throw new Error(`Feed fetch failed [${feedRes.status}]`);
    }

    const reader = feedRes.body!.getReader();
    const decoder = new TextDecoder();
    let xml = "";
    const MAX_BYTES = 20 * 1024 * 1024;

    while (xml.length < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      xml += decoder.decode(value, { stream: true });
    }
    reader.cancel();

    console.log(`Read ${xml.length} chars from feed`);

    const products = parseXmlProducts(xml);
    console.log(`Parsed ${products.length} products (prices converted to HUF)`);

    if (products.length === 0) {
      return new Response(
        JSON.stringify({ success: true, count: 0, message: "No products found in feed", xmlSnippet: xml.slice(0, 500) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Translate product names in batches of 25
    console.log("Translating product names to Hungarian...");
    const BATCH_SIZE = 25;
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const names = batch.map((p: any) => p.name);
      const translated = await translateBatch(names);
      for (let j = 0; j < batch.length; j++) {
        products[i + j].name = translated[j];
      }
      console.log(`Translated batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(products.length / BATCH_SIZE)}`);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Clear old products then insert new ones
    await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const { error } = await supabase.from("products").insert(products);
    if (error) {
      console.error("DB insert error:", error);
      throw error;
    }

    console.log(`Inserted ${products.length} translated products`);

    return new Response(
      JSON.stringify({ success: true, count: products.length, translated: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
