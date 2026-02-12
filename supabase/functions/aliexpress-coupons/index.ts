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

function md5Hash(input: string): string {
  const utf8Bytes = new TextEncoder().encode(input);
  const string = Array.from(utf8Bytes).map(b => String.fromCharCode(b)).join('');
  function md5cycle(x:number[],k:number[]){let a=x[0],b=x[1],c=x[2],d=x[3];a=ff(a,b,c,d,k[0],7,-680876936);d=ff(d,a,b,c,k[1],12,-389564586);c=ff(c,d,a,b,k[2],17,606105819);b=ff(b,c,d,a,k[3],22,-1044525330);a=ff(a,b,c,d,k[4],7,-176418897);d=ff(d,a,b,c,k[5],12,1200080426);c=ff(c,d,a,b,k[6],17,-1473231341);b=ff(b,c,d,a,k[7],22,-45705983);a=ff(a,b,c,d,k[8],7,1770035416);d=ff(d,a,b,c,k[9],12,-1958414417);c=ff(c,d,a,b,k[10],17,-42063);b=ff(b,c,d,a,k[11],22,-1990404162);a=ff(a,b,c,d,k[12],7,1804603682);d=ff(d,a,b,c,k[13],12,-40341101);c=ff(c,d,a,b,k[14],17,-1502002290);b=ff(b,c,d,a,k[15],22,1236535329);a=gg(a,b,c,d,k[1],5,-165796510);d=gg(d,a,b,c,k[6],9,-1069501632);c=gg(c,d,a,b,k[11],14,643717713);b=gg(b,c,d,a,k[0],20,-373897302);a=gg(a,b,c,d,k[5],5,-701558691);d=gg(d,a,b,c,k[10],9,38016083);c=gg(c,d,a,b,k[15],14,-660478335);b=gg(b,c,d,a,k[4],20,-405537848);a=gg(a,b,c,d,k[9],5,568446438);d=gg(d,a,b,c,k[14],9,-1019803690);c=gg(c,d,a,b,k[3],14,-187363961);b=gg(b,c,d,a,k[8],20,1163531501);a=gg(a,b,c,d,k[13],5,-1444681467);d=gg(d,a,b,c,k[2],9,-51403784);c=gg(c,d,a,b,k[7],14,1735328473);b=gg(b,c,d,a,k[12],20,-1926607734);a=hh(a,b,c,d,k[5],4,-378558);d=hh(d,a,b,c,k[8],11,-2022574463);c=hh(c,d,a,b,k[11],16,1839030562);b=hh(b,c,d,a,k[14],23,-35309556);a=hh(a,b,c,d,k[1],4,-1530992060);d=hh(d,a,b,c,k[4],11,1272893353);c=hh(c,d,a,b,k[7],16,-155497632);b=hh(b,c,d,a,k[10],23,-1094730640);a=hh(a,b,c,d,k[13],4,681279174);d=hh(d,a,b,c,k[0],11,-358537222);c=hh(c,d,a,b,k[3],16,-722521979);b=hh(b,c,d,a,k[6],23,76029189);a=hh(a,b,c,d,k[9],4,-640364487);d=hh(d,a,b,c,k[12],11,-421815835);c=hh(c,d,a,b,k[15],16,530742520);b=hh(b,c,d,a,k[2],23,-995338651);a=ii(a,b,c,d,k[0],6,-198630844);d=ii(d,a,b,c,k[7],10,1126891415);c=ii(c,d,a,b,k[14],15,-1416354905);b=ii(b,c,d,a,k[5],21,-57434055);a=ii(a,b,c,d,k[12],6,1700485571);d=ii(d,a,b,c,k[3],10,-1894986606);c=ii(c,d,a,b,k[10],15,-1051523);b=ii(b,c,d,a,k[1],21,-2054922799);a=ii(a,b,c,d,k[8],6,1873313359);d=ii(d,a,b,c,k[15],10,-30611744);c=ii(c,d,a,b,k[6],15,-1560198380);b=ii(b,c,d,a,k[13],21,1309151649);a=ii(a,b,c,d,k[4],6,-145523070);d=ii(d,a,b,c,k[11],10,-1120210379);c=ii(c,d,a,b,k[2],15,718787259);b=ii(b,c,d,a,k[9],21,-343485551);x[0]=add32(a,x[0]);x[1]=add32(b,x[1]);x[2]=add32(c,x[2]);x[3]=add32(d,x[3]);}
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

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  hu: { "44": "Elektronika kuponok", "509": "Telefon kuponok", "200000346": "Női divat kuponok", "200000343": "Férfi divat kuponok", "200000532": "Cipő kuponok", "26": "Sport kuponok", "15": "Otthon kuponok", "100003109": "Szépségápolás kuponok", "127": "Óra kuponok", "1501": "Játék kuponok", "_universal": "Univerzális kódok" },
  en: { "44": "Electronics Coupons", "509": "Phone Coupons", "200000346": "Women's Fashion Coupons", "200000343": "Men's Fashion Coupons", "200000532": "Shoes Coupons", "26": "Sports Coupons", "15": "Home Coupons", "100003109": "Beauty Coupons", "127": "Watch Coupons", "1501": "Toy Coupons", "_universal": "Universal Codes" },
  uk: { "44": "Купони електроніки", "509": "Купони телефонів", "200000346": "Купони жіночої моди", "200000343": "Купони чоловічої моди", "200000532": "Купони взуття", "26": "Купони спорту", "15": "Купони для дому", "100003109": "Купони краси", "127": "Купони годинників", "1501": "Купони іграшок", "_universal": "Універсальні коди" },
};

const COUPON_QUERIES = [
  { keywords: "best seller coupon deal", category: "44" },
  { keywords: "women fashion sale coupon", category: "200000346" },
  { keywords: "men fashion deal coupon", category: "200000343" },
  { keywords: "shoes sneakers sale", category: "200000532" },
  { keywords: "home kitchen gadget deal", category: "15" },
  { keywords: "sport fitness deal", category: "26" },
  { keywords: "beauty skincare sale coupon", category: "100003109" },
  { keywords: "smart watch deal coupon", category: "127" },
];

async function fetchForCoupons(appKey: string, appSecret: string, query: { keywords: string; category: string }): Promise<any[]> {
  try {
    const params: Record<string, string> = {
      method: "aliexpress.affiliate.hotproduct.query",
      app_key: appKey,
      sign_method: "md5",
      timestamp: getTimestamp(),
      format: "json",
      v: "2.0",
      keywords: query.keywords,
      target_currency: "USD",
      target_language: "EN",
      ship_to_country: "HU",
      page_no: "1",
      page_size: "40",
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
        const result = data?.aliexpress_affiliate_hotproduct_query_response?.resp_result?.result
          || data?.aliexpress_affiliate_product_query_response?.resp_result?.result;
        if (result?.products?.product) {
          return result.products.product.map((p: any) => ({ ...p, _category_id: query.category }));
        }
        break;
      } catch { continue; }
    }
  } catch (e) {
    console.log(`Coupon fetch ${query.category} failed:`, e);
  }
  return [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: any = {};
    try { body = await req.json(); } catch {}
    const lang = (body.language || "hu").toLowerCase();

    const appKey = Deno.env.get("ALIEXPRESS_APP_KEY")?.trim();
    const appSecret = Deno.env.get("ALIEXPRESS_APP_SECRET")?.trim();
    if (!appKey || !appSecret) throw new Error("API not configured");

    const shuffled = [...COUPON_QUERIES].sort(() => Math.random() - 0.5);
    console.log("Fetching coupons from", shuffled.length, "categories");

    const results = await Promise.allSettled(
      shuffled.map(q => fetchForCoupons(appKey, appSecret, q))
    );

    const allRaw: any[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") allRaw.push(...r.value);
    }
    console.log(`Total raw products: ${allRaw.length}`);

    const coupons: any[] = [];
    const seenCodes = new Set<string>();

    for (const p of allRaw) {
      const promoCode = p.promo_code_info?.code || p.promo_code_info?.promo_code || null;
      const couponCode = p.coupon_info?.coupon_code || null;
      const code = promoCode || couponCode;
      if (!code || seenCodes.has(code)) continue;
      seenCodes.add(code);

      const catId = p._category_id || p.first_level_category_id?.toString() || "_universal";
      const categoryLabel = CATEGORY_LABELS[lang]?.[catId] || CATEGORY_LABELS["en"]?.[catId] || CATEGORY_LABELS[lang]?.["_universal"] || "Other";

      const discount = p.promo_code_info?.promo_discount || p.coupon_info?.coupon_discount || null;
      const minSpend = p.promo_code_info?.promo_min_spend || p.coupon_info?.coupon_min_spend || null;

      coupons.push({
        id: `${p.product_id}_${code}`,
        code,
        discount: discount ? String(discount) : null,
        minSpend: minSpend ? String(minSpend) : null,
        category: categoryLabel,
        categoryId: catId,
        productName: p.product_title || "",
        productImage: p.product_main_image_url || null,
        affiliateUrl: p.promotion_link || p.product_detail_url || null,
        salePrice: parseFloat(p.target_sale_price || "0"),
        originalPrice: parseFloat(p.target_original_price || "0"),
        currency: "USD",
        fetchedAt: new Date().toISOString(),
      });
    }

    coupons.sort((a, b) => {
      const aVal = parseFloat(a.discount?.replace(/[^0-9.]/g, '') || "0");
      const bVal = parseFloat(b.discount?.replace(/[^0-9.]/g, '') || "0");
      return bVal - aVal;
    });

    console.log(`Extracted ${coupons.length} unique coupon codes`);

    return new Response(
      JSON.stringify({ coupons, total: coupons.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Coupon fetch error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error", coupons: [], total: 0 }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
