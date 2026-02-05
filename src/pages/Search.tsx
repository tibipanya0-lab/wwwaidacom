import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Bot, Send, Sparkles, ShoppingBag, ArrowLeft, Loader2, MessageCircle, X, ArrowDownWideNarrow, TrendingDown, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "@/components/ChatMessage";
import ThinkingIndicator from "@/components/ThinkingIndicator";
import CityScene3D from "@/components/CityScene3D";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import SearchProductCard from "@/components/SearchProductCard";
import SmartTipBox from "@/components/SmartTipBox";
import { generateProductsForQuery, calculateThresholdInfo, getStoreById, type GeneratedProduct, type ThresholdInfo } from "@/lib/partnerStores";
import { supabase } from "@/integrations/supabase/client";
import AidaAvatar from "@/components/AidaAvatar";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aida-chat`;

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isCouponMode = searchParams.get("coupon") === "true";
  const initialQuery = searchParams.get("q") || "";
  const { language, t } = useLanguage();
  
  // Search and products state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState("");
  const [products, setProducts] = useState<GeneratedProduct[]>([]);
  const [coupons, setCoupons] = useState<{ store: string; code: string; discount: string }[]>([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<"discount" | "price" | "popular">("popular");
  const [smartTip, setSmartTip] = useState<{ info: ThresholdInfo; storeId: string; storeName: string; storeColor: string } | null>(null);
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const getInitialMessage = () => {
    if (language === "uk") {
      return "Привіт! 👋 Я Aida, ваш персональний асистент. Чим можу допомогти?";
    }
    if (language === "en") {
      return "Hi! 👋 I'm Aida, your personal assistant. How can I help?";
    }
    return "Szia! 👋 Aida vagyok. Miben segíthetek?";
  };

  // Initialize chat messages
  useEffect(() => {
    setMessages([{ role: "assistant", content: getInitialMessage() }]);
  }, [language]);

  // Handle initial query from URL
  useEffect(() => {
    if (initialQuery && !activeQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && activeQuery) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, isLoadingMore, activeQuery, page]);

  // Fetch coupons from database
  const fetchCoupons = async () => {
    const { data } = await supabase
      .from("coupons")
      .select("store_name, code, discount_percent, discount_amount")
      .eq("is_active", true);
    
    if (data) {
      setCoupons(data.map(c => ({
        store: c.store_name,
        code: c.code,
        discount: c.discount_percent ? `${c.discount_percent}% kedvezmény` : c.discount_amount || "Kedvezmény",
      })));
    }
  };

  // Fetch coupons on mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setActiveQuery(query);
    setPage(1);
    setHasMore(true);
    setSmartTip(null); // Reset tip on new search
    
    // Generate initial products with coupons
    const newProducts = generateProductsForQuery(query, 1, 12, coupons);
    setProducts(newProducts);
    
    // Calculate smart tip for a random product (simulating "viewed" product)
    const regularProducts = newProducts.filter(p => !p.isPartnerLink && p.salePriceNum);
    if (regularProducts.length > 0) {
      const viewedProduct = regularProducts[Math.floor(Math.random() * regularProducts.length)];
      const thresholdInfo = calculateThresholdInfo(viewedProduct.storeId, viewedProduct.salePriceNum || 0);
      if (thresholdInfo && thresholdInfo.amountNeeded > 0 && thresholdInfo.amountNeeded < 15000) {
        const store = getStoreById(viewedProduct.storeId);
        if (store) {
          setSmartTip({
            info: thresholdInfo,
            storeId: viewedProduct.storeId,
            storeName: store.name,
            storeColor: store.color,
          });
        }
      }
    }
    
    // Update URL
    setSearchParams({ q: query });
  };

  // Handler for addon click - search for that addon
  const handleAddonClick = (addonName: string) => {
    setSearchQuery(addonName);
    handleSearch(addonName);
    toast({
      title: "Keresés indítva 🔍",
      description: `"${addonName}" a kedvezményszint eléréséhez`,
    });
  };

  const loadMoreProducts = useCallback(() => {
    if (isLoadingMore || !hasMore || !activeQuery) return;
    
    setIsLoadingMore(true);
    
    // Simulate loading delay for UX
    setTimeout(() => {
      const nextPage = page + 1;
      const newProducts = generateProductsForQuery(activeQuery, nextPage, 12, coupons);
      
      if (nextPage > 10) {
        setHasMore(false);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(nextPage);
      }
      
      setIsLoadingMore(false);
    }, 500);
  }, [page, activeQuery, isLoadingMore, hasMore, coupons]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: chatInput.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setChatInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          searchQuery: activeQuery || chatInput.trim(),
          isCouponSearch: isCouponMode,
          language: language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Hiba történt");
      }

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
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {
            // Incomplete JSON, continue
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Hiba",
        description: error instanceof Error ? error.message : "Nem sikerült kapcsolódni Aidához",
        variant: "destructive",
      });
      if (assistantContent === "") {
        setMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  // Sort products based on selected sort option
  const sortedProducts = useMemo(() => {
    // Separate partner links (keep at top) from regular products
    const partnerLinks = products.filter(p => p.isPartnerLink);
    const regularProducts = products.filter(p => !p.isPartnerLink);
    
    const sorted = [...regularProducts].sort((a, b) => {
      switch (sortBy) {
        case "discount": {
          // Extract discount percentage from string like "-25%"
          const discountA = parseInt(a.discount?.replace(/[^0-9]/g, "") || "0");
          const discountB = parseInt(b.discount?.replace(/[^0-9]/g, "") || "0");
          return discountB - discountA; // Descending (biggest first)
        }
        case "price": {
          // Extract price from string like "15,000 Ft"
          const priceA = parseInt(a.salePrice.replace(/[^0-9]/g, "") || "0");
          const priceB = parseInt(b.salePrice.replace(/[^0-9]/g, "") || "0");
          return priceA - priceB; // Ascending (lowest first)
        }
        case "popular":
        default: {
          // Shuffle using a seeded random based on product id for consistency
          const hashA = a.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
          const hashB = b.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
          return hashA - hashB;
        }
      }
    });
    
    return [...partnerLinks, ...sorted];
  }, [products, sortBy]);

  const suggestedQueries = [
    "Bicikli", "Laptop", "Hűtőszekrény", "Kanapé", 
    "Futócipő", "Mobiltelefon", "Bababútor", "Kávéfőző"
  ];

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
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-1 md:mx-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search.inputPlaceholder")}
                className="w-full rounded-full border border-border bg-card/80 px-3 md:px-5 py-2 md:py-2.5 pr-10 md:pr-12 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
              >
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
          {/* Welcome Section - No search yet */}
          {!activeQuery && (
            <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
              <div className="mx-auto mb-6">
                <AidaAvatar size="lg" className="mx-auto shadow-glow" />
              </div>
              <h1 className="mb-3 text-3xl font-bold">{t("search.welcome")}</h1>
              <p className="text-muted-foreground mb-8">
                {t("search.welcomeSubtitle")}
              </p>

              {/* Suggested Queries */}
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedQueries.map((query) => (
                  <button
                    key={query}
                    onClick={() => {
                      setSearchQuery(query);
                      handleSearch(query);
                    }}
                    className="rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-medium transition-all hover:border-primary/50 hover:bg-card"
                  >
                    <ShoppingBag className="mr-2 inline h-4 w-4 text-primary" />
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {activeQuery && (
            <>
              {/* Results Header */}
              <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">
                      Találatok: <span className="text-primary">"{activeQuery}"</span>
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Több mint 1000+ ajánlat partnerboltjainkból
                    </p>
                  </div>
                  
                  {/* Sort Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground mr-1">Rendezés:</span>
                    <button
                      onClick={() => setSortBy("discount")}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                        sortBy === "discount"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <ArrowDownWideNarrow className="h-4 w-4" />
                      Legnagyobb kedvezmény
                    </button>
                    <button
                      onClick={() => setSortBy("price")}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                        sortBy === "price"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <TrendingDown className="h-4 w-4" />
                      Legalacsonyabb ár
                    </button>
                    <button
                      onClick={() => setSortBy("popular")}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                        sortBy === "popular"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Flame className="h-4 w-4" />
                      Legnépszerűbb
                    </button>
                  </div>
                </div>
              </div>

              {/* Smart Tip Box - Upsell Suggestions */}
              {smartTip && (
                <div className="mb-6">
                  <SmartTipBox
                    thresholdInfo={smartTip.info}
                    storeName={smartTip.storeName}
                    storeColor={smartTip.storeColor}
                    onAddonClick={handleAddonClick}
                  />
                </div>
              )}

              {/* Products List - Column Layout */}
              <div className="flex flex-col gap-4">
                {sortedProducts.map((product) => (
                  <SearchProductCard 
                    key={product.id} 
                    product={product}
                    couponCode={product.couponCode}
                    couponDiscount={product.couponDiscount}
                  />
                ))}
              </div>

              {/* Load More Trigger */}
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {isLoadingMore && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>További ajánlatok betöltése...</span>
                  </div>
                )}
                {!hasMore && products.length > 0 && (
                  <p className="text-muted-foreground text-sm">
                    Minden ajánlatot megjelenítettünk. Próbálj új keresést!
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30 transition-transform hover:scale-110 safe-area-bottom"
        >
          <AidaAvatar size="sm" className="border-primary/50 md:hidden" />
          <AidaAvatar size="md" className="border-primary/50 hidden md:block" />
        </button>
      )}

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-96 md:max-w-[calc(100vw-3rem)] h-[85vh] md:h-auto md:max-h-[32rem] rounded-t-2xl md:rounded-2xl border border-border bg-card shadow-2xl shadow-black/50 overflow-hidden animate-fade-in safe-area-bottom">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <AidaAvatar size="sm" />
              <div>
                <span className="font-semibold text-sm">Aida</span>
                <p className="text-xs text-muted-foreground">AI Asszisztens</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:h-80">
            {messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1;
              const isEmptyAssistant = message.role === "assistant" && !message.content;
              
              if (isLoading && isLastMessage && isEmptyAssistant) {
                return <ThinkingIndicator key={index} />;
              }
              
              return (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  isLoading={isLoading && isLastMessage && message.role === "assistant"}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
                placeholder="Kérdezz Aidától..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
                disabled={isLoading}
              />
              <Button
                variant="hero"
                size="icon"
                onClick={sendChatMessage}
                disabled={!chatInput.trim() || isLoading}
                className="h-9 w-9 rounded-lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
