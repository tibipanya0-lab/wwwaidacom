import { useState, useMemo, useCallback } from "react";
import { ArrowLeft, Flame, ArrowDownWideNarrow, TrendingDown, Search, ExternalLink, ShoppingBag, Tag, Copy, Check, RefreshCw, Loader2, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CityScene3D from "@/components/CityScene3D";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

interface HotProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  currency: string;
  image_url: string | null;
  affiliate_url: string | null;
  store_name: string;
  discount: number;
  rating: number | null;
  orders: number;
  category: string;
  categoryId: string | null;
  hasCoupon?: boolean;
  couponCode?: string | null;
  couponDiscount?: string | null;
}

type SortOption = "popular" | "discount" | "price";

const HOT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aliexpress-hot-products`;

const Deals = () => {
  const { language, t } = useLanguage();
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["hot-products", language],
    queryFn: async () => {
      const res = await fetch(HOT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      if (!res.ok) throw new Error("Nem sikerült betölteni");
      return (await res.json()) as { products: HotProduct[]; total: number };
    },
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const products = data?.products || [];

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ["all", ...Array.from(cats).sort()];
  }, [products]);

  const sorted = useMemo(() => {
    let filtered = products;
    if (categoryFilter !== "all") filtered = filtered.filter(p => p.category === categoryFilter);
    
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
    }
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "discount": return b.discount - a.discount;
        case "price": return a.price - b.price;
        case "popular":
        default: return (b.orders || 0) - (a.orders || 0);
      }
    });
  }, [products, sortBy, searchQuery, categoryFilter]);

  const formatPrice = useCallback((price: number, currency: string) =>
    new Intl.NumberFormat("hu-HU", { style: "currency", currency, maximumFractionDigits: 0 }).format(price), []);

  return (
    <div className="min-h-screen flex flex-col relative">
      <CityScene3D />

      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium hidden sm:inline">{t("search.back")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">Best of AliExpress</span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container mx-auto px-4 py-6">
          {/* Hero */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2">🔥 Legjobb Akciók</h1>
            <p className="text-muted-foreground text-sm">Változatos válogatás · Minimum 30% kedvezmény · Eladások és értékelés alapján</p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Keresés az akciók között..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-border bg-card/50 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                Frissítés
              </button>
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground mr-1">Kategória:</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                    categoryFilter === cat ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat === "all" ? "Összes" : cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground mr-1">Rendezés:</span>
              {([
                { key: "popular" as const, label: "Legnépszerűbb", icon: Flame },
                { key: "discount" as const, label: "Legnagyobb kedvezmény", icon: ArrowDownWideNarrow },
                { key: "price" as const, label: "Legolcsóbb", icon: TrendingDown },
              ]).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                    sortBy === key ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />{label}
                </button>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2" />
              {sorted.length} akciós termék · Élő AliExpress adatok
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          )}

          {/* List View */}
          {!isLoading && sorted.length > 0 && (
            <div className="flex flex-col gap-3">
              {sorted.map((product, idx) => (
                <div
                  key={`${product.id}-${idx}`}
                  className={`group flex flex-col sm:flex-row overflow-hidden rounded-2xl border bg-card/80 backdrop-blur-sm transition-all hover:shadow-lg ${
                    product.discount >= 60 ? "border-orange-500/50 shadow-orange-500/10" : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  {/* Image */}
                  <a
                    href={product.affiliate_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="relative shrink-0 w-full sm:w-44 md:w-52 aspect-square sm:aspect-auto sm:h-auto overflow-hidden bg-muted"
                  >
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground min-h-[10rem]">
                        <ShoppingBag className="h-10 w-10" />
                      </div>
                    )}
                    <span className={`absolute top-2 left-2 rounded-lg px-2 py-0.5 text-xs font-bold shadow-sm ${
                      product.discount >= 60 ? "bg-orange-500 text-white animate-pulse" : "bg-destructive text-destructive-foreground"
                    }`}>
                      -{product.discount}%
                      {product.discount >= 60 && " 🔥"}
                    </span>
                  </a>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-4 gap-3 min-w-0">
                    {/* Category badge */}
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary/70 truncate">
                      {product.category}
                    </span>

                    {/* Name */}
                    <a href={product.affiliate_url || "#"} target="_blank" rel="noopener noreferrer nofollow" className="hover:underline">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base leading-snug line-clamp-2">{product.name}</h3>
                    </a>

                    {/* Price + stats */}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="text-xl font-bold text-primary">{formatPrice(product.price, product.currency)}</p>
                      {product.originalPrice > product.price && (
                        <p className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice, product.currency)}</p>
                      )}
                      {product.orders > 0 && (
                        <span className="text-xs text-muted-foreground">· {product.orders.toLocaleString("hu-HU")}+ eladva</span>
                      )}
                      {product.rating != null && product.rating > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          · <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {(product.rating / 20).toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* Shipping + Coupon row */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2 sm:flex-1">
                        <span className="text-base">🚚</span>
                        <span className="text-xs sm:text-sm text-muted-foreground">Várható szállítás: ~15-25 nap</span>
                      </div>

                      {/* Coupon section */}
                      {product.couponCode ? (
                        <div
                          className="flex items-center gap-2 rounded-lg border-2 border-dashed border-orange-400/60 bg-orange-500/10 px-3 py-2 sm:flex-1 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigator.clipboard.writeText(product.couponCode!);
                            setCopiedId(product.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                        >
                          <Tag className="h-4 w-4 shrink-0 text-orange-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-orange-500">Kuponkód:</p>
                            <code className="text-sm font-mono font-bold text-foreground truncate block">{product.couponCode}</code>
                          </div>
                          <button className="shrink-0 flex items-center gap-1 rounded-lg bg-orange-500 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-orange-600">
                            {copiedId === product.id ? <><Check className="h-3 w-3" /> Másolva!</> : <><Copy className="h-3 w-3" /> Másolás</>}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2 sm:flex-1">
                          <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="text-xs sm:text-sm text-muted-foreground">Ehhez a termékhez nincs kuponkód</span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-auto">
                      <a
                        href={product.affiliate_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:brightness-110"
                      >
                        MEGNÉZEM <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && sorted.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              {isFetching ? (
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              ) : (
                "Nincs találat a szűrésre. Próbálj más kategóriát!"
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Deals;
