import { ExternalLink, TrendingDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface DealCardProps {
  title: string;
  image: string;
  originalPrice: number;
  currentPrice: number;
  store: string;
  storeIcon: string;
  rating: number;
  discount: number;
  delay?: number;
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
}: DealCardProps) => {
  const { t } = useLanguage();

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-black/60 backdrop-blur-sm shadow-lg transition-all duration-300 hover:border-amber-500/50 hover:shadow-amber-500/10 hover:-translate-y-1 animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Discount Badge */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 px-3 py-1 text-xs font-bold text-black">
        <TrendingDown className="h-3 w-3" />
        -{discount}%
      </div>

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-neutral-900">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Store */}
        <div className="mb-2 flex items-center gap-2">
          <img src={storeIcon} alt={store} className="h-5 w-5 rounded" />
          <span className="text-xs font-medium text-neutral-400">{store}</span>
          <div className="ml-auto flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-white">{rating}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug text-white">
          {title}
        </h3>

        {/* Prices */}
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-xl font-bold text-amber-400">
            {currentPrice.toLocaleString()} Ft
          </span>
          <span className="text-sm text-neutral-500 line-through">
            {originalPrice.toLocaleString()} Ft
          </span>
        </div>

        {/* CTA */}
        <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold hover:from-amber-400 hover:to-yellow-500" size="sm">
          {t("dealCard.view")}
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DealCard;
