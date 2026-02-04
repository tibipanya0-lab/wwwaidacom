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

// Get store coupons - cached for 5 minutes
let cachedCoupons: { code: string; discount: string; store: string; description: string }[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getStoreCoupons() {
  const now = Date.now();
  if (cachedCoupons && (now - cacheTime) < CACHE_TTL) {
    return cachedCoupons;
  }

  const { data } = await getSupabase()
    .from("coupons")
    .select("store_name, code, description, discount_percent, discount_amount")
    .eq("is_active", true)
    .order("discount_percent", { ascending: false, nullsFirst: false })
    .limit(50);

  const coupons = (data || []) as Coupon[];
  cachedCoupons = coupons.map(c => ({
    code: c.code,
    discount: c.discount_percent ? `${c.discount_percent}%` : c.discount_amount || "kedvezmény",
    store: c.store_name,
    description: c.description,
  }));
  
  cacheTime = now;
  return cachedCoupons;
}

// Format coupons for context
function formatCoupons(coupons: { code: string; discount: string; store: string; description: string }[], lang: string) {
  if (coupons.length === 0) return "";
  
  const header = lang === "uk" ? "КУПОНИ" : lang === "en" ? "COUPONS" : "KUPONOK";
  const lines = coupons.slice(0, 20).map(c => `${c.store}: ${c.code} (${c.discount}) - ${c.description}`);
  
  return `\n\n${header}:\n${lines.join("\n")}`;
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
- Якщо є купон: [КУПОН: КОД - знижка%]
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
- If coupon available: [COUPON: CODE - discount%]
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
- Ha van kupon: [KUPON: KÓD - kedvezmény%]
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

    // Only fetch coupons if needed (product search or coupon search)
    let couponContext = "";
    if (searchQuery || isCouponSearch) {
      const coupons = await getStoreCoupons();
      couponContext = formatCoupons(coupons, effectiveLang);
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
