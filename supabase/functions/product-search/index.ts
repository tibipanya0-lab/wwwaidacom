import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── CORS ───
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── AI Helper (Gemini direct → Lovable gateway fallback) ───
async function callAI(prompt: string, maxTokens = 200): Promise<string | null> {
  const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
  const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (GEMINI_KEY) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: maxTokens },
          }),
        }
      );
      if (r.ok) {
        const d = await r.json();
        return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
      }
      console.log("Gemini error:", r.status);
    } catch (e) {
      console.log("Gemini failed:", e);
    }
  }

  if (LOVABLE_KEY) {
    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.3,
        }),
      });
      if (r.ok) {
        const d = await r.json();
        return d.choices?.[0]?.message?.content?.trim() || null;
      }
    } catch (e) {
      console.log("Lovable gateway failed:", e);
    }
  }
  return null;
}

// ─── Intent Analysis ───
interface Intent {
  correctedQuery: string;
  keywords: string[];
  englishKeywords: string;
  gender: string | null;
  category: string | null;
}

async function analyzeIntent(query: string): Promise<Intent> {
  const prompt = `You are a Hungarian shopping search intent analyzer.

1. Fix typos: "ferfi sipo" → "férfi cipő", "laptp" → "laptop"
2. Extract gender: "férfi" | "nő" | "gyerek" | null
3. Extract category in Hungarian: "kabát", "cipő", "táska", etc. or null
4. Extract Hungarian keywords for DB search
5. Translate to 2-4 English keywords for AliExpress API

Query: "${query}"

Return ONLY valid JSON:
{"correctedQuery":"javított","keywords":["kulcsszó1"],"englishKeywords":"english terms","gender":null,"category":null}`;

  const raw = await callAI(prompt, 150);
  if (raw) {
    try {
      const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const p = JSON.parse(cleaned);
      return {
        correctedQuery: p.correctedQuery || query,
        keywords: Array.isArray(p.keywords) ? p.keywords : [query],
        englishKeywords: p.englishKeywords || query,
        gender: p.gender === "null" || !p.gender ? null : p.gender,
        category: p.category === "null" || !p.category ? null : p.category,
      };
    } catch {
      console.log("Intent parse failed");
    }
  }
  return { correctedQuery: query, keywords: [query], englishKeywords: query, gender: null, category: null };
}

// ─── Style Tip ───
async function generateStyleTip(query: string, count: number, lang: string): Promise<string | null> {
  if (count === 0) return null;
  const langName = lang === "en" ? "English" : lang === "uk" ? "Ukrainian" : "Hungarian";
  const prompt = `You are Inaya, a friendly shopping assistant. User searched "${query}", found ${count} products.
Write 1-2 sentence personal style tip or expert advice in ${langName}. Be warm, use 1 emoji. Plain text only, no markdown.`;
  return await callAI(prompt, 80);
}

// ─── MD5 for AliExpress API signing ───
function md5Hash(input: string): string {
  const utf8Bytes = new TextEncoder().encode(input);
  const s = Array.from(utf8Bytes).map(b => String.fromCharCode(b)).join("");
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
    a=ii(a,b,c,d,k[0],6,-198630844);d=ii(d,a,b,c,k[7],10,1126891415);c=ii(c,d,a,b,c,k[14],15,-1416354905);b=ii(b,c,d,a,k[5],21,-57434055);
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
  function md5blk(s2:string){const r:number[]=[];for(let i=0;i<64;i+=4){r[i>>2]=s2.charCodeAt(i)+(s2.charCodeAt(i+1)<<8)+(s2.charCodeAt(i+2)<<16)+(s2.charCodeAt(i+3)<<24);}return r;}
  function rhex(n:number){const h="0123456789abcdef";let r="";for(let j=0;j<4;j++){r+=h.charAt((n>>(j*8+4))&0x0f)+h.charAt((n>>(j*8))&0x0f);}return r;}
  function hex(x:number[]){return x.map(rhex).join("");}
  function md5_1(s2:string){const n=s2.length;let state=[1732584193,-271733879,-1732584194,271733878];let i:number;for(i=64;i<=n;i+=64){md5cycle(state,md5blk(s2.substring(i-64,i)));}s2=s2.substring(i-64);const tail=new Array(16).fill(0);for(i=0;i<s2.length;i++){tail[i>>2]|=s2.charCodeAt(i)<<(i%4<<3);}tail[i>>2]|=0x80<<(i%4<<3);if(i>55){md5cycle(state,tail);tail.fill(0);}tail[14]=n*8;md5cycle(state,tail);return state;}
  return hex(md5_1(s)).toUpperCase();
}

function signRequest(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params).sort();
  let str = secret;
  for (const k of sorted) str += k + params[k];
  str += secret;
  return md5Hash(str);
}

function getTimestamp(): string {
  const n = new Date();
  const p = (v: number) => v.toString().padStart(2, "0");
  return `${n.getFullYear()}-${p(n.getMonth()+1)}-${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`;
}

// ─── AliExpress API Search ───
async function searchAliExpressAPI(keywords: string, appKey: string, appSecret: string): Promise<any[]> {
  const params: Record<string, string> = {
    method: "aliexpress.affiliate.product.query",
    app_key: appKey,
    sign_method: "md5",
    timestamp: getTimestamp(),
    format: "json",
    v: "2.0",
    keywords,
    target_currency: "HUF",
    target_language: "EN",
    ship_to_country: "HU",
    page_no: "1",
    page_size: "20",
    sort: "LAST_VOLUME_DESC",
    platform_product_type: "ALL",
  };
  params.sign = signRequest(params, appSecret);

  try {
    const r = await fetch("https://api-sg.aliexpress.com/sync", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
      body: new URLSearchParams(params).toString(),
    });
    if (!r.ok) return [];
    const data = JSON.parse(await r.text());
    const result = data?.aliexpress_affiliate_product_query_response?.resp_result?.result;
    if (!result?.products?.product) return [];

    return result.products.product.map((p: any) => ({
      original_title: p.product_title || "",
      price: parseFloat(p.target_sale_price || p.target_original_price || "0"),
      originalPrice: parseFloat(p.target_original_price || "0"),
      currency: "HUF",
      image_url: p.product_main_image_url || null,
      affiliate_url: p.promotion_link || p.product_detail_url || null,
      store_name: "AliExpress",
      discount: p.discount ? `${String(p.discount).replace(/%/g, "")}%` : null,
      orders: p.lastest_volume ? parseInt(p.lastest_volume) : null,
    }));
  } catch (e) {
    console.error("AliExpress API error:", e);
    return [];
  }
}

// ─── Gemini Enrichment for Background Indexing ───
async function enrichAndIndex(products: any[], supabase: any): Promise<void> {
  if (products.length === 0) return;
  const titles = products.map((p, i) => `${i}. ${p.original_title}`).join("\n");
  const prompt = `Enrich these products for a Hungarian shopping platform.
For each, return:
1. "title": Hungarian translation (natural, concise)
2. "gender": "férfi" | "nő" | "uniszex" | "gyerek" | "n/a"
3. "subcategory": Hungarian subcategory (e.g. "kabát", "cipő")
4. "tags": 3-5 Hungarian tags as array
5. "valid": true if real product, false if spam

Products:
${titles}

Return ONLY valid JSON array:
[{"i":0,"title":"Magyar cím","gender":"uniszex","subcategory":"cipő","tags":["sport"],"valid":true}]`;

  const raw = await callAI(prompt, 3000);
  if (!raw) return;

  try {
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return;

    const rows: any[] = [];
    for (const item of parsed) {
      if (!item.valid || item.i == null || item.i < 0 || item.i >= products.length) continue;
      const p = products[item.i];
      if (!p.affiliate_url) continue;
      rows.push({
        title: item.title || p.original_title,
        original_title: p.original_title,
        category: item.subcategory || "Egyéb",
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

    if (rows.length > 0) {
      const { error } = await supabase.from("products").upsert(rows, { onConflict: "affiliate_url" });
      if (error) console.error("Upsert error:", error);
      else console.log(`✅ Indexed ${rows.length} products`);
    }
  } catch (e) {
    console.error("Enrichment error:", e);
  }
}

// ─── Map DB product → response format ───
function mapDbProduct(p: any) {
  return {
    id: p.id,
    name: p.title,
    price: Number(p.price),
    originalPrice: Number(p.price),
    currency: p.currency || "HUF",
    image_url: p.image_url,
    affiliate_url: p.affiliate_url,
    store_name: p.store_name,
    discount: null,
    orders: null,
    source: "db",
  };
}

function mapApiProduct(p: any, i: number) {
  return {
    id: `api_${i}`,
    name: p.original_title,
    price: p.price,
    originalPrice: p.originalPrice || p.price,
    currency: p.currency || "HUF",
    image_url: p.image_url,
    affiliate_url: p.affiliate_url,
    store_name: p.store_name,
    discount: p.discount,
    orders: p.orders,
    source: "api",
  };
}

// ─── Main Handler ───
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, page = 1, sort = "popular", language = "hu", maxPrice } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Keresési kifejezés szükséges" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const sanitized = query.trim().slice(0, 200);
    const pageSize = 20;
    const pageNo = Math.max(1, Number(page) || 1);
    const offset = (pageNo - 1) * pageSize;

    // ── Step 1: Intent Analysis (Gemini) ──
    console.log(`🔍 Search: "${sanitized}"`);
    const intent = await analyzeIntent(sanitized);
    console.log(`Intent: ${JSON.stringify(intent)}`);

    // ── Step 2: Search local DB ──
    const terms = intent.keywords.length > 0 ? intent.keywords : [intent.correctedQuery];
    const orParts: string[] = [];
    for (const kw of terms) {
      orParts.push(`title.ilike.%${kw}%`);
      orParts.push(`original_title.ilike.%${kw}%`);
      orParts.push(`tags.cs.{${kw}}`);
    }

    let dbQ = supabase.from("products").select("*", { count: "exact" }).or(orParts.join(","));

    // Strict gender filter
    if (intent.gender) {
      dbQ = dbQ.or(`gender.eq.${intent.gender},gender.eq.uniszex`);
    }
    // Strict category filter
    if (intent.category) {
      dbQ = dbQ.ilike("subcategory", `%${intent.category}%`);
    }
    if (maxPrice && maxPrice > 0) {
      dbQ = dbQ.lte("price", maxPrice);
    }
    if (sort === "price") {
      dbQ = dbQ.order("price", { ascending: true });
    } else {
      dbQ = dbQ.order("created_at", { ascending: false });
    }
    dbQ = dbQ.range(offset, offset + pageSize - 1);

    const { data: dbRows, count: dbCount } = await dbQ;
    const dbResults = dbRows || [];
    const total = dbCount || 0;
    console.log(`📦 DB: ${dbResults.length} results (total: ${total})`);

    // ── Step 3: DB has results → return ──
    if (dbResults.length > 0) {
      const [styleTip] = await Promise.all([generateStyleTip(intent.correctedQuery, dbResults.length, language)]);
      return new Response(
        JSON.stringify({
          products: dbResults.map(mapDbProduct),
          total,
          page: pageNo,
          hasMore: offset + pageSize < total,
          styleTip,
          correctedQuery: intent.correctedQuery !== sanitized ? intent.correctedQuery : null,
          source: "db",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Step 4: DB empty → AliExpress API fallback ──
    const appKey = Deno.env.get("ALIEXPRESS_APP_KEY")?.trim();
    const appSecret = Deno.env.get("ALIEXPRESS_APP_SECRET")?.trim();

    if (!appKey || !appSecret) {
      console.log("⚠️ No API credentials");
      return new Response(
        JSON.stringify({ products: [], total: 0, page: pageNo, hasMore: false, styleTip: null, correctedQuery: intent.correctedQuery !== sanitized ? intent.correctedQuery : null, source: "none" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`🌐 API fallback: "${intent.englishKeywords}"`);
    const apiProducts = await searchAliExpressAPI(intent.englishKeywords, appKey, appSecret);
    console.log(`🌐 API returned: ${apiProducts.length} products`);

    if (apiProducts.length === 0) {
      return new Response(
        JSON.stringify({ products: [], total: 0, page: pageNo, hasMore: false, styleTip: null, correctedQuery: intent.correctedQuery !== sanitized ? intent.correctedQuery : null, source: "none" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return API results immediately + background index
    const styleTip = await generateStyleTip(intent.correctedQuery, apiProducts.length, language);

    // Fire-and-forget: enrich & save to DB
    console.log(`💾 Background indexing: ${apiProducts.length} products`);
    enrichAndIndex(apiProducts, supabase).catch(e => console.error("Index error:", e));

    return new Response(
      JSON.stringify({
        products: apiProducts.map(mapApiProduct),
        total: apiProducts.length,
        page: pageNo,
        hasMore: false,
        styleTip,
        correctedQuery: intent.correctedQuery !== sanitized ? intent.correctedQuery : null,
        source: "api",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Keresési hiba" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
