import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_URL = "https://api-sg.aliexpress.com/sync";
const MIN_RATING = 3.0;
const MIN_REVIEWS = 5;
const BATCH_SIZE = 20; // API supports up to 20 product IDs per call

// ─── MD5 implementation ───
function md5Hash(input: string): string {
  const utf8Bytes = new TextEncoder().encode(input);
  const string = Array.from(utf8Bytes).map(b => String.fromCharCode(b)).join('');
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a=ff(a,b,c,d,k[0],7,-680876936);d=ff(d,a,b,c,k[1],12,-389564586);c=ff(c,d,a,b,k[2],17,606105819);b=ff(b,c,d,a,k[3],22,-1044525330);
    a=ff(a,b,c,d,k[4],7,-176418897);d=ff(d,a,b,c,k[5],12,1200080426);c=ff(c,d,a,b,k[6],17,-1473231341);b=ff(b,c,d,a,k[7],22,-45705983);
    a=ff(a,b,c,d,k[8],7,1770035416);d=ff(d,a,b,c,k[9],12,-1958414417);c=ff(c,d,a,b,k[10],17,-42063);b=ff(b,c,d,a,k[11],22,-1990404162);
    a=ff(a,b,c,d,k[12],7,1804603682);d=ff(d,a,b,c,k[13],12,-40341101);c=ff(c,d,a,b,k[14],17,-1502002290);b=ff(b,c,d,a,k[15],22,1236535329);
    a=gg(a,b,c,d,k[1],5,-165796510);d=gg(d,a,b,c,k[6],9,-1069501632);c=gg(c,d,a,b,k[11],14,643717713);b=gg(b,c,d,a,k[0],20,-373897302);
    a=gg(a,b,c,d,k[5],5,-701558691);d=gg(d,a,b,c,k[10],9,38016083);c=gg(c,d,a,b,k[15],14,-660478335);b=gg(b,c,d,a,k[4],20,-405537848);
    a=gg(a,b,c,d,k[9],5,568446438);d=gg(d,a,b,c,k[14],9,-1019803690);c=gg(c,d,a,b,k[3],14,-187363961);b=gg(b,c,d,a,k[8],20,1163531501);
    a=gg(a,b,c,d,k[13],5,-1444681467);d=gg(d,a,b,c,k[2],9,-51403784);c=gg(c,d,a,b,k[7],14,1735328473);b=gg(b,c,d,a,k[12],20,-1926607734);
    a=hh(a,b,c,d,k[5],4,-378558);d=hh(d,a,b,c,k[8],11,-2022574463);c=hh(c,d,a,b,k[11],16,1839030562);b=hh(b,c,d,a,k[14],23,-35309556);
    a=hh(a,b,c,d,k[1],4,-1530992060);d=hh(d,a,b,c,k[4],11,1272893353);c=hh(c,d,a,b,k[7],16,-155497632);b=hh(b,c,d,a,b,k[10],23,-1094730640);
    a=hh(a,b,c,d,k[13],4,681279174);d=hh(d,a,b,c,k[0],11,-358537222);c=hh(c,d,a,b,k[3],16,-722521979);b=hh(b,c,d,a,k[6],23,76029189);
    a=hh(a,b,c,d,k[9],4,-640364487);d=hh(d,a,b,c,k[12],11,-421815835);c=hh(c,d,a,b,k[15],16,530742520);b=hh(b,c,d,a,k[2],23,-995338651);
    a=ii(a,b,c,d,k[0],6,-198630844);d=ii(d,a,b,c,k[7],10,1126891415);c=ii(c,d,a,b,k[14],15,-1416354905);b=ii(b,c,d,a,k[5],21,-57434055);
    a=ii(a,b,c,d,k[12],6,1700485571);d=ii(d,a,b,c,k[3],10,-1894986606);c=ii(c,d,a,b,k[10],15,-1051523);b=ii(b,c,d,a,k[1],21,-2054922799);
    a=ii(a,b,c,d,k[8],6,1873313359);d=ii(d,a,b,c,k[15],10,-30611744);c=ii(c,d,a,b,k[6],15,-1560198380);b=ii(b,c,d,a,k[13],21,1309151649);
    a=ii(a,b,c,d,k[4],6,-145523070);d=ii(d,a,b,c,k[11],10,-1120210379);c=ii(c,d,a,b,k[2],15,718787259);b=ii(b,c,d,a,k[9],21,-343485551);
    x[0]=add32(a,x[0]);x[1]=add32(b,x[1]);x[2]=add32(c,x[2]);x[3]=add32(d,x[3]);
  }
  function cmn(q:number,a:number,b:number,x:number,s:number,t:number){a=add32(add32(a,q),add32(x,t));return add32((a<<s)|(a>>>(32-s)),b);}
  function ff(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return cmn((b&c)|(~b&d),a,b,x,s,t);}
  function gg(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return cmn((b&d)|(c&~d),a,b,x,s,t);}
  function hh(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return cmn(b^c^d,a,b,x,s,t);}
  function ii(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return cmn(c^(b|~d),a,b,x,s,t);}
  function add32(a:number,b:number){return(a+b)&0xffffffff;}
  function md5blk(s:string){const md5blks:number[]=[];for(let i=0;i<64;i+=4){md5blks[i>>2]=s.charCodeAt(i)+(s.charCodeAt(i+1)<<8)+(s.charCodeAt(i+2)<<16)+(s.charCodeAt(i+3)<<24);}return md5blks;}
  function rhex(n:number){const h="0123456789abcdef";let s="";for(let j=0;j<4;j++){s+=h.charAt((n>>(j*8+4))&0x0f)+h.charAt((n>>(j*8))&0x0f);}return s;}
  function hex(x:number[]){return x.map(rhex).join("");}
  function md5_1(s:string){const n=s.length;let state=[1732584193,-271733879,-1732584194,271733878];let i:number;for(i=64;i<=n;i+=64){md5cycle(state,md5blk(s.substring(i-64,i)));}s=s.substring(i-64);const tail=new Array(16).fill(0);for(i=0;i<s.length;i++){tail[i>>2]|=s.charCodeAt(i)<<(i%4<<3);}tail[i>>2]|=0x80<<(i%4<<3);if(i>55){md5cycle(state,tail);tail.fill(0);}tail[14]=n*8;md5cycle(state,tail);return state;}
  return hex(md5_1(string)).toUpperCase();
}

function signRequest(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params).sort();
  let signStr = secret;
  for (const key of sorted) { signStr += key + params[key]; }
  signStr += secret;
  return md5Hash(signStr);
}

function getTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

// ─── Extract product ID from affiliate URL ───
function extractProductId(url: string): string | null {
  // Common patterns: /item/1234567890.html or productId=1234567890
  const match = url.match(/\/item\/(\d+)\.html/) || url.match(/productId=(\d+)/) || url.match(/\/(\d{8,15})\b/);
  return match ? match[1] : null;
}

// ─── Fetch product details by IDs (up to 20) ───
async function fetchProductDetails(appKey: string, appSecret: string, productIds: string[]): Promise<Map<string, { rating: number; reviews: number }>> {
  const result = new Map<string, { rating: number; reviews: number }>();
  if (!productIds.length) return result;

  const params: Record<string, string> = {
    method: "aliexpress.affiliate.product.detail.get",
    app_key: appKey,
    sign_method: "md5",
    timestamp: getTimestamp(),
    format: "json",
    v: "2.0",
    product_ids: productIds.join(","),
    target_currency: "HUF",
    target_language: "EN",
    ship_to_country: "HU",
  };
  params.sign = signRequest(params, appSecret);

  try {
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
      body: new URLSearchParams(params).toString(),
    });
    if (!resp.ok) return result;

    const data = JSON.parse(await resp.text());
    const products = data?.aliexpress_affiliate_product_detail_get_response?.resp_result?.result?.products?.product;
    if (!Array.isArray(products)) return result;

    for (const p of products) {
      const id = p.product_id?.toString();
      if (!id) continue;
      const rating = parseFloat(p.evaluate_rate || "0");
      const reviews = parseInt(p.lastest_volume || "0", 10);
      result.set(id, { rating, reviews });
    }
  } catch (e) {
    console.error("Product detail fetch error:", e);
  }

  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const appKey = Deno.env.get("ALIEXPRESS_APP_KEY")?.trim();
    const appSecret = Deno.env.get("ALIEXPRESS_APP_SECRET")?.trim();
    if (!appKey || !appSecret) throw new Error("AliExpress API credentials missing");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Fetch all products from DB in batches of 1000
    let allProducts: { id: string; affiliate_url: string }[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("products")
        .select("id, affiliate_url")
        .not("affiliate_url", "is", null)
        .range(from, from + pageSize - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      allProducts.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    console.log(`📊 Összesen ${allProducts.length} termék az adatbázisban`);

    // Extract product IDs and map back to DB IDs
    const productIdToDbIds = new Map<string, string[]>();
    for (const p of allProducts) {
      if (!p.affiliate_url) continue;
      const pid = extractProductId(p.affiliate_url);
      if (!pid) continue;
      const existing = productIdToDbIds.get(pid) || [];
      existing.push(p.id);
      productIdToDbIds.set(pid, existing);
    }

    const allProductIds = [...productIdToDbIds.keys()];
    console.log(`🔍 ${allProductIds.length} egyedi termék ID kinyerve az URL-ekből`);

    let totalChecked = 0;
    let totalRemoved = 0;
    let totalNotFound = 0;
    const idsToDelete: string[] = [];

    // Process in batches of BATCH_SIZE
    for (let i = 0; i < allProductIds.length; i += BATCH_SIZE) {
      const batch = allProductIds.slice(i, i + BATCH_SIZE);
      const details = await fetchProductDetails(appKey, appSecret, batch);
      totalChecked += batch.length;

      for (const pid of batch) {
        const info = details.get(pid);
        const dbIds = productIdToDbIds.get(pid) || [];

        if (!info) {
          // Product not found on AliExpress anymore — mark for deletion
          totalNotFound += dbIds.length;
          idsToDelete.push(...dbIds);
          continue;
        }

        // Check rating/review thresholds
        const failsRating = info.rating > 0 && info.rating < MIN_RATING;
        const failsReviews = info.reviews > 0 && info.reviews < MIN_REVIEWS;
        if (failsRating || failsReviews) {
          totalRemoved += dbIds.length;
          idsToDelete.push(...dbIds);
        }
      }

      // Rate limiting
      if (i + BATCH_SIZE < allProductIds.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // Delete all flagged products
    if (idsToDelete.length > 0) {
      // Delete in batches of 100 to avoid query size limits
      for (let i = 0; i < idsToDelete.length; i += 100) {
        const batch = idsToDelete.slice(i, i + 100);
        await supabase.from("products").delete().in("id", batch);
      }
    }

    const summary = {
      totalInDb: allProducts.length,
      totalChecked,
      removedLowRating: totalRemoved,
      removedNotFound: totalNotFound,
      totalDeleted: idsToDelete.length,
      remaining: allProducts.length - idsToDelete.length,
    };

    console.log(`✅ Tisztítás kész: ${totalRemoved} alacsony értékelés + ${totalNotFound} nem elérhető = ${idsToDelete.length} törölve`);

    return new Response(JSON.stringify({ success: true, ...summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Rating cleanup error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Cleanup failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
