import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Truck, ExternalLink, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ProductChatWidget from "@/components/ProductChatWidget";
import { ApiProduct } from "@/lib/api";

import { API_BASE } from "@/lib/api";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // Try DB first, then Meilisearch fallback
    fetch(`${API_BASE}/api/v1/products/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        setProduct({
          id: data.id, title: data.title || data.name || "", price: data.price ?? data.min_price ?? 0,
          currency: data.currency || "HUF", image_url: data.image_url, affiliate_url: data.affiliate_url,
          store_name: data.store_name || data.best_store || "Áruház", rating: data.rating,
          review_count: data.review_count, shipping_days: data.shipping_days,
          shipping_cost: data.shipping_cost, category: data.category || data.category_name,
          discount: data.discount, original_price: data.original_price,
        });
        setLoading(false);
      })
      .catch(() => {
        // Fallback: Meilisearch by ID
        fetch(`${API_BASE}/api/v1/search/?q=${id}&limit=5`)
          .then(r => r.json())
          .then(data => {
            const hit = (data.hits || []).find((h: any) => String(h.id) === String(id));
            if (hit) {
              setProduct({
                id: hit.id, title: hit.name || "", price: hit.min_price ?? 0,
                currency: hit.currency || "HUF", image_url: hit.image_url,
                affiliate_url: hit.affiliate_url || null,
                store_name: hit.best_store || (hit.stores && hit.stores[0]) || "Áruház",
                rating: null, review_count: null, shipping_days: null,
                shipping_cost: null, category: hit.category_name || null,
                discount: null, original_price: null,
              });
              setLoading(false);
            } else {
              setError(true); setLoading(false);
            }
          })
          .catch(() => { setError(true); setLoading(false); });
      });
  }, [id]);

  const starRating = product?.rating ? (product.rating > 5 ? product.rating / 20 : product.rating) : 0;

  return (
    <div className="min-h-screen relative">
      <SEOHead
        title={{ hu: product?.title || "Termék", en: product?.title || "Product", uk: product?.title || "Товар" }}
        description={{
          hu: product ? `${product.title} – ${product.price} ${product.currency} | ${product.store_name} | Inaya árösszehasonlítás` : "",
          en: product ? `${product.title} – ${product.price} ${product.currency} | ${product.store_name} | Inaya price comparison` : "",
          uk: product ? `${product.title} – ${product.price} ${product.currency} | ${product.store_name}` : "",
        }}
        canonical={`/termek/${id}`}
        type="product"
        breadcrumbs={[
          { name: "Főoldal", url: "/" },
          { name: "Termékek", url: "/termekek" },
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

      <main className="container mx-auto px-4 py-8">
        <Link to="/termekek" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Vissza a termékekhez</span>
        </Link>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        ) : error || !product ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-xl font-bold mb-2">Termék nem található</h2>
            <p className="text-muted-foreground mb-4">Ez a termék nem elérhető vagy nem létezik.</p>
            <Link to="/termekek">
              <Button variant="outline">Vissza a termékekhez</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="rounded-xl overflow-hidden border border-border bg-card aspect-[3/4]">
              {product.image_url ? (
                <img src={product.image_url} alt={product.title} className="h-full w-full object-contain p-3" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/30">
                  <ShoppingBag className="h-20 w-20 text-muted-foreground/20" />
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-3">
                {product.store_name}
              </span>
              <h1 className="text-lg md:text-xl font-bold mb-3">{product.title}</h1>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-xl font-bold text-primary">{product.price} {product.currency}</span>
                {product.original_price && (
                  <span className="text-lg text-muted-foreground line-through">{product.original_price} {product.currency}</span>
                )}
                {product.discount && (
                  <span className="rounded-full bg-deal px-2 py-0.5 text-xs font-bold text-deal-foreground">{product.discount}</span>
                )}
              </div>

              {starRating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{starRating.toFixed(1)}</span>
                  {product.review_count && <span className="text-muted-foreground">({product.review_count} vélemény)</span>}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Truck className="h-4 w-4" />
                <span>Szállítás: {product.shipping_days || "~15-25 nap"}</span>
                {product.shipping_cost && <span>• {product.shipping_cost}</span>}
              </div>

              {product.affiliate_url && (
                <Button variant="hero" size="lg" className="gap-2" onClick={() => window.open(product.affiliate_url!, "_blank")}>
                  Megnézem az áruházban
                  <ExternalLink className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Chat widget */}
      {product && id && <ProductChatWidget productId={id} productTitle={product.title} />}
    </div>
  );
};

export default ProductDetail;
