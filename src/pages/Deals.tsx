import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, Flame, Loader2, ArrowDownWideNarrow, TrendingDown, Clock, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import DealCard from "@/components/DealCard";
import CityScene3D from "@/components/CityScene3D";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

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
    title: "Elegáns férfi karóra minimalista számlappal",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    originalPrice: 29990,
    currentPrice: 8990,
    store: "AliExpress",
    storeIcon: "https://logo.clearbit.com/aliexpress.com",
    rating: 4.5,
    discount: 70,
    category: "fashion",
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
const dealTemplates: Record<string, { title: string; image: string }[]> = {
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
    { title: "Fürdőszobai kellékek és törölközők", image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop" },
    { title: "Kávéscsésze latte art díszítéssel", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop" },
    { title: "Robotporszívó okos navigációval", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
    { title: "Aroma diffúzor illóolajokhoz", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop" },
    { title: "Konyhai mérleg digitális", image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&h=400&fit=crop" },
  ],
  sport: [
    { title: "Jóga matrac csúszásmentes", image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop" },
    { title: "Futócipő könnyű légáteresztő", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop" },
    { title: "Kézisúlyzó szett neoprén", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop" },
    { title: "Sporttáska vízálló nagy", image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop" },
    { title: "Futó férfi sportöltözékben", image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=400&fit=crop" },
    { title: "Szabadtéri edzés naplemente fényben", image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=400&fit=crop" },
  ],
  baby: [
    { title: "Babakocsi könnyű összecsukható", image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=400&h=400&fit=crop" },
    { title: "Plüss játék puha ölelni való", image: "https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=400&h=400&fit=crop" },
    { title: "Baba body szett pamut 3 db", image: "https://images.unsplash.com/photo-1584839404042-8bc31fae5a8c?w=400&h=400&fit=crop" },
    { title: "Jógázó nő meditáció közben", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop" },
    { title: "Gyerek puzzle fa készlet", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=400&fit=crop" },
  ],
  auto: [
    { title: "Városi busz tömegközlekedés", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=400&fit=crop" },
    { title: "Robotporszívó okos navigációval", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
    { title: "Sportkocsi fehér elegáns", image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=400&fit=crop" },
    { title: "Klasszikus autó vintage stílusban", image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=400&fit=crop" },
    { title: "Motoros védőfelszerelés sisak", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop" },
  ],
  gift: [
    { title: "Ajándékcsomag szépségápolás", image: "https://images.unsplash.com/photo-1549465220-1a8b9238f760?w=400&h=400&fit=crop" },
    { title: "Illatos gyertya szett luxus", image: "https://images.unsplash.com/photo-1602607633975-bb955ed8c1a3?w=400&h=400&fit=crop" },
    { title: "Bőr pénztárca RFID védett", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop" },
    { title: "Kávé ajándékdoboz prémium", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop" },
    { title: "Személyre szabott ékszer", image: "https://images.unsplash.com/photo-1515562141589-67f0d927b28a?w=400&h=400&fit=crop" },
  ],
  other: [
    { title: "Könyv bestseller regény", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop" },
    { title: "Társasjáték családi", image: "https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=400&h=400&fit=crop" },
    { title: "Háziállat játék interaktív", image: "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=400&h=400&fit=crop" },
    { title: "Kültéri napelemes lámpa", image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop" },
    { title: "Hordozható ventilátor USB", image: "https://images.unsplash.com/photo-1586953208270-767889db7b09?w=400&h=400&fit=crop" },
  ],
};

const stores = [
  { name: "Temu", icon: "https://logo.clearbit.com/temu.com" },
  { name: "AliExpress", icon: "https://logo.clearbit.com/aliexpress.com" },
  { name: "Shein", icon: "https://logo.clearbit.com/shein.com" },
  { name: "Amazon", icon: "https://logo.clearbit.com/amazon.de" },
  { name: "eBay", icon: "https://logo.clearbit.com/ebay.com" },
];

const allCategories = ["tech", "fashion", "home", "sport", "baby", "auto", "gift", "other"] as const;
type Category = typeof allCategories[number];

// Generate a dynamic deal
function generateDeal(page: number, index: number, filterCategory?: Category) {
  const category = filterCategory || allCategories[(page + index) % allCategories.length];
  const templates = dealTemplates[category];
  const template = templates[(page * 3 + index) % templates.length];
  const store = stores[(page + index) % stores.length];
  
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
    id: `deal_${page}_${index}_${Date.now()}`,
  };
}

function generateDeals(page: number, count: number = 9, filterCategory?: Category) {
  return Array.from({ length: count }, (_, i) => generateDeal(page, i, filterCategory));
}

type SortOption = "discount" | "price" | "newest";

const Deals = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") as Category | "all" | null;
  const { t } = useLanguage();
  
  const [deals, setDeals] = useState(() => {
    const initial = initialCategory 
      ? initialDeals.filter(d => d.category === initialCategory)
      : initialDeals;
    return initial.length > 0 ? initial : generateDeals(0, 9, (initialCategory && initialCategory !== "all") ? initialCategory : undefined);
  });
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">(initialCategory || "all");
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadMore = useCallback(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const nextPage = page + 1;
      const filterCat = categoryFilter === "all" ? undefined : categoryFilter;
      const newDeals = generateDeals(nextPage, 9, filterCat);
      setDeals(prev => [...prev, ...newDeals]);
      setPage(nextPage);
      setIsLoading(false);
    }, 400);
  }, [page, isLoading, categoryFilter]);

  // Infinite scroll observer
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

  // Reset when category changes
  useEffect(() => {
    const filterCat = categoryFilter === "all" ? undefined : categoryFilter;
    const filtered = categoryFilter === "all" 
      ? initialDeals 
      : initialDeals.filter(d => d.category === categoryFilter);
    
    if (filtered.length > 0) {
      setDeals(filtered);
    } else {
      setDeals(generateDeals(0, 9, filterCat));
    }
    setPage(0);
  }, [categoryFilter]);

  // Filter and sort deals
  const sortedDeals = useMemo(() => {
    let filtered = deals;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = deals.filter(d => d.title.toLowerCase().includes(q));
    }
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "discount":
          return b.discount - a.discount;
        case "price":
          return a.currentPrice - b.currentPrice;
        case "newest":
        default:
          return 0;
      }
    });
    return sorted;
  }, [deals, sortBy, searchQuery]);

  const sortButtons: { key: SortOption; label: string; icon: React.ReactNode }[] = [
    { key: "discount", label: "Legnagyobb kedvezmény", icon: <ArrowDownWideNarrow className="h-4 w-4" /> },
    { key: "price", label: "Legalacsonyabb ár", icon: <TrendingDown className="h-4 w-4" /> },
    { key: "newest", label: "Legújabbak", icon: <Clock className="h-4 w-4" /> },
  ];

  const categoryButtons: { key: Category | "all"; label: string; emoji: string }[] = [
    { key: "all", label: "Összes", emoji: "🔥" },
    { key: "tech", label: "Elektronika", emoji: "💻" },
    { key: "fashion", label: "Divat", emoji: "👗" },
    { key: "home", label: "Otthon", emoji: "🏠" },
    { key: "sport", label: "Sport", emoji: "🏋️" },
    { key: "baby", label: "Baba-mama", emoji: "👶" },
    { key: "auto", label: "Autó", emoji: "🚗" },
    { key: "gift", label: "Ajándék", emoji: "🎁" },
    { key: "other", label: "Egyéb", emoji: "✨" },
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      <CityScene3D />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">{t("search.back")}</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">Akciók</span>
          </div>
          
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container mx-auto px-4 py-6">
          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 mb-6">
              {/* Search + Category Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Keresés az akciók között..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-border bg-card/50 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground mr-1">Kategória:</span>
                {categoryButtons.map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => setCategoryFilter(btn.key)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      categoryFilter === btn.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span>{btn.emoji}</span>
                    {btn.label}
                  </button>
                ))}
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
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {btn.icon}
                    <span className="hidden sm:inline">{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2" />
              {sortedDeals.length}+ akció · Folyamatosan frissül
            </p>
          </div>

          {/* Deals Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedDeals.map((deal, index) => (
              <DealCard 
                key={deal.id} 
                {...deal} 
                delay={(index % 9) * 0.05}
                highlightDiscount={sortBy === "discount"}
              />
            ))}
          </div>

          {/* Load More Trigger */}
          <div ref={loadMoreRef} className="py-8 flex justify-center">
            {isLoading && (
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>További akciók betöltése...</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Deals;
