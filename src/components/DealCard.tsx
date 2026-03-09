import { ExternalLink, TrendingDown, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRef, useState, useEffect } from "react";

interface DealCardProps {
  title: string;
  image: string;
  originalPrice: number;
  currentPrice: number;
  store: string;
  storeIcon?: string;
  rating?: number;
  discount: number;
  delay?: number;
  highlightDiscount?: boolean;
  affiliateUrl?: string | null;
  currency?: string;
}

const DealCard = ({
  title,
  image,
  originalPrice,
  currentPrice,
  store,
  storeIcon,
  rating,
  discount,
  delay = 0,
  highlightDiscount = false,
  affiliateUrl,
  currency = "HUF",
}: DealCardProps) => {
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Lazy load: only render content when card scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const isHotDeal = discount >= 60;

  const formatPrice = (price: number) => {
    if (currency === "HUF") return `${price.toLocaleString()} Ft`;
    return new Intl.NumberFormat("hu-HU", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-2xl border bg-black/60 backdrop-blur-sm shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in ${
        highlightDiscount && isHotDeal
          ? "border-amber-400 shadow-amber-500/30 hover:shadow-amber-500/50"
          : "border-amber-500/20 hover:border-amber-500/50 hover:shadow-amber-500/10"
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      {!isVisible ? (
        /* Placeholder skeleton while not in viewport */
        <div className="animate-pulse">
          <div className="aspect-square bg-neutral-800" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-neutral-700 rounded w-1/3" />
            <div className="h-4 bg-neutral-700 rounded w-full" />
            <div className="h-4 bg-neutral-700 rounded w-2/3" />
            <div className="h-6 bg-neutral-700 rounded w-1/2" />
            <div className="h-9 bg-neutral-700 rounded w-full" />
          </div>
        </div>
      ) : (
        <>
          {/* Discount Badge */}
          {discount > 0 && (
            <div
              className={`absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full px-3 py-1 font-bold text-black transition-all ${
                highlightDiscount && isHotDeal
                  ? "bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-sm px-4 py-1.5 animate-pulse shadow-lg shadow-orange-500/50"
                  : "bg-gradient-to-r from-amber-500 to-yellow-600 text-xs"
              }`}
            >
              {highlightDiscount && isHotDeal ? (
                <>
                  <Zap className="h-4 w-4" />
                  -{discount}% HOT!
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3" />
                  -{discount}%
                </>
              )}
            </div>
          )}

          {/* Image */}
          <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-neutral-900">
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            {highlightDiscount && isHotDeal && (
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent pointer-events-none" />
            )}
          </div>

          {/* Content */}
          <div className="p-2 sm:p-4">
            {/* Store */}
            <div className="mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
              {storeIcon && <img src={storeIcon} alt={store} className="h-4 w-4 sm:h-5 sm:w-5 rounded" />}
              <span className="text-[10px] sm:text-xs font-medium text-neutral-400">{store}</span>
              {rating && (
                <div className="ml-auto flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium text-white">{rating}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="mb-2 sm:mb-3 line-clamp-2 text-xs sm:text-sm font-semibold leading-snug text-white">
              {title}
            </h3>

            {/* Prices */}
            <div className="mb-2 sm:mb-4 flex items-baseline gap-1.5 sm:gap-2">
              <span className={`font-bold ${highlightDiscount && isHotDeal ? "text-sm sm:text-lg text-orange-400" : "text-xs sm:text-base text-amber-400"}`}>
                {formatPrice(currentPrice)}
              </span>
              {originalPrice > currentPrice && (
                <span className="text-[10px] sm:text-sm text-neutral-500 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            {/* CTA */}
            {affiliateUrl ? (
              <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold hover:from-amber-400 hover:to-yellow-500" size="sm">
                <a href={affiliateUrl} target="_blank" rel="noopener noreferrer nofollow">
                  {t("dealCard.view")}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            ) : (
              <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold hover:from-amber-400 hover:to-yellow-500" size="sm">
                {t("dealCard.view")}
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DealCard;