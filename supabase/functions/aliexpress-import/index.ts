import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_URL = "https://api-sg.aliexpress.com/sync";

// Keywords come from request body

// ─── MD5 implementation (same as aliexpress-search) ───
function md5Hash(input: string): string {
  const utf8Bytes = new TextEncoder().encode(input);
  const string = Array.from(utf8Bytes).map(b => String.fromCharCode(b)).join('');

  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a=ff(a,b,c,d,k[0],7,-680876936);d=ff(d,a,b,c,k[1],12,-389564586);c=ff(c,d,a,b,k[2],17,606105819);b=ff(b,c,d,a,k[3],22,-1044525330);
    a=ff(a,b,c,d,k[4],7,-176418897);d=ff(d,a,b,c,k[5],12,1200080426);c=ff(c,d,a,b,k[6],17,-1473231341);b=ff(b,c,d,a,k[7],22,-45705983);
    a=ff(a,b,c,d,k[8],7,1770035416);d=ff(d,a,b,c,k[9],12,-1958414417);c=ff(c,d,a,b,k[10],17,-42063);b=ff(b,c,d,a,k[11],22,-1990404162);
    a=ff(a,b,c,d,k[12],7,1804603682);d=ff(d,a,b,c,k[13],12,-40341101);c=ff(c,d,a,b,k[14],17,-1502002290);b=ff(b,c,d,a,k[15],22,1236535329);
    a=gg(a,b,c,d,k[1],5,-165796510);d=gg(d,a,b,c,k[6],9,-1069501632);c=gg(c,d,a,b,k[11],14,643717713);b=gg(b,c,d,a,k[0],20,-373897302);
    a=gg(a,b,c,d,k[5],5,-701558691);d=gg(d,a,b,c,k[10],9,38016083);c=gg(c,d,a,b,k[15],14,-660478335);b=gg(b,c,d,a,k[4],20,-405537848);
    a=gg(a,b,c,d,k[9],5,568446438);d=gg(d,a,b,c,k[14],9,-1019803690);c=gg(c,d,a,b,k[3],14,-187363961);b=gg(b,c,d,a,k[8],20,1163531501);
    a=gg(a,b,c,d,k[13],5,-1444681467);d=gg(d,a,b,c,k[2],9,-51403784);c=gg(c,d,a,b,k[7],14,1735328473);b=gg(b,c,d,a,k[12],20,-1926607734);
    a=hh(a,b,c,d,k[5],4,-378558);d=hh(d,a,b,c,k[8],11,-2022574463);c=hh(c,d,a,b,k[11],16,1839030562);b=hh(b,c,d,a,k[14],23,-35309556);
    a=hh(a,b,c,d,k[1],4,-1530992060);d=hh(d,a,b,c,k[4],11,1272893353);c=hh(c,d,a,b,k[7],16,-155497632);b=hh(b,c,d,a,k[10],23,-1094730640);
    a=hh(a,b,c,d,k[13],4,681279174);d=hh(d,a,b,c,k[0],11,-358537222);c=hh(c,d,a,b,k[3],16,-722521979);b=hh(b,c,d,a,k[6],23,76029189);
    a=hh(a,b,c,d,k[9],4,-640364487);d=hh(d,a,b,c,k[12],11,-421815835);c=hh(c,d,a,b,k[15],16,530742520);b=hh(b,c,d,a,k[2],23,-995338651);
    a=ii(a,b,c,d,k[0],6,-198630844);d=ii(d,a,b,c,k[7],10,1126891415);c=ii(c,d,a,b,k[14],15,-1416354905);b=ii(b,c,d,a,k[5],21,-57434055);
    a=ii(a,b,c,d,k[12],6,1700485571);d=ii(d,a,b,c,k[3],10,-1894986606);c=ii(c,d,a,b,k[10],15,-1051523);b=ii(b,c,d,a,k[1],21,-2054922799);
    a=ii(a,b,c,d,k[8],6,1873313359);d=ii(d,a,b,c,k[15],10,-30611744);c=ii(c,d,a,b,k[6],15,-1560198380);b=ii(b,c,d,a,k[13],21,1309151649);
    a=ii(a,b,c,d,k[4],6,-145523070);d=ii(d,a,b,c,k[11],10,-1120210379);c=ii(c,d,a,b,k[2],15,718787259);b=ii(b,c,d,a,k[9],21,-343485551);
    x[0]=add32(a,x[0]);x[1]=add32(b,x[1]);x[2]=add32(c,x[2]);x[3]=add32(d,x[3]);
  }
  function cmn(q:number,a:number,b:number,x:number,s:number,t:number){a=add32(add32(a,q),add32(x,t));return add32((a<<s)|(a>>>(32-s)),b);}
  function ff(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return cmn((b&c)|(~b&d),a,b,x,s,t);}
  function gg(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return cmn((b&d)|(c&~d),a,b,x,s,t);}
  function hh(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return cmn(b^c^d,a,b,x,s,t);}
  function ii(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return cmn(c^(b|~d),a,b,x,s,t);}
  function add32(a:number,b:number){return(a+b)&0xffffffff;}
  function md5blk(s:string){const md5blks:number[]=[];for(let i=0;i<64;i+=4){md5blks[i>>2]=s.charCodeAt(i)+(s.charCodeAt(i+1)<<8)+(s.charCodeAt(i+2)<<16)+(s.charCodeAt(i+3)<<24);}return md5blks;}
  function rhex(n:number){const h="0123456789abcdef";let s="";for(let j=0;j<4;j++){s+=h.charAt((n>>(j*8+4))&0x0f)+h.charAt((n>>(j*8))&0x0f);}return s;}
  function hex(x:number[]){return x.map(rhex).join("");}
  function md5_1(s:string){const n=s.length;let state=[1732584193,-271733879,-1732584194,271733878];let i:number;for(i=64;i<=n;i+=64){md5cycle(state,md5blk(s.substring(i-64,i)));}s=s.substring(i-64);const tail=new Array(16).fill(0);for(i=0;i<s.length;i++){tail[i>>2]|=s.charCodeAt(i)<<(i%4<<3);}tail[i>>2]|=0x80<<(i%4<<3);if(i>55){md5cycle(state,tail);tail.fill(0);}tail[14]=n*8;md5cycle(state,tail);return state;}
  return hex(md5_1(string)).toUpperCase();
}

function signRequest(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params).sort();
  let signStr = secret;
  for (const key of sorted) { signStr += key + params[key]; }
  signStr += secret;
  return md5Hash(signStr);
}

function getTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

// ─── Call Gemini / Lovable AI ───
async function callAI(prompt: string, maxTokens = 2000): Promise<string | null> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (GEMINI_API_KEY) {
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0, maxOutputTokens: maxTokens },
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
      }
      console.log("Gemini direct error:", resp.status);
    } catch (e) { console.log("Gemini direct failed:", e); }
  }

  if (LOVABLE_API_KEY) {
    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens, temperature: 0,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        return data.choices?.[0]?.message?.content?.trim() || null;
      }
    } catch (e) { console.log("Lovable gateway failed:", e); }
  }
  return null;
}

// ─── Fetch products from one category page ───
async function fetchProductPage(appKey: string, appSecret: string, keywords: string, pageNo: number): Promise<any[]> {
  const params: Record<string, string> = {
    method: "aliexpress.affiliate.product.query",
    app_key: appKey,
    sign_method: "md5",
    timestamp: getTimestamp(),
    format: "json",
    v: "2.0",
    keywords: keywords,
    target_currency: "HUF",
    target_language: "EN",
    ship_to_country: "HU",
    page_no: pageNo.toString(),
    page_size: "40",
    sort: "LAST_VOLUME_DESC",
    platform_product_type: "ALL",
  };
  params.sign = signRequest(params, appSecret);

  const resp = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: new URLSearchParams(params).toString(),
  });

  if (!resp.ok) {
    console.log(`  API HTTP error: ${resp.status}`);
    return [];
  }
  const rawText = await resp.text();
  console.log(`  API response (first 300): ${rawText.slice(0, 300)}`);
  const data = JSON.parse(rawText);
  const result = data?.aliexpress_affiliate_product_query_response?.resp_result?.result;
  if (!result?.products?.product) {
    console.log(`  No products in API response. resp_result:`, JSON.stringify(data?.aliexpress_affiliate_product_query_response?.resp_result || data?.error_response || {}).slice(0, 300));
    return [];
  }

  return result.products.product.map((p: any) => ({
    original_title: p.product_title || "",
    price: parseFloat(p.target_sale_price || p.target_original_price || "0"),
    currency: "HUF",
    image_url: p.product_main_image_url || null,
    affiliate_url: p.promotion_link || p.product_detail_url || null,
    store_name: "AliExpress",
  }));
}

// ─── Enrich products via Gemini (batch of ~20) ───
interface EnrichedProduct {
  title: string;
  original_title: string;
  category: string;
  subcategory: string;
  gender: string;
  tags: string[];
  price: number;
  currency: string;
  image_url: string | null;
  affiliate_url: string | null;
  store_name: string;
}

async function enrichWithGemini(products: any[], categoryName: string): Promise<EnrichedProduct[]> {
  if (products.length === 0) return [];

  const titles = products.map((p, i) => `${i}. ${p.original_title}`).join("\n");

  const prompt = `You are a product data enricher for a Hungarian shopping platform.

For each product below, provide:
1. "title": Hungarian translation of the product name (natural, not word-by-word)
2. "gender": one of "férfi", "nő", "uniszex", "gyerek", "n/a"
3. "subcategory": specific Hungarian subcategory (e.g. "kabát", "cipő", "fülhallgató", "horgászbot", "táska")
4. "tags": 3-5 relevant Hungarian tags as array (e.g. ["téli", "meleg", "divatos"])
5. "valid": true if this is a real, identifiable product. false if it's spam/gibberish/misleading.

Category context: ${categoryName}

Products:
${titles}

Return ONLY valid JSON array:
[{"i":0,"title":"Magyar cím","gender":"férfi","subcategory":"kabát","tags":["téli","meleg"],"valid":true}, ...]

IMPORTANT: Return ONLY the JSON array, no markdown, no explanation.`;

  const raw = await callAI(prompt, 3000);
  if (!raw) return [];

  try {
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];

    const enriched: EnrichedProduct[] = [];
    for (const item of parsed) {
      if (!item.valid) continue;
      const idx = item.i;
      if (idx === undefined || idx < 0 || idx >= products.length) continue;
      const p = products[idx];
      if (!p.affiliate_url) continue;

      enriched.push({
        title: item.title || p.original_title,
        original_title: p.original_title,
        category: categoryName,
        subcategory: item.subcategory || "egyéb",
        gender: item.gender || "n/a",
        tags: Array.isArray(item.tags) ? item.tags : [],
        price: p.price,
        currency: p.currency,
        image_url: p.image_url,
        affiliate_url: p.affiliate_url,
        store_name: p.store_name,
      });
    }
    return enriched;
  } catch (e) {
    console.log("Gemini enrichment parse error:", e);
    return [];
  }
}

// ─── Main handler ───
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const appKey = Deno.env.get("ALIEXPRESS_APP_KEY")?.trim();
    const appSecret = Deno.env.get("ALIEXPRESS_APP_SECRET")?.trim();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!appKey || !appSecret) {
      throw new Error("AliExpress API credentials missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse keywords from request body
    let keywords = "trending";
    try {
      const body = await req.json();
      if (body?.keywords && typeof body.keywords === "string") {
        keywords = body.keywords.trim().slice(0, 200);
      }
    } catch { /* no body = use default */ }

    if (!keywords) throw new Error("Keywords required");

    console.log(`\n📦 Bulk import for: "${keywords}"`);
    const stats = { fetched: 0, enriched: 0, upserted: 0, skipped: 0, errors: 0 };

    // Fetch up to 100 products (3 pages × ~40)
    let allRaw: any[] = [];
    for (let page = 1; page <= 3 && allRaw.length < 100; page++) {
      const pageProducts = await fetchProductPage(appKey, appSecret, keywords, page);
      allRaw = allRaw.concat(pageProducts);
      if (pageProducts.length < 40) break;
    }
    allRaw = allRaw.slice(0, 100);
    stats.fetched = allRaw.length;
    console.log(`  Fetched: ${allRaw.length} products`);

    // Process in batches of 20 for Gemini
    for (let i = 0; i < allRaw.length; i += 20) {
      const batch = allRaw.slice(i, i + 20);
      const enriched = await enrichWithGemini(batch, keywords);
      stats.enriched += enriched.length;
      stats.skipped += batch.length - enriched.length;

      if (enriched.length === 0) continue;

      const { error } = await supabase
        .from("products")
        .upsert(
          enriched.map(p => ({
            title: p.title,
            original_title: p.original_title,
            category: p.category,
            subcategory: p.subcategory,
            gender: p.gender,
            tags: p.tags,
            price: p.price,
            currency: p.currency,
            image_url: p.image_url,
            affiliate_url: p.affiliate_url,
            store_name: p.store_name,
          })),
          { onConflict: "affiliate_url" }
        );

      if (error) {
        console.log(`  Upsert error:`, error.message);
        stats.errors++;
      } else {
        stats.upserted += enriched.length;
        console.log(`  Upserted batch: ${enriched.length} products`);
      }
    }

    console.log("\n✅ Import complete:", stats);

    return new Response(
      JSON.stringify({ success: true, stats }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Import error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Import failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
