import "https://deno.land/x/xhr@0.1.0/mod.ts";

const BACKEND_URL = "http://217.13.104.64:8000";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function extractMessage(payload: any): string {
  if (typeof payload?.message === "string") return payload.message.trim();

  if (Array.isArray(payload?.messages)) {
    const lastUser = [...payload.messages].reverse().find((m: any) => m?.role === "user" && typeof m?.content === "string");
    return (lastUser?.content ?? "").trim();
  }

  if (Array.isArray(payload?.body?.messages)) {
    const lastUser = [...payload.body.messages].reverse().find((m: any) => m?.role === "user" && typeof m?.content === "string");
    return (lastUser?.content ?? "").trim();
  }

  if (typeof payload?.body?.message === "string") return payload.body.message.trim();
  return "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const message = extractMessage(payload);

    if (!message) {
      return new Response(JSON.stringify({ error: "Missing message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const raw = await response.text();
    const data = raw ? JSON.parse(raw) : {};

    if (!response.ok) {
      console.error("Backend error:", response.status, raw);
      return new Response(
        JSON.stringify({ error: "Backend returned an error", status: response.status, backend: data }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

