import { useState, useEffect } from "react";
import { X, Flame, Search, ShoppingBag, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<DealProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = async (query?: string) => {
    setLoading(true);
    try {
      const q = query || TRENDING_QUERIES[Math.floor(Math.random() * TRENDING_QUERIES.length)];
      const res = await fetch(`${API_BASE}/api/v1/deals/search?q=${encodeURIComponent(q)}&limit=24&deals_only=true`);
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
        title={{ hu: "Akciók és leárazások", en: "Deals & Discounts", uk: "Акції та знижки", ro: "Oferte și reduceri", de: "Angebote & Rabatte" }}
        description={{ hu: "Fedezd fel a legjobb akciókat! Akár 70% kedvezmény AliExpress, eBay termékeire.", en: "Discover the best deals! Up to 70% off on AliExpress, eBay.", uk: "Відкрийте найкращі акції! До 70% знижки.", ro: "Descoperă cele mai bune oferte! Până la 70% reducere.", de: "Entdecken Sie die besten Angebote! Bis zu 70% Rabatt." }}
        canonical="/akciok"
        breadcrumbs={[{ name: "Főoldal", url: "/" }, { name: "Akciók", url: "/akciok" }]}
      />
      <CityScene3D />

      <header className="sticky top-0 z-50 border-b border-amber-500/20 bg-black/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-12 sm:h-14 items-center gap-2 sm:gap-3 px-3 sm:px-4">
          <div className="flex items-center gap-1.5 shrink-0">
            <Flame className="h-4 w-4 text-amber-400" />
            <span className="font-bold text-xs sm:text-sm text-white hidden sm:inline">Akciók</span>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Keresés az akciók között..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full rounded-full border border-amber-500/20 bg-white/5 py-1.5 sm:py-2 pl-9 pr-4 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/40"
            />
          </div>

          <button
            onClick={() => {
              navigate("/");
            }}
            className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full border border-amber-500/20 bg-white/5 text-neutral-400 hover:text-white hover:border-amber-500/50 hover:bg-white/10 transition-all"
            title="Bezárás"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">

          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="h-10 w-10 mx-auto mb-3 animate-spin text-primary" />
              <p className="text-base text-muted-foreground">Akciók betöltése...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
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
              <ShoppingBag className="h-14 w-14 mx-auto mb-4 opacity-30" />
              <p className="text-base font-medium">Nincs találat. Próbálj más keresést!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Deals;
