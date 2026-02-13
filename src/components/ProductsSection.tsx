import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

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
        {rating.toFixed(1)}
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
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data as Product[];
    },
  });

  // Fetch active coupons to match with stores
  const { data: coupons } = useQuery({
    queryKey: ["coupons-for-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-background/40 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="mb-2 inline-flex items-center gap-2 text-primary">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Termékek</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Ajánlott termékek</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("hu-HU", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCouponForStore = (storeName: string) => {
    if (!coupons) return null;
    return coupons.find(c => c.store_name.toLowerCase() === storeName.toLowerCase()) || null;
  };

  return (
    <section className="py-20 bg-background/40 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="mb-2 inline-flex items-center gap-2 text-primary">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Termékek</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Ajánlott <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">termékek</span>
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const coupon = getCouponForStore(product.store_name);
            const shippingText = product.shipping_days || "~15-25 nap";

            return (
              <Card
                key={product.id}
                className="group overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
              >
                {product.image_url && (
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <CardContent className="p-4 space-y-2.5">
                  {/* Store */}
                  <p className="text-xs font-medium text-muted-foreground">{product.store_name}</p>

                  {/* Title */}
                  <h3 className="font-semibold text-foreground line-clamp-2 text-sm leading-snug">
                    {product.title}
                  </h3>

                  {/* Rating — under title */}
                  <RatingStars rating={product.rating} reviewCount={product.review_count} />

                  {/* Price */}
                  <p className="text-lg font-bold text-primary">
                    {formatPrice(product.price, product.currency)}
                  </p>

                  {/* Coupon — above CTA */}
                  {coupon && <CouponBadge storeProducts={coupon} />}

                  {/* Shipping — above CTA */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Truck className="h-3.5 w-3.5 shrink-0" />
                    <span>🚚 {shippingText}</span>
                    {product.shipping_cost && (
                      <span className="ml-auto font-medium">{product.shipping_cost}</span>
                    )}
                  </div>

                  {/* CTA */}
                  {product.affiliate_url && (
                    <Button
                      asChild
                      size="sm"
                      className="w-full gap-2 mt-1"
                    >
                      <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer nofollow">
                        Megnézem <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
