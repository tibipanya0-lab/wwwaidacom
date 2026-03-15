import { useState } from "react";
import { ArrowLeft, Ticket, Search } from "lucide-react";
import { Link } from "react-router-dom";
import CityScene3D from "@/components/CityScene3D";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import SEOHead from "@/components/SEOHead";

const Coupons = () => {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const labels = {
    hu: { title: "Kuponok", subtitle: "Kuponkódok hamarosan elérhetőek lesznek", search: "Keresés a kuponok között...", noCoupons: "A kupon funkció hamarosan elérhető lesz." },
    en: { title: "Coupons", subtitle: "Coupon codes coming soon", search: "Search coupons...", noCoupons: "Coupon feature coming soon." },
    uk: { title: "Купони", subtitle: "Купони скоро будуть доступні", search: "Пошук купонів...", noCoupons: "Функція купонів скоро буде доступна." },
  };
  const l = labels[language] || labels.hu;

  return (
    <div className="min-h-screen flex flex-col relative">
      <SEOHead
        title={{ hu: "Kuponok és kedvezmények", en: "Coupons & Discounts", uk: "Купони та знижки", ro: "Cupoane și reduceri", de: "Gutscheine & Rabatte" }}
        description={{ hu: "Működő kuponkódok és kedvezmények egy helyen. AliExpress, eBay kuponok naponta frissítve.", en: "Working coupon codes in one place. Updated daily.", uk: "Робочі купони в одному місці. Оновлюються щодня.", ro: "Coduri de cupon funcționale într-un singur loc.", de: "Funktionierende Gutscheincodes an einem Ort." }}
        canonical="/kuponok"
        breadcrumbs={[{ name: "Főoldal", url: "/" }, { name: "Kuponok", url: "/kuponok" }]}
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
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2">🎟️ {l.title}</h1>
            <p className="text-muted-foreground text-sm">{l.subtitle}</p>
          </div>

          <div className="mb-6">
            <div className="relative flex-1 max-w-sm mx-auto">
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

          <div className="text-center py-20 text-muted-foreground">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">{l.noCoupons}</p>
            <p className="text-sm">Új backend API csatlakoztatás alatt...</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Coupons;
