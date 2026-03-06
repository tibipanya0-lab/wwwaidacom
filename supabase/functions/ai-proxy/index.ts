const BACKEND_URL = "http://217.13.104.64:8000";
const BACKEND_TIMEOUT_MS = 60000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ExtractedPayload {
  message: string;
  session_id: string | null;
}

function extractPayload(raw: any): ExtractedPayload {
  let message = "";
  let session_id: string | null = null;

  if (typeof raw?.message === "string") {
    message = raw.message.trim();
  } else if (Array.isArray(raw?.messages)) {
    const last = [...raw.messages]
      .reverse()
      .find((m: any) => m?.role === "user" && typeof m?.content === "string");
    message = (last?.content ?? "").trim();
  } else if (typeof raw?.body?.message === "string") {
    message = raw.body.message.trim();
  }

  session_id =
    (typeof raw?.session_id === "string" ? raw.session_id : null) ??
    (typeof raw?.body?.session_id === "string" ? raw.body.session_id : null);

  return { message, session_id };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { message, session_id } = extractPayload(payload);

    console.log("[ai-proxy] message:", message.slice(0, 80), "| session_id:", session_id ?? "new");

    if (!message) {
      return new Response(JSON.stringify({ error: "Missing message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requestBody: Record<string, unknown> = { message };
    if (session_id) requestBody.session_id = session_id;

    // VPS hívás timeouttal
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

    let backendRes: Response;
    try {
      backendRes = await fetch(`${BACKEND_URL}/api/v1/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      const isTimeout = (fetchErr as Error)?.name === "AbortError";
      console.error("[ai-proxy] fetch hiba:", fetchErr);
      return new Response(
        JSON.stringify({
          error: isTimeout ? "Backend timeout" : "Backend nem elérhető",
          session_id: session_id ?? "",
          response: isTimeout
            ? "A szerver jelenleg lassan válaszol, próbáld újra!"
            : "A szerver nem elérhető, próbáld újra később!",
          products: [],
          search_performed: false,
          cached: false,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    clearTimeout(timeoutId);

    console.log("[ai-proxy] backend státusz:", backendRes.status);

    const rawText = await backendRes.text();
    let data: Record<string, unknown> = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      console.error("[ai-proxy] JSON parse hiba, raw:", rawText.slice(0, 200));
      data = { raw: rawText };
    }

    if (!backendRes.ok) {
      console.error("[ai-proxy] backend hiba:", backendRes.status, rawText.slice(0, 200));
      return new Response(
        JSON.stringify({ error: "Backend error", status: backendRes.status, backend: data }),
        { status: backendRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[ai-proxy] OK, session_id:", data.session_id, "search_performed:", data.search_performed);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[ai-proxy] belső hiba:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request", detail: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
