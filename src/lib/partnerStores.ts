// Partner store configurations for deep linking and product generation

export interface PartnerStore {
  id: string;
  name: string;
  logo: string;
  searchUrl: string;
  affiliateParam?: string;
  categories: string[];
  color: string;
}

export const PARTNER_STORES: PartnerStore[] = [
  {
    id: "temu",
    name: "Temu",
    logo: "🛒",
    searchUrl: "https://www.temu.com/search_result.html?search_key=",
    categories: ["minden"],
    color: "#FF6B00",
  },
  {
    id: "aliexpress",
    name: "AliExpress",
    logo: "🌍",
    searchUrl: "https://www.aliexpress.com/wholesale?SearchText=",
    categories: ["minden"],
    color: "#E62E04",
  },
  {
    id: "amazon",
    name: "Amazon",
    logo: "📦",
    searchUrl: "https://www.amazon.de/s?k=",
    categories: ["minden"],
    color: "#FF9900",
  },
  {
    id: "ebay",
    name: "eBay",
    logo: "🏷️",
    searchUrl: "https://www.ebay.com/sch/i.html?_nkw=",
    categories: ["minden"],
    color: "#E53238",
  },
  {
    id: "shein",
    name: "Shein",
    logo: "👗",
    searchUrl: "https://www.shein.com/pdsearch/",
    categories: ["divat", "ruha"],
    color: "#000000",
  },
  {
    id: "emag",
    name: "eMAG",
    logo: "🔌",
    searchUrl: "https://www.emag.hu/search/",
    categories: ["elektronika", "háztartás"],
    color: "#0066CC",
  },
  {
    id: "alza",
    name: "Alza",
    logo: "💻",
    searchUrl: "https://www.alza.hu/search.htm?exps=",
    categories: ["elektronika"],
    color: "#8BC34A",
  },
  {
    id: "decathlon",
    name: "Decathlon",
    logo: "⚽",
    searchUrl: "https://www.decathlon.hu/search?Ntt=",
    categories: ["sport", "bicikli", "fitness"],
    color: "#0082C3",
  },
  {
    id: "ikea",
    name: "IKEA",
    logo: "🏠",
    searchUrl: "https://www.ikea.com/hu/hu/search/?q=",
    categories: ["bútor", "lakberendezés"],
    color: "#0051BA",
  },
  {
    id: "wish",
    name: "Wish",
    logo: "⭐",
    searchUrl: "https://www.wish.com/search/",
    categories: ["minden"],
    color: "#2FB7EC",
  },
];

// Generate product placeholders for a search query
export interface GeneratedProduct {
  id: string;
  name: string;
  store: string;
  storeId: string;
  salePrice: string;
  originalPrice?: string;
  discount?: string;
  link: string;
  imageUrl?: string;
  isPartnerLink: boolean;
}

// Generate mock products and partner store cards for a query
export function generateProductsForQuery(
  query: string,
  page: number = 1,
  itemsPerPage: number = 20
): GeneratedProduct[] {
  const products: GeneratedProduct[] = [];
  const encodedQuery = encodeURIComponent(query);
  
  // First page starts with partner store cards
  if (page === 1) {
    PARTNER_STORES.slice(0, 6).forEach((store, index) => {
      products.push({
        id: `partner_${store.id}_${index}`,
        name: `${query} - Több mint 500+ találat`,
        store: store.name,
        storeId: store.id,
        salePrice: "Megnézem →",
        link: store.searchUrl + encodedQuery,
        isPartnerLink: true,
      });
    });
  }
  
  // Generate additional product placeholders
  const priceRanges = [
    { min: 2000, max: 5000 },
    { min: 5000, max: 15000 },
    { min: 15000, max: 50000 },
    { min: 50000, max: 150000 },
  ];
  
  const stores = PARTNER_STORES.filter(s => s.categories.includes("minden"));
  
  for (let i = 0; i < itemsPerPage - (page === 1 ? 6 : 0); i++) {
    const store = stores[i % stores.length];
    const priceRange = priceRanges[i % priceRanges.length];
    const price = Math.floor(Math.random() * (priceRange.max - priceRange.min) + priceRange.min);
    const hasDiscount = Math.random() > 0.5;
    const discountPercent = hasDiscount ? Math.floor(Math.random() * 40 + 10) : 0;
    const originalPrice = hasDiscount ? Math.floor(price / (1 - discountPercent / 100)) : undefined;
    
    products.push({
      id: `product_${page}_${i}_${store.id}`,
      name: `${query} - ${store.name} ajánlat #${(page - 1) * itemsPerPage + i + 1}`,
      store: store.name,
      storeId: store.id,
      salePrice: `${price.toLocaleString("hu-HU")} Ft`,
      originalPrice: originalPrice ? `${originalPrice.toLocaleString("hu-HU")} Ft` : undefined,
      discount: hasDiscount ? `-${discountPercent}%` : undefined,
      link: store.searchUrl + encodedQuery,
      isPartnerLink: false,
    });
  }
  
  return products;
}

// Get store by ID
export function getStoreById(id: string): PartnerStore | undefined {
  return PARTNER_STORES.find(s => s.id === id);
}
