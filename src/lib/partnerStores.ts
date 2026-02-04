// Partner store configurations for deep linking and product generation

export interface StoreThreshold {
  minAmount: number;       // Minimum order amount in Ft
  benefit: string;         // What you get (e.g., "Ingyenes szállítás")
  benefitType: "shipping" | "discount" | "gift";
  discountAmount?: number; // Additional discount in Ft (if applicable)
  discountPercent?: number; // Additional discount % (if applicable)
}

export interface PartnerStore {
  id: string;
  name: string;
  logo: string;
  searchUrl: string;
  affiliateParam?: string;
  categories: string[];
  color: string;
  thresholds?: StoreThreshold[]; // Coupon/shipping thresholds
}

export const PARTNER_STORES: PartnerStore[] = [
  {
    id: "temu",
    name: "Temu",
    logo: "🛒",
    searchUrl: "https://www.temu.com/search_result.html?search_key=",
    categories: ["minden"],
    color: "#FF6B00",
    thresholds: [
      { minAmount: 5000, benefit: "Ingyenes szállítás", benefitType: "shipping" },
      { minAmount: 10000, benefit: "10% extra kedvezmény", benefitType: "discount", discountPercent: 10 },
      { minAmount: 25000, benefit: "20% extra kedvezmény", benefitType: "discount", discountPercent: 20 },
      { minAmount: 50000, benefit: "VIP kupon + ajándék", benefitType: "gift", discountPercent: 25 },
    ],
  },
  {
    id: "aliexpress",
    name: "AliExpress",
    logo: "🌍",
    searchUrl: "https://www.aliexpress.com/wholesale?SearchText=",
    categories: ["minden"],
    color: "#E62E04",
    thresholds: [
      { minAmount: 8000, benefit: "Ingyenes szállítás", benefitType: "shipping" },
      { minAmount: 15000, benefit: "500 Ft kedvezmény", benefitType: "discount", discountAmount: 500 },
      { minAmount: 30000, benefit: "1500 Ft kedvezmény", benefitType: "discount", discountAmount: 1500 },
      { minAmount: 60000, benefit: "5000 Ft kedvezmény", benefitType: "discount", discountAmount: 5000 },
    ],
  },
  {
    id: "amazon",
    name: "Amazon",
    logo: "📦",
    searchUrl: "https://www.amazon.de/s?k=",
    categories: ["minden"],
    color: "#FF9900",
    thresholds: [
      { minAmount: 12000, benefit: "Ingyenes szállítás", benefitType: "shipping" },
      { minAmount: 40000, benefit: "Prime próba + gyors szállítás", benefitType: "gift" },
    ],
  },
  {
    id: "ebay",
    name: "eBay",
    logo: "🏷️",
    searchUrl: "https://www.ebay.com/sch/i.html?_nkw=",
    categories: ["minden"],
    color: "#E53238",
    thresholds: [
      { minAmount: 15000, benefit: "Ingyenes szállítás sok terméknél", benefitType: "shipping" },
    ],
  },
  {
    id: "shein",
    name: "Shein",
    logo: "👗",
    searchUrl: "https://www.shein.com/pdsearch/",
    categories: ["divat", "ruha"],
    color: "#000000",
    thresholds: [
      { minAmount: 7000, benefit: "Ingyenes szállítás", benefitType: "shipping" },
      { minAmount: 15000, benefit: "15% extra kedvezmény", benefitType: "discount", discountPercent: 15 },
      { minAmount: 30000, benefit: "20% extra + ajándék", benefitType: "discount", discountPercent: 20 },
    ],
  },
  {
    id: "emag",
    name: "eMAG",
    logo: "🔌",
    searchUrl: "https://www.emag.hu/search/",
    categories: ["elektronika", "háztartás"],
    color: "#0066CC",
    thresholds: [
      { minAmount: 10000, benefit: "Ingyenes szállítás", benefitType: "shipping" },
      { minAmount: 50000, benefit: "Extra garancia", benefitType: "gift" },
    ],
  },
  {
    id: "alza",
    name: "Alza",
    logo: "💻",
    searchUrl: "https://www.alza.hu/search.htm?exps=",
    categories: ["elektronika"],
    color: "#8BC34A",
    thresholds: [
      { minAmount: 15000, benefit: "Ingyenes szállítás", benefitType: "shipping" },
    ],
  },
  {
    id: "decathlon",
    name: "Decathlon",
    logo: "⚽",
    searchUrl: "https://www.decathlon.hu/search?Ntt=",
    categories: ["sport", "bicikli", "fitness"],
    color: "#0082C3",
    thresholds: [
      { minAmount: 15000, benefit: "Ingyenes szállítás", benefitType: "shipping" },
      { minAmount: 40000, benefit: "Ajándék sportzsák", benefitType: "gift" },
    ],
  },
  {
    id: "ikea",
    name: "IKEA",
    logo: "🏠",
    searchUrl: "https://www.ikea.com/hu/hu/search/?q=",
    categories: ["bútor", "lakberendezés"],
    color: "#0051BA",
    thresholds: [
      { minAmount: 20000, benefit: "Csökkentett szállítási díj", benefitType: "shipping" },
      { minAmount: 50000, benefit: "Ingyenes összeszerelés", benefitType: "gift" },
    ],
  },
  {
    id: "wish",
    name: "Wish",
    logo: "⭐",
    searchUrl: "https://www.wish.com/search/",
    categories: ["minden"],
    color: "#2FB7EC",
    thresholds: [
      { minAmount: 5000, benefit: "Ingyenes szállítás", benefitType: "shipping" },
      { minAmount: 12000, benefit: "10% kedvezmény", benefitType: "discount", discountPercent: 10 },
    ],
  },
];

// Suggested add-on products for upselling (cheap items to reach thresholds)
export interface SuggestedAddon {
  name: string;
  priceRange: { min: number; max: number };
  category: string;
  emoji: string;
}

export const ADDON_SUGGESTIONS: SuggestedAddon[] = [
  { name: "USB kábel", priceRange: { min: 500, max: 1500 }, category: "tech", emoji: "🔌" },
  { name: "Telefontok", priceRange: { min: 800, max: 2500 }, category: "tech", emoji: "📱" },
  { name: "Fülhallgató tartó", priceRange: { min: 600, max: 1800 }, category: "tech", emoji: "🎧" },
  { name: "Képernyővédő fólia", priceRange: { min: 400, max: 1200 }, category: "tech", emoji: "🛡️" },
  { name: "Zokni szett", priceRange: { min: 1000, max: 3000 }, category: "fashion", emoji: "🧦" },
  { name: "Öv", priceRange: { min: 1500, max: 4000 }, category: "fashion", emoji: "👔" },
  { name: "Sapka", priceRange: { min: 800, max: 2500 }, category: "fashion", emoji: "🧢" },
  { name: "LED izzó", priceRange: { min: 500, max: 1500 }, category: "home", emoji: "💡" },
  { name: "Tartó/állvány", priceRange: { min: 1000, max: 3500 }, category: "home", emoji: "📐" },
  { name: "Kulcstartó", priceRange: { min: 300, max: 1000 }, category: "accessory", emoji: "🔑" },
  { name: "Tároló doboz", priceRange: { min: 800, max: 2000 }, category: "home", emoji: "📦" },
  { name: "Sportszalag", priceRange: { min: 600, max: 2000 }, category: "sport", emoji: "💪" },
];

// Calculate the next threshold and how much more is needed
export interface ThresholdInfo {
  currentAmount: number;
  nextThreshold: StoreThreshold | null;
  amountNeeded: number;
  suggestedAddons: { addon: SuggestedAddon; price: number }[];
  potentialSaving: number;
}

export function calculateThresholdInfo(
  storeId: string, 
  currentAmount: number
): ThresholdInfo | null {
  const store = PARTNER_STORES.find(s => s.id === storeId);
  if (!store?.thresholds || store.thresholds.length === 0) {
    return null;
  }

  // Find the next threshold that hasn't been reached
  const nextThreshold = store.thresholds
    .sort((a, b) => a.minAmount - b.minAmount)
    .find(t => t.minAmount > currentAmount);

  if (!nextThreshold) {
    return null; // Already at max threshold
  }

  const amountNeeded = nextThreshold.minAmount - currentAmount;

  // Find addon suggestions that would help reach the threshold
  const suitableAddons = ADDON_SUGGESTIONS
    .filter(addon => {
      const avgPrice = (addon.priceRange.min + addon.priceRange.max) / 2;
      // Addon should be close to the amount needed (within 150%)
      return avgPrice <= amountNeeded * 1.5 && avgPrice >= amountNeeded * 0.3;
    })
    .slice(0, 3)
    .map(addon => ({
      addon,
      price: Math.floor(Math.random() * (addon.priceRange.max - addon.priceRange.min) + addon.priceRange.min),
    }));

  // Calculate potential saving
  let potentialSaving = 0;
  if (nextThreshold.discountAmount) {
    potentialSaving = nextThreshold.discountAmount;
  } else if (nextThreshold.discountPercent) {
    potentialSaving = Math.floor(nextThreshold.minAmount * (nextThreshold.discountPercent / 100));
  } else if (nextThreshold.benefitType === "shipping") {
    potentialSaving = 1500; // Estimated shipping cost
  }

  return {
    currentAmount,
    nextThreshold,
    amountNeeded,
    suggestedAddons: suitableAddons,
    potentialSaving,
  };
}

// Generate product placeholders for a search query
export interface GeneratedProduct {
  id: string;
  name: string;
  store: string;
  storeId: string;
  salePrice: string;
  salePriceNum?: number; // Numeric price for calculations
  originalPrice?: string;
  discount?: string;
  link: string;
  imageUrl?: string;
  isPartnerLink: boolean;
  couponCode?: string;
  couponDiscount?: string;
  isUsed?: boolean;
}

// Generate mock products and partner store cards for a query
export function generateProductsForQuery(
  query: string,
  page: number = 1,
  itemsPerPage: number = 12,
  coupons?: { store: string; code: string; discount: string }[]
): GeneratedProduct[] {
  const products: GeneratedProduct[] = [];
  const encodedQuery = encodeURIComponent(query);
  
  // First page starts with partner store cards
  if (page === 1) {
    PARTNER_STORES.slice(0, 4).forEach((store, index) => {
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
  
  // Generate product items with realistic variety
  const productTemplates = [
    { suffix: "- Kiváló minőség", priceRange: { min: 15000, max: 45000 } },
    { suffix: "- Népszerű választás", priceRange: { min: 8000, max: 25000 } },
    { suffix: "- Legjobb ár", priceRange: { min: 3000, max: 12000 } },
    { suffix: "- Prémium", priceRange: { min: 35000, max: 120000 } },
    { suffix: "- Akciós", priceRange: { min: 5000, max: 20000 } },
    { suffix: "- Új modell", priceRange: { min: 20000, max: 60000 } },
  ];
  
  const stores = PARTNER_STORES.filter(s => s.categories.includes("minden"));
  const itemCount = page === 1 ? itemsPerPage - 4 : itemsPerPage;
  
  for (let i = 0; i < itemCount; i++) {
    const store = stores[i % stores.length];
    const template = productTemplates[i % productTemplates.length];
    const price = Math.floor(Math.random() * (template.priceRange.max - template.priceRange.min) + template.priceRange.min);
    const hasDiscount = Math.random() > 0.4;
    const discountPercent = hasDiscount ? Math.floor(Math.random() * 35 + 10) : 0;
    const originalPrice = hasDiscount ? Math.floor(price / (1 - discountPercent / 100)) : undefined;
    
    // Find matching coupon for this store
    const storeCoupon = coupons?.find(c => 
      c.store.toLowerCase() === store.name.toLowerCase()
    );
    
    // eBay and Wish often have used items - randomly mark some as used
    const isUsedStore = store.id === "ebay" || store.id === "wish";
    const isUsed = isUsedStore && Math.random() > 0.5;
    
    products.push({
      id: `product_${page}_${i}_${store.id}`,
      name: `${query} ${template.suffix}`,
      store: store.name,
      storeId: store.id,
      salePrice: `${price.toLocaleString("hu-HU")} Ft`,
      salePriceNum: price, // Store numeric price for threshold calculations
      originalPrice: originalPrice ? `${originalPrice.toLocaleString("hu-HU")} Ft` : undefined,
      discount: hasDiscount ? `-${discountPercent}%` : undefined,
      link: store.searchUrl + encodedQuery,
      isPartnerLink: false,
      couponCode: storeCoupon?.code,
      couponDiscount: storeCoupon?.discount,
      isUsed,
    });
  }
  
  return products;
}

// Get store by ID
export function getStoreById(id: string): PartnerStore | undefined {
  return PARTNER_STORES.find(s => s.id === id);
}
