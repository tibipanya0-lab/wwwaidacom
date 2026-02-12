import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Send, ShoppingBag, ArrowLeft, Loader2, MessageCircle, X, ArrowDownWideNarrow, TrendingDown, Flame, ExternalLink, Truck, Tag, Copy, Check, ArrowUp, SlidersHorizontal, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "@/components/ChatMessage";
import ThinkingIndicator from "@/components/ThinkingIndicator";
import CityScene3D from "@/components/CityScene3D";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import { supabase } from "@/integrations/supabase/client";
import aliexpressLogo from "@/assets/aliexpress-logo.png";
import InayaAvatar from "@/components/InayaAvatar";

// --- Search cache (sessionStorage + in-memory) ---
const CACHE_PREFIX = "search_cache_";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedResult {
  data: SearchResponse;
  timestamp: number;
}

const memoryCache = new Map<string, CachedResult>();

function getCacheKey(query: string, page: number, sort: string, language: string) {
  return `${query.toLowerCase().trim()}|${page}|${sort}|${language}`;
}

function getFromCache(key: string): SearchResponse | null {
  // Try memory first
  const mem = memoryCache.get(key);
  if (mem && Date.now() - mem.timestamp < CACHE_TTL) return mem.data;
  // Try sessionStorage
  try {
    const stored = sessionStorage.getItem(CACHE_PREFIX + key);
    if (stored) {
      const parsed: CachedResult = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < CACHE_TTL) {
        memoryCache.set(key, parsed);
        return parsed.data;
      }
      sessionStorage.removeItem(CACHE_PREFIX + key);
    }
  } catch {}
  return null;
}

function setCache(key: string, data: SearchResponse) {
  const entry: CachedResult = { data, timestamp: Date.now() };
  memoryCache.set(key, entry);
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {}
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface LiveProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  currency: string;
  image_url: string | null;
  affiliate_url: string | null;
  store_name: string;
  discount: string | null;
  rating: number | null;
  starRating: number | null;
  reviewsCount: number | null;
  orders: number | null;
  hasCoupon?: boolean;
  couponCode?: string | null;
  couponDiscount?: string | null;
  shippingDays?: number | null;
  shippingMinDays?: number | null;
  shippingMaxDays?: number | null;
}

// Star rating display component
const StarRating = ({ rating, reviewsCount, language }: { rating: number; reviewsCount: number | null; language: string }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const reviewLabel = language === "en" ? "reviews" : language === "uk" ? "відгуків" : "vélemény";
  const newProductLabel = language === "en" ? "New product" : language === "uk" ? "Новий товар" : "Új termék";

  if (rating <= 0) {
    return (
      <span className="text-[11px] sm:text-xs text-muted-foreground italic">{newProductLabel}</span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-px">
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg key={`f${i}`} className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"/></svg>
        ))}
        {hasHalf && (
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 20 20">
            <defs><clipPath id="halfClip"><rect x="0" y="0" width="10" height="20"/></clipPath></defs>
            <path className="text-muted-foreground/30 fill-current" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"/>
            <path className="text-amber-400 fill-amber-400" clipPath="url(#halfClip)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"/>
          </svg>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg key={`e${i}`} className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/30 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"/></svg>
        ))}
      </div>
      <span className="text-[11px] sm:text-xs font-medium text-foreground">{rating.toFixed(1)}</span>
      {reviewsCount != null && reviewsCount > 0 && (
        <span className="text-[11px] sm:text-xs text-muted-foreground">({reviewsCount.toLocaleString("hu-HU")} {reviewLabel})</span>
      )}
    </div>
  );
};

interface SearchResponse {
  products: LiveProduct[];
  total: number;
  page: number;
  fallback?: boolean;
  hasMore?: boolean;
}

const SEARCH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aliexpress-search`;

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState("");
  const [products, setProducts] = useState<LiveProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [sortBy, setSortBy] = useState<"discount" | "price" | "popular">("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minRating, setMinRating] = useState<number>(0);
  const [freeShippingOnly, setFreeShippingOnly] = useState(false);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const getInitialMessage = () => {
    if (language === "uk") return "Привіт! 👋 Я Inaya, ваш персональний асистент. Чим можу допомогти?";
    if (language === "en") return "Hi! 👋 I'm Inaya, your personal assistant. How can I help?";
    return "Szia! 👋 Inaya vagyok. Miben segíthetek?";
  };

  useEffect(() => {
    setMessages([{ role: "assistant", content: getInitialMessage() }]);
  }, [language]);

  // Debounced search: auto-search after 500ms of no typing
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialQuery && !activeQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  // Re-fetch when language changes
  useEffect(() => {
    if (activeQuery) {
      handleSearch(activeQuery);
    }
  }, [language]);

  // Debounce: trigger search 500ms after user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim() || searchQuery.trim() === activeQuery) return;
    debounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      setHasMore(false);
      handleSearch(searchQuery);
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const handleSearch = async (query: string, page = 1, append = false) => {
    if (!query.trim()) return;
    const cacheKey = getCacheKey(query, page, sortBy, language);

    // Check cache first
    const cached = getFromCache(cacheKey);
    if (cached && !append) {
      console.log(`[Cache HIT] "${query}" p${page}`);
      setActiveQuery(query);
      setSearchParams({ q: query });
      setProducts(cached.products || []);
      setIsFallback(cached.fallback === true);
      setCurrentPage(page);
      setHasMore(cached.hasMore === true);
      setTotalCount(cached.total || 0);
      return;
    }

    setActiveQuery(query);
    if (!append) {
      setIsSearching(true);
      setSearchParams({ q: query });
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await fetch(SEARCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), page, sort: sortBy === "price" ? "SALE_PRICE_ASC" : "LAST_VOLUME_DESC", language }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Keresési hiba");
      }

      const data: SearchResponse = await response.json();

      // Save to cache
      setCache(cacheKey, data);

      if (append) {
        setProducts(prev => [...prev, ...(data.products || [])]);
      } else {
        setProducts(data.products || []);
      }
      setIsFallback(data.fallback === true);
      setCurrentPage(page);
      setHasMore(data.hasMore === true);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error("Search error:", error);
      toast({ title: "Hiba", description: error instanceof Error ? error.message : "Nem sikerült keresni", variant: "destructive" });
      if (!append) setProducts([]);
    }
    setIsSearching(false);
    setIsLoadingMore(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setHasMore(false);
    handleSearch(searchQuery);
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoadingMore || isSearching) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          handleSearch(activeQuery, currentPage + 1, true);
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isSearching, currentPage, activeQuery]);

  const sortedProducts = useMemo(() => {
    let filtered = [...products];

    // Price filter
    if (maxPrice !== "" && maxPrice > 0) {
      filtered = filtered.filter(p => p.price <= maxPrice);
    }
    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(p => (p.rating ?? 0) >= minRating);
    }
    // Free shipping filter
    if (freeShippingOnly) {
      filtered = filtered.filter(p =>
        p.shippingDays === 0 || (p.shippingMinDays != null && p.shippingMinDays <= 7)
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "discount":
          return a.price - b.price;
        case "popular":
        default:
          return 0;
      }
    });
  }, [products, sortBy, maxPrice, minRating, freeShippingOnly]);

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat("hu-HU", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);

  // Chat logic
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { if (isChatOpen) scrollToBottom(); }, [messages, isChatOpen]);

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isLoading) return;
    const userMessage: Message = { role: "user", content: chatInput.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setChatInput("");
    setIsLoading(true);
    let assistantContent = "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/inaya-chat`;
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })), searchQuery: activeQuery || chatInput.trim(), isCouponSearch: false, language }),
      });
      if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.error || "Hiba történt"); }
      if (!response.body) throw new Error("Nincs válasz");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: assistantContent }; return u; });
            }
          } catch { /* incomplete JSON */ }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({ title: "Hiba", description: error instanceof Error ? error.message : "Nem sikerült kapcsolódni Aidához", variant: "destructive" });
      if (assistantContent === "") setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQueries = ["Bicikli", "Laptop", "Hűtőszekrény", "Kanapé", "Futócipő", "Mobiltelefon", "Bababútor", "Kávéfőző"];

  return (
    <div className="min-h-screen flex flex-col relative">
      <CityScene3D />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-amber-500/20 bg-black/80 backdrop-blur-lg safe-area-top">
        <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-3 md:px-4 gap-2">
          <Link to="/" className="flex items-center gap-1 md:gap-2 text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-xs md:text-sm font-medium hidden sm:inline">{t("search.back")}</span>
          </Link>
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-1 md:mx-4">
            <div className="relative">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("search.inputPlaceholder")} className="w-full rounded-full border border-border bg-card/80 px-3 md:px-5 py-2 md:py-2.5 pr-10 md:pr-12 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
              <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container mx-auto px-4 py-6">
          {/* Welcome Section */}
          {!activeQuery && (
            <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
              <div className="mx-auto mb-6"><InayaAvatar size="lg" className="mx-auto shadow-glow" /></div>
              <h1 className="mb-3 text-3xl font-bold">{t("search.welcome")}</h1>
              <p className="text-muted-foreground mb-8">{t("search.welcomeSubtitle")}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedQueries.map((query) => (
                  <button key={query} onClick={() => { setSearchQuery(query); handleSearch(query); }} className="rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-medium transition-all hover:border-primary/50 hover:bg-card">
                    <ShoppingBag className="mr-2 inline h-4 w-4 text-primary" />{query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {activeQuery && (
            <>
              <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{isFallback ? "Népszerű termékek" : <>Találatok: <span className="text-primary">"{activeQuery}"</span></>}</h2>
                    <p className="text-muted-foreground text-sm">{isFallback ? "Ajánlott termékek az AliExpress-ről" : `${sortedProducts.length} termék megjelenítve${sortedProducts.length < products.length ? ` (${products.length}-ból szűrve)` : totalCount > products.length ? ` (összesen ~${totalCount.toLocaleString("hu-HU")})` : ""}`}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground mr-1">Rendezés:</span>
                    {([
                      { key: "popular" as const, label: "Népszerű", icon: Flame },
                      { key: "price" as const, label: "Legolcsóbb", icon: TrendingDown },
                    ]).map(({ key, label, icon: Icon }) => (
                      <button key={key} onClick={() => setSortBy(key)} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${sortBy === key ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                        <Icon className="h-4 w-4" />{label}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowFilters(v => !v)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${showFilters ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                    >
                      <SlidersHorizontal className="h-4 w-4" />Szűrők
                      {(maxPrice !== "" || minRating > 0 || freeShippingOnly) && (
                        <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground/20 text-[10px] font-bold">
                          {[maxPrice !== "", minRating > 0, freeShippingOnly].filter(Boolean).length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Filters panel */}
                {showFilters && (
                  <div className="mb-4 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-3 sm:p-4 animate-fade-in">
                    <div className="flex flex-wrap gap-3 sm:gap-4 items-end">
                      {/* Max price */}
                      <div className="flex flex-col gap-1 min-w-[140px]">
                        <label className="text-xs font-medium text-muted-foreground">Max ár (Ft)</label>
                        <input
                          type="number"
                          placeholder="pl. 5000"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 w-full"
                        />
                      </div>

                      {/* Min rating */}
                      <div className="flex flex-col gap-1 min-w-[140px]">
                        <label className="text-xs font-medium text-muted-foreground">Min értékelés</label>
                        <div className="flex gap-1">
                          {[0, 80, 90, 95].map((val) => (
                            <button
                              key={val}
                              onClick={() => setMinRating(minRating === val ? 0 : val)}
                              className={`flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${minRating === val ? "bg-primary text-primary-foreground" : "border border-border bg-background text-muted-foreground hover:text-foreground"}`}
                            >
                              {val === 0 ? "Mind" : <><Star className="h-3 w-3" />{val}%+</>}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Free shipping */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">Szállítás</label>
                        <button
                          onClick={() => setFreeShippingOnly(v => !v)}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${freeShippingOnly ? "bg-primary text-primary-foreground" : "border border-border bg-background text-muted-foreground hover:text-foreground"}`}
                        >
                          🚀 Gyors (≤7 nap)
                        </button>
                      </div>

                      {/* Reset */}
                      {(maxPrice !== "" || minRating > 0 || freeShippingOnly) && (
                        <button
                          onClick={() => { setMaxPrice(""); setMinRating(0); setFreeShippingOnly(false); }}
                          className="rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          Szűrők törlése
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {isSearching && (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm animate-pulse">
                      <div className="w-full sm:w-44 md:w-52 aspect-square sm:aspect-auto sm:h-48 bg-muted" />
                      <div className="flex flex-1 flex-col p-4 gap-3">
                        <div className="h-4 w-3/4 rounded bg-muted" />
                        <div className="h-4 w-1/2 rounded bg-muted" />
                        <div className="flex gap-2">
                          <div className="h-6 w-24 rounded bg-muted" />
                          <div className="h-6 w-16 rounded bg-muted" />
                        </div>
                        <div className="flex gap-2 mt-auto">
                          <div className="h-10 w-full rounded-lg bg-muted" />
                          <div className="h-10 w-full rounded-lg bg-muted" />
                        </div>
                        <div className="h-10 w-32 rounded-xl bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isSearching && products.length === 0 && !isFallback && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-6">Nincs találat erre: „{activeQuery}"</p>
                  <a
                    href={`https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(activeQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-4 rounded-2xl border-2 border-primary/40 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-5 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20"
                  >
                    <img src={aliexpressLogo} alt="AliExpress" className="h-12 w-12 rounded-xl object-contain" />
                    <div className="text-left">
                      <p className="text-base font-bold text-foreground mb-0.5">Nézz szét az AliExpress teljes kínálatában</p>
                      <p className="text-xs text-muted-foreground">500 000+ termék · Ingyenes szállítás sok tételre</p>
                    </div>
                    <ExternalLink className="h-5 w-5 text-primary shrink-0 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              )}

              {!isSearching && isFallback && products.length > 0 && (
                <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Erre a kifejezésre nem találtunk pontos egyezést: <strong className="text-foreground">„{activeQuery}"</strong></p>
                  <p className="text-sm font-medium text-primary flex items-center justify-center gap-1.5">
                    <Flame className="h-4 w-4" /> Íme a legnépszerűbb termékek az AliExpress-ről:
                  </p>
                </div>
              )}

              {!isSearching && products.length > 0 && (
                <>
                  <div className="flex flex-col gap-3">
                    {sortedProducts.map((product, idx) => (
                      <div
                        key={`${product.id}-${idx}`}
                        className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm transition-all hover:shadow-lg hover:border-primary/50"
                      >
                        {/* Image */}
                        <a
                          href={product.affiliate_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="relative shrink-0 w-full sm:w-44 md:w-52 aspect-[4/3] sm:aspect-auto sm:h-auto overflow-hidden bg-muted"
                        >
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground min-h-[8rem]">
                              <ShoppingBag className="h-8 w-8" />
                            </div>
                          )}
                          {product.discount && (
                            <span className="absolute top-2 left-2 rounded-lg bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground shadow-sm">
                              -{product.discount}
                            </span>
                          )}
                        </a>

                        {/* Content */}
                        <div className="flex flex-1 flex-col p-3 sm:p-4 gap-2 sm:gap-3 min-w-0">
                          {/* Name + price */}
                          <div className="flex flex-col gap-0.5 sm:gap-1">
                            <a href={product.affiliate_url || "#"} target="_blank" rel="noopener noreferrer nofollow" className="hover:underline">
                              <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">{product.name}</h3>
                            </a>
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <p className="text-lg sm:text-xl font-bold text-primary">{formatPrice(product.price, product.currency)}</p>
                              {product.originalPrice > product.price && (
                                <p className="text-xs sm:text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice, product.currency)}</p>
                              )}
                              {product.orders != null && product.orders > 0 && (
                                <span className="text-xs text-muted-foreground">· {product.orders.toLocaleString("hu-HU")}+ eladva</span>
                              )}
                            </div>
                          </div>

                          {/* Star rating */}
                          <StarRating rating={product.starRating ?? 0} reviewsCount={product.reviewsCount} language={language} />

                          {/* Info row: compact on mobile */}
                          <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-2">
                            {/* Shipping with estimated days */}
                            <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-border/50 px-2 sm:px-3 py-1.5 sm:py-2 sm:flex-1">
                              <span className="text-sm sm:text-base">🚚</span>
                              <span className="text-[11px] sm:text-sm text-muted-foreground leading-tight">
                                {product.shippingMinDays && product.shippingMaxDays
                                  ? `${product.shippingMinDays}-${product.shippingMaxDays} napos szállítás`
                                  : product.shippingDays
                                    ? `~${product.shippingDays} napos szállítás`
                                    : "~15-25 napos szállítás"}
                              </span>
                            </div>

                            {/* Coupon info */}
                            {product.couponCode ? (
                              <div
                                className="flex items-center gap-1.5 sm:gap-2 rounded-lg border-2 border-dashed border-orange-400/60 bg-orange-500/10 px-2 sm:px-3 py-1.5 sm:py-2 sm:flex-1 cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(product.couponCode!);
                                  setCopiedId(product.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                              >
                                <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-orange-500" />
                                <code className="text-xs sm:text-sm font-mono font-bold text-foreground truncate">{product.couponCode}</code>
                                <button className="shrink-0 ml-auto flex items-center gap-1 rounded-md sm:rounded-lg bg-orange-500 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-white">
                                  {copiedId === product.id ? <><Check className="h-3 w-3" /> ✓</> : <><Copy className="h-3 w-3" /></>}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-border/50 px-2 sm:px-3 py-1.5 sm:py-2 sm:flex-1">
                                <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-muted-foreground" />
                                <span className="text-[11px] sm:text-sm text-muted-foreground">Nincs kuponkód</span>
                              </div>
                            )}
                          </div>

                          {/* CTA - dynamic label */}
                          <div className="mt-auto pt-1 flex gap-2">
                            {product.couponCode ? (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigator.clipboard.writeText(product.couponCode!);
                                  setCopiedId(product.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                  window.open(product.affiliate_url || "#", "_blank", "noopener,noreferrer");
                                }}
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-4 sm:px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md"
                              >
                                {copiedId === product.id ? (
                                  <><Check className="h-4 w-4" /> MÁSOLVA!</>
                                ) : (
                                  <><Copy className="h-4 w-4" /> MÁSOLÁS: {product.couponCode}</>
                                )}
                              </button>
                            ) : (
                              <a
                                href={product.affiliate_url || "#"}
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-4 sm:px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md"
                              >
                                MEGNÉZEM <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Infinite scroll sentinel */}
                  <div ref={loadMoreRef} className="py-8 flex justify-center">
                    {isLoadingMore && (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-sm">További termékek betöltése...</span>
                      </div>
                    )}
                    {!hasMore && products.length > 0 && !isFallback && (
                      <p className="text-sm text-muted-foreground">Minden találat betöltve ({products.length} termék)</p>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Scroll to top button */}
      {activeQuery && !isChatOpen && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 right-4 md:bottom-20 md:right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/90 backdrop-blur-sm shadow-lg transition-all hover:bg-accent active:scale-95"
          aria-label="Vissza a tetejére"
        >
          <ArrowUp className="h-4 w-4 text-foreground" />
        </button>
      )}

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button onClick={() => setIsChatOpen(true)} className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30 transition-transform hover:scale-110 safe-area-bottom">
          <InayaAvatar size="sm" className="border-primary/50 md:hidden" />
          <InayaAvatar size="md" className="border-primary/50 hidden md:block" />
        </button>
      )}

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-96 md:max-w-[calc(100vw-3rem)] h-[85vh] md:h-auto md:max-h-[32rem] rounded-t-2xl md:rounded-2xl border border-border bg-card shadow-2xl shadow-black/50 overflow-hidden animate-fade-in safe-area-bottom">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <InayaAvatar size="sm" />
              <div><span className="font-semibold text-sm">Inaya</span><p className="text-xs text-muted-foreground">AI Asszisztens</p></div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:h-80">
            {messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1;
              const isEmptyAssistant = message.role === "assistant" && !message.content;
              if (isLoading && isLastMessage && isEmptyAssistant) return <ThinkingIndicator key={index} />;
              return <ChatMessage key={index} role={message.role} content={message.content} isLoading={isLoading && isLastMessage && message.role === "assistant"} />;
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendChatMessage()} placeholder="Kérdezz Inayától..." className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50" disabled={isLoading} />
              <Button variant="hero" size="icon" onClick={sendChatMessage} disabled={!chatInput.trim() || isLoading} className="h-9 w-9 rounded-lg"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
