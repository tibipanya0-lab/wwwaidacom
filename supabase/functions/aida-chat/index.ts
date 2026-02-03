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
  discount_percent: number | null;
  discount_amount: string | null;
}

// Get store coupons - cached for 5 minutes
let cachedCoupons: Record<string, { code: string; discount: string }[]> | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getStoreCoupons() {
  const now = Date.now();
  if (cachedCoupons && (now - cacheTime) < CACHE_TTL) {
    return cachedCoupons;
  }

  const { data } = await getSupabase()
    .from("coupons")
    .select("store_name, code, discount_percent, discount_amount")
    .eq("is_active", true)
    .order("discount_percent", { ascending: false, nullsFirst: false })
    .limit(50);

  const coupons = (data || []) as Coupon[];
  const couponsByStore: Record<string, { code: string; discount: string }[]> = {};
  
  for (const c of coupons) {
    const storeLower = c.store_name.toLowerCase();
    if (!couponsByStore[storeLower]) {
      couponsByStore[storeLower] = [];
    }
    const discount = c.discount_percent ? `${c.discount_percent}%` : c.discount_amount || "kedvezmény";
    couponsByStore[storeLower].push({ code: c.code, discount });
  }
  
  cachedCoupons = couponsByStore;
  cacheTime = now;
  return couponsByStore;
}

// Format coupons concisely
function formatCoupons(couponsByStore: Record<string, { code: string; discount: string }[]>) {
  if (Object.keys(couponsByStore).length === 0) return "";
  
  const lines = Object.entries(couponsByStore)
    .slice(0, 20)
    .map(([store, coupons]) => `${store}: ${coupons[0].code} (${coupons[0].discount})`);
  
  return `\n\nKUPONOK:\n${lines.join("\n")}`;
}

// Compact system prompt for speed
const BASE_PROMPT = `Te vagy Aida, AI shopping asszisztens. Magyar nyelven válaszolsz.

FELADAT: Termék ajánlások különböző webshopokból, árakkal.

TERÜLETEK: Divat (Shein, Temu, Trendyol), Autóalkatrész (AutoDoc, eBay), Bútor (IKEA, Bonami), Elektronika (Alza, eMAG)

SZABÁLYOK:
- Adj 3-5 terméket árakkal
- Használt terméknél jelezd: "(Használt)"
- Autóalkatrésznél kérdezz autó típust
- Ha van kupon: [KUPON: KÓD - kedvezmény%]
- Légy tömör és gyors`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, searchQuery, isCouponSearch } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("AI szolgáltatás nincs konfigurálva");
    }

    console.log("Aida request:", { query: searchQuery?.slice(0, 50), msgs: messages?.length });

    // Only fetch coupons if needed (product search or coupon search)
    let couponContext = "";
    if (searchQuery || isCouponSearch) {
      const coupons = await getStoreCoupons();
      couponContext = formatCoupons(coupons);
    }

    // Limit to last 6 messages for speed
    const limitedMessages = (messages || []).slice(-6);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: BASE_PROMPT + couponContext },
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
