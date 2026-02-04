import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import DealCard from "./DealCard";
import { Flame, Loader2, ArrowDownWideNarrow, TrendingDown, Clock } from "lucide-react";

// Initial curated deals
const initialDeals = [
  {
    id: "initial_1",
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
    id: "initial_2",
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
    id: "initial_3",
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
    id: "initial_4",
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
    id: "initial_5",
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
    id: "initial_6",
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

// Templates for generating dynamic deals
const dealTemplates = {
  tech: [
    { title: "Bluetooth hangszóró hordozható", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop" },
    { title: "Vezeték nélküli egér ergonomikus", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop" },
    { title: "USB-C hub multiport adapter", image: "https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400&h=400&fit=crop" },
    { title: "Powerbank 20000mAh gyorstöltő", image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop" },
    { title: "Gaming headset RGB világítás", image: "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop" },
    { title: "Tablet állvány állítható", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop" },
  ],
  fashion: [
    { title: "Férfi slim fit póló pamut", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop" },
    { title: "Női táska crossbody elegáns", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop" },
    { title: "Napszemüveg UV400 védelem", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop" },
    { title: "Sneaker cipő divatos fehér", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop" },
    { title: "Karóra minimalista design", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop" },
    { title: "Baseball sapka unisex", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop" },
  ],
  home: [
    { title: "LED asztali lámpa dimmelhető", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop" },
    { title: "Párna memóriahabos ergonomikus", image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop" },
    { title: "Kávéfőző automata espresso", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop" },
    { title: "Porszívó robot okos navigáció", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
    { title: "Légfrissítő aroma diffúzor", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop" },
    { title: "Konyhai mérleg digitális", image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&h=400&fit=crop" },
  ],
};

const stores = [
  { name: "Temu", icon: "https://logo.clearbit.com/temu.com" },
  { name: "AliExpress", icon: "https://logo.clearbit.com/aliexpress.com" },
  { name: "Shein", icon: "https://logo.clearbit.com/shein.com" },
  { name: "Amazon", icon: "https://logo.clearbit.com/amazon.de" },
  { name: "eBay", icon: "https://logo.clearbit.com/ebay.com" },
];

const categories = ["tech", "fashion", "home"] as const;

// Generate a dynamic deal
function generateDeal(page: number, index: number) {
  const category = categories[(page + index) % categories.length];
  const templates = dealTemplates[category];
  const template = templates[(page * 3 + index) % templates.length];
  const store = stores[(page + index) % stores.length];
  
  // Generate high discount deals (50-90%)
  const discount = Math.floor(Math.random() * 40 + 50);
  const originalPrice = Math.floor(Math.random() * 50000 + 10000);
  const currentPrice = Math.floor(originalPrice * (1 - discount / 100));
  const rating = (Math.random() * 0.5 + 4.4).toFixed(1);
  
  return {
    title: template.title,
    image: template.image,
    originalPrice,
    currentPrice,
    store: store.name,
    storeIcon: store.icon,
    rating: parseFloat(rating),
    discount,
    category,
    id: `deal_${page}_${index}`,
  };
}

// Generate a batch of deals
function generateDeals(page: number, count: number = 6) {
  return Array.from({ length: count }, (_, i) => generateDeal(page, i));
}

type SortOption = "discount" | "price" | "newest";

const DealsSection = () => {
  const [deals, setDeals] = useState(initialDeals);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadMore = useCallback(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      const nextPage = page + 1;
      const newDeals = generateDeals(nextPage);
      setDeals(prev => [...prev, ...newDeals]);
      setPage(nextPage);
      setIsLoading(false);
    }, 400);
  }, [page, isLoading]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loadMore, isLoading]);

  // Sort deals based on selected option
  const sortedDeals = useMemo(() => {
    const sorted = [...deals].sort((a, b) => {
      switch (sortBy) {
        case "discount":
          return b.discount - a.discount;
        case "price":
          return a.currentPrice - b.currentPrice;
        case "newest":
        default:
          // Keep original order (newest first based on id)
          return 0;
      }
    });
    return sorted;
  }, [deals, sortBy]);

  const sortButtons: { key: SortOption; label: string; icon: React.ReactNode }[] = [
    { key: "discount", label: "Legnagyobb kedvezmény", icon: <ArrowDownWideNarrow className="h-4 w-4" /> },
    { key: "price", label: "Legalacsonyabb ár", icon: <TrendingDown className="h-4 w-4" /> },
    { key: "newest", label: "Legújabbak", icon: <Clock className="h-4 w-4" /> },
  ];

  return (
    <section id="deals" className="py-20 bg-black/40 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-amber-400">
                <Flame className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Mai legjobb ajánlatok</span>
              </div>
              <h2 className="text-3xl font-bold text-white">
                Kiemelt <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">akciók</span>
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Folyamatosan frissülő ajánlatok
            </div>
          </div>

          {/* Sort Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground mr-1">Rendezés:</span>
            {sortButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setSortBy(btn.key)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  sortBy === btn.key
                    ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/30"
                    : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {btn.icon}
                <span className="hidden sm:inline">{btn.label}</span>
                <span className="sm:hidden">
                  {btn.key === "discount" ? "%" : btn.key === "price" ? "Ft" : "Új"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedDeals.map((deal, index) => (
            <DealCard 
              key={deal.id} 
              {...deal} 
              delay={(index % 6) * 0.05}
              highlightDiscount={sortBy === "discount"}
            />
          ))}
        </div>

        {/* Deals Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal, index) => (
            <DealCard key={deal.id || index} {...deal} delay={(index % 6) * 0.1} />
          ))}
        </div>

        {/* Load More Trigger */}
        <div ref={loadMoreRef} className="py-8 flex justify-center">
          {isLoading && (
            <div className="flex items-center gap-2 text-amber-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>További akciók betöltése...</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DealsSection;
