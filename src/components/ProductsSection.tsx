import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Product = {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  affiliate_url: string | null;
  store_name: string;
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
          {products.map((product) => (
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
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{product.store_name}</p>
                <h3 className="font-semibold text-foreground line-clamp-2 text-sm leading-snug">
                  {product.title}
                </h3>
                <p className="text-lg font-bold text-primary">
                  {formatPrice(product.price, product.currency)}
                </p>
                {product.affiliate_url && (
                  <Button
                    asChild
                    size="sm"
                    className="w-full gap-2 mt-2"
                  >
                    <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer nofollow">
                      Megnézem <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
