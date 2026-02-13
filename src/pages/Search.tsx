import { useState, useRef, useEffect, useMemo } from "react";
import { Send, ShoppingBag, ArrowLeft, Loader2, MessageCircle, X, TrendingDown, Flame, ExternalLink, Tag, Copy, Check, ArrowUp, SlidersHorizontal, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "@/components/ChatMessage";
import ThinkingIndicator from "@/components/ThinkingIndicator";
import CityScene3D from "@/components/CityScene3D";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import { supabase } from "@/integrations/supabase/client";
import InayaAvatar from "@/components/InayaAvatar";
import SEOHead from "@/components/SEOHead";

// ─── Types ───
type Message = { role: "user" | "assistant"; content: string };

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  currency: string;
  image_url: string | null;
  affiliate_url: string | null;
  store_name: string;
  discount: string | null;
  orders: number | null;
  source: "db" | "api";
}

interface SearchResponse {
  products: Product[];
  total: number;
  page: number;
  hasMore?: boolean;
  styleTip?: string | null;
  correctedQuery?: string | null;
  source: string;
}

const SEARCH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/product-search`;

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { language, t } = useLanguage();
  const { toast } = useToast();

  // Search state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [styleTip, setStyleTip] = useState<string | null>(null);
  const [correctedQuery, setCorrectedQuery] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"popular" | "price">("popular");
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minRating, setMinRating] = useState<number>(0);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getInitialMessage = () => {
    if (language === "uk") return "Привіт! 👋 Я Inaya, ваш персональний асистент. Чим можу допомогти?";
    if (language === "en") return "Hi! 👋 I'm Inaya, your personal assistant. How can I help?";
    return "Szia! 👋 Inaya vagyok. Miben segíthetek?";
  };

  useEffect(() => {
    setMessages([{ role: "assistant", content: getInitialMessage() }]);
  }, [language]);

  // Auto-search on load
  useEffect(() => {
    if (initialQuery && !activeQuery) handleSearch(initialQuery);
  }, [initialQuery]);

  // Debounced search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim() || searchQuery.trim() === activeQuery) return;
    debounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      handleSearch(searchQuery);
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  // ─── Core Search Function ───
  const handleSearch = async (query: string, page = 1, append = false) => {
    if (!query.trim()) return;
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
        body: JSON.stringify({
          query: query.trim(),
          page,
          sort: sortBy,
          language,
          maxPrice: maxPrice || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Keresési hiba");
      }

      const data: SearchResponse = await response.json();

      if (append) {
        setProducts(prev => [...prev, ...(data.products || [])]);
      } else {
        setProducts(data.products || []);
        setStyleTip(data.styleTip || null);
        setCorrectedQuery(data.correctedQuery || null);
      }
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
    handleSearch(searchQuery);
  };

  // Infinite scroll
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

  // Client-side sorting & filtering
  const sortedProducts = useMemo(() => {
    let filtered = [...products];
    if (maxPrice !== "" && maxPrice > 0) {
      filtered = filtered.filter(p => p.price <= maxPrice);
    }
    return filtered.sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      return 0; // keep server order for "popular"
    });
  }, [products, sortBy, maxPrice]);

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat("hu-HU", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);

  // ─── Chat logic ───
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
      if (!response.ok) throw new Error("Hiba történt");
      if (!response.body) throw new Error("Nincs válasz");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, idx);
          textBuffer = textBuffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
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
          } catch {}
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({ title: "Hiba", description: "Nem sikerült kapcsolódni", variant: "destructive" });
      if (assistantContent === "") setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQueries = ["Bicikli", "Laptop", "Hűtőszekrény", "Kanapé", "Futócipő", "Mobiltelefon", "Bababútor", "Kávéfőző"];

  return (
    <div className="min-h-screen flex flex-col relative">
      <SEOHead
        title={{ hu: "Keresés - Inaya AI Árösszehasonlító", en: "Search - Inaya AI Price Comparison", uk: "Пошук - Inaya AI Порівняння цін" }}
        description={{ hu: "Keresd meg a legjobb árakat AI segítségével!", en: "Find the best prices with AI!", uk: "Знайдіть найкращі ціни з AI!" }}
        canonical="/kereses"
      />
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
          {/* Welcome */}
          {!activeQuery && (
            <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
              <div className="mx-auto mb-6"><InayaAvatar size="lg" className="mx-auto shadow-glow" /></div>
              <h1 className="mb-3 text-3xl font-bold">{t("search.welcome")}</h1>
              <p className="text-muted-foreground mb-8">{t("search.welcomeSubtitle")}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedQueries.map((q) => (
                  <button key={q} onClick={() => { setSearchQuery(q); handleSearch(q); }} className="rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-medium transition-all hover:border-primary/50 hover:bg-card">
                    <ShoppingBag className="mr-2 inline h-4 w-4 text-primary" />{q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {activeQuery && (
            <>
              <div className="mb-6">
                {correctedQuery && (
                  <div className="mb-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-sm">
                    <span className="text-muted-foreground">Erre kerestünk: </span>
                    <strong className="text-foreground">„{correctedQuery}"</strong>
                  </div>
                )}

                {styleTip && !isSearching && (
                  <div className="mb-4 flex items-start gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-4 animate-fade-in">
                    <InayaAvatar size="sm" className="shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground leading-relaxed">{styleTip}</p>
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Találatok: <span className="text-primary">"{activeQuery}"</span></h2>
                    <p className="text-muted-foreground text-sm">{sortedProducts.length} termék</p>
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
                    <button onClick={() => setShowFilters(v => !v)} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${showFilters ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                      <SlidersHorizontal className="h-4 w-4" />Szűrők
                    </button>
                  </div>
                </div>

                {showFilters && (
                  <div className="mb-4 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-3 sm:p-4 animate-fade-in">
                    <div className="flex flex-wrap gap-3 sm:gap-4 items-end">
                      <div className="flex flex-col gap-1 min-w-[140px]">
                        <label className="text-xs font-medium text-muted-foreground">Max ár (Ft)</label>
                        <input type="number" placeholder="pl. 5000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 w-full" />
                      </div>
                      {(maxPrice !== "") && (
                        <button onClick={() => setMaxPrice("")} className="rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
                          Szűrők törlése
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Loading skeleton */}
              {isSearching && (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm animate-pulse">
                      <div className="w-full sm:w-44 md:w-52 aspect-square sm:aspect-auto sm:h-48 bg-muted" />
                      <div className="flex flex-1 flex-col p-4 gap-3">
                        <div className="h-4 w-3/4 rounded bg-muted" />
                        <div className="h-4 w-1/2 rounded bg-muted" />
                        <div className="h-6 w-24 rounded bg-muted" />
                        <div className="h-10 w-32 rounded-xl bg-muted mt-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No results */}
              {!isSearching && products.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Nincs találat erre: „{activeQuery}"</p>
                  <p className="text-sm text-muted-foreground">Próbálj más kulcsszavakat!</p>
                </div>
              )}

              {/* Product list */}
              {!isSearching && products.length > 0 && (
                <>
                  <div className="flex flex-col gap-3">
                    {sortedProducts.map((product, idx) => (
                      <div key={`${product.id}-${idx}`} className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm transition-all hover:shadow-lg hover:border-primary/50">
                        {/* Image */}
                        <a href={product.affiliate_url || "#"} target="_blank" rel="noopener noreferrer nofollow" className="relative shrink-0 w-full sm:w-44 md:w-52 aspect-[4/3] sm:aspect-auto sm:h-auto overflow-hidden bg-muted">
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

                          <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-border/50 px-2 sm:px-3 py-1.5 sm:py-2 w-fit">
                            <span className="text-sm">🏪</span>
                            <span className="text-[11px] sm:text-sm text-muted-foreground">{product.store_name}</span>
                          </div>

                          <div className="mt-auto pt-1">
                            <a href={product.affiliate_url || "#"} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-4 sm:px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md">
                              MEGNÉZEM <ExternalLink className="h-4 w-4" />
                            </a>
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
                    {!hasMore && products.length > 0 && (
                      <p className="text-sm text-muted-foreground">Minden találat betöltve ({products.length} termék)</p>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Scroll to top */}
      {activeQuery && !isChatOpen && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-20 right-4 md:bottom-20 md:right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/90 backdrop-blur-sm shadow-lg transition-all hover:bg-accent active:scale-95" aria-label="Vissza a tetejére">
          <ArrowUp className="h-4 w-4 text-foreground" />
        </button>
      )}

      {/* Chat button */}
      {!isChatOpen && (
        <button onClick={() => setIsChatOpen(true)} className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30 transition-transform hover:scale-110 safe-area-bottom">
          <InayaAvatar size="sm" className="border-primary/50 md:hidden" />
          <InayaAvatar size="md" className="border-primary/50 hidden md:block" />
        </button>
      )}

      {/* Chat panel */}
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
              const isLast = index === messages.length - 1;
              const isEmpty = message.role === "assistant" && !message.content;
              if (isLoading && isLast && isEmpty) return <ThinkingIndicator key={index} />;
              return <ChatMessage key={index} role={message.role} content={message.content} isLoading={isLoading && isLast && message.role === "assistant"} />;
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendChatMessage()} placeholder="Kérdezz Inayától..." className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50" disabled={isLoading} />
              <Button variant="ghost" size="icon" onClick={sendChatMessage} disabled={!chatInput.trim() || isLoading} className="h-9 w-9 rounded-lg"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
