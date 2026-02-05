import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation constants
const MAX_MESSAGE_LENGTH = 10000;
const MAX_MESSAGES_COUNT = 50;
const MAX_SEARCH_QUERY_LENGTH = 500;
const ALLOWED_LANGUAGES = ["hu", "en", "uk", "auto"];

// Validate and sanitize string input
function sanitizeString(input: unknown, maxLength: number): string | null {
  if (typeof input !== "string") return null;
  // Remove potential script injections and trim
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
  return sanitized || null;
}

// Validate messages array
function validateMessages(messages: unknown): { role: string; content: string }[] | null {
  if (!Array.isArray(messages)) return null;
  if (messages.length > MAX_MESSAGES_COUNT) return null;
  
  const validated: { role: string; content: string }[] = [];
  for (const msg of messages) {
    if (typeof msg !== "object" || msg === null) continue;
    const role = msg.role;
    const content = msg.content;
    
    if (typeof role !== "string" || !["user", "assistant", "system"].includes(role)) continue;
    if (typeof content !== "string") continue;
    
    const sanitizedContent = sanitizeString(content, MAX_MESSAGE_LENGTH);
    if (!sanitizedContent) continue;
    
    validated.push({ role, content: sanitizedContent });
  }
  
  return validated.length > 0 ? validated : null;
}

// Validate language
function validateLanguage(lang: unknown): string {
  if (typeof lang !== "string") return "hu";
  return ALLOWED_LANGUAGES.includes(lang) ? lang : "hu";
}

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

// Universal partner stores for any search with thresholds
const PARTNER_STORES: { name: string; searchUrl: string; categories: string[]; thresholds?: { minAmount: number; benefit: string }[] }[] = [
  { 
    name: "Temu", 
    searchUrl: "https://www.temu.com/search_result.html?search_key=", 
    categories: ["minden"],
    thresholds: [
      { minAmount: 5000, benefit: "Ingyenes szállítás" },
      { minAmount: 10000, benefit: "10% extra kedvezmény" },
      { minAmount: 25000, benefit: "20% extra kedvezmény" },
    ]
  },
  { 
    name: "AliExpress", 
    searchUrl: "https://www.aliexpress.com/wholesale?SearchText=", 
    categories: ["minden"],
    thresholds: [
      { minAmount: 8000, benefit: "Ingyenes szállítás" },
      { minAmount: 15000, benefit: "500 Ft kedvezmény" },
      { minAmount: 30000, benefit: "1500 Ft kedvezmény" },
    ]
  },
  { 
    name: "Amazon", 
    searchUrl: "https://www.amazon.de/s?k=", 
    categories: ["minden"],
    thresholds: [
      { minAmount: 12000, benefit: "Ingyenes szállítás" },
    ]
  },
  { 
    name: "eMAG", 
    searchUrl: "https://www.emag.hu/search/", 
    categories: ["elektronika", "háztartás"],
    thresholds: [
      { minAmount: 10000, benefit: "Ingyenes szállítás" },
    ]
  },
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
        if (c.description.toLowerCase().includes(queryLower)) return true;
        if (c.store_name.toLowerCase().includes(queryLower)) return true;
        if (["Temu", "Amazon", "AliExpress", "eMAG"].includes(c.store_name)) return true;
        return false;
      })
    : coupons;

  // Always generate search links for partner stores
  const searchLinks: { store: string; url: string }[] = [];
  if (searchQuery) {
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
  
  if (searchLinks.length > 0 && searchQuery) {
    const linksHeader = lang === "uk" 
      ? "ПОШУКОВІ ПОСИЛАННЯ (завжди надавай їх користувачу):"
      : lang === "en"
      ? "SEARCH LINKS (always provide these to user):"
      : "KERESÉSI LINKEK (mindig add meg a felhasználónak):";
    
    const links = searchLinks.map(l => `🔗 ${l.store}: ${l.url}`).join("\n");
    context += `\n\n${linksHeader}\n${links}`;
  }
  
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
  if (/[іїєґ]/i.test(text)) return "uk";
  if (/[áéíóöőúüű]/i.test(text)) return "hu";
  if (/\b(the|and|for|you|with|this|that|have|from)\b/i.test(text)) return "en";
  return "auto";
}

// Get system prompt based on language
function getSystemPrompt(lang: string, detectedLang: string): string {
  const effectiveLang = lang === "auto" ? detectedLang : lang;
  
  const thresholdKnowledge = `
PARTNERBOLT KÜSZÖBÖK (mindig említsd meg ezeket!):
- Temu: 5000 Ft felett ingyenes szállítás, 10000 Ft felett +10%, 25000 Ft felett +20%
- AliExpress: 8000 Ft felett ingyenes szállítás, 15000 Ft felett -500 Ft, 30000 Ft felett -1500 Ft
- Amazon: 12000 Ft felett ingyenes szállítás
- eMAG: 10000 Ft felett ingyenes szállítás

💡 TIPP RENDSZER: Ha a felhasználó egy terméket néz, ajánlj OLCSÓ KIEGÉSZÍTŐT (pl. tok, kábel, zokni), amivel eléri a következő kedvezmény-szintet! 
Számold ki: "Ha ezt is megveszed (+X Ft), Y Ft-ot spórolsz az ingyenes szállítással/extra kedvezménnyel!"
`;
  
  if (effectiveLang === "uk") {
    return `Ти Aida, УНІВЕРСАЛЬНИЙ AI асистент з покупок. Відповідай УКРАЇНСЬКОЮ мовою.

ТИ МОЖЕШ ДОПОМОГТИ З БУДЬ-ЯКИМ ТОВАРОМ! Від велосипедів до іграшок, від електроніки до меблів - все що завгодно.

ПАРТНЕРСЬКІ МАГАЗИНИ: Amazon, Temu, AliExpress, eMAG, Alza, Decathlon, IKEA, eBay та інші.

${thresholdKnowledge}

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

${thresholdKnowledge}

RULES:
- Recommend 3-5 products with estimated prices
- ALWAYS provide search links to partner stores (format: 🔗 [Name]: link)
- If coupon available: [COUPON: CODE - discount%]
- If coupon is "AUTOMATIC": "No code needed, discount is automatic!"
- NEVER say "I can only help with X" - you can help with EVERYTHING!
- Be helpful and fast`;
  }
  
  return `Te vagy Aida, egy UNIVERZÁLIS AI shopping asszisztens. Magyar nyelven válaszolsz.

BÁRMILYEN TERMÉKKEL TUDSZ SEGÍTENI! Biciklitől a játékokig, elektronikától a bútorig - bármit keresnek.

PARTNERBOLTOK: Amazon, Temu, AliExpress, eMAG, Alza, Decathlon, IKEA, eBay és még sok más.

${thresholdKnowledge}

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
    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Hibás kérés formátum" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof body !== "object" || body === null) {
      return new Response(
        JSON.stringify({ error: "Hibás kérés" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestBody = body as Record<string, unknown>;
    
    // Validate inputs
    const messages = validateMessages(requestBody.messages);
    if (!messages) {
      return new Response(
        JSON.stringify({ error: "Hibás üzenet formátum" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const searchQuery = sanitizeString(requestBody.searchQuery, MAX_SEARCH_QUERY_LENGTH);
    const language = validateLanguage(requestBody.language);
    const isCouponSearch = requestBody.isCouponSearch === true;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("AI szolgáltatás nincs konfigurálva");
    }

    // Detect language from the latest user message
    const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";
    const detectedLang = detectLanguage(lastUserMessage);
    const effectiveLang = language === "auto" ? (detectedLang !== "auto" ? detectedLang : "hu") : language;

    console.log("Aida request:", { query: searchQuery?.slice(0, 50), msgs: messages.length, lang: effectiveLang });

    // Fetch and filter coupons based on search query
    let couponContext = "";
    if (searchQuery || isCouponSearch) {
      const couponResult = await getStoreCoupons(searchQuery || lastUserMessage);
      couponContext = formatCoupons(couponResult, effectiveLang, searchQuery || undefined);
    }

    // Limit to last 6 messages for speed
    const limitedMessages = messages.slice(-6);
    
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
