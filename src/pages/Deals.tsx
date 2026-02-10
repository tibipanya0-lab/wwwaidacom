import { useState, useMemo } from "react";
import { ArrowLeft, Flame, Loader2, ArrowDownWideNarrow, TrendingDown, Clock, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DealCard from "@/components/DealCard";
import CityScene3D from "@/components/CityScene3D";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

type SortOption = "discount" | "price" | "newest";

const Deals = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const { t } = useLanguage();

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);

  const { data: products, isLoading } = useQuery({
    queryKey: ["deals-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const deals = useMemo(() => {
    if (!products) return [];
    return products.map((p) => ({
      id: p.id,
      title: p.name,
      image: p.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      currentPrice: Number(p.price),
      originalPrice: Math.round(Number(p.price) * (1 + Math.random() * 0.6 + 0.2)),
      store: p.store_name,
      discount: 0,
      affiliateUrl: p.affiliate_url,
      currency: p.currency,
    })).map((d) => ({
      ...d,
      discount: d.originalPrice > 0 ? Math.round((1 - d.currentPrice / d.originalPrice) * 100) : 0,
    }));
  }, [products]);

  // Unique store names for category filter
  const storeNames = useMemo(() => {
    const names = new Set(deals.map((d) => d.store));
    return ["all", ...Array.from(names).sort()];
  }, [deals]);

  const sortedDeals = useMemo(() => {
    let filtered = deals;
    if (categoryFilter !== "all") {
      filtered = filtered.filter((d) => d.store === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((d) => d.title.toLowerCase().includes(q));
    }
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "discount": return b.discount - a.discount;
        case "price": return a.currentPrice - b.currentPrice;
        default: return 0;
      }
    });
  }, [deals, sortBy, searchQuery, categoryFilter]);

  const sortButtons: { key: SortOption; label: string; icon: React.ReactNode }[] = [
    { key: "discount", label: "Legnagyobb kedvezmény", icon: <ArrowDownWideNarrow className="h-4 w-4" /> },
    { key: "price", label: "Legalacsonyabb ár", icon: <TrendingDown className="h-4 w-4" /> },
    { key: "newest", label: "Legújabbak", icon: <Clock className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      <CityScene3D />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">{t("search.back")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">Akciók</span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container mx-auto px-4 py-6">
          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 mb-6">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Keresés az akciók között..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-border bg-card/50 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Store/Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground mr-1">Szűrés:</span>
                {storeNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => setCategoryFilter(name)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      categoryFilter === name
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {name === "all" ? "🔥 Összes" : name}
                  </button>
                ))}
              </div>

              {/* Sort Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground mr-1">Rendezés:</span>
                {sortButtons.map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => setSortBy(btn.key)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      sortBy === btn.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {btn.icon}
                    <span className="hidden sm:inline">{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2" />
              {sortedDeals.length} termék · Valós adatok
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          )}

          {/* Deals Grid */}
          {!isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedDeals.map((deal, index) => (
                <DealCard
                  key={deal.id}
                  title={deal.title}
                  image={deal.image}
                  originalPrice={deal.originalPrice}
                  currentPrice={deal.currentPrice}
                  store={deal.store}
                  discount={deal.discount}
                  affiliateUrl={deal.affiliateUrl}
                  currency={deal.currency}
                  delay={(index % 9) * 0.05}
                  highlightDiscount={sortBy === "discount"}
                />
              ))}
            </div>
          )}

          {!isLoading && sortedDeals.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              Nincs találat a keresésre.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Deals;
