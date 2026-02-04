import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("AI szolgáltatás nincs konfigurálva");
    }

    if (!imageBase64) {
      throw new Error("Nincs kép megadva");
    }

    console.log("Analyzing image with Vision AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Te egy termékfelismerő AI vagy. A feladatod, hogy a feltöltött képen azonosítsd a fő terméket vagy tárgyat.

SZABÁLYOK:
- Adj vissza EGY rövid (1-3 szavas) keresési kulcsszót magyarul
- Ha több termék van, a legfontosabbat azonosítsd
- Ha ruházat, add meg a típusát (pl. "férfi pulóver", "női cipő")
- Ha elektronika, add meg a típusát (pl. "vezeték nélküli fülhallgató", "okosóra")
- Ha nem ismersz fel terméket, válaszolj: "ismeretlen"
- NE adj hosszú leírást, CSAK a keresési kulcsszót!

Példák:
- Kép egy Nike cipőről -> "sportcipő"
- Kép egy iPhone-ról -> "okostelefon"
- Kép egy bőrdzsekiről -> "bőrdzseki"
- Kép egy kávéfőzőről -> "kávéfőző"`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Mi látható ezen a képen? Add meg a keresési kulcsszót!"
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      console.error("Vision AI error:", status);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Túl sok kérés, várj egy kicsit." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI limit elérve." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error("Vision AI hiba");
    }

    const data = await response.json();
    const keyword = data.choices?.[0]?.message?.content?.trim() || "ismeretlen";

    console.log("Detected product keyword:", keyword);

    return new Response(
      JSON.stringify({ keyword }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Hiba történt" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
