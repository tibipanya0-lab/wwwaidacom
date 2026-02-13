import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_URL = "https://api-sg.aliexpress.com/sync";

// ─── All categories with keywords ───
const CATEGORIES = [
  { name: "Divat", keywords: ["women dress", "men jacket", "sneakers", "handbag", "sunglasses", "winter coat", "hoodie", "jeans", "t-shirt women", "men shoes"] },
  { name: "Elektronika", keywords: ["bluetooth earbuds", "smartwatch", "phone case", "usb cable", "led strip", "wireless mouse", "power bank", "webcam", "tablet stand", "gaming headset"] },
  { name: "Otthon", keywords: ["kitchen gadget", "home decor", "led lamp", "storage box", "bedding set", "curtain", "bathroom accessories", "wall art", "cleaning tool", "candle holder"] },
  { name: "Sport", keywords: ["fitness band", "yoga mat", "cycling gloves", "fishing reel", "camping tent", "running shoes", "gym bag", "resistance band", "spinning reel", "hiking backpack"] },
  { name: "Szépség", keywords: ["makeup brush", "skincare", "hair dryer", "nail art", "perfume", "face mask", "lipstick", "beauty tool", "hair clip", "eyelash"] },
  { name: "Gyerek", keywords: ["baby clothes", "kids toys", "school bag", "children shoes", "baby stroller", "lego compatible", "kids watch", "puzzle", "baby bottle", "kids dress"] },
  { name: "Autó & Szerszám", keywords: ["car accessories", "tool set", "drill bit", "car phone holder", "led headlight", "diagnostic tool", "wrench set", "tape measure", "car vacuum", "socket set"] },
];

const TOTAL_TARGET = 5000;
const DEFAULT_QUOTA = Math.floor(TOTAL_TARGET / CATEGORIES.length); // ~714 per category
const CATEGORY_QUOTAS: Record<string, number> = { "Divat": 2000 };
const getCategoryQuota = (name: string) => CATEGORY_QUOTAS[name] ?? DEFAULT_QUOTA;
const PAGES_PER_KEYWORD = 13;
const PAGE_SIZE = 40;
const BATCH_CONCURRENCY = 5;
const GEMINI_BATCH_SIZE = 50;
const HARD_LIMIT = 40000;
const MIN_RATING = 3.5;
const MIN_REVIEWS = 10;

// ─── MD5 implementation ───
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

// ─── Gemini AI ───
async function callAI(prompt: string, maxTokens = 3000): Promise<string | null> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (GEMINI_API_KEY) {
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0, maxOutputTokens: maxTokens } }),
      });
      if (resp.ok) { const d = await resp.json(); return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null; }
    } catch (e) { console.log("Gemini error:", e); }
  }
  if (LOVABLE_API_KEY) {
    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST", headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-2.5-flash-lite", messages: [{ role: "user", content: prompt }], max_tokens: maxTokens, temperature: 0 }),
      });
      if (resp.ok) { const d = await resp.json(); return d.choices?.[0]?.message?.content?.trim() || null; }
    } catch (e) { console.log("Gateway error:", e); }
  }
  return null;
}

// ─── Fetch one API page ───
async function fetchPage(appKey: string, appSecret: string, keywords: string, pageNo: number): Promise<{ products: any[]; filteredByRating: number }> {
  const params: Record<string, string> = {
    method: "aliexpress.affiliate.product.query", app_key: appKey, sign_method: "md5",
    timestamp: getTimestamp(), format: "json", v: "2.0", keywords,
    target_currency: "HUF", target_language: "EN", ship_to_country: "HU",
    page_no: pageNo.toString(), page_size: PAGE_SIZE.toString(),
    sort: "LAST_VOLUME_DESC", platform_product_type: "ALL",
  };
  params.sign = signRequest(params, appSecret);
  try {
    const resp = await fetch(API_URL, {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
      body: new URLSearchParams(params).toString(),
    });
    if (!resp.ok) return { products: [], filteredByRating: 0 };
    const data = JSON.parse(await resp.text());
    const products = data?.aliexpress_affiliate_product_query_response?.resp_result?.result?.products?.product;
    if (!Array.isArray(products)) return { products: [], filteredByRating: 0 };
    
    const basicFiltered = products.filter((p: any) =>
      p.product_main_image_url && p.product_title?.length >= 5 && (p.promotion_link || p.product_detail_url)
    );
    
    let filteredByRating = 0;
    const qualityFiltered = basicFiltered.filter((p: any) => {
      if (!p.product_id) { filteredByRating++; return false; }
      const ratingPct = parseFloat(p.evaluate_rate || "0");
      const rating = ratingPct > 5 ? ratingPct / 20 : ratingPct;
      const reviews = parseInt(p.lastest_volume || "0", 10);
      if (rating <= 0 || rating < MIN_RATING) { filteredByRating++; return false; }
      if (reviews <= 0 || reviews < MIN_REVIEWS) { filteredByRating++; return false; }
      return true;
    });

    // Sort by quality: highest rating first, then by sales volume
    qualityFiltered.sort((a: any, b: any) => {
      const rA = parseFloat(a.evaluate_rate || "0");
      const rB = parseFloat(b.evaluate_rate || "0");
      const ratA = rA > 5 ? rA / 20 : rA;
      const ratB = rB > 5 ? rB / 20 : rB;
      if (ratB !== ratA) return ratB - ratA;
      return parseInt(b.lastest_volume || "0", 10) - parseInt(a.lastest_volume || "0", 10);
    });

    return {
      filteredByRating,
      products: qualityFiltered.map((p: any) => {
        // Extract shipping info from API response
        const shipDays = p.ship_to_days || p.estimated_delivery_time || p.delivery_days || null;
        const logisticsShipDays = p.logistics_info_dto?.estimated_delivery_time || null;
        const finalShipDays = shipDays || logisticsShipDays || "15-25 nap";
        
        return {
          original_title: p.product_title,
          external_id: p.product_id.toString(),
          price: parseFloat(p.target_sale_price || p.target_original_price || "0"),
          currency: "HUF",
          image_url: p.product_main_image_url,
          affiliate_url: p.promotion_link || p.product_detail_url,
          store_name: "AliExpress",
          rating: (() => { const r = parseFloat(p.evaluate_rate || "0"); return r > 5 ? Math.round((r / 20) * 10) / 10 : r || null; })(),
          review_count: parseInt(p.lastest_volume || "0", 10) || null,
          shipping_days: finalShipDays,
          shipping_cost: "Ingyenes szállítás",
        };
      }),
    };
  } catch { return { products: [], filteredByRating: 0 }; }
}

// ─── Deep fetch: all pages for one keyword, respecting remaining quota ───
async function deepFetchKeyword(appKey: string, appSecret: string, keyword: string, startPage: number, remainingQuota: number): Promise<{ products: any[]; pagesCompleted: number; totalFilteredByRating: number }> {
  const all: any[] = [];
  let page = startPage;
  let totalFilteredByRating = 0;

  for (; page <= PAGES_PER_KEYWORD; page += BATCH_CONCURRENCY) {
    // Stop if we already have enough for this category's quota
    if (all.length >= remainingQuota) {
      console.log(`  🎯 Kvóta elérve (${all.length}/${remainingQuota}), ugrás a következőre.`);
      break;
    }

    const pageNos = [];
    for (let i = 0; i < BATCH_CONCURRENCY && page + i <= PAGES_PER_KEYWORD; i++) pageNos.push(page + i);

    const results = await Promise.all(pageNos.map(p => fetchPage(appKey, appSecret, keyword, p)));
    let gotEmpty = false;
    for (const r of results) {
      totalFilteredByRating += r.filteredByRating;
      if (r.products.length === 0) { gotEmpty = true; break; }
      all.push(...r.products);
    }
    if (gotEmpty) break;
    await new Promise(r => setTimeout(r, 300));
  }

  // Trim to remaining quota and keep best quality first (already sorted per page)
  const trimmed = all.slice(0, remainingQuota);

  return { products: trimmed, pagesCompleted: Math.min(page, PAGES_PER_KEYWORD), totalFilteredByRating };
}

// ─── Enrich batch with Gemini (ultra-lite prompt + truncated JSON fix) ───
async function enrichBatch(products: any[], categoryName: string): Promise<any[]> {
  if (!products.length) return [];
  const titles = products.map((p, i) => `${i}. ${p.original_title}`).join("\n");
  const prompt = `Translate to Hungarian, fix spelling. Filter spam. Category: ${categoryName}
${titles}
JSON only: [{"i":0,"title":"magyar cím","sub":"alkategória","g":"férfi/nő/uniszex/gyerek/n/a","v":true}]
v=false if spam or wrong category.`;

  const raw = await callAI(prompt, 5000);
  if (!raw) return [];
  try {
    let cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    // Fix truncated JSON
    if (!cleaned.endsWith("]")) {
      const lastComplete = cleaned.lastIndexOf("}");
      if (lastComplete > 0) cleaned = cleaned.substring(0, lastComplete + 1) + "]";
    }
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    const result: any[] = [];
    for (const item of parsed) {
      if (item.v === false || item.valid === false) continue;
      const idx = item.i;
      if (idx === undefined || idx < 0 || idx >= products.length) continue;
      const p = products[idx];
      if (!p.affiliate_url || !p.external_id) continue;
      result.push({
        title: item.title || p.original_title, original_title: p.original_title,
        category: categoryName, subcategory: item.sub || item.subcategory || "egyéb",
        gender: item.g || item.gender || "n/a", tags: [],
        price: p.price, currency: p.currency, image_url: p.image_url,
        affiliate_url: p.affiliate_url, store_name: p.store_name,
        external_id: p.external_id,
        rating: p.rating, review_count: p.review_count,
        shipping_days: p.shipping_days, shipping_cost: p.shipping_cost,
      });
    }
    return result;
  } catch (e) { console.log("Gemini parse error:", e); return []; }
}

// ─── Upsert enriched products with live quota check ───
async function upsertProducts(supabase: any, enriched: any[], categoryName: string): Promise<number> {
  if (!enriched.length) return 0;

  // HARD STOP: check live category count before inserting
  const { count: liveCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category", categoryName);
  
  const currentCount = liveCount || 0;
  const remaining = Math.max(0, getCategoryQuota(categoryName) - currentCount);
  
  if (remaining <= 0) {
    console.log(`  🛑 HARD STOP: ${categoryName} már ${currentCount}/${getCategoryQuota(categoryName)} — batch eldobva!`);
    return 0;
  }

  // Batch-szűrés: only take what fits
  const trimmed = enriched.slice(0, remaining);
  if (trimmed.length < enriched.length) {
    console.log(`  ✂️ Batch vágás: ${enriched.length} → ${trimmed.length} (${remaining} hely maradt)`);
  }

  const { error } = await supabase.from("products").upsert(
    trimmed.map(p => ({
      title: p.title, original_title: p.original_title, category: p.category,
      subcategory: p.subcategory, gender: p.gender, tags: p.tags,
      price: p.price, currency: p.currency, image_url: p.image_url,
      affiliate_url: p.affiliate_url, store_name: p.store_name,
      external_id: p.external_id || null,
      rating: p.rating || null, review_count: p.review_count || null,
      shipping_days: p.shipping_days || null, shipping_cost: p.shipping_cost || null,
    })),
    { onConflict: "affiliate_url" }
  );
  return error ? 0 : trimmed.length;
}

// ─── Process one keyword fully ───
async function processKeyword(
  appKey: string, appSecret: string, supabase: any,
  categoryName: string, keyword: string, startPage: number, remainingQuota: number
): Promise<{ fetched: number; saved: number; pagesCompleted: number; filteredByRating: number }> {
  console.log(`  📦 Deep fetch: "${keyword}" from page ${startPage} (kvóta maradék: ${remainingQuota})`);
  const { products, pagesCompleted, totalFilteredByRating } = await deepFetchKeyword(appKey, appSecret, keyword, startPage, remainingQuota);
  console.log(`  Fetched ${products.length} quality products (⭐ ${totalFilteredByRating} elvetve), pages done: ${pagesCompleted}`);

  let totalSaved = 0;
  const PARALLEL_AI = 5;
  for (let i = 0; i < products.length; i += GEMINI_BATCH_SIZE * PARALLEL_AI) {
    // Live quota check before each AI round
    const { count: liveCatCount } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category", categoryName);
    
    if ((liveCatCount || 0) >= getCategoryQuota(categoryName)) {
      console.log(`  🛑 HARD STOP mid-processing: ${categoryName} = ${liveCatCount}/${getCategoryQuota(categoryName)}. Többi batch eldobva.`);
      break;
    }

    const batchPromises = [];
    for (let j = 0; j < PARALLEL_AI; j++) {
      const batch = products.slice(i + j * GEMINI_BATCH_SIZE, i + (j + 1) * GEMINI_BATCH_SIZE);
      if (batch.length > 0) batchPromises.push(enrichBatch(batch, categoryName));
    }
    const results = await Promise.allSettled(batchPromises);
    const allEnriched = results
      .filter((r): r is PromiseFulfilledResult<any[]> => r.status === "fulfilled")
      .flatMap(r => r.value);
    const saved = await upsertProducts(supabase, allEnriched, categoryName);
    totalSaved += saved;
  }

  return { fetched: products.length, saved: totalSaved, pagesCompleted, filteredByRating: totalFilteredByRating };
}

// ─── Main: State machine driven by sync_status ───
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const appKey = Deno.env.get("ALIEXPRESS_APP_KEY")?.trim();
    const appSecret = Deno.env.get("ALIEXPRESS_APP_SECRET")?.trim();
    if (!appKey || !appSecret) throw new Error("AliExpress API credentials missing");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // ─── Step 0: Cleanup old products (30+ days) ───
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: deletedCount } = await supabase
      .from("products")
      .delete({ count: "exact" })
      .lt("created_at", thirtyDaysAgo);
    if (deletedCount && deletedCount > 0) {
      console.log(`🧹 Takarítás: ${deletedCount} régi termék törölve (30+ napos)`);
    }

    // ─── Step 0.5: Check hard limit ───
    const { count: currentProductCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });
    
    if ((currentProductCount || 0) >= HARD_LIMIT) {
      console.log(`🚫 HARD LIMIT elérve: ${currentProductCount}/${HARD_LIMIT}. Robot leáll.`);
      await supabase.from("sync_status").update({ status: "pending" }).eq("status", "in_progress");
      return new Response(JSON.stringify({
        success: false,
        message: `Hard limit elérve (${currentProductCount}/${HARD_LIMIT}). Robot automatikusan leállt.`,
        productCount: currentProductCount,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ─── Step 1: Initialize sync_status rows if missing ───
    const { data: existingRows } = await supabase.from("sync_status").select("category_name, keyword");
    const existingSet = new Set((existingRows || []).map((r: any) => `${r.category_name}::${r.keyword}`));

    const missingRows: any[] = [];
    for (const cat of CATEGORIES) {
      for (let ki = 0; ki < cat.keywords.length; ki++) {
        const key = `${cat.name}::${cat.keywords[ki]}`;
        if (!existingSet.has(key)) {
          missingRows.push({ category_name: cat.name, keyword: cat.keywords[ki], keyword_index: ki, status: "pending" });
        }
      }
    }
    if (missingRows.length > 0) {
      await supabase.from("sync_status").insert(missingRows);
      console.log(`Initialized ${missingRows.length} sync_status rows`);
    }

    // ─── Step 2: Get per-category product counts & check quotas ───
    const categoryCounts: Record<string, number> = {};
    const countPromises = CATEGORIES.map(async (cat) => {
      const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category", cat.name);
      categoryCounts[cat.name] = count || 0;
    });
    await Promise.all(countPromises);
    console.log(`📊 Kategória kvóták:`, JSON.stringify(CATEGORIES.map(c => `${c.name}:${getCategoryQuota(c.name)}`)), `Jelenlegi:`, JSON.stringify(categoryCounts));

    // First: look for in_progress job (resume)
    let { data: currentJob } = await supabase
      .from("sync_status")
      .select("*")
      .eq("status", "in_progress")
      .order("updated_at", { ascending: true })
      .limit(1)
      .single();

    if (!currentJob) {
      // Find pending jobs, skip categories that already hit their quota
      const { data: pendingJobs } = await supabase
        .from("sync_status")
        .select("*")
        .eq("status", "pending")
        .order("keyword_index", { ascending: true });

      if (!pendingJobs || pendingJobs.length === 0) {
        await supabase.from("sync_status").update({ status: "pending", pages_completed: 0 }).neq("status", "___");
        console.log("🔄 All categories complete! Reset for next cycle.");
        return new Response(JSON.stringify({ success: true, message: "Full cycle complete, reset for next round", categoryCounts }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Filter out categories that already reached their quota
      const availableJobs = pendingJobs.filter((j: any) => (categoryCounts[j.category_name] || 0) < getCategoryQuota(j.category_name));

      if (availableJobs.length === 0) {
        // All categories full — mark remaining as done and finish
        await supabase.from("sync_status").update({ status: "done", completed_at: new Date().toISOString() }).eq("status", "pending");
        console.log("🎯 Minden kategória elérte a kvótát! Ciklus kész.");
        return new Response(JSON.stringify({ success: true, message: "All category quotas reached!", categoryCounts }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Sort by category product count (emptiest first)
      availableJobs.sort((a: any, b: any) => (categoryCounts[a.category_name] || 0) - (categoryCounts[b.category_name] || 0));
      currentJob = availableJobs[0];
    }

    // ─── Step 3: Process this keyword with remaining quota ───
    const currentCatCount = categoryCounts[currentJob.category_name] || 0;
    const remainingQuota = Math.max(0, getCategoryQuota(currentJob.category_name) - currentCatCount);

    if (remainingQuota <= 0) {
      // Category already full, mark done and return
      await supabase.from("sync_status").update({
        status: "done", completed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }).eq("id", currentJob.id);
      console.log(`⏭️ ${currentJob.category_name} kvóta tele (${currentCatCount}/${getCategoryQuota(currentJob.category_name)}), ugrás.`);
      return new Response(JSON.stringify({
        success: true, message: `Category ${currentJob.category_name} quota full, skipped.`,
        categoryCounts,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`\n🤖 Processing: "${currentJob.category_name}" → "${currentJob.keyword}" (kvóta: ${currentCatCount}/${getCategoryQuota(currentJob.category_name)}, maradék: ${remainingQuota})`);
    await supabase.from("sync_status")
      .update({ status: "in_progress", started_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", currentJob.id);

    const startPage = (currentJob.pages_completed || 0) + 1;
    const result = await processKeyword(appKey, appSecret, supabase, currentJob.category_name, currentJob.keyword, startPage, remainingQuota);

    // ─── Step 4: Save progress ───
    await supabase.from("sync_status").update({
      status: "done",
      pages_completed: result.pagesCompleted,
      products_fetched: (currentJob.products_fetched || 0) + result.fetched,
      products_saved: (currentJob.products_saved || 0) + result.saved,
      products_filtered: (currentJob.products_filtered || 0) + result.filteredByRating,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", currentJob.id);

    console.log(`✅ Done: "${currentJob.keyword}" — ${result.fetched} fetched, ${result.saved} saved, ⭐ ${result.filteredByRating} elvetve`);

    return new Response(JSON.stringify({
      success: true,
      processed: { category: currentJob.category_name, keyword: currentJob.keyword, ...result },
      categoryCounts,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Sync failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
