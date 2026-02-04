import { ExternalLink, Tag, ArrowRight, Star, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedProduct } from "@/lib/partnerStores";
import { getStoreById } from "@/lib/partnerStores";

interface SearchProductCardProps {
  product: GeneratedProduct;
  couponCode?: string;
  couponDiscount?: string;
}

const SearchProductCard = ({ product, couponCode, couponDiscount }: SearchProductCardProps) => {
  const [copied, setCopied] = useState(false);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  const store = getStoreById(product.storeId);
  
  const isInFavorites = isFavorite(product.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isInFavorites) {
      removeFavorite(product.id);
      toast({
        title: "Eltávolítva a kedvencekből",
        description: product.name,
      });
    } else {
      addFavorite({
        id: product.id,
        type: "product",
        data: {
          name: product.name,
          store: product.store,
          salePrice: product.salePrice,
          originalPrice: product.originalPrice,
          discount: product.discount,
          link: product.link,
        },
      });
      toast({
        title: "Hozzáadva a kedvencekhez ⭐",
        description: product.name,
      });
    }
  };

  const handleCopyAndOpen = async () => {
    if (couponCode) {
      try {
        await navigator.clipboard.writeText(couponCode);
        setCopied(true);
        toast({
          title: "Kuponkód másolva! 🎉",
          description: `${couponCode} - most megnyitjuk a bolt oldalát`,
        });
        
        // Open store in new tab
        setTimeout(() => {
          window.open(product.link, "_blank");
        }, 300);
        
        // Reset copied state after 3 seconds
        setTimeout(() => setCopied(false), 3000);
      } catch {
        toast({
          title: "Hiba",
          description: "Nem sikerült másolni a kuponkódot",
          variant: "destructive",
        });
      }
    } else {
      window.open(product.link, "_blank");
    }
  };

  // Partner link card - special styling (wide format)
  if (product.isPartnerLink) {
    return (
      <a
        href={product.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20"
      >
        {/* Store Logo */}
        <div 
          className="flex-shrink-0 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl text-3xl md:text-4xl"
          style={{ backgroundColor: store?.color + "20" }}
        >
          {store?.logo || "🛒"}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-bold text-primary mb-1">{product.store}</h3>
          <p className="text-sm text-muted-foreground truncate">{product.name}</p>
        </div>
        
        {/* CTA */}
        <div className="flex-shrink-0 flex items-center gap-2 text-primary font-semibold">
          <span className="hidden sm:inline">Keresés indítása</span>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </div>
      </a>
    );
  }

  // Regular product card - LIST VIEW
  return (
    <div className="group relative flex flex-col md:flex-row items-stretch gap-4 p-4 rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      {/* Left: Image & Store */}
      <div className="flex-shrink-0 flex items-center gap-4">
        {/* Favorite Button - Mobile top right */}
        <button
          onClick={handleToggleFavorite}
          className="absolute right-3 top-3 md:relative md:right-auto md:top-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 transition-all hover:bg-muted hover:scale-110"
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              isInFavorites ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
            }`}
          />
        </button>

        {/* Store Logo */}
        <div 
          className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl text-3xl"
          style={{ backgroundColor: store?.color + "20" }}
        >
          {store?.logo || "📦"}
        </div>
      </div>

      {/* Middle: Product Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Store Badge & Discount */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span 
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{ 
              backgroundColor: store?.color + "20",
              color: store?.color 
            }}
          >
            {product.store}
          </span>
          {product.discount && (
            <span className="inline-flex items-center gap-1 rounded-full bg-deal px-2 py-1 text-xs font-bold text-deal-foreground">
              <Tag className="h-3 w-3" />
              {product.discount}
            </span>
          )}
        </div>

        {/* Product Name */}
        <h4 className="text-base md:text-lg font-semibold leading-snug mb-2 line-clamp-2">
          {product.name}
        </h4>

        {/* Prices */}
        <div className="flex items-baseline gap-3">
          <span className="text-xl md:text-2xl font-bold text-primary">{product.salePrice}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.originalPrice}
            </span>
          )}
        </div>
      </div>

      {/* Right: Coupon & CTA */}
      <div className="flex-shrink-0 flex flex-col justify-center gap-3 md:w-64 md:border-l md:border-border md:pl-6">
        {/* Coupon Code Section */}
        {couponCode ? (
          <div className="rounded-lg bg-success/10 border-2 border-dashed border-success/50 p-3">
            <p className="text-xs text-success/80 mb-1 font-medium">Kuponkód:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-lg font-bold text-success tracking-wider">
                {couponCode}
              </code>
            </div>
            {couponDiscount && (
              <p className="text-xs text-success/70 mt-1">{couponDiscount}</p>
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">
              Nincs szükség kódra
            </p>
          </div>
        )}

        {/* CTA Button */}
        <Button
          variant="hero"
          size="lg"
          className="w-full gap-2 text-base font-semibold"
          onClick={handleCopyAndOpen}
        >
          {couponCode ? (
            copied ? (
              <>
                <Check className="h-5 w-5" />
                MÁSOLVA!
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                MÁSOLÁS & MEGNYITÁS
              </>
            )
          ) : (
            <>
              Megnézem
              <ExternalLink className="h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SearchProductCard;
