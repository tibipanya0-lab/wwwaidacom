import { ExternalLink, Tag, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedProduct } from "@/lib/partnerStores";
import { getStoreById } from "@/lib/partnerStores";

interface SearchProductCardProps {
  product: GeneratedProduct;
}

const SearchProductCard = ({ product }: SearchProductCardProps) => {
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

  // Partner link card - special styling
  if (product.isPartnerLink) {
    return (
      <a
        href={product.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02]"
      >
        <div className="p-6 text-center">
          {/* Store Logo */}
          <div 
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
            style={{ backgroundColor: store?.color + "20" }}
          >
            {store?.logo || "🛒"}
          </div>
          
          {/* Store Name */}
          <h3 className="text-xl font-bold text-primary mb-2">{product.store}</h3>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4">{product.name}</p>
          
          {/* CTA */}
          <div className="flex items-center justify-center gap-2 text-primary font-semibold">
            <span>Keresés indítása</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </a>
    );
  }

  // Regular product card
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
      {product.discount && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-deal px-2 py-1 text-xs font-bold text-deal-foreground">
          <Tag className="h-3 w-3" />
          {product.discount}
        </div>
      )}

      {/* Product Image Placeholder */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30">
        <div className="flex h-full w-full items-center justify-center">
          <div 
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
            style={{ backgroundColor: store?.color + "20" }}
          >
            {store?.logo || "📦"}
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Store Badge */}
        <span 
          className="inline-block rounded-full px-2 py-0.5 text-xs font-medium mb-2"
          style={{ 
            backgroundColor: store?.color + "20",
            color: store?.color 
          }}
        >
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

        {/* CTA Button */}
        <Button
          variant="hero"
          size="sm"
          className="w-full gap-2"
          onClick={() => window.open(product.link, "_blank")}
        >
          Megnézem
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SearchProductCard;
