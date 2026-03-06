import "https://deno.land/x/xhr@0.1.0/mod.ts";

const BACKEND_URL = "http://217.13.104.64:8000";

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

    if (!message) {
      return new Response(JSON.stringify({ error: "Missing message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requestBody: Record<string, unknown> = { message };
    if (session_id) requestBody.session_id = session_id;

    const backendRes = await fetch(`${BACKEND_URL}/api/v1/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const rawText = await backendRes.text();
    let data: Record<string, unknown> = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = { raw: rawText };
    }

    if (!backendRes.ok) {
      console.error("Backend error:", backendRes.status, rawText);
      return new Response(
        JSON.stringify({ error: "Backend error", status: backendRes.status, backend: data }),
        { status: backendRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

