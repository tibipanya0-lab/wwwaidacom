import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation constants
const MAX_BASE64_SIZE = 10 * 1024 * 1024; // 10MB max
const VALID_IMAGE_PREFIXES = [
  "data:image/jpeg;base64,",
  "data:image/png;base64,",
  "data:image/gif;base64,",
  "data:image/webp;base64,",
];

// Validate base64 image
function validateImageBase64(input: unknown): string | null {
  if (typeof input !== "string") return null;
  
  // Check size limit
  if (input.length > MAX_BASE64_SIZE) return null;
  
  // Check if it's a valid data URL or raw base64
  const isDataUrl = VALID_IMAGE_PREFIXES.some(prefix => input.startsWith(prefix));
  const isRawBase64 = /^[A-Za-z0-9+/]+=*$/.test(input.replace(/\s/g, ""));
  
  if (!isDataUrl && !isRawBase64) return null;
  
  return input;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Optional authentication - log user if authenticated
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      if (token.split(".").length === 3) {
        try {
          const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
          const supabaseAuth = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
            { global: { headers: { Authorization: authHeader } } }
          );
          const { data: claimsData } = await supabaseAuth.auth.getClaims(token);
          if (claimsData?.claims?.sub) {
            userId = claimsData.claims.sub as string;
          }
        } catch {
          // Continue as anonymous
        }
      }
    }

    console.log("Request from:", userId ? `user:${userId}` : "anonymous");

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
    const imageBase64 = validateImageBase64(requestBody.imageBase64);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("AI szolgáltatás nincs konfigurálva");
    }

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Hibás vagy túl nagy kép (max 10MB)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    // Sanitize output - remove any potential injection
    const sanitizedKeyword = keyword
      .replace(/<[^>]*>/g, "")
      .replace(/[<>"']/g, "")
      .slice(0, 100);

    console.log("Detected product keyword:", sanitizedKeyword);

    return new Response(
      JSON.stringify({ keyword: sanitizedKeyword }),
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
