import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Truck, ExternalLink, ShoppingBag, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ProductChatWidget from "@/components/ProductChatWidget";
import { ApiProduct, searchProducts } from "@/lib/api";
import { Link } from "react-router-dom";

function appendRefToUrl(url: string): string {
  try {
    const ref = localStorage.getItem("inaya_ref");
    if (!ref) return url;
    const sep = url.includes("?") ? "&" : "?";
    const enc = encodeURIComponent(ref);
    if (url.includes("jdoqocy.com") || url.includes("anrdoezrs.net") || url.includes("dpbolvw.net") || url.includes("tkqlhce.com"))
      return url + sep + "sid=" + enc;
    if (url.includes("affiliateport.eu")) {
      const m = url.match(/([?&]deep_link=)([^&]*)/);
      if (m) {
        const isEncoded = m[2].includes("%3A%2F%2F") || m[2].includes("%3F");
        const dlSep = isEncoded ? (m[2].includes("%3F") ? "%26" : "%3F") : (m[2].includes("?") ? "&" : "?");
        const subParam = isEncoded ? "aff_sub%3D" : "aff_sub=";
        return url.replace(m[0], m[1] + m[2] + dlSep + subParam + enc);
      }
      return url + sep + "aff_sub=" + enc;
    }
    if (url.includes("tradetracker.net")) return url + sep + "r=" + enc;
    if (url.includes("aliexpress.com")) return url + sep + "aff_fsk=" + enc;
    if (url.includes("ebay.com") || url.includes("rover.ebay")) return url + sep + "customid=" + enc;
    return url + sep + "sid=" + enc;
  } catch { return url; }
}

import { API_BASE } from "@/lib/api";

const storeLogoUrl = (name: string) => {
  const s = name.toLowerCase();
  if (s.includes("answear")) return "https://www.google.com/s2/favicons?domain=answear.hu&sz=32";
  if (s.includes("geekbuying")) return "https://www.google.com/s2/favicons?domain=geekbuying.com&sz=32";
  if (s.includes("aliexpress")) return "https://www.google.com/s2/favicons?domain=aliexpress.com&sz=32";
  if (s.includes("ebay")) return "https://www.google.com/s2/favicons?domain=ebay.com&sz=32";
  if (s.includes("notino")) return "https://www.google.com/s2/favicons?domain=notino.hu&sz=32";
  if (s.includes("douglas")) return "https://www.google.com/s2/favicons?domain=douglas.hu&sz=32";
  if (s.includes("vivantis")) return "https://www.google.com/s2/favicons?domain=vivantis.hu&sz=32";
  if (s.includes("vitapur")) return "https://www.google.com/s2/favicons?domain=vitapur.hu&sz=32";
  if (s.includes("ledfeny")) return "https://www.google.com/s2/favicons?domain=ledfenyforrasok.hu&sz=32";
  return "";
};

const SimilarCard = ({ product }: { product: ApiProduct }) => {
  const starRating = product.rating ? (product.rating > 5 ? product.rating / 20 : product.rating) : 0;
  return (
    <Link
      to={`/termek/${product.id}`}
      className="group relative overflow-hidden rounded-lg border border-[rgba(212,160,23,0.15)] bg-[rgba(0,0,0,0.3)] transition-all hover:border-[rgba(212,160,23,0.5)] hover:shadow-lg hover:shadow-[rgba(212,160,23,0.05)] block"
    >
      {product.discount && (
        <div className="absolute left-1.5 top-1.5 z-10 rounded-full bg-red-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
          -{product.discount}
        </div>
      )}
      <div className="relative aspect-square overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.title} className="h-full w-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag className="h-6 w-6 text-[rgba(212,160,23,0.2)]" />
          </div>
        )}
      </div>
      <div className="p-2">
        <div className="flex items-center gap-1 mb-1">
          {storeLogoUrl(product.store_name) && <img src={storeLogoUrl(product.store_name)} alt="" className="h-2.5 w-2.5 rounded-sm" />}
          <span className="text-[9px] text-[rgba(212,160,23,0.6)]">{product.store_name}</span>
        </div>
        <h3 className="line-clamp-2 text-[10px] font-medium leading-tight text-white/80 mb-1">{product.title}</h3>
        <span className="text-xs font-bold text-[#f0d060]">{product.price} {product.currency}</span>
        {starRating > 0 && (
          <div className="flex items-center gap-0.5 mt-0.5">
            <Star className="h-2.5 w-2.5 fill-[#f0d060] text-[#f0d060]" />
            <span className="text-[9px] text-white/40">{starRating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [similar, setSimilar] = useState<ApiProduct[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setSimilar([]);

    const mapHit = (h: any): ApiProduct => {
      const p0 = h.prices?.[0];
      return {
        id: h.id,
        title: h.title || h.name || "",
        price: h.price ?? p0?.price ?? h.min_price ?? 0,
        currency: h.currency || p0?.currency || "HUF",
        image_url: h.image_url,
        affiliate_url: h.affiliate_url || p0?.affiliate_url || null,
        store_name: h.store_name || p0?.store?.name || h.best_store || (h.stores && h.stores[0]) || "",
        rating: h.rating || null,
        review_count: h.review_count || null,
        shipping_days: h.shipping_days || null,
        shipping_cost: h.shipping_cost || null,
        category: h.category || h.category_name || null,
        discount: h.discount || null,
        original_price: h.original_price || null,
      };
    };

    const cached = localStorage.getItem("product_" + id);
    if (cached) {
      try {
        const p = mapHit(JSON.parse(cached));
        setProduct(p);
        setLoading(false);
        localStorage.removeItem("product_" + id);
        loadSimilar(p.title, p.id);
        return;
      } catch {}
    }

    fetch(`${API_BASE}/api/v1/products/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        const p = mapHit(data);
        setProduct(p);
        setLoading(false);
        loadSimilar(p.title, p.id);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [id]);

  const loadSimilar = async (title: string, currentId: string) => {
    try {
      const words = title.split(/\s+/).slice(0, 3).join(" ");
      const results = await searchProducts(words);
      setSimilar(results.filter(p => String(p.id) !== String(currentId)).slice(0, 12));
    } catch {}
  };

  const starRating = product?.rating ? (product.rating > 5 ? product.rating / 20 : product.rating) : 0;
  const logo = product ? storeLogoUrl(product.store_name) : "";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen relative">
      <SEOHead
        title={{ hu: product?.title || "Termek", en: product?.title || "Product", uk: product?.title || "Tovar" }}
        description={{
          hu: product ? `${product.title} - ${product.price} ${product.currency} | ${product.store_name}` : "",
          en: product ? `${product.title} - ${product.price} ${product.currency} | ${product.store_name}` : "",
          uk: product ? `${product.title} - ${product.price} ${product.currency} | ${product.store_name}` : "",
        }}
        canonical={`/termek/${id}`}
        type="product"
        breadcrumbs={[
          { name: "Fooldal", url: "/" },
          { name: "Termekek", url: "/termekek" },
          ...(product ? [{ name: product.title, url: `/termek/${id}` }] : []),
        ]}
        jsonLd={product ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          image: product.image_url || undefined,
          description: product.title,
          brand: { "@type": "Brand", name: product.store_name },
          offers: {
            "@type": "Offer",
            url: product.affiliate_url || `https://inaya.hu/termek/${id}`,
            priceCurrency: product.currency === "Ft" ? "HUF" : product.currency,
            price: product.price,
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: product.store_name },
          },
          ...(starRating > 0 ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: starRating.toFixed(1),
              bestRating: "5",
              ...(product.review_count ? { reviewCount: product.review_count } : { ratingCount: "1" }),
            }
          } : {}),
        } : undefined}
      />
      <Header />

      <main className="container mx-auto px-3 py-4 max-w-md">
        {/* Back button - goes to previous page */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-[rgba(212,160,23,0.7)] hover:text-[#f0d060] mb-3 transition-colors text-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Vissza</span>
        </button>

        {loading ? (
          <div className="rounded-xl border border-[rgba(212,160,23,0.15)] bg-[rgba(0,0,0,0.3)] p-3">
            <div className="flex gap-3">
              <Skeleton className="w-28 h-28 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          </div>
        ) : error || !product ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-10 w-10 mx-auto mb-2 text-[rgba(212,160,23,0.2)]" />
            <h2 className="text-sm font-bold mb-1 text-white/70">Termek nem talalhato</h2>
            <button onClick={handleBack} className="text-xs text-[rgba(212,160,23,0.7)] hover:text-[#f0d060] mt-2">
              Vissza
            </button>
          </div>
        ) : (
          <>
            {/* Compact product card */}
            <div className="rounded-xl border border-[rgba(212,160,23,0.2)] bg-[rgba(0,0,0,0.35)] overflow-hidden hover:border-[rgba(212,160,23,0.4)] transition-all">
              <div className="flex">
                {/* Small image */}
                <div className="w-24 sm:w-28 flex-shrink-0 bg-white/5 flex items-center justify-center">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} className="w-full h-24 sm:h-28 object-contain p-1.5" />
                  ) : (
                    <ShoppingBag className="h-8 w-8 text-[rgba(212,160,23,0.15)]" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
                  <div>
                    {/* Store badge */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {logo && <img src={logo} alt="" className="h-3 w-3 rounded-sm" />}
                      <span className="text-[10px] font-medium text-[rgba(212,160,23,0.7)]">{product.store_name}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-sm font-semibold text-white/90 leading-snug mb-2 line-clamp-2">{product.title}</h1>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className="text-lg font-bold text-[#f0d060]">{product.price} {product.currency}</span>
                      {product.original_price && (
                        <span className="text-xs text-white/30 line-through">{product.original_price} {product.currency}</span>
                      )}
                      {product.discount && (
                        <span className="rounded-full bg-red-500/80 px-1.5 py-0.5 text-[9px] font-bold text-white">-{product.discount}</span>
                      )}
                    </div>

                    {/* Rating */}
                    {starRating > 0 && (
                      <div className="flex items-center gap-1 mb-1.5">
                        <Star className="h-3 w-3 fill-[#f0d060] text-[#f0d060]" />
                        <span className="text-[11px] text-white/50">{starRating.toFixed(1)}</span>
                        {product.review_count && <span className="text-[10px] text-white/30">({product.review_count})</span>}
                      </div>
                    )}

                    {/* Shipping */}
                    <div className="flex items-center gap-1 text-[10px] text-white/30 mb-2">
                      <Truck className="h-3 w-3" />
                      <span>{product.shipping_days || "~15-25 nap"}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  {product.affiliate_url && (
                    <button
                      onClick={() => window.open(appendRefToUrl(product.affiliate_url!), "_blank")}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all
                        bg-gradient-to-r from-[#d4a017] to-[#f0d060] text-black hover:from-[#e0b020] hover:to-[#f5da70]
                        shadow-[0_0_12px_rgba(212,160,23,0.2)] hover:shadow-[0_0_20px_rgba(212,160,23,0.35)]
                        w-full sm:w-auto"
                    >
                      Megvasarlom
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Similar products */}
            {similar.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-bold text-[rgba(212,160,23,0.8)] uppercase tracking-wider mb-3" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  Hasonlo termekek
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {similar.map(p => <SimilarCard key={p.id} product={p} />)}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {product && id && <ProductChatWidget productId={id} productTitle={product.title} />}
    </div>
  );
};

export default ProductDetail;
