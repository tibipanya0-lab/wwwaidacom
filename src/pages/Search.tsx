import { useState, useRef, useEffect } from "react";
import { Send, ShoppingBag, ArrowLeft, X, Star, Truck, ExternalLink, ArrowUp } from "lucide-react";
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

type Message = { role: "user" | "assistant"; content: string };

const Search = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { language, t } = useLanguage();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState("");

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getInitialMessage = () => {
    if (language === "uk") return "Привіт! 👋 Я Inaya, ваш персональний асистент. Функція чату скоро буде доступна!";
    if (language === "en") return "Hi! 👋 I'm Inaya, your personal assistant. Chat feature coming soon!";
    return "Szia! 👋 Inaya vagyok. A chat funkció hamarosan elérhető lesz!";
  };

  useEffect(() => {
    setMessages([{ role: "assistant", content: getInitialMessage() }]);
  }, [language]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setActiveQuery(searchQuery.trim());
    toast({ title: "Keresés", description: "A keresési funkció hamarosan elérhető lesz egy új backend API-val." });
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isLoading) return;
    const userMessage: Message = { role: "user", content: chatInput.trim() };
    setMessages(prev => [...prev, userMessage]);
    setChatInput("");
    // Chat is disabled – no backend connected
    setMessages(prev => [...prev, { role: "assistant", content: "A chat funkció jelenleg nem elérhető. Hamarosan új backend API-t csatlakoztatunk! 🚀" }]);
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
              <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full">
                <Send className="h-4 w-4" />
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
                  <button key={q} onClick={() => { setSearchQuery(q); setActiveQuery(q); toast({ title: "Keresés", description: "A keresési funkció hamarosan elérhető lesz." }); }} className="rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-medium transition-all hover:border-primary/50 hover:bg-card">
                    <ShoppingBag className="mr-2 inline h-4 w-4 text-primary" />{q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results placeholder */}
          {activeQuery && (
            <div className="py-20 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <h2 className="text-2xl font-bold mb-2">Keresés: <span className="text-primary">"{activeQuery}"</span></h2>
              <p className="text-muted-foreground">A keresési funkció hamarosan elérhető lesz egy új backend API-val.</p>
              <p className="text-sm text-muted-foreground mt-2">POST /api/search endpoint csatlakoztatás alatt...</p>
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
