import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, searchQuery } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI szolgáltatás nincs konfigurálva");
    }

    console.log("Aida chat request received:", { searchQuery, messageCount: messages?.length });

    const systemPrompt = `Te vagy Aida, a SmartAsszisztens személyes AI shopping asszisztense. 
    
Feladatod:
- Segítesz a felhasználóknak megtalálni a legjobb árakat különböző webáruházakból (Temu, Shein, Alza, AliExpress, Amazon, eBay, eMAG, Media Markt stb.)
- Termékajánlásokat adsz a felhasználók igényei alapján
- Összehasonlítod az árakat és kiemeled a legjobb ajánlatokat
- Magyar nyelven kommunikálsz, barátságosan és segítőkészen

Stílusod:
- Barátságos, lelkes, de professzionális
- Használj emoji-kat mérsékletesen
- Adj konkrét termékajánlásokat árakkal (szimulált, de reális árakkal)
- Mindig említsd meg melyik boltban találtad az ajánlatot

Ha a felhasználó terméket keres, adj 3-5 konkrét ajánlatot különböző árkategóriákban, mindig jelezd a megtakarítás %-át az eredeti árhoz képest.`;

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
