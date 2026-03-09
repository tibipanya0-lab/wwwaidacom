import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, ExternalLink, Star, Truck, Copy, Check, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type Product = {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  affiliate_url: string | null;
  store_name: string;
  rating: number | null;
  review_count: number | null;
  shipping_days: string | null;
  shipping_cost: string | null;
};

const RatingStars = ({ rating, reviewCount }: { rating: number | null; reviewCount: number | null }) => {
  if (!rating || rating === 0) {
    return <span className="text-xs text-muted-foreground italic">Új termék</span>;
  }

  // AliExpress returns rating as percentage (0-100), convert to 5-star scale
  const starRating = rating > 5 ? rating / 20 : rating;
  const fullStars = Math.floor(starRating);
  const hasHalf = starRating - fullStars >= 0.3;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0));

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`f${i}`} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        ))}
        {hasHalf && (
          <div className="relative">
            <Star className="h-3.5 w-3.5 text-muted-foreground/30" />
            <div className="absolute inset-0 overflow-hidden w-[50%]">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`e${i}`} className="h-3.5 w-3.5 text-muted-foreground/30" />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {starRating.toFixed(1)}
        {reviewCount ? ` (${reviewCount} vélemény)` : ""}
      </span>
    </div>
  );
};

const CouponBadge = ({ storeProducts }: { storeProducts: any }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // This would use coupons from the coupons table matched by store
  const coupon = storeProducts;
  if (!coupon) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      toast({ title: "Kuponkód másolva! 🎉", description: `${coupon.code} a vágólapra másolva` });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Hiba", description: "Nem sikerült másolni", variant: "destructive" });
    }
  };

  return (
    <div className="rounded-lg border-2 border-dashed border-success/50 bg-success/5 p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Ticket className="h-3.5 w-3.5 text-success shrink-0" />
          <code className="text-xs font-bold text-success truncate">{coupon.code}</code>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md bg-success/10 px-2 py-0.5 text-xs font-medium text-success hover:bg-success/20 transition-colors shrink-0"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Másolva" : "Másolás"}
        </button>
      </div>
      {coupon.description && (
        <p className="text-[10px] text-success/70 mt-1 pl-5 truncate">{coupon.description}</p>
      )}
    </div>
  );
};

const ProductsSection = () => {
  return null;
};

export default ProductsSection;
