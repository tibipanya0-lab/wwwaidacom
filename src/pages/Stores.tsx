import { useState, useMemo } from "react";
import { ArrowLeft, Store, Search, ExternalLink, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import DealCard from "@/components/DealCard";
import CityScene3D from "@/components/CityScene3D";
import LanguageSelector from "@/components/LanguageSelector";
import aliexpressLogo from "@/assets/aliexpress-logo.png";

// Map store names to local logos
const STORE_LOGOS: Record<string, string> = {
  AliExpress: aliexpressLogo,
};

const Stores = () => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  // Fetch real stores from DB (only those with products)
  const { data: dbStores } = useQuery({
    queryKey: ["stores-with-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("store_name");
      if (error) throw error;

      // Count products per store
      const counts: Record<string, number> = {};
      data.forEach((p) => {
        counts[p.store_name] = (counts[p.store_name] || 0) + 1;
      });

      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    },
  });

  // Fetch products for selected store
  const { data: storeProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["store-products", selectedStore],
    queryFn: async () => {
      if (!selectedStore) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_name", selectedStore)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStore,
  });

  const filteredStores = useMemo(() => {
    if (!dbStores) return [];
    if (!searchQuery.trim()) return dbStores;
    const q = searchQuery.toLowerCase();
    return dbStores.filter((s) => s.name.toLowerCase().includes(q));
  }, [dbStores, searchQuery]);

  const selectedStoreInfo = selectedStore
    ? dbStores?.find((s) => s.name === selectedStore)
    : null;

  const deals = useMemo(() => {
    if (!storeProducts) return [];
    return storeProducts.map((p) => ({
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
  }, [storeProducts]);

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
            <Store className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">{t("nav.stores")}</span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20 relative z-10">
        <div className="container mx-auto px-4 py-6">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("stores.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedStore(null);
                }}
                className="w-full rounded-full border border-border bg-card/50 py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </motion.div>

          {/* Selected store detail */}
          {selectedStoreInfo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <button
                onClick={() => setSelectedStore(null)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("stores.backToAll")}
              </button>

              <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl border border-primary/30 bg-card/80 backdrop-blur-sm">
                {STORE_LOGOS[selectedStoreInfo.name] ? (
                  <img
                    src={STORE_LOGOS[selectedStoreInfo.name]}
                    alt={selectedStoreInfo.name}
                    className="h-16 w-16 rounded-xl object-contain"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                    {selectedStoreInfo.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedStoreInfo.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedStoreInfo.count} termék az adatbázisban
                  </p>
                </div>
              </div>

              {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-80 rounded-2xl bg-muted/30 animate-pulse" />
                  ))}
                </div>
              ) : deals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deals.map((deal, index) => (
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
                      delay={index * 0.05}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">
                  {t("stores.noProducts")}
                </p>
              )}
            </motion.div>
          )}

          {/* Store Grid */}
          {!selectedStore && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredStores.map((store, index) => (
                  <motion.button
                    key={store.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    onClick={() => setSelectedStore(store.name)}
                    className="group relative flex flex-col items-center text-center rounded-2xl border border-primary/20 bg-card/80 dark:bg-black/60 backdrop-blur-sm p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="absolute right-3 top-3">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    {STORE_LOGOS[store.name] ? (
                      <img
                        src={STORE_LOGOS[store.name]}
                        alt={store.name}
                        className="mb-3 h-14 w-14 rounded-xl object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="mb-3 h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary transition-transform duration-300 group-hover:scale-110">
                        {store.name.charAt(0)}
                      </div>
                    )}
                    <h3 className="font-semibold text-foreground mb-1">{store.name}</h3>
                    <p className="text-xs text-muted-foreground">{store.count} termék</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="h-3 w-3" />
                      {t("stores.viewProducts")}
                    </div>
                  </motion.button>
                ))}
              </div>

              {filteredStores.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  {t("stores.noResults")}
                </div>
              )}

              <p className="text-center text-sm text-muted-foreground italic mt-8">
                Folyamatosan bővítjük a választékunkat!
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Stores;