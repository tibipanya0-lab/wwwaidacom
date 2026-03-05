import { useState, useRef, useEffect } from "react";
import { Send, ShoppingBag, ArrowLeft, X, Star, Truck, ExternalLink, ArrowUp, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "@/components/ChatMessage";
import ThinkingIndicator from "@/components/ThinkingIndicator";
import CityScene3D from "@/components/CityScene3D";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import InayaAvatar from "@/components/InayaAvatar";
import SEOHead from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { searchProducts, ApiProduct } from "@/lib/api";

type Message = { role: "user" | "assistant"; content: string };

const SearchResultCard = ({ product }: { product: ApiProduct }) => {
  const starRating = product.rating ? (product.rating > 5 ? product.rating / 20 : product.rating) : 0;
  return (
    <Link
      to={`/termek/${product.id}`}
      className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 block"
    >
      {product.discount && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-deal px-2 py-1 text-xs font-bold text-deal-foreground">
          <Tag className="h-3 w-3" />{product.discount}
        </div>
      )}
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        {product.image_url ? (
          <img src={product.image_url} alt={product.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center"><ShoppingBag className="h-12 w-12 text-muted-foreground/30" /></div>
        )}
      </div>
      <div className="p-3">
        <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mb-1">{product.store_name}</span>
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug">{product.title}</h3>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-base font-bold text-primary">{product.price} {product.currency}</span>
          {product.original_price && <span className="text-xs text-muted-foreground line-through">{product.original_price} {product.currency}</span>}
        </div>
        {starRating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-muted-foreground">{starRating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

const Search = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { language, t } = useLanguage();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState("");
  const [results, setResults] = useState<ApiProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getInitialMessage = () => {
    if (language === "uk") return "Привіт! 👋 Я Inaya, ваш персональний асистент.";
    if (language === "en") return "Hi! 👋 I'm Inaya, your personal assistant.";
    return "Szia! 👋 Inaya vagyok, a személyes asszisztensed.";
  };

  useEffect(() => {
    setMessages([{ role: "assistant", content: getInitialMessage() }]);
  }, [language]);

  // Auto-search if URL has query param
  useEffect(() => {
    if (initialQuery) {
      handleSuggestionClick(initialQuery);
    }
  }, []);

  const doSearch = async (q: string) => {
    setActiveQuery(q);
    setIsSearching(true);
    setSearchError(false);
    try {
      const data = await searchProducts(q);
      setResults(data);
    } catch {
      setSearchError(true);
      toast({ title: "Hiba", description: "A keresés nem sikerült. Próbáld újra!", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    doSearch(q);
  };

  const handleSuggestionClick = (q: string) => {
    setSearchQuery(q);
    doSearch(q);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isLoading) return;
    const userMessage: Message = { role: "user", content: chatInput.trim() };
    setMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setMessages(prev => [...prev, { role: "assistant", content: "A chat funkció jelenleg a termék oldalakon érhető el. Nyiss meg egy terméket a keresési találatok közül! 🛒" }]);
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { if (isChatOpen) scrollToBottom(); }, [messages, isChatOpen]);

  const suggestedQueries = ["Kabát", "Cipő", "Táska", "Fülhallgató", "Óra", "Játék", "Konyhai eszköz", "Szépségápolás"];

  return (
    <div className="min-h-screen flex flex-col relative">
      <SEOHead
        title={{ hu: "Keresés - Inaya AI Árösszehasonlító", en: "Search - Inaya AI Price Comparison", uk: "Пошук - Inaya AI Порівняння цін" }}
        description={{ hu: "Keresd meg a legjobb árakat!", en: "Find the best prices!", uk: "Знайдіть найкращі ціни!" }}
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
              <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
          <LanguageSelector />
        </div>
      </header>

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
                  <button key={q} onClick={() => handleSuggestionClick(q)} className="rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-medium transition-all hover:border-primary/50 hover:bg-card">
                    <ShoppingBag className="mr-2 inline h-4 w-4 text-primary" />{q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {activeQuery && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold">
                  Keresés: <span className="text-primary">"{activeQuery}"</span>
                  {!isSearching && <span className="text-sm font-normal text-muted-foreground ml-2">({results.length} találat)</span>}
                </h2>
              </div>

              {isSearching ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                      <Skeleton className="aspect-square w-full" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchError ? (
                <div className="py-20 text-center">
                  <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Hiba történt a keresés során. Próbáld újra!</p>
                </div>
              ) : results.length === 0 ? (
                <div className="py-20 text-center">
                  <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Nincs találat erre: "{activeQuery}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.map(p => <SearchResultCard key={p.id} product={p} />)}
                </div>
              )}
            </div>
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
