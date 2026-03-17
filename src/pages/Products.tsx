import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Star, Truck, ExternalLink, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { fetchProductsMeili, fetchProductsApi, ApiProduct } from "@/lib/api";

const storeLogoUrl = (name: string) => {
  const s = name.toLowerCase();
  if (s.includes("answear")) return "https://www.google.com/s2/favicons?domain=answear.hu&sz=32";
  if (s.includes("geekbuying")) return "https://www.google.com/s2/favicons?domain=geekbuying.com&sz=32";
  if (s.includes("aliexpress")) return "https://www.google.com/s2/favicons?domain=aliexpress.com&sz=32";
  if (s.includes("ebay")) return "https://www.google.com/s2/favicons?domain=ebay.com&sz=32";
  return "";
};

const ProductGridCard = ({ product }: { product: ApiProduct }) => {
  const starRating = product.rating ? (product.rating > 5 ? product.rating / 20 : product.rating) : 0;

  return (
    <Link
      to={`/termek/${product.id}`}
      className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 block"
    >
      {product.discount && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-deal px-2 py-1 text-xs font-bold text-deal-foreground">
          <Tag className="h-3 w-3" />
          {product.discount}
        </div>
      )}

      <div className="relative aspect-[3/4] overflow-hidden bg-muted/30">
        {product.image_url ? (
          <img src={product.image_url} alt={product.title} className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="p-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mb-2">
          {storeLogoUrl(product.store_name) && <img src={storeLogoUrl(product.store_name)} alt="" className="h-3.5 w-3.5 rounded-sm" />}
          {product.store_name}
        </span>
        <h3 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug">{product.title}</h3>
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">{product.price} {product.currency}</span>
          {product.original_price && (
            <span className="text-sm text-muted-foreground line-through">{product.original_price} {product.currency}</span>
          )}
        </div>
        {starRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs text-muted-foreground">{starRating.toFixed(1)} {product.review_count ? `(${product.review_count})` : ""}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Truck className="h-3.5 w-3.5 shrink-0" />
          <span>{product.shipping_days || "~15-25 nap"}</span>
        </div>
      </div>
    </Link>
  );
};

const SkeletonCard = () => (
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    <Skeleton className="aspect-square w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-5 w-24" />
    </div>
  </div>
);

const Products = () => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [meiliOffset, setMeiliOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const seenIds = useRef(new Set<string>());
  const observerRef = useRef<HTMLDivElement>(null);

  const addUnique = useCallback((prev: ApiProduct[], newItems: ApiProduct[]) => {
    const unique = newItems.filter(p => {
      const key = String(p.id);
      if (seenIds.current.has(key)) return false;
      seenIds.current.add(key);
      return true;
    });
    return [...prev, ...unique];
  }, []);

  // Phase 1: Meili (fast) - infinite scroll source
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const data = await fetchProductsMeili(meiliOffset);
      setProducts(prev => addUnique(prev, data.items));
      setMeiliOffset(data.offset ?? meiliOffset + data.items.length);
      setHasMore(data.has_more ?? false);
    } catch (err) {
      console.error("Meili load failed:", err);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setInitialLoad(false);
    }
  }, [meiliOffset, isLoading, hasMore, addUnique]);

  // Initial load: parallel Meili searches for store diversity
  useEffect(() => {
    const doLoad = async () => {
      setIsLoading(true);
      try {
        // Each fetch is individually error-safe
        const safeFetch = (q: string, limit: number) =>
          fetchProductsMeili(0, limit, q).catch(() => ({ items: [], offset: 0, has_more: false } as any));

        const [general, answear, geekbuying] = await Promise.all([
          safeFetch("*", 20),
          safeFetch("answear", 10),
          safeFetch("geekbuying", 10),
        ]);

        console.log("Products loaded:", {
          general: general.items.length,
          answear: answear.items.length,
          geekbuying: geekbuying.items.length,
        });

        // Interleave: store-specific first, then general fills the rest
        const mixed = addUnique([], [
          ...answear.items,
          ...geekbuying.items,
          ...general.items,
        ]);
        setProducts(mixed);
        setMeiliOffset(general.offset ?? 20);
        setHasMore(general.has_more ?? false);
      } catch (err) {
        console.error("Initial load failed:", err);
      } finally {
        setIsLoading(false);
        setInitialLoad(false);
      }
    };
    doLoad();
  }, []);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && hasMore && !isLoading) loadMore(); },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  return (
    <div className="min-h-screen relative">
      <SEOHead
        title={{ hu: "Termékek - Inaya", en: "Products - Inaya", uk: "Товари - Inaya", ro: "Produse - Inaya", de: "Produkte - Inaya" }}
        description={{ hu: "Böngéssz a legjobb ajánlatok között AliExpress, eBay áruházakból.", en: "Browse the best offers from AliExpress, eBay.", uk: "Переглядайте найкращі пропозиції з AliExpress, eBay.", ro: "Răsfoiește cele mai bune oferte de pe AliExpress, eBay.", de: "Durchsuchen Sie die besten Angebote von AliExpress, eBay." }}
        canonical="/termekek"
        breadcrumbs={[{ name: "Főoldal", url: "/" }, { name: "Termékek", url: "/termekek" }]}
      />
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Termékek</h1>
          <p className="text-muted-foreground">Böngéssz a legfrissebb ajánlatok között</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {initialLoad
            ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map(p => <ProductGridCard key={p.id} product={p} />)
          }
        </div>

        {/* Infinite scroll trigger */}
        <div ref={observerRef} className="py-8 flex justify-center">
          {isLoading && !initialLoad && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Töltés...</span>
            </div>
          )}
          {!hasMore && products.length > 0 && (
            <p className="text-sm text-muted-foreground">Nincs több termék</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
