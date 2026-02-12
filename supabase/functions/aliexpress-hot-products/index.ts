import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_URLS = [
  "https://api-sg.aliexpress.com/sync",
  "https://eco.taobao.com/router/rest",
  "https://api.taobao.com/router/rest",
];

// Minimal MD5 implementation
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
    a=hh(a,b,c,d,k[1],4,-1530992060);d=hh(d,a,b,c,k[4],11,1272893353);c=hh(c,d,a,b,k[7],16,-155497632);b=hh(b,c,d,a,k[10],23,-1094730640);
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
  function md5blk(s:string){const r:number[]=[];for(let i=0;i<64;i+=4){r[i>>2]=s.charCodeAt(i)+(s.charCodeAt(i+1)<<8)+(s.charCodeAt(i+2)<<16)+(s.charCodeAt(i+3)<<24);}return r;}
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

// AliExpress category ID to Hungarian label
const CATEGORY_LABELS: Record<string, string> = {
  "44": "Elektronika", "509": "Telefon", "7": "Számítógép", "15": "Otthon & Kert",
  "1509": "Ékszer", "200000346": "Női divat", "200000343": "Férfi divat",
  "200000532": "Cipő", "26": "Sport", "2": "Autó", "6": "Szerszámok",
  "1503": "Táskák", "200000297": "Baba & Gyerek", "100003109": "Szépségápolás",
  "200000779": "Póló", "200001996": "Háztartás", "21": "Szabadidő",
  "36": "Világítás", "1501": "Játékok", "127": "Óra",
};

function getCategoryLabel(catId: string | null): string {
  if (!catId) return "Egyéb";
  return CATEGORY_LABELS[catId] || "Egyéb";
}

// Varied search terms to get diverse categories
const DIVERSE_QUERIES = [
  { keywords: "best seller electronics gadget", category: "44" },
  { keywords: "women fashion dress coat", category: "200000346" },
  { keywords: "men fashion jacket hoodie", category: "200000343" },
  { keywords: "home decor kitchen gadget", category: "15" },
  { keywords: "sport fitness outdoor", category: "26" },
  { keywords: "phone accessories case charger", category: "509" },
  { keywords: "smart watch wristwatch", category: "127" },
  { keywords: "beauty skincare makeup", category: "100003109" },
  { keywords: "shoes sneakers boots", category: "200000532" },
  { keywords: "toys kids children", category: "1501" },
];

async function fetchCategoryProducts(
  appKey: string, appSecret: string, query: { keywords: string; category: string }, pageNo: number
): Promise<any[]> {
  try {
    const params: Record<string, string> = {
      method: "aliexpress.affiliate.hotproduct.query",
      app_key: appKey,
      sign_method: "md5",
      timestamp: getTimestamp(),
      format: "json",
      v: "2.0",
      keywords: query.keywords,
      target_currency: "HUF",
      target_language: "EN",
      ship_to_country: "HU",
      page_no: pageNo.toString(),
      page_size: "20",
      sort: "LAST_VOLUME_DESC",
      platform_product_type: "ALL",
      category_ids: query.category,
    };
    params.sign = signRequest(params, appSecret);

    const urlParams = new URLSearchParams(params);
    
    for (const apiUrl of API_URLS) {
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
          body: urlParams.toString(),
        });
        if (!response.ok) continue;
        
        const data = JSON.parse(await response.text());
        if (data.error_response) continue;
        
        const result = data?.aliexpress_affiliate_hotproduct_query_response?.resp_result?.result;
        if (result?.products?.product) {
          return result.products.product.map((p: any) => ({ ...p, _category_id: query.category }));
        }
        
        // Fallback to regular product query if hotproduct doesn't work
        const result2 = data?.aliexpress_affiliate_product_query_response?.resp_result?.result;
        if (result2?.products?.product) {
          return result2.products.product.map((p: any) => ({ ...p, _category_id: query.category }));
        }
        break;
      } catch { continue; }
    }
  } catch (e) {
    console.log(`Category ${query.category} fetch failed:`, e);
  }
  
  // Fallback: try regular product query
  try {
    const params: Record<string, string> = {
      method: "aliexpress.affiliate.product.query",
      app_key: appKey,
      sign_method: "md5",
      timestamp: getTimestamp(),
      format: "json",
      v: "2.0",
      keywords: query.keywords,
      target_currency: "HUF",
      target_language: "EN",
      ship_to_country: "HU",
      page_no: pageNo.toString(),
      page_size: "20",
      sort: "LAST_VOLUME_DESC",
      platform_product_type: "ALL",
      category_ids: query.category,
    };
    params.sign = signRequest(params, appSecret);

    const urlParams = new URLSearchParams(params);
    for (const apiUrl of API_URLS) {
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
          body: urlParams.toString(),
        });
        if (!response.ok) continue;
        const data = JSON.parse(await response.text());
        if (data.error_response) continue;
        const result = data?.aliexpress_affiliate_product_query_response?.resp_result?.result;
        if (result?.products?.product) {
          return result.products.product.map((p: any) => ({ ...p, _category_id: query.category }));
        }
        break;
      } catch { continue; }
    }
  } catch {}
  return [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const appKey = Deno.env.get("ALIEXPRESS_APP_KEY")?.trim();
    const appSecret = Deno.env.get("ALIEXPRESS_APP_SECRET")?.trim();
    if (!appKey || !appSecret) throw new Error("AliExpress API nincs konfigurálva");

    // Fetch from multiple categories in parallel (pick 5 random ones to vary content)
    const shuffled = [...DIVERSE_QUERIES].sort(() => Math.random() - 0.5);
    const selectedQueries = shuffled.slice(0, 5);
    
    console.log("Fetching hot products from categories:", selectedQueries.map(q => q.category).join(", "));
    
    const results = await Promise.allSettled(
      selectedQueries.map(q => fetchCategoryProducts(appKey, appSecret, q, 1))
    );

    const allRawProducts: any[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") allRawProducts.push(...r.value);
    }

    console.log(`Total raw products from API: ${allRawProducts.length}`);

    // Map and filter
    const mappedProducts = allRawProducts.map((p: any) => {
      const salePrice = parseFloat(p.target_sale_price || "0");
      const origPrice = parseFloat(p.target_original_price || "0");
      const discountNum = origPrice > 0 && salePrice > 0 ? Math.round((1 - salePrice / origPrice) * 100) : 
        (p.discount ? parseInt(String(p.discount).replace(/%/g, '')) : 0);
      
      return {
        id: p.product_id?.toString() || "",
        name: p.product_title || "",
        price: salePrice,
        originalPrice: origPrice,
        currency: "HUF",
        image_url: p.product_main_image_url || null,
        affiliate_url: p.promotion_link || p.product_detail_url || null,
        store_name: "AliExpress",
        discount: discountNum,
        rating: p.evaluate_rate ? parseFloat(String(p.evaluate_rate).replace("%", "")) : null,
        orders: p.lastest_volume ? parseInt(p.lastest_volume) : 0,
        category: getCategoryLabel(p._category_id || p.first_level_category_id?.toString() || p.second_level_category_id?.toString() || null),
        categoryId: p._category_id || p.first_level_category_id?.toString() || null,
        hasCoupon: !!(p.promo_code_info || p.coupon_info),
        couponCode: p.promo_code_info?.code || p.promo_code_info?.promo_code || p.coupon_info?.coupon_code || null,
        couponDiscount: p.promo_code_info?.promo_discount || p.coupon_info?.coupon_discount || null,
      };
    });

    // Filter: 30%+ discount only, must have valid price
    const filtered = mappedProducts.filter(p => p.discount >= 30 && p.price > 0);

    // Sort by orders (volume) desc, then rating desc
    filtered.sort((a, b) => {
      const orderDiff = (b.orders || 0) - (a.orders || 0);
      if (orderDiff !== 0) return orderDiff;
      return (b.rating || 0) - (a.rating || 0);
    });

    // Deduplicate by product ID
    const seen = new Set<string>();
    const unique = filtered.filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    console.log(`After 30%+ filter: ${unique.length} products`);

    return new Response(
      JSON.stringify({ products: unique, total: unique.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Hot products error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Hiba" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
