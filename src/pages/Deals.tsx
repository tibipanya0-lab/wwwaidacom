import { useState } from "react";
import { ArrowLeft, Flame, TrendingDown, Search, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import CityScene3D from "@/components/CityScene3D";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import SEOHead from "@/components/SEOHead";

const Deals = () => {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

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
            <Flame className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">Legjobb Akciók</span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2">🔥 Legjobb Akciók</h1>
            <p className="text-muted-foreground text-sm">Válogatott termékek a legjobb árakkal</p>
          </div>

          <div className="mb-6 flex flex-col gap-4">
            <div className="relative flex-1 max-w-sm mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Keresés az akciók között..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-border bg-card/50 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Empty state */}
          <div className="text-center py-20 text-muted-foreground">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Az akciók hamarosan elérhetőek lesznek.</p>
            <p className="text-sm">Új backend API csatlakoztatás alatt...</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Deals;
