import { useState, useEffect } from "react";
import { ArrowLeft, Flame, Search, ShoppingBag, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import CityScene3D from "@/components/CityScene3D";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import SEOHead from "@/components/SEOHead";
import DealCard from "@/components/DealCard";

const API_BASE = "";

const TRENDING_QUERIES = ["smartphone", "earbuds", "smartwatch", "laptop", "tablet", "camera"];

interface DealProduct {
  title: string;
  image_url: string;
  original_price: number;
  sale_price: number;
  store_name: string;
  discount: string;
  affiliate_url: string;
  currency: string;
}

const Deals = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<DealProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = async (query?: string) => {
    setLoading(true);
    try {
      const q = query || TRENDING_QUERIES[Math.floor(Math.random() * TRENDING_QUERIES.length)];
      const res = await fetch(`${API_BASE}/api/v1/aliexpress/search?q=${encodeURIComponent(q)}&limit=24&sort=LAST_VOLUME_DESC`);
      const data = await res.json();
      setProducts(data.items || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchDeals(searchQuery.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <SEOHead
        title={{ hu: "Akciók és leárazások", en: "Deals & Discounts", uk: "Акції та знижки" }}
        description={{ hu: "Fedezd fel a legjobb akciókat és leárazásokat!", en: "Discover the best deals and discounts!", uk: "Відкрийте найкращі акції та знижки!" }}
        canonical="/akciok"
      />
      <CityScene3D />

      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium hidden sm:inline">{t("search.back")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            <span className="font-bold text-sm">Legjobb Akciók</span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="mb-4 sm:mb-6 text-center">
            <h1 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Legjobb Akciók</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Válogatott termékek a legjobb árakkal</p>
          </div>

          <div className="mb-6 flex flex-col gap-4">
            <div className="relative flex-1 max-w-sm mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Keresés az akciók között..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full rounded-full border border-border bg-card/50 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Akciók betöltése...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {products.map((p: any, i: number) => {
                const orig = parseFloat(p.original_price) || parseFloat(p.sale_price) || 0;
                const sale = parseFloat(p.sale_price) || orig;
                const disc = orig > sale ? Math.round((1 - sale / orig) * 100) : parseInt(p.discount) || 0;
                return (
                  <DealCard
                    key={i}
                    title={p.name || p.title || ""}
                    image={p.image_url || ""}
                    originalPrice={orig}
                    currentPrice={sale}
                    store={p.store || p.store_name || "AliExpress"}
                    discount={disc}
                    delay={i * 0.03}
                    highlightDiscount={disc >= 40}
                    affiliateUrl={p.affiliate_url}
                    currency={p.currency || "HUF"}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm font-medium">Nincs találat. Próbálj más keresést!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Deals;
