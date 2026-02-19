import DealCard from "./DealCard";
import { Flame, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const DealsSection = () => {
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["homepage-deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("review_count", { ascending: false, nullsFirst: false })
        .limit(6);
      if (error) throw error;
      return (data || []).map(p => ({
        id: p.id,
        title: p.title,
        image: p.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
        originalPrice: p.price,
        currentPrice: p.price,
        store: p.store_name,
        storeIcon: `https://logo.clearbit.com/${p.store_name.toLowerCase().replace(/\s/g, '')}.com`,
        rating: p.rating && p.rating > 5 ? p.rating / 20 : (p.rating || 0),
        discount: 0,
        category: p.category || "Egyéb",
      }));
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <section id="deals" className="py-20 bg-background/40 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-primary">
                <Flame className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Nap ajánlatai</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                Mai legjobb <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">akciók</span>
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Válogatott ajánlatok az adatbázisból
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Deals Grid */}
        {!isLoading && deals.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {deals.map((deal, index) => (
              <DealCard 
                key={deal.id} 
                {...deal} 
                delay={index * 0.05}
              />
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="flex justify-center">
          <Link to="/akciok">
            <Button 
              size="lg" 
              className="gap-2 rounded-full px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold"
            >
              <Flame className="h-5 w-5" />
              Összes akció megtekintése
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DealsSection;