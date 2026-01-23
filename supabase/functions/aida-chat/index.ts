import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to search coupons by query or store names
async function searchCoupons(query: string, storeNames: string[] = []) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Build OR conditions for stores
  let orConditions = `store_name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`;
  
  // Add store name conditions
  if (storeNames.length > 0) {
    const storeConditions = storeNames.map(s => `store_name.ilike.%${s}%`).join(',');
    orConditions += `,${storeConditions}`;
  }

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .eq("is_active", true)
    .or(orConditions)
    .order("discount_percent", { ascending: false, nullsFirst: false })
    .limit(10);

  return coupons || [];
}

// Get all active coupons grouped by store
async function getAllStoreCoupons() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: coupons } = await supabase
    .from("coupons")
    .select("store_name, code, discount_percent, discount_amount")
    .eq("is_active", true)
    .order("discount_percent", { ascending: false, nullsFirst: false });

  // Group by store name (lowercase for matching)
  const couponsByStore: Record<string, { code: string; discount: string }[]> = {};
  for (const c of coupons || []) {
    const storeLower = c.store_name.toLowerCase();
    if (!couponsByStore[storeLower]) {
      couponsByStore[storeLower] = [];
    }
    const discount = c.discount_percent ? `${c.discount_percent}%` : c.discount_amount || "kedvezmény";
    couponsByStore[storeLower].push({ code: c.code, discount });
  }
  return couponsByStore;
}

// Format coupons for AI context
function formatCouponsForAI(coupons: any[]) {
  if (coupons.length === 0) return "";
  
  let text = "\n\n📋 VALÓDI KUPONOK AZ ADATBÁZISBÓL:\n";
  coupons.forEach((c, i) => {
    const discount = c.discount_percent ? `${c.discount_percent}%` : c.discount_amount || "kedvezmény";
    const minOrder = c.min_order_amount ? ` (min. rendelés: ${c.min_order_amount})` : "";
    const validUntil = c.valid_until ? ` - Érvényes: ${new Date(c.valid_until).toLocaleDateString("hu-HU")}` : "";
    text += `${i + 1}. **${c.store_name}** - Kód: \`${c.code}\` - ${discount}${minOrder}${validUntil}\n   ${c.description}\n`;
  });
  return text;
}

// Format store coupons for system prompt
function formatStoreCouponsForPrompt(couponsByStore: Record<string, { code: string; discount: string }[]>) {
  if (Object.keys(couponsByStore).length === 0) return "";
  
  let text = "\n\n🎫 ELÉRHETŐ KUPONOK ÁRUHÁZANKÉNT (MINDIG add hozzá a termékhez, ha az áruházhoz van kupon!):\n";
  for (const [store, coupons] of Object.entries(couponsByStore)) {
    const bestCoupon = coupons[0]; // Already sorted by discount
    text += `- ${store.toUpperCase()}: [KUPON: ${bestCoupon.code} - ${bestCoupon.discount}]\n`;
  }
  return text;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, searchQuery, isCouponSearch } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI szolgáltatás nincs konfigurálva");
    }

    console.log("Aida chat request received:", { searchQuery, messageCount: messages?.length, isCouponSearch });

    // Always fetch all store coupons for product recommendations
    const [storeCoupons, searchCouponResults] = await Promise.all([
      getAllStoreCoupons(),
      searchQuery ? searchCoupons(searchQuery) : Promise.resolve([])
    ]);
    
    const storeCouponContext = formatStoreCouponsForPrompt(storeCoupons);
    
    // Additional coupon context for explicit coupon searches
    let couponContext = "";
    if (searchQuery) {
      const keywords = ["kupon", "kód", "kedvezmény", "promóció", "akció"];
      const hasCouponKeyword = keywords.some(k => searchQuery.toLowerCase().includes(k)) || isCouponSearch;
      
      if (hasCouponKeyword && searchCouponResults.length > 0) {
        couponContext = formatCouponsForAI(searchCouponResults);
        console.log(`Found ${searchCouponResults.length} coupons for query: ${searchQuery}`);
      }
    }

    // Limit message history to last 10 messages for speed
    const limitedMessages = (messages || []).slice(-10);

    const systemPrompt = `Te vagy Aida, a SmartAsszisztens személyes AI shopping asszisztense. 
    
Feladatod:
- Segítesz a felhasználóknak megtalálni a legjobb árakat különböző webáruházakból
- Termékajánlásokat adsz a felhasználók igényei alapján
- Összehasonlítod az árakat és kiemeled a legjobb ajánlatokat
- Magyar nyelven kommunikálsz, barátságosan és segítőkészen
- Kuponkódokat és promóciókat is keresel, ha a felhasználó kéri

Szakértői területeid:
1. DIVAT: Trendyol, Shein, Wish, Temu, ASOS
2. AUTÓALKATRÉSZ: AutoDoc, eBay Motors - Mindig kérdezz rá az autó évjáratára és típusára!
3. BÚTOR/LAKBERENDEZÉS: Bonami, VidaXL, Möbelix, IKEA
4. ELEKTRONIKA: Alza, eMAG, Media Markt, Amazon
5. ÁLTALÁNOS: AliExpress, Amazon, eBay

FONTOS SZABÁLYOK:
- Ha eBay-ről vagy más használt terméket áruló oldalról ajánlasz, MINDIG jelezd a válaszodban: "(Használt)" a termék neve után
- Ha autóalkatrészt keres valaki, először kérdezd meg: "Milyen autóhoz keresed? Kérlek add meg a márkát, modellt és évjáratot!"
- Ha bútort keres, kérdezz rá a méretre és stílusra

🎫 KUPONKÓD SZABÁLY (NAGYON FONTOS!):
- Ha van elérhető kupon az adatbázisban egy adott áruházhoz, MINDIG add hozzá a termék ajánláshoz!
- Formátum: a termék ár infó után írd oda: [KUPON: KÓDNÉV - kedvezmény%]
- Példa: "Akciós ár: 5.990 Ft [KUPON: SHEIN15 - 15%]"

Stílusod:
- Barátságos, lelkes, de professzionális
- Használj emoji-kat mérsékletesen
- Adj konkrét termékajánlásokat árakkal (szimulált, de reális árakkal)
- Mindig említsd meg melyik boltban találtad az ajánlatot

Ha a felhasználó terméket keres, adj 3-5 konkrét ajánlatot különböző árkategóriákban, mindig jelezd a megtakarítás %-át az eredeti árhoz képest.
${storeCouponContext}${couponContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...limitedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Túl sok kérés. Kérlek várj egy kicsit és próbáld újra." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI szolgáltatás limit elérve." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI szolgáltatás hiba" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response to client");
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Aida chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Ismeretlen hiba" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
