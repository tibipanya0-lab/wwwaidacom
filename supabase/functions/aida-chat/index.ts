import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Lazy init Supabase client
let supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
  }
  return supabase;
}

// Coupon type
interface Coupon {
  store_name: string;
  code: string;
  description: string;
  discount_percent: number | null;
  discount_amount: string | null;
}

// Category mappings for relevance filtering
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "sport": ["bicikli", "bicycle", "bike", "kerékpár", "futás", "running", "fitness", "edzés", "sport", "велосипед", "спорт"],
  "divat": ["ruha", "cipő", "táska", "divat", "fashion", "dress", "shoes", "clothes", "одяг", "мода", "взуття"],
  "elektronika": ["laptop", "telefon", "phone", "tv", "számítógép", "computer", "tablet", "електроніка", "телефон"],
  "autó": ["autó", "car", "fékbetét", "brake", "olaj", "motor", "alkatrész", "auto", "авто", "запчастини"],
  "bútor": ["kanapé", "sofa", "ágy", "bed", "szék", "chair", "asztal", "table", "bútor", "furniture", "меблі"],
  "háztartás": ["mosógép", "hűtő", "konyha", "kitchen", "háztartás", "home", "побут"],
};

// Store categories for filtering
const STORE_CATEGORIES: Record<string, string[]> = {
  "Decathlon": ["sport"],
  "Hervis": ["sport"],
  "Shein": ["divat"],
  "Temu": ["divat", "elektronika", "háztartás"],
  "Trendyol": ["divat"],
  "Amazon": ["elektronika", "sport", "bútor", "háztartás"],
  "Alza": ["elektronika"],
  "eMAG": ["elektronika", "háztartás"],
  "Media Markt": ["elektronika"],
  "AutoDoc": ["autó"],
  "IKEA": ["bútor"],
  "Bonami": ["bútor"],
  "VidaXL": ["bútor", "háztartás"],
};

// Deep link templates for stores
const STORE_SEARCH_LINKS: Record<string, string> = {
  "Decathlon": "https://www.decathlon.hu/search?Ntt=",
  "Amazon": "https://www.amazon.de/s?k=",
  "eMAG": "https://www.emag.hu/search/",
  "Alza": "https://www.alza.hu/search.htm?exps=",
  "Temu": "https://www.temu.com/search_result.html?search_key=",
  "AliExpress": "https://www.aliexpress.com/wholesale?SearchText=",
};

// Get store coupons with optional relevance filtering
async function getStoreCoupons(searchQuery?: string) {
  const { data } = await getSupabase()
    .from("coupons")
    .select("store_name, code, description, discount_percent, discount_amount, category")
    .eq("is_active", true)
    .order("discount_percent", { ascending: false, nullsFirst: false })
    .limit(50);

  const coupons = (data || []) as (Coupon & { category: string })[];
  
  // If no search query, return all coupons
  if (!searchQuery) {
    return {
      coupons: coupons.map(c => ({
        code: c.code,
        discount: c.discount_percent ? `${c.discount_percent}%` : c.discount_amount || "kedvezmény",
        store: c.store_name,
        description: c.description,
      })),
      hasRelevant: true,
      searchLinks: [] as { store: string; url: string }[],
    };
  }

  const queryLower = searchQuery.toLowerCase();
  
  // Detect search category
  let detectedCategory: string | null = null;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => queryLower.includes(kw))) {
      detectedCategory = category;
      break;
    }
  }

  // Filter coupons by relevance
  const relevantCoupons = coupons.filter(c => {
    // Check if coupon category matches
    const couponCatLower = c.category.toLowerCase();
    if (detectedCategory && couponCatLower.includes(detectedCategory)) return true;
    
    // Check if store is relevant
    const storeCategories = STORE_CATEGORIES[c.store_name] || [];
    if (detectedCategory && storeCategories.includes(detectedCategory)) return true;
    
    // Check if description matches query
    if (c.description.toLowerCase().includes(queryLower)) return true;
    if (c.store_name.toLowerCase().includes(queryLower)) return true;
    
    return false;
  });

  // Generate search links for relevant stores
  const searchLinks: { store: string; url: string }[] = [];
  if (relevantCoupons.length === 0) {
    // Suggest stores that might have the product
    const relevantStores = detectedCategory
      ? Object.entries(STORE_CATEGORIES)
          .filter(([_, cats]) => cats.includes(detectedCategory!))
          .map(([store]) => store)
      : ["Amazon", "eMAG", "Temu"];
    
    for (const store of relevantStores) {
      const linkTemplate = STORE_SEARCH_LINKS[store];
      if (linkTemplate) {
        searchLinks.push({
          store,
          url: linkTemplate + encodeURIComponent(searchQuery),
        });
      }
    }
  }

  return {
    coupons: relevantCoupons.map(c => ({
      code: c.code,
      discount: c.discount_percent ? `${c.discount_percent}%` : c.discount_amount || "kedvezmény",
      store: c.store_name,
      description: c.description,
    })),
    hasRelevant: relevantCoupons.length > 0,
    searchLinks,
    detectedCategory,
  };
}

// Format coupons for context - each coupon is a complete unit
interface CouponResult {
  coupons: { code: string; discount: string; store: string; description: string }[];
  hasRelevant: boolean;
  searchLinks: { store: string; url: string }[];
  detectedCategory?: string | null;
}

function formatCoupons(result: CouponResult, lang: string, searchQuery?: string): string {
  const { coupons, hasRelevant, searchLinks } = result;
  
  if (!hasRelevant && searchLinks.length > 0) {
    // No relevant coupons found - provide search links
    const noResultsMsg = lang === "uk" 
      ? "Не знайдено конкретних купонів для цього пошуку. Ось посилання для пошуку:"
      : lang === "en"
      ? "No specific coupons found for this search. Here are search links:"
      : "Nem találtunk konkrét kupont erre a keresésre. Nézd meg a kínálatot itt:";
    
    const links = searchLinks.map(l => `${l.store}: ${l.url}`).join("\n");
    return `\n\n${noResultsMsg}\n${links}`;
  }
  
  if (coupons.length === 0) return "";
  
  const header = lang === "uk" ? "RELEVÁNS КУПОНИ" : lang === "en" ? "RELEVANT COUPONS" : "RELEVÁNS KUPONOK";
  const autoLabel = lang === "uk" ? "АВТОМАТИЧНО" : lang === "en" ? "AUTOMATIC" : "AUTOMATIKUS";
  
  // Format each coupon as a complete, self-contained unit
  const lines = coupons.slice(0, 10).map(c => {
    if (c.code === "AUTO") {
      return `${c.store}: ${autoLabel} (${c.discount}) - ${c.description}`;
    }
    return `${c.store}: ${c.code} (${c.discount}) - ${c.description}`;
  });
  
  return `\n\n${header} (FONTOS: Csak ezeket a kuponokat ajánld, amelyek relevánsak a kereséshez!):\n${lines.join("\n")}`;
}

// Detect language from user message
function detectLanguage(text: string): string {
  // Ukrainian characters
  if (/[іїєґ]/i.test(text)) return "uk";
  // Hungarian specific characters
  if (/[áéíóöőúüű]/i.test(text)) return "hu";
  // Common English patterns
  if (/\b(the|and|for|you|with|this|that|have|from)\b/i.test(text)) return "en";
  return "auto";
}

// Get system prompt based on language
function getSystemPrompt(lang: string, detectedLang: string): string {
  const effectiveLang = lang === "auto" ? detectedLang : lang;
  
  if (effectiveLang === "uk") {
    return `Ти Aida, AI асистент з покупок. Відповідай УКРАЇНСЬКОЮ мовою.

ЗАВДАННЯ: Рекомендації товарів з різних інтернет-магазинів з цінами.

СФЕРИ: Мода (Shein, Temu, Trendyol), Автозапчастини (AutoDoc, eBay), Меблі (IKEA, Bonami), Електроніка (Alza, eMAG)

ПРАВИЛА:
- Надавай 3-5 товарів з цінами
- Вживаний товар позначай: "(Вживаний)"
- Для автозапчастин питай тип авто
- КРИТИЧНО: Кожен купон належить ЛИШЕ своєму магазину! Не плутай коди!
- Якщо є купон: [КУПОН: КОД - знижка%]
- Якщо купон "АВТОМАТИЧНО", напиши: "Код не потрібен, знижка автоматична!"
- Якщо немає купона для магазину, НЕ вигадуй!
- Будь лаконічним і швидким
- Перекладай опис купонів українською`;
  }
  
  if (effectiveLang === "en") {
    return `You are Aida, an AI shopping assistant. Respond in ENGLISH.

TASK: Product recommendations from various webshops with prices.

AREAS: Fashion (Shein, Temu, Trendyol), Auto parts (AutoDoc, eBay), Furniture (IKEA, Bonami), Electronics (Alza, eMAG)

RULES:
- Provide 3-5 products with prices
- Mark used items: "(Used)"
- For auto parts, ask for car type
- CRITICAL: Each coupon belongs ONLY to its own store! Don't mix up codes!
- If coupon available: [COUPON: CODE - discount%]
- If coupon is "AUTOMATIC", write: "No code needed, discount is automatic!"
- If no coupon exists for a store, DON'T make one up!
- Be concise and fast
- Translate coupon descriptions to English`;
  }
  
  // Default Hungarian
  return `Te vagy Aida, AI shopping asszisztens. Magyar nyelven válaszolsz.

FELADAT: Termék ajánlások különböző webshopokból, árakkal.

TERÜLETEK: Divat (Shein, Temu, Trendyol), Autóalkatrész (AutoDoc, eBay), Bútor (IKEA, Bonami), Elektronika (Alza, eMAG)

SZABÁLYOK:
- Adj 3-5 terméket árakkal
- Használt terméknél jelezd: "(Használt)"
- Autóalkatrésznél kérdezz autó típust
- KRITIKUS: Minden kupon CSAK a saját boltjához tartozik! Ne keverd össze a kódokat!
- Ha van kupon egy bolthoz: [KUPON: KÓD - kedvezmény%]
- Ha a kupon "AUTOMATIKUS", akkor írd: "Nincs szükség kódra, a kedvezmény automatikus!"
- Ha nincs kupon egy bolthoz, NE találj ki egyet!
- Légy tömör és gyors`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, searchQuery, isCouponSearch, language = "hu" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("AI szolgáltatás nincs konfigurálva");
    }

    // Detect language from the latest user message
    const lastUserMessage = messages?.filter((m: any) => m.role === "user").pop()?.content || "";
    const detectedLang = detectLanguage(lastUserMessage);
    const effectiveLang = language === "auto" ? (detectedLang !== "auto" ? detectedLang : "hu") : language;

    console.log("Aida request:", { query: searchQuery?.slice(0, 50), msgs: messages?.length, lang: effectiveLang });

    // Fetch and filter coupons based on search query
    let couponContext = "";
    if (searchQuery || isCouponSearch) {
      const couponResult = await getStoreCoupons(searchQuery || lastUserMessage);
      couponContext = formatCoupons(couponResult, effectiveLang, searchQuery);
    }

    // Limit to last 6 messages for speed
    const limitedMessages = (messages || []).slice(-6);
    
    // Get language-appropriate system prompt
    const systemPrompt = getSystemPrompt(language, detectedLang);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt + couponContext },
          ...limitedMessages,
        ],
        stream: true,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      console.error("AI error:", status);
      
      const errorMsg = status === 429 
        ? "Túl sok kérés, várj egy kicsit."
        : status === 402 
        ? "AI limit elérve."
        : "AI hiba";
      
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Hiba" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
