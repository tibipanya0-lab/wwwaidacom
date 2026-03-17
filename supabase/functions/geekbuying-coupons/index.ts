import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: any = {};
    try { body = await req.json(); } catch {}
    const page = body.page || 1;
    const query = body.query || "";

    const res = await fetch("https://hu.geekbuying.com/Coupon/GetCouponCenter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `categoryID=0&tempID=&status=0&sort=0&coupon_key=${encodeURIComponent(query)}&page=${page}`,
    });

    if (!res.ok) {
      throw new Error(`GeekBuying API error: ${res.status}`);
    }

    const data = await res.json();
    const items = (data.model || []).filter((c: any) => c.CouponCode && c.Amount > 0);

    // Transform to a consistent format
    const coupons = items.map((c: any) => ({
      code: c.CouponCode,
      name: c.CouponName,
      discount: c.YHmoney,
      amount: c.Amount,
      discountRaw: c.Discount,
      link: c.CouponLink,
      endTime: c.EndTime,
      image: c.CouponDisplayValue?.startsWith("//") ? "https:" + c.CouponDisplayValue : c.CouponDisplayValue,
      description: c.Description,
      store: "GeekBuying",
    }));

    return new Response(
      JSON.stringify({ coupons, total: coupons.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GeekBuying coupon fetch error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error", coupons: [], total: 0 }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
