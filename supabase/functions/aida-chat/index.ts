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

// Universal partner stores for any search
const PARTNER_STORES: { name: string; searchUrl: string; categories: string[] }[] = [
  { name: "Amazon", searchUrl: "https://www.amazon.de/s?k=", categories: ["minden"] },
  { name: "Temu", searchUrl: "https://www.temu.com/search_result.html?search_key=", categories: ["minden"] },
  { name: "AliExpress", searchUrl: "https://www.aliexpress.com/wholesale?SearchText=", categories: ["minden"] },
  { name: "eMAG", searchUrl: "https://www.emag.hu/search/", categories: ["elektronika", "háztartás"] },
  { name: "Alza", searchUrl: "https://www.alza.hu/search.htm?exps=", categories: ["elektronika"] },
  { name: "Decathlon", searchUrl: "https://www.decathlon.hu/search?Ntt=", categories: ["sport"] },
  { name: "IKEA", searchUrl: "https://www.ikea.com/hu/hu/search/?q=", categories: ["bútor"] },
  { name: "eBay", searchUrl: "https://www.ebay.com/sch/i.html?_nkw=", categories: ["minden"] },
];

// Get store coupons and always generate search links
async function getStoreCoupons(searchQuery?: string) {
  const { data } = await getSupabase()
    .from("coupons")
    .select("store_name, code, description, discount_percent, discount_amount, category")
    .eq("is_active", true)
    .order("discount_percent", { ascending: false, nullsFirst: false })
    .limit(50);

  const coupons = (data || []) as (Coupon & { category: string })[];
  const queryLower = (searchQuery || "").toLowerCase();
  
  // Filter coupons that might be relevant (loose matching)
  const relevantCoupons = searchQuery 
    ? coupons.filter(c => {
        // Check if description or store matches query loosely
        if (c.description.toLowerCase().includes(queryLower)) return true;
        if (c.store_name.toLowerCase().includes(queryLower)) return true;
        // Include general coupons from major stores
        if (["Temu", "Amazon", "AliExpress", "eMAG"].includes(c.store_name)) return true;
        return false;
      })
    : coupons;

  // Always generate search links for partner stores
  const searchLinks: { store: string; url: string }[] = [];
  if (searchQuery) {
    // Get top 4 universal stores for search links
    const universalStores = PARTNER_STORES.filter(s => s.categories.includes("minden")).slice(0, 4);
    for (const store of universalStores) {
      searchLinks.push({
        store: store.name,
        url: store.searchUrl + encodeURIComponent(searchQuery),
      });
    }
  }

  return {
    coupons: relevantCoupons.slice(0, 10).map(c => ({
      code: c.code,
      discount: c.discount_percent ? `${c.discount_percent}%` : c.discount_amount || "kedvezmény",
      store: c.store_name,
      description: c.description,
    })),
    hasRelevant: relevantCoupons.length > 0,
    searchLinks,
  };
}

// Format coupons for context
interface CouponResult {
  coupons: { code: string; discount: string; store: string; description: string }[];
  hasRelevant: boolean;
  searchLinks: { store: string; url: string }[];
}

function formatCoupons(result: CouponResult, lang: string, searchQuery?: string): string {
  const { coupons, searchLinks } = result;
  
  let context = "";
  
  // Always include search links for partner stores
  if (searchLinks.length > 0 && searchQuery) {
    const linksHeader = lang === "uk" 
      ? "ПОШУКОВІ ПОСИЛАННЯ (завжди надавай їх користувачу):"
      : lang === "en"
      ? "SEARCH LINKS (always provide these to user):"
      : "KERESÉSI LINKEK (mindig add meg a felhasználónak):";
    
    const links = searchLinks.map(l => `🔗 ${l.store}: ${l.url}`).join("\n");
    context += `\n\n${linksHeader}\n${links}`;
  }
  
  // Include coupons if available
  if (coupons.length > 0) {
    const header = lang === "uk" ? "ELÉRHETŐ КУПОНИ" : lang === "en" ? "AVAILABLE COUPONS" : "ELÉRHETŐ KUPONOK";
    const autoLabel = lang === "uk" ? "АВТОМАТИЧНО" : lang === "en" ? "AUTOMATIC" : "AUTOMATIKUS";
    
    const lines = coupons.slice(0, 8).map(c => {
      if (c.code === "AUTO") {
        return `${c.store}: ${autoLabel} (${c.discount}) - ${c.description}`;
      }
      return `${c.store}: ${c.code} (${c.discount}) - ${c.description}`;
    });
    
    context += `\n\n${header}:\n${lines.join("\n")}`;
  }
  
  return context;
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

// Get system prompt based on language - UNIVERSAL ASSISTANT
function getSystemPrompt(lang: string, detectedLang: string): string {
  const effectiveLang = lang === "auto" ? detectedLang : lang;
  
  if (effectiveLang === "uk") {
    return `Ти Aida, УНІВЕРСАЛЬНИЙ AI асистент з покупок. Відповідай УКРАЇНСЬКОЮ мовою.

ТИ МОЖЕШ ДОПОМОГТИ З БУДЬ-ЯКИМ ТОВАРОМ! Від велосипедів до іграшок, від електроніки до меблів - все що завгодно.

ПАРТНЕРСЬКІ МАГАЗИНИ: Amazon, Temu, AliExpress, eMAG, Alza, Decathlon, IKEA, eBay та інші.

ПРАВИЛА:
- Рекомендуй 3-5 товарів з орієнтовними цінами
- ЗАВЖДИ надавай пошукові посилання на партнерські магазини (формат: 🔗 [Назва]: посилання)
- Якщо є купон: [КУПОН: КОД - знижка%]
- Якщо купон "АВТОМАТИЧНО": "Код не потрібен, знижка автоматична!"
- НЕ кажи "я можу допомогти тільки з X" - ти можеш допомогти з усім!
- Будь корисним і швидким`;
  }
  
  if (effectiveLang === "en") {
    return `You are Aida, a UNIVERSAL AI shopping assistant. Respond in ENGLISH.

YOU CAN HELP WITH ANY PRODUCT! From bicycles to toys, from electronics to furniture - anything at all.

PARTNER STORES: Amazon, Temu, AliExpress, eMAG, Alza, Decathlon, IKEA, eBay and more.

RULES:
- Recommend 3-5 products with estimated prices
- ALWAYS provide search links to partner stores (format: 🔗 [Name]: link)
- If coupon available: [COUPON: CODE - discount%]
- If coupon is "AUTOMATIC": "No code needed, discount is automatic!"
- NEVER say "I can only help with X" - you can help with EVERYTHING!
- Be helpful and fast`;
  }
  
  // Default Hungarian
  return `Te vagy Aida, egy UNIVERZÁLIS AI shopping asszisztens. Magyar nyelven válaszolsz.

BÁRMILYEN TERMÉKKEL TUDSZ SEGÍTENI! Biciklitől a játékokig, elektronikától a bútorig - bármit keresnek.

PARTNERBOLTOK: Amazon, Temu, AliExpress, eMAG, Alza, Decathlon, IKEA, eBay és még sok más.

SZABÁLYOK:
- Ajánlj 3-5 terméket becsült árakkal
- MINDIG add meg a keresési linkeket a partnerboltokhoz (formátum: 🔗 [Bolt]: link)
- Ha van kupon: [KUPON: KÓD - kedvezmény%]
- Ha a kupon "AUTOMATIKUS": "Nincs szükség kódra, a kedvezmény automatikus!"
- SOHA ne mondd, hogy "csak X kategóriában tudok segíteni" - MINDENBEN tudsz segíteni!
- Légy segítőkész és gyors`;
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
