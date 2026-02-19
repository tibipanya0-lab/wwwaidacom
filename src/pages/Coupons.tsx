import { useState, useMemo } from "react";
import { ArrowLeft, Ticket, Search, Copy, Check, ExternalLink, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CityScene3D from "@/components/CityScene3D";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import SEOHead from "@/components/SEOHead";

const Coupons = () => {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Only DB coupons - no external API calls
  const { data: dbCoupons = [], isLoading } = useQuery({
    queryKey: ["db-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("is_active", true)
        .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)
        .order("discount_percent", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const coupons = useMemo(() => dbCoupons, [dbCoupons]);

  const categories = useMemo(() => {
    const cats = new Set(coupons.map(c => c.category).filter(Boolean));
    return ["all", ...Array.from(cats).sort()];
  }, [coupons]);

  const filtered = useMemo(() => {
    let result = coupons;
    if (categoryFilter !== "all") result = result.filter(c => c.category === categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(c =>
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.store_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [coupons, categoryFilter, searchQuery]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, typeof coupons> = {};
    for (const c of filtered) {
      const cat = c.category || "Egyéb";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(c);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const handleCopy = (coupon: typeof coupons[0]) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const labels = {
    hu: { title: "Kuponok", subtitle: "Ellenőrzött kuponkódok az adatbázisunkból", search: "Keresés a kuponok között...", category: "Kategória:", all: "Összes", count: "aktív kupon", copyBuy: "MÁSOLÁS", copied: "MÁSOLVA! ✓", minOrder: "felett", noCoupons: "Jelenleg nincs elérhető kuponkód.", loading: "Kuponok betöltése..." },
    en: { title: "Coupons", subtitle: "Verified coupon codes from our database", search: "Search coupons...", category: "Category:", all: "All", count: "active coupons", copyBuy: "COPY", copied: "COPIED! ✓", minOrder: "min order", noCoupons: "No coupon codes available right now.", loading: "Loading coupons..." },
    uk: { title: "Купони", subtitle: "Перевірені купони з нашої бази даних", search: "Пошук купонів...", category: "Категорія:", all: "Усі", count: "активних купонів", copyBuy: "КОПІЮВАТИ", copied: "СКОПІЙОВАНО! ✓", minOrder: "мін. замовлення", noCoupons: "Наразі немає доступних купонів.", loading: "Завантаження купонів..." },
  };
  const l = labels[language] || labels.hu;

  return (
    <div className="min-h-screen flex flex-col relative">
      <SEOHead
        title={{
          hu: "Kuponok és kedvezmények",
          en: "Coupons & Discounts",
          uk: "Купони та знижки",
        }}
        description={{
          hu: "Működő kuponkódok és kedvezmények egy helyen. Spórolj minden vásárlásnál az Inaya AI kuponkeresővel!",
          en: "Working coupon codes and discounts in one place. Save on every purchase with Inaya AI!",
          uk: "Робочі купони та знижки в одному місці. Заощаджуйте з кожною покупкою з Inaya AI!",
        }}
        canonical="/kuponok"
      />
      <CityScene3D />

      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium hidden sm:inline">{t("search.back")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">{l.title}</span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20 relative z-10">
        <div className="container mx-auto px-4 py-6">
          {/* Hero */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2">🎟️ {l.title}</h1>
            <p className="text-muted-foreground text-sm">{l.subtitle}</p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={l.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-border bg-card/50 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground mr-1">{l.category}</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                    categoryFilter === cat ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat === "all" ? l.all : cat}
                </button>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2" />
              {filtered.length} {l.count}
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-2xl" />
              ))}
            </div>
          )}

          {/* Grouped Coupons */}
          {!isLoading && grouped.length > 0 && (
            <div className="space-y-10">
              {grouped.map(([category, items]) => (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-4">
                    <Tag className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">{category}</h2>
                    <span className="text-xs text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5">{items.length}</span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map(coupon => (
                      <div
                        key={coupon.id}
                        className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-card/80 backdrop-blur-sm transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10"
                      >
                        <div className="p-5">
                          {/* Discount badge */}
                          {(coupon.discount_percent || coupon.discount_amount) && (
                            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-sm font-bold text-primary">
                              🏷️ {coupon.discount_percent ? `-${coupon.discount_percent}%` : coupon.discount_amount}
                              {coupon.min_order_amount ? ` (${l.minOrder} $${coupon.min_order_amount})` : ""}
                            </div>
                          )}

                          {/* Store + description */}
                          <p className="text-xs text-muted-foreground mb-1 font-medium">{coupon.store_name}</p>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{coupon.description}</p>

                          {/* Coupon code - BIG */}
                          <div className="mb-4 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-3 text-center">
                            <code className="text-2xl font-mono font-black text-primary tracking-wider">{coupon.code}</code>
                          </div>

                          {/* CTA */}
                          <button
                            onClick={() => handleCopy(coupon)}
                            className={`w-full flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
                              copiedId === coupon.id
                                ? "bg-green-500 text-white"
                                : "bg-primary text-primary-foreground hover:brightness-110"
                            }`}
                          >
                            {copiedId === coupon.id ? (
                              <><Check className="h-4 w-4" /> {l.copied}</>
                            ) : (
                              <><Copy className="h-4 w-4" /> {l.copyBuy}</>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <Ticket className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">{l.noCoupons}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Coupons;