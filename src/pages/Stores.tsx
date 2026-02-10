import { useState, useMemo } from "react";
import { ArrowLeft, Store, Search, ExternalLink, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PARTNER_STORES } from "@/lib/partnerStores";
import { useLanguage } from "@/contexts/LanguageContext";
import DealCard from "@/components/DealCard";
import CityScene3D from "@/components/CityScene3D";
import LanguageSelector from "@/components/LanguageSelector";

// Demo products mapped to stores
const storeProducts: Record<string, { title: string; image: string; originalPrice: number; currentPrice: number; discount: number; rating: number; category: string }[]> = {
  temu: [
    { title: "Vezeték nélküli Bluetooth fülhallgató TWS", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop", originalPrice: 15990, currentPrice: 4990, discount: 69, rating: 4.8, category: "tech" },
    { title: "Laptop hátizsák USB töltőporttal", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop", originalPrice: 18990, currentPrice: 6990, discount: 63, rating: 4.7, category: "tech" },
    { title: "Bluetooth hangszóró hordozható", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop", originalPrice: 12990, currentPrice: 4490, discount: 65, rating: 4.6, category: "tech" },
  ],
  aliexpress: [
    { title: "Elegáns férfi karóra minimalista számlappal", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop", originalPrice: 29990, currentPrice: 8990, discount: 70, rating: 4.5, category: "fashion" },
    { title: "Powerbank 20000mAh gyorstöltő", image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop", originalPrice: 14990, currentPrice: 5490, discount: 63, rating: 4.4, category: "tech" },
    { title: "USB-C hub multiport adapter", image: "https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400&h=400&fit=crop", originalPrice: 11990, currentPrice: 4990, discount: 58, rating: 4.3, category: "tech" },
  ],
  shein: [
    { title: "Női nyári ruha virágmintás A-vonalú", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop", originalPrice: 12990, currentPrice: 3990, discount: 69, rating: 4.6, category: "fashion" },
    { title: "Férfi slim fit póló pamut", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop", originalPrice: 8990, currentPrice: 2990, discount: 67, rating: 4.5, category: "fashion" },
    { title: "Női táska crossbody elegáns", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop", originalPrice: 15990, currentPrice: 5990, discount: 63, rating: 4.7, category: "fashion" },
  ],
  alza: [
    { title: "Samsung Galaxy A54 5G 128GB", image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop", originalPrice: 169990, currentPrice: 119990, discount: 29, rating: 4.9, category: "tech" },
    { title: "Apple AirPods Pro 2. generáció", image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop", originalPrice: 99990, currentPrice: 79990, discount: 20, rating: 4.9, category: "tech" },
    { title: "Gaming headset RGB világítás", image: "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop", originalPrice: 24990, currentPrice: 14990, discount: 40, rating: 4.6, category: "tech" },
  ],
  amazon: [
    { title: "Vezeték nélküli egér ergonomikus", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop", originalPrice: 12990, currentPrice: 6990, discount: 46, rating: 4.7, category: "tech" },
    { title: "Könyv bestseller regény", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop", originalPrice: 5990, currentPrice: 3490, discount: 42, rating: 4.8, category: "other" },
    { title: "Kávéfőző kapszulás", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop", originalPrice: 34990, currentPrice: 24990, discount: 29, rating: 4.6, category: "home" },
  ],
  ebay: [
    { title: "Napszemüveg UV400 védelem", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop", originalPrice: 9990, currentPrice: 3990, discount: 60, rating: 4.4, category: "fashion" },
    { title: "Sneaker cipő divatos fehér", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop", originalPrice: 24990, currentPrice: 12990, discount: 48, rating: 4.5, category: "fashion" },
    { title: "Bőr pénztárca RFID védett", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop", originalPrice: 11990, currentPrice: 5990, discount: 50, rating: 4.3, category: "gift" },
  ],
  emag: [
    { title: "LED asztali lámpa dimmelhető", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop", originalPrice: 9990, currentPrice: 5990, discount: 40, rating: 4.5, category: "home" },
    { title: "Robotporszívó okos navigációval", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop", originalPrice: 89990, currentPrice: 59990, discount: 33, rating: 4.7, category: "home" },
    { title: "Tablet állvány állítható", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop", originalPrice: 7990, currentPrice: 3990, discount: 50, rating: 4.4, category: "tech" },
  ],
  decathlon: [
    { title: "Jóga matrac csúszásmentes", image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop", originalPrice: 8990, currentPrice: 4990, discount: 44, rating: 4.6, category: "sport" },
    { title: "Futócipő könnyű légáteresztő", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", originalPrice: 19990, currentPrice: 11990, discount: 40, rating: 4.8, category: "sport" },
    { title: "Kézisúlyzó szett neoprén", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop", originalPrice: 6990, currentPrice: 3990, discount: 43, rating: 4.5, category: "sport" },
  ],
  ikea: [
    { title: "Aroma diffúzor illóolajokhoz", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop", originalPrice: 7990, currentPrice: 4990, discount: 38, rating: 4.4, category: "home" },
    { title: "Konyhai mérleg digitális", image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&h=400&fit=crop", originalPrice: 5990, currentPrice: 2990, discount: 50, rating: 4.3, category: "home" },
    { title: "Illatos gyertya szett luxus", image: "https://images.unsplash.com/photo-1602607633975-bb955ed8c1a3?w=400&h=400&fit=crop", originalPrice: 4990, currentPrice: 2490, discount: 50, rating: 4.6, category: "gift" },
  ],
  wish: [
    { title: "Baseball sapka unisex", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop", originalPrice: 4990, currentPrice: 1490, discount: 70, rating: 4.2, category: "fashion" },
    { title: "Társasjáték családi", image: "https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=400&h=400&fit=crop", originalPrice: 8990, currentPrice: 3490, discount: 61, rating: 4.3, category: "other" },
    { title: "Háziállat játék interaktív", image: "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=400&h=400&fit=crop", originalPrice: 3990, currentPrice: 1490, discount: 63, rating: 4.1, category: "other" },
  ],
};

const Stores = () => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) return PARTNER_STORES;
    const q = searchQuery.toLowerCase();
    return PARTNER_STORES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.categories.some((c) => c.toLowerCase().includes(q)) ||
        s.description?.[language]?.toLowerCase().includes(q)
    );
  }, [searchQuery, language]);

  const selectedStoreData = selectedStore
    ? PARTNER_STORES.find((s) => s.id === selectedStore)
    : null;

  const selectedProducts = selectedStore ? storeProducts[selectedStore] || [] : [];

  return (
    <div className="min-h-screen flex flex-col relative">
      <CityScene3D />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
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
          {selectedStoreData && (
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

              <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl border border-amber-500/30 bg-card/80 backdrop-blur-sm">
                <img
                  src={selectedStoreData.logoUrl || ""}
                  alt={selectedStoreData.name}
                  className="h-16 w-16 rounded-xl object-contain"
                />
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedStoreData.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedStoreData.description?.[language]}
                  </p>
                </div>
              </div>

              {selectedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedProducts.map((product, index) => (
                    <DealCard
                      key={`${selectedStore}_${index}`}
                      title={product.title}
                      image={product.image}
                      originalPrice={product.originalPrice}
                      currentPrice={product.currentPrice}
                      store={selectedStoreData.name}
                      storeIcon={selectedStoreData.logoUrl || ""}
                      rating={product.rating}
                      discount={product.discount}
                      delay={index * 0.08}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredStores.map((store, index) => (
                <motion.button
                  key={store.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  onClick={() => setSelectedStore(store.id)}
                  className="group relative flex flex-col items-center text-center rounded-2xl border border-amber-500/20 bg-card/80 dark:bg-black/60 backdrop-blur-sm p-5 transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="absolute right-3 top-3">
                    <CheckCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  </div>
                  <img
                    src={store.logoUrl || ""}
                    alt={store.name}
                    className="mb-3 h-14 w-14 rounded-xl object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                  <h3 className="font-semibold text-foreground mb-1">
                    {store.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {store.description?.[language]}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-amber-500 dark:text-amber-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-3 w-3" />
                    {t("stores.viewProducts")}
                  </div>
                </motion.button>
              ))}

              {filteredStores.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  {t("stores.noResults")}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Stores;
