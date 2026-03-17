import { useState, useEffect } from "react";
import { ArrowLeft, Ticket, Search, ExternalLink, Tag, Copy, Check, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CityScene3D from "@/components/CityScene3D";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import SEOHead from "@/components/SEOHead";
import { useToast } from "@/hooks/use-toast";

interface GBCoupon {
  CouponCode: string;
  CouponName: string;
  YHmoney: string;
  Amount: number;
  Discount: string;
  CouponLink: string;
  EndTime: string;
  CouponDisplayValue: string;
  Description: string;
}

const GB_LOGO = "https://www.google.com/s2/favicons?domain=geekbuying.com&sz=32";

const CouponCard = ({ coupon }: { coupon: GBCoupon }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(coupon.CouponCode);
      setCopied(true);
      toast({ title: "Kuponkód másolva!", description: coupon.CouponCode });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Hiba", description: "Nem sikerült másolni", variant: "destructive" });
    }
  };

  const endDate = coupon.EndTime ? new Date(coupon.EndTime.replace(/-/g, "/")).toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" }) : "";
  const imgSrc = coupon.CouponDisplayValue?.startsWith("//") ? "https:" + coupon.CouponDisplayValue : coupon.CouponDisplayValue;

  return (
    <a
      href={coupon.CouponLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 block"
    >
      <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-deal px-2.5 py-1 text-xs font-bold text-deal-foreground">
        <Tag className="h-3 w-3" />
        {coupon.YHmoney}
      </div>

      {imgSrc && (
        <div className="h-32 bg-muted/20 flex items-center justify-center overflow-hidden">
          <img src={imgSrc} alt="" className="h-full w-full object-contain p-3" loading="lazy" />
        </div>
      )}

      <div className="p-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mb-2">
          <img src={GB_LOGO} alt="" className="h-3.5 w-3.5 rounded-sm" />
          GeekBuying
        </span>

        <h4 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug">
          {coupon.Description || coupon.CouponName}
        </h4>

        <div className="mb-3 flex items-center gap-2 rounded-lg border border-dashed border-primary/50 bg-primary/5 p-2">
          <code className="flex-1 text-center font-mono text-base font-bold text-primary">
            {coupon.CouponCode}
          </code>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {endDate && <span>Lejár: {endDate}</span>}
          <span className="flex items-center gap-1 text-primary group-hover:underline ml-auto">
            Ugrás <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </div>
    </a>
  );
};

const Coupons = () => {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [coupons, setCoupons] = useState<GBCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const labels = {
    hu: { title: "Kuponok", subtitle: "Aktuális kedvezmények és kuponok partneri áruházainkból", search: "Keresés a kuponok között...", noCoupons: "Nincs találat." },
    en: { title: "Coupons", subtitle: "Current discounts and coupons from our partner stores", search: "Search coupons...", noCoupons: "No results." },
    uk: { title: "Купони", subtitle: "Актуальні знижки та купони від наших партнерських магазинів", search: "Пошук купонів...", noCoupons: "Нічого не знайдено." },
  };
  const l = labels[language] || labels.hu;

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch("https://hu.geekbuying.com/Coupon/GetCouponCenter", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "categoryID=0&tempID=&status=0&sort=0&coupon_key=&page=1",
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const items: GBCoupon[] = (data.model || []).filter((c: GBCoupon) => c.CouponCode && c.Amount > 0);
        setCoupons(items);
      } catch {
        toast({ title: "Hiba", description: "Kuponok betöltése sikertelen", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const filtered = coupons.filter(c => {
    const q = searchQuery.toLowerCase();
    return c.CouponName.toLowerCase().includes(q) ||
      c.CouponCode.toLowerCase().includes(q) ||
      c.Description.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen flex flex-col relative">
      <SEOHead
        title={{ hu: "Kuponok és kedvezmények", en: "Coupons & Discounts", uk: "Купони та знижки", ro: "Cupoane și reduceri", de: "Gutscheine & Rabatte" }}
        description={{ hu: "Működő kuponkódok és kedvezmények egy helyen. GeekBuying kuponok naponta frissítve.", en: "Working coupon codes in one place. Updated daily.", uk: "Робочі купони в одному місці. Оновлюються щодня.", ro: "Coduri de cupon funcționale într-un singur loc.", de: "Funktionierende Gutscheincodes an einem Ort." }}
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
            {!loading && <p className="text-xs text-muted-foreground mt-1">{coupons.length} kupon elérhető</p>}
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

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Ticket className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">{l.noCoupons}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {filtered.map(coupon => (
                <CouponCard key={coupon.CouponCode} coupon={coupon} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Coupons;
