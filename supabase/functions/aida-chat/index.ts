import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to search coupons
async function searchCoupons(query: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .eq("is_active", true)
    .or(`store_name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
    .order("discount_percent", { ascending: false, nullsFirst: false })
    .limit(5);

  return coupons || [];
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

    // Search for real coupons if relevant
    let couponContext = "";
    if (searchQuery) {
      const keywords = ["kupon", "kód", "kedvezmény", "promóció", "akció"];
      const hasCouponKeyword = keywords.some(k => searchQuery.toLowerCase().includes(k)) || isCouponSearch;
      
      if (hasCouponKeyword) {
        const coupons = await searchCoupons(searchQuery);
        couponContext = formatCouponsForAI(coupons);
        console.log(`Found ${coupons.length} coupons for query: ${searchQuery}`);
      }
    }

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
- Ha a felhasználó kupont keres, használd a valódi kuponokat az adatbázisból!

Stílusod:
- Barátságos, lelkes, de professzionális
- Használj emoji-kat mérsékletesen
- Adj konkrét termékajánlásokat árakkal (szimulált, de reális árakkal)
- Mindig említsd meg melyik boltban találtad az ajánlatot

Ha a felhasználó terméket keres, adj 3-5 konkrét ajánlatot különböző árkategóriákban, mindig jelezd a megtakarítás %-át az eredeti árhoz képest.
${couponContext}`;

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
          ...(messages || []),
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
