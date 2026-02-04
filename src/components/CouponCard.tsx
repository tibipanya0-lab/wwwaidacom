import { Copy, Check, Tag, Clock, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/contexts/FavoritesContext";

export interface Coupon {
  id: string;
  store_name: string;
  code: string;
  description: string;
  discount_percent?: number;
  discount_amount?: string;
  min_order_amount?: string;
  valid_until?: string;
  category: string;
}

interface CouponCardProps {
  coupon: Coupon;
}

const CouponCard = ({ coupon }: CouponCardProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const couponId = `coupon_${coupon.id}`;
  const isInFavorites = isFavorite(couponId);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInFavorites) {
      removeFavorite(couponId);
      toast({
        title: "Eltávolítva a kedvencekből",
        description: coupon.code,
      });
    } else {
      addFavorite({
        id: couponId,
        type: "coupon",
        data: coupon,
      });
      toast({
        title: "Hozzáadva a kedvencekhez ⭐",
        description: coupon.code,
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      toast({
        title: "Kuponkód másolva!",
        description: `${coupon.code} a vágólapra került`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Hiba",
        description: "Nem sikerült másolni a kódot",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDiscountDisplay = () => {
    if (coupon.discount_percent) {
      return `-${coupon.discount_percent}%`;
    }
    if (coupon.discount_amount) {
      return coupon.discount_amount;
    }
    return "Kedvezmény";
  };

  const isAutomatic = coupon.code === "AUTO";

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      {/* Favorite Button */}
      <button
        onClick={handleToggleFavorite}
        className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110"
      >
        <Star
          className={`h-4 w-4 transition-colors ${
            isInFavorites ? "fill-amber-400 text-amber-400" : "text-white"
          }`}
        />
      </button>

      {/* Discount Badge */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-deal px-2 py-1 text-xs font-bold text-deal-foreground">
        <Tag className="h-3 w-3" />
        {getDiscountDisplay()}
      </div>

      <div className="p-4 pt-14">
        {/* Store Badge */}
        <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mb-2">
          {coupon.store_name}
        </span>

        {/* Description */}
        <h4 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug">
          {coupon.description}
        </h4>

        {/* Coupon Code */}
        {isAutomatic ? (
          <div className="mb-3 rounded-lg border border-dashed border-success/50 bg-success/10 p-2 text-center">
            <span className="text-sm font-medium text-success">
              ✨ Automatikus kedvezmény - nincs szükség kódra!
            </span>
          </div>
        ) : (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-dashed border-primary/50 bg-primary/5 p-2">
            <code className="flex-1 text-center font-mono text-lg font-bold text-primary">
              {coupon.code}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {coupon.min_order_amount && (
            <span className="flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" />
              Min: {coupon.min_order_amount}
            </span>
          )}
          {coupon.valid_until && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(coupon.valid_until)}
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="mt-3">
          <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {coupon.category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CouponCard;
