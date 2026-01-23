import { ExternalLink, Tag, Copy, Check, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Product {
  name: string;
  originalPrice?: string;
  salePrice: string;
  store: string;
  imageUrl?: string;
  discount?: string;
  link?: string;
  isUsed?: boolean;
  couponCode?: string;
  couponDiscount?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyCoupon = async () => {
    if (!product.couponCode) return;
    
    try {
      await navigator.clipboard.writeText(product.couponCode);
      setCopied(true);
      toast({
        title: "Kuponkód másolva! 🎉",
        description: `${product.couponCode} a vágólapra másolva`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Hiba",
        description: "Nem sikerült másolni a kuponkódot",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      {/* Discount Badge */}
      {product.discount && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-deal px-2 py-1 text-xs font-bold text-deal-foreground">
          <Tag className="h-3 w-3" />
          {product.discount}
        </div>
      )}

      {/* Used Badge */}
      {product.isUsed && (
        <div className="absolute right-3 top-3 z-10 rounded-full bg-warning px-2 py-1 text-xs font-bold text-warning-foreground">
          HASZNÁLT
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="mx-auto mb-2 h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center">
                <Tag className="h-6 w-6" />
              </div>
              <span className="text-xs">Nincs kép</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Store Badge */}
        <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mb-2">
          {product.store}
        </span>

        {/* Product Name */}
        <h4 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug">
          {product.name}
        </h4>

        {/* Prices */}
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">{product.salePrice}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.originalPrice}
            </span>
          )}
        </div>

        {/* Coupon Code Section */}
        {product.couponCode && (
          <div className="mb-3 rounded-lg bg-success/10 border border-success/30 p-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Ticket className="h-4 w-4 text-success flex-shrink-0" />
                <code className="text-sm font-bold text-success truncate">
                  {product.couponCode}
                </code>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0 hover:bg-success/20"
                onClick={handleCopyCoupon}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4 text-success" />
                )}
              </Button>
            </div>
            {product.couponDiscount && (
              <p className="text-xs text-success/80 mt-1 pl-6">
                {product.couponDiscount}
              </p>
            )}
          </div>
        )}

        {/* CTA Button */}
        <Button
          variant="hero"
          size="sm"
          className="w-full gap-2"
          onClick={() => product.link && window.open(product.link, "_blank")}
        >
          Megnézem az ajánlatot
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
