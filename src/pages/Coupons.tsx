import { useState, useMemo } from "react";
import { ArrowLeft, Ticket, Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CouponCard, { type Coupon } from "@/components/CouponCard";
import CityScene3D from "@/components/CityScene3D";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import InayaAvatar from "@/components/InayaAvatar";

const Coupons = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");

  const { data: coupons, isLoading } = useQuery({
    queryKey: ["all-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("is_active", true)
        .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)
        .order("discount_percent", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });

  // Unique store names for filter
  const storeNames = useMemo(() => {
    if (!coupons) return ["all"];
    const names = new Set(coupons.map((c) => c.store_name));
    return ["all", ...Array.from(names).sort()];
  }, [coupons]);

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    if (!coupons) return [];
    let filtered = coupons;

    if (storeFilter !== "all") {
      filtered = filtered.filter((c) => c.store_name === storeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.description.toLowerCase().includes(q) ||
          c.store_name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [coupons, searchQuery, storeFilter]);

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
            <Ticket className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">{t("nav.couponSearch")}</span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20 relative z-10">
        <div className="container mx-auto px-4 py-6">
          {/* Welcome */}
          <div className="max-w-2xl mx-auto text-center mb-10">
            <InayaAvatar size="lg" className="mx-auto mb-4 shadow-glow" />
            <h1 className="text-3xl font-bold mb-2">Kuponkereső 🎟️</h1>
            <p className="text-muted-foreground">
              Keresd meg a legjobb kuponkódokat a partnerboltjainkból!
            </p>
          </div>

          {/* Search & Filters */}
          <div className="max-w-2xl mx-auto mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Keresés kuponok között..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-border bg-card/50 py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Store filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground mr-1">Áruház:</span>
              {storeNames.map((name) => (
                <button
                  key={name}
                  onClick={() => setStoreFilter(name)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    storeFilter === name
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {name === "all" ? "Mind" : name}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2" />
              {filteredCoupons.length} aktív kupon
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Kuponok betöltése...</span>
            </div>
          )}

          {/* Coupons Grid */}
          {!isLoading && filteredCoupons.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCoupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filteredCoupons.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <Ticket className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">Nincs találat</p>
              <p className="text-sm">Próbálj más keresési kifejezést vagy szűrőt!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Coupons;