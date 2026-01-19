import DealCard from "./DealCard";
import { Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const deals = [
  {
    title: "Vezeték nélküli Bluetooth fülhallgató TWS",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    originalPrice: 15990,
    currentPrice: 4990,
    store: "Temu",
    storeIcon: "https://logo.clearbit.com/temu.com",
    rating: 4.8,
    discount: 69,
  },
  {
    title: "Női nyári ruha virágmintás A-vonalú",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
    originalPrice: 12990,
    currentPrice: 3990,
    store: "Shein",
    storeIcon: "https://logo.clearbit.com/shein.com",
    rating: 4.6,
    discount: 69,
  },
  {
    title: "Samsung Galaxy A54 5G 128GB",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
    originalPrice: 169990,
    currentPrice: 119990,
    store: "Alza",
    storeIcon: "https://logo.clearbit.com/alza.hu",
    rating: 4.9,
    discount: 29,
  },
  {
    title: "Sport okosóra vízálló fitnesz tracker",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    originalPrice: 29990,
    currentPrice: 8990,
    store: "AliExpress",
    storeIcon: "https://logo.clearbit.com/aliexpress.com",
    rating: 4.5,
    discount: 70,
  },
  {
    title: "Laptop hátizsák USB töltőporttal",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    originalPrice: 18990,
    currentPrice: 6990,
    store: "Temu",
    storeIcon: "https://logo.clearbit.com/temu.com",
    rating: 4.7,
    discount: 63,
  },
  {
    title: "Apple AirPods Pro 2. generáció",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop",
    originalPrice: 99990,
    currentPrice: 79990,
    store: "Alza",
    storeIcon: "https://logo.clearbit.com/alza.hu",
    rating: 4.9,
    discount: 20,
  },
];

const DealsSection = () => {
  return (
    <section id="deals" className="py-20 bg-section-dark">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-primary">
              <Flame className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Mai legjobb ajánlatok</span>
            </div>
            <h2 className="text-3xl font-bold">
              Kiemelt <span className="text-gradient">akciók</span>
            </h2>
          </div>
          <Button variant="glass">
            Összes megtekintése
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Deals Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal, index) => (
            <DealCard key={index} {...deal} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealsSection;
