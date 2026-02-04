import DealCard from "./DealCard";
import { Flame, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Curated deals for homepage - limited to 6
const featuredDeals = [
  {
    id: "featured_1",
    title: "Vezeték nélküli Bluetooth fülhallgató TWS",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    originalPrice: 15990,
    currentPrice: 4990,
    store: "Temu",
    storeIcon: "https://logo.clearbit.com/temu.com",
    rating: 4.8,
    discount: 69,
    category: "tech",
  },
  {
    id: "featured_2",
    title: "Női nyári ruha virágmintás A-vonalú",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
    originalPrice: 12990,
    currentPrice: 3990,
    store: "Shein",
    storeIcon: "https://logo.clearbit.com/shein.com",
    rating: 4.6,
    discount: 69,
    category: "fashion",
  },
  {
    id: "featured_3",
    title: "Samsung Galaxy A54 5G 128GB",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
    originalPrice: 169990,
    currentPrice: 119990,
    store: "Alza",
    storeIcon: "https://logo.clearbit.com/alza.hu",
    rating: 4.9,
    discount: 29,
    category: "tech",
  },
  {
    id: "featured_4",
    title: "Sport okosóra vízálló fitnesz tracker",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    originalPrice: 29990,
    currentPrice: 8990,
    store: "AliExpress",
    storeIcon: "https://logo.clearbit.com/aliexpress.com",
    rating: 4.5,
    discount: 70,
    category: "tech",
  },
  {
    id: "featured_5",
    title: "Laptop hátizsák USB töltőporttal",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    originalPrice: 18990,
    currentPrice: 6990,
    store: "Temu",
    storeIcon: "https://logo.clearbit.com/temu.com",
    rating: 4.7,
    discount: 63,
    category: "tech",
  },
  {
    id: "featured_6",
    title: "Apple AirPods Pro 2. generáció",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop",
    originalPrice: 99990,
    currentPrice: 79990,
    store: "Alza",
    storeIcon: "https://logo.clearbit.com/alza.hu",
    rating: 4.9,
    discount: 20,
    category: "tech",
  },
];

const DealsSection = () => {
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
              Válogatott ajánlatok partnerboltjainkból
            </p>
          </div>
        </div>

        {/* Deals Grid - Limited to 6 */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {featuredDeals.map((deal, index) => (
            <DealCard 
              key={deal.id} 
              {...deal} 
              delay={index * 0.05}
            />
          ))}
        </div>

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
