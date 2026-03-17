import { useState } from "react";
import { ArrowLeft, Ticket, Search, ExternalLink, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import CityScene3D from "@/components/CityScene3D";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import SEOHead from "@/components/SEOHead";

interface CouponItem {
  id: string;
  store_name: string;
  store_logo: string;
  description: string;
  discount: string;
  code: string | null;
  category: string;
  url: string;
}

const coupons: CouponItem[] = [
  {
    id: "gb-sitewide-6",
    store_name: "GeekBuying",
    store_logo: "https://www.google.com/s2/favicons?domain=geekbuying.com&sz=32",
    description: "6% kedvezmény az egész áruházban (max $20 megtakarítás)",
    discount: "-6%",
    code: null,
    category: "Elektronika",
    url: "https://www.jdoqocy.com/click-101662668-15855141",
  },
];

const Coupons = () => {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const labels = {
    hu: { title: "Kuponok", subtitle: "Aktuális kedvezmények és kuponok partneri áruházainkból", search: "Keresés a kuponok között...", noCoupons: "Nincs találat." },
    en: { title: "Coupons", subtitle: "Current discounts and coupons from our partner stores", search: "Search coupons...", noCoupons: "No results." },
    uk: { title: "Купони", subtitle: "Актуальні знижки та купони від наших партнерських магазинів", search: "Пошук купонів...", noCoupons: "Нічого не знайдено." },
  };
  const l = labels[language] || labels.hu;

  const filtered = coupons.filter(c =>
    c.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col relative">
      <SEOHead
        title={{ hu: "Kuponok és kedvezmények", en: "Coupons & Discounts", uk: "Купони та знижки", ro: "Cupoane și reduceri", de: "Gutscheine & Rabatte" }}
        description={{ hu: "Működő kuponkódok és kedvezmények egy helyen. GeekBuying, AliExpress kuponok naponta frissítve.", en: "Working coupon codes in one place. Updated daily.", uk: "Робочі купони в одному місці. Оновлюються щодня.", ro: "Coduri de cupon funcționale într-un singur loc.", de: "Funktionierende Gutscheincodes an einem Ort." }}
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
            <h1 className="text-3xl font-bold mb-2">{l.title}</h1>
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

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Ticket className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">{l.noCoupons}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {filtered.map(coupon => (
                <a
                  key={coupon.id}
                  href={coupon.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 block"
                >
                  <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-deal px-2 py-1 text-xs font-bold text-deal-foreground">
                    <Tag className="h-3 w-3" />
                    {coupon.discount}
                  </div>

                  <div className="p-4 pt-12">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mb-2">
                      <img src={coupon.store_logo} alt="" className="h-3.5 w-3.5 rounded-sm" />
                      {coupon.store_name}
                    </span>

                    <h4 className="mb-3 text-sm font-semibold leading-snug">
                      {coupon.description}
                    </h4>

                    <div className="mb-3 rounded-lg border border-dashed border-green-500/50 bg-green-500/10 p-2 text-center">
                      <span className="text-sm font-medium text-green-400">
                        Automatikus kedvezmény — kattints a linkre!
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {coupon.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-primary group-hover:underline">
                        Ugrás <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Coupons;
