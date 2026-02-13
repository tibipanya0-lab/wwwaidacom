import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Call AI (Gemini direct → Lovable gateway fallback)
async function callAI(prompt: string, maxTokens = 300): Promise<string | null> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (GEMINI_API_KEY) {
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens },
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
          max_tokens: maxTokens, temperature: 0.7,
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

// Intent analysis: spell correction + extract search intent (gender, category, keywords)
async function analyzeIntent(query: string): Promise<{
  correctedQuery: string;
  keywords: string[];
  gender: string | null;
  category: string | null;
}> {
  const prompt = `You are a Hungarian shopping search intent analyzer. Analyze the query and return JSON.

1. Fix typos (e.g., "ferfi sipo" → "férfi cipő")
2. Extract gender if mentioned: "férfi", "nő", "gyerek", or null
3. Extract category/subcategory if mentioned (in Hungarian, e.g., "kabát", "cipő", "táska")
4. Extract search keywords (Hungarian) for database full-text search

Query: "${query}"

Return ONLY valid JSON:
{"correctedQuery":"javított keresés","keywords":["kulcsszó1","kulcsszó2"],"gender":"férfi|nő|gyerek|null","category":"kategória|null"}`;

  const raw = await callAI(prompt, 150);
  if (raw) {
    try {
      const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return {
        correctedQuery: parsed.correctedQuery || query,
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [query],
        gender: parsed.gender === "null" ? null : (parsed.gender || null),
        category: parsed.category === "null" ? null : (parsed.category || null),
      };
    } catch { console.log("Intent parse error, raw:", raw); }
  }
  return { correctedQuery: query, keywords: [query], gender: null, category: null };
}

// Generate style tip
async function generateStyleTip(query: string, productCount: number, language: string): Promise<string | null> {
  if (productCount === 0) return null;

  const langMap: Record<string, string> = {
    hu: "magyar",
    en: "English",
    uk: "українська",
  };

  const prompt = `You are Inaya, a friendly and expert shopping assistant. The user searched for "${query}" and found ${productCount} products.

Write a SHORT (1-2 sentences max) personal style tip or expert advice related to their search in ${langMap[language] || "magyar"} language.

Examples:
- "kabát" → "A kabátválasztásnál fontos a rétegezhetőség – válassz olyat, ami pulóver felett is kényelmes! 🧥"
- "futócipő" → "Jó futócipőnél a talp rugalmassága és a bokavédelem a kulcs! 👟"
- "fülhallgató" → "Ha sokat utazol, a zajszűrős modellek igazi életmentők! 🎧"

Be warm, use 1 emoji at the end. NO markdown formatting, just plain text.`;

  return await callAI(prompt, 100);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, page = 1, sort = "popular", language = "hu", maxPrice, gender: filterGender } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Keresési kifejezés szükséges" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const sanitizedQuery = query.trim().slice(0, 200);
    const pageSize = 20;
    const pageNo = Math.max(1, Number(page) || 1);
    const offset = (pageNo - 1) * pageSize;

    // Step 1: Gemini intent analysis (spell check + extract gender/category)
    console.log(`Search query: "${sanitizedQuery}"`);
    const intent = await analyzeIntent(sanitizedQuery);
    console.log(`Intent:`, JSON.stringify(intent));

    // Step 2: Build Supabase query with ILIKE on title and tags
    // Search across title (Hungarian) and tags array
    const searchTerms = intent.keywords.length > 0 ? intent.keywords : [intent.correctedQuery];

    // Build OR conditions for each keyword against title and tags
    const orConditions: string[] = [];
    for (const kw of searchTerms) {
      orConditions.push(`title.ilike.%${kw}%`);
      orConditions.push(`original_title.ilike.%${kw}%`);
      orConditions.push(`subcategory.ilike.%${kw}%`);
    }

    let dbQuery = supabase
      .from("products")
      .select("*", { count: "exact" })
      .or(orConditions.join(","));

    // Step 3: Strict gender filter
    if (intent.gender || filterGender) {
      const g = filterGender || intent.gender;
      // Match exact gender OR uniszex
      dbQuery = dbQuery.or(`gender.eq.${g},gender.eq.uniszex`);
    }

    // Step 4: Strict category filter (subcategory match)
    if (intent.category) {
      dbQuery = dbQuery.ilike("subcategory", `%${intent.category}%`);
    }

    // Price filter
    if (maxPrice && maxPrice > 0) {
      dbQuery = dbQuery.lte("price", maxPrice);
    }

    // Sort
    if (sort === "price") {
      dbQuery = dbQuery.order("price", { ascending: true });
    } else {
      dbQuery = dbQuery.order("created_at", { ascending: false });
    }

    // Pagination
    dbQuery = dbQuery.range(offset, offset + pageSize - 1);

    const { data: products, error, count } = await dbQuery;

    if (error) {
      console.error("DB query error:", error);
      throw new Error("Adatbázis hiba");
    }

    const totalCount = count || 0;
    console.log(`Results: ${products?.length || 0} products (total: ${totalCount})`);

    // Step 5: Generate style tip (parallel with nothing, just async)
    const styleTip = await generateStyleTip(intent.correctedQuery, products?.length || 0, language);
    console.log(`Style tip: ${styleTip?.slice(0, 80) || "none"}`);

    // Map to response format
    const mappedProducts = (products || []).map((p: any) => ({
      id: p.id,
      name: p.title,
      price: Number(p.price),
      originalPrice: Number(p.price),
      currency: p.currency || "HUF",
      image_url: p.image_url,
      affiliate_url: p.affiliate_url,
      store_name: p.store_name,
      discount: null,
      rating: null,
      starRating: null,
      reviewsCount: null,
      orders: null,
      hasCoupon: false,
      couponCode: null,
      couponDiscount: null,
      shippingDays: null,
      shippingMinDays: null,
      shippingMaxDays: null,
      // Extra fields
      gender: p.gender,
      category: p.category,
      subcategory: p.subcategory,
      tags: p.tags,
    }));

    return new Response(
      JSON.stringify({
        products: mappedProducts,
        total: totalCount,
        page: pageNo,
        hasMore: offset + pageSize < totalCount,
        styleTip,
        correctedQuery: intent.correctedQuery !== sanitizedQuery ? intent.correctedQuery : null,
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
