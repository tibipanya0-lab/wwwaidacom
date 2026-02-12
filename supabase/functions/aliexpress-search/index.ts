import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Try multiple gateway URLs - different regions may validate different app keys
const API_URLS = [
  "https://api-sg.aliexpress.com/sync",
  "https://eco.taobao.com/router/rest",
  "https://api.taobao.com/router/rest",
];

function md5(input: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = new Uint8Array(20);
  // Deno built-in
  const hash = new Deno.Command("echo", { args: ["-n"] }); // not used
  // Use Web Crypto API with a workaround: AliExpress needs MD5 but Web Crypto doesn't support it.
  // We'll implement a simple MD5.
  return md5Hash(input);
}

// Minimal MD5 implementation for Deno
function md5Hash(input: string): string {
  // Convert UTF-8 string to binary string (byte-level) for correct MD5
  const utf8Bytes = new TextEncoder().encode(input);
  const string = Array.from(utf8Bytes).map(b => String.fromCharCode(b)).join('');

  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff;
  }

  function md5blk(s: string) {
    const md5blks: number[] = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] =
        s.charCodeAt(i) +
        (s.charCodeAt(i + 1) << 8) +
        (s.charCodeAt(i + 2) << 16) +
        (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  function rhex(n: number) {
    const hexChr = "0123456789abcdef";
    let s = "";
    for (let j = 0; j < 4; j++) {
      s += hexChr.charAt((n >> (j * 8 + 4)) & 0x0f) + hexChr.charAt((n >> (j * 8)) & 0x0f);
    }
    return s;
  }

  function hex(x: number[]) {
    return x.map(rhex).join("");
  }

  function md5_1(s: string) {
    const n = s.length;
    let state = [1732584193, -271733879, -1732584194, 271733878];
    let i: number;
    for (i = 64; i <= n; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    const tail = new Array(16).fill(0);
    for (i = 0; i < s.length; i++) {
      tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3);
    }
    tail[i >> 2] |= 0x80 << (i % 4 << 3);
    if (i > 55) {
      md5cycle(state, tail);
      tail.fill(0);
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }

  return hex(md5_1(string)).toUpperCase();
}

// Generate AliExpress API signature
function signRequest(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params).sort();
  let signStr = secret;
  for (const key of sorted) {
    signStr += key + params[key];
  }
  signStr += secret;
  return md5Hash(signStr);
}

// Format timestamp for API
function getTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

// Translate Hungarian query to English for better AliExpress results
async function translateToEnglish(query: string): Promise<{ keywords: string; exclude: string[]; gender: string }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.log("No LOVABLE_API_KEY, skipping translation");
    return { keywords: query, exclude: [], gender: "unisex" };
  }

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You translate product search terms to English for AliExpress. Return ONLY valid JSON, no markdown.
Format: {"keywords":"optimized english search term","exclude":["irrelevant1","irrelevant2"],"gender":"men|women|unisex"}

Rules:
1. "keywords": The BEST 2-5 word English search phrase for AliExpress. Translate precisely.
   - "férfi cipő" → keywords: "men shoes", gender: "men"
   - "női táska" → keywords: "women handbag", gender: "women"
   - "cipő" → keywords: "shoes fashion", gender: "unisex"
   - "férfi óra" → keywords: "men watch", gender: "men"
   - "fejhallgató" → keywords: "headphones over ear", gender: "unisex"
   For gender-specific queries, ALWAYS include the gender word (men/women) in keywords.
2. "exclude": 5-15 English terms for accessories/unrelated items.
   - For shoes: ["insole","shoe brush","shoe cleaner","shoe rack","shoe horn","shoe lace","shoe polish","cleaning","stain remover","shoe cover","overshoe","washing bag","boot cover"]
   - For headphones: ["sleep mask","headband","ear plug","cable","adapter","stand","holder","hanger","case only"]
3. "gender": Set to "men" if query contains male/férfi/fiú terms. Set to "women" if query contains female/női/lány terms. Otherwise "unisex".
4. If already English, still optimize and provide exclude list and gender.`
          },
          {
            role: "user",
            content: query
          }
        ],
        max_tokens: 250,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      console.log("Translation API error:", response.status);
      return { keywords: query, exclude: [], gender: "unisex" };
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (raw) {
      try {
        // Strip markdown code fences if present
        const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const parsed = JSON.parse(cleaned);
        console.log(`Translated: "${query}" → "${parsed.keywords}" (exclude: ${parsed.exclude?.length || 0} terms, gender: ${parsed.gender || 'unisex'})`);
        return { keywords: parsed.keywords || query, exclude: parsed.exclude || [], gender: parsed.gender || "unisex" };
      } catch {
        console.log(`Translated (plain): "${query}" → "${raw}"`);
        return { keywords: raw, exclude: [], gender: "unisex" };
      }
    }
    return { keywords: query, exclude: [], gender: "unisex" };
  } catch (e) {
    console.log("Translation failed, using original:", e);
    return { keywords: query, exclude: [], gender: "unisex" };
  }
}

// Fetch hot/trending products as fallback when search yields no results
async function fetchHotProducts(appKey: string, appSecret: string, pageNo: number, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const params: Record<string, string> = {
      method: "aliexpress.affiliate.product.query",
      app_key: appKey,
      sign_method: "md5",
      timestamp: getTimestamp(),
      format: "json",
      v: "2.0",
      keywords: "best seller trending",
      target_currency: "HUF",
      target_language: "EN",
      ship_to_country: "HU",
      page_no: "1",
      page_size: "20",
      sort: "LAST_VOLUME_DESC",
      platform_product_type: "ALL",
    };
    params.sign = signRequest(params, appSecret);

    const urlParams = new URLSearchParams(params);
    const response = await fetch(API_URLS[0], {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
      body: urlParams.toString(),
    });

    if (response.ok) {
      const data = JSON.parse(await response.text());
      const result = data?.aliexpress_affiliate_product_query_response?.resp_result?.result;
      if (result?.products?.product) {
        const hotProducts = result.products.product.map((p: any) => ({
          id: p.product_id?.toString() || "",
          name: p.product_title || "",
          price: parseFloat(p.target_sale_price || p.target_original_price || "0"),
          originalPrice: parseFloat(p.target_original_price || "0"),
          currency: "HUF",
          image_url: p.product_main_image_url || null,
          affiliate_url: p.promotion_link || p.product_detail_url || null,
          store_name: "AliExpress",
          discount: p.discount ? `${String(p.discount).replace(/%/g, '')}%` : null,
          rating: p.evaluate_rate ? parseFloat(p.evaluate_rate.replace("%", "")) : null,
          orders: p.lastest_volume ? parseInt(p.lastest_volume) : null,
        }));
        console.log(`Hot products fallback: ${hotProducts.length} items`);
        return new Response(
          JSON.stringify({ products: hotProducts, total: hotProducts.length, page: pageNo, fallback: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
  } catch (e) {
    console.log("Hot products fallback failed:", e);
  }

  return new Response(
    JSON.stringify({ products: [], total: 0, page: pageNo, fallback: true }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, page = 1, sort = "LAST_VOLUME_DESC", category } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Keresési kifejezés szükséges" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const appKey = Deno.env.get("ALIEXPRESS_APP_KEY")?.trim();
    const appSecret = Deno.env.get("ALIEXPRESS_APP_SECRET")?.trim();

    if (!appKey || !appSecret) {
      throw new Error("AliExpress API nincs konfigurálva");
    }

    const sanitizedQuery = query.trim().slice(0, 200);
    const pageNo = Math.max(1, Math.min(Number(page) || 1, 50));

    // Translate to English for better search results
    const translation = await translateToEnglish(sanitizedQuery);
    const englishQuery = translation.keywords;
    const aiExcludeTerms = translation.exclude || [];
    const detectedGender = translation.gender || "unisex";
    
    // Gender-based exclusion terms
    const genderExcludeTerms: string[] = [];
    if (detectedGender === "men") {
      genderExcludeTerms.push("women", "woman", "women's", "womens", "lady", "ladies", "female", "girl", "girls");
    } else if (detectedGender === "women") {
      genderExcludeTerms.push("men's", "mens", "male", "boy", "boys");
    }
    
    // If translation returned empty or nonsense, return no results
    if (!englishQuery || englishQuery.trim().length === 0) {
      return new Response(
        JSON.stringify({ products: [], total: 0, page: pageNo }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Search: "${sanitizedQuery}" → "${englishQuery}" (exclude: ${aiExcludeTerms.length} terms, gender: ${detectedGender})`);
    // Build API parameters
    const params: Record<string, string> = {
      method: "aliexpress.affiliate.product.query",
      app_key: appKey,
      sign_method: "md5",
      timestamp: getTimestamp(),
      format: "json",
      v: "2.0",
      keywords: englishQuery,
      target_currency: "HUF",
      target_language: "EN",
      ship_to_country: "HU",
      page_no: pageNo.toString(),
      page_size: "40",
      sort: sort,
      platform_product_type: "ALL",
    };

    if (category) {
      params.category_ids = String(category);
    }

    // Sign the request
    params.sign = signRequest(params, appSecret);

    // Send as POST body (form-urlencoded)
    const urlParams = new URLSearchParams(params);

    console.log("AliExpress search:", { query: sanitizedQuery, page: pageNo, sort, appKeyLen: appKey.length, appKeyPrefix: appKey.slice(0, 4), appKeySuffix: appKey.slice(-4) });

    // Try multiple API gateway URLs
    let data: any = null;
    let lastError = "";
    
    for (const apiUrl of API_URLS) {
      try {
        console.log("Trying gateway:", apiUrl);
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
          body: urlParams.toString(),
        });

        const responseText = await response.text();
        console.log(`Response from ${apiUrl} (first 300):`, responseText.slice(0, 300));

        if (!response.ok) {
          lastError = `HTTP ${response.status}`;
          continue;
        }

        const parsed = JSON.parse(responseText);
        
        // Check if we got an error_response (InvalidAppKey etc.)
        if (parsed.error_response) {
          lastError = `${parsed.error_response.code}: ${parsed.error_response.msg}`;
          console.log("API error from", apiUrl, lastError);
          continue;
        }
        
        data = parsed;
        console.log("Success with gateway:", apiUrl);
        break;
      } catch (e) {
        lastError = e instanceof Error ? e.message : "fetch error";
        console.log("Gateway failed:", apiUrl, lastError);
      }
    }

    if (!data) {
      console.error("All gateways failed. Last error:", lastError);
      throw new Error(`AliExpress API hiba: ${lastError}`);
    }

    // Parse the response - AliExpress wraps it
    const result =
      data?.aliexpress_affiliate_product_query_response?.resp_result?.result;

    if (!result || !result.products?.product) {
      // No API results - try hot products fallback
      console.log("No results from API, trying hot products fallback");
      return await fetchHotProducts(appKey, appSecret, pageNo, corsHeaders);
    }

    const allProducts = result.products.product.map((p: any) => ({
      id: p.product_id?.toString() || "",
      name: p.product_title || "",
      price: parseFloat(p.target_sale_price || p.target_original_price || "0"),
      originalPrice: parseFloat(p.target_original_price || "0"),
      currency: "HUF",
      image_url: p.product_main_image_url || null,
      affiliate_url: p.promotion_link || p.product_detail_url || null,
      store_name: "AliExpress",
      discount: p.discount ? `${String(p.discount).replace(/%/g, '')}%` : null,
      rating: p.evaluate_rate ? parseFloat(p.evaluate_rate.replace("%", "")) : null,
      orders: p.lastest_volume ? parseInt(p.lastest_volume) : null,
    }));

    // Supplement with hardcoded terms the AI might miss
    const hardcodedExclude: Record<string, string[]> = {
      shoes: ["shoe cover", "overshoe", "washing bag", "laundry bag", "wash bag", "boot cover"],
    };
    const extraExclude = Object.entries(hardcodedExclude)
      .filter(([key]) => englishQuery.toLowerCase().includes(key))
      .flatMap(([, terms]) => terms);
    const excludeTerms = [...aiExcludeTerms, ...extraExclude];

    // Word-boundary matching helper
    function hasWord(title: string, word: string): boolean {
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
      return regex.test(title);
    }

    // Filter products: title must contain ALL keywords or the full phrase
    const keywords = englishQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const fullPhrase = englishQuery.toLowerCase();
    const products = keywords.length > 0
      ? allProducts.filter((p: any) => {
          const title = p.name.toLowerCase();
          // Exclude products matching AI-generated negative keywords
          if (excludeTerms.some(term => title.includes(term))) return false;
          // Gender-based title exclusion: if user searched "men shoes", exclude "women's" titles
          if (genderExcludeTerms.length > 0 && genderExcludeTerms.some(term => hasWord(title, term))) return false;
          // Accept if full phrase matches OR all keywords are in title
          return title.includes(fullPhrase) || keywords.every((kw: string) => hasWord(title, kw));
        })
      : allProducts;
    
    // If strict filter removes everything, fall back with word-boundary match on main keyword
    const finalProducts = products.length > 0 ? products : (() => {
      const mainKeyword = keywords.sort((a, b) => b.length - a.length)[0];
      if (!mainKeyword) return allProducts;
      return allProducts.filter((p: any) => {
        const title = p.name.toLowerCase();
        if (excludeTerms.some(term => title.includes(term))) return false;
        if (genderExcludeTerms.length > 0 && genderExcludeTerms.some(term => hasWord(title, term))) return false;
        return hasWord(title, mainKeyword);
      });
    })();
    
    console.log(`Results: ${allProducts.length} total, ${finalProducts.length} after title filter (keywords: ${keywords.join(', ')})`);

    // If all filtering removed everything, return hot products instead
    if (finalProducts.length === 0) {
      console.log("All products filtered out, returning hot products");
      return await fetchHotProducts(appKey, appSecret, pageNo, corsHeaders);
    }

    const totalRecordCount = result.total_record_count ? parseInt(result.total_record_count) : finalProducts.length;
    
    return new Response(
      JSON.stringify({
        products: finalProducts,
        total: totalRecordCount,
        page: pageNo,
        hasMore: pageNo * 40 < totalRecordCount,
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
