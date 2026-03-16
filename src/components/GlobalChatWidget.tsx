import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, Send, X, ShoppingBag, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import InayaAvatar from "./InayaAvatar";
import ThinkingIndicator from "./ThinkingIndicator";
import ChatMessage from "./ChatMessage";
import { useLanguage } from "@/contexts/LanguageContext";
import { BackendProduct, API_BASE } from "@/lib/api";
import type { AnimationState } from "./InayaAnimation";

const SESSION_KEY = "inaya_chat_session_id";

type Message = {
  role: "user" | "assistant";
  content: string;
  products?: BackendProduct[];
};

function ProductCardMini({ product }: { product: BackendProduct }) {
  return (
    <a
      href={`/termek/${product.slug}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-background p-2 transition-colors hover:border-primary/50"
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <ShoppingBag className="m-auto h-6 w-6 text-muted-foreground/40" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium leading-tight line-clamp-2">
          {product.name}
        </p>
        {product.min_price != null && (
          <p className="text-xs font-bold text-primary mt-0.5">
            {product.min_price.toLocaleString("hu-HU")} {product.currency}
          </p>
        )}
        {product.best_store && (
          <p className="text-[10px] text-muted-foreground">{product.best_store}</p>
        )}
      </div>

      <span className="text-muted-foreground text-sm">→</span>
    </a>
  );
}

const PRODUCTS_PER_PAGE = 6;

function ProductListWithScroll({ products }: { products: BackendProduct[] }) {
  const [visible, setVisible] = useState(PRODUCTS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visible < products.length) {
          setVisible((v) => Math.min(v + PRODUCTS_PER_PAGE, products.length));
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, products.length]);

  const hasMore = visible < products.length;

  return (
    <div className="mt-2 space-y-1.5 pl-8">
      {products.slice(0, visible).map((product) => (
        <ProductCardMini key={product.id} product={product} />
      ))}
      {hasMore && (
        <div ref={loaderRef} className="flex items-center justify-center py-2">
          <button
            onClick={() => setVisible((v) => Math.min(v + PRODUCTS_PER_PAGE, products.length))}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ChevronDown className="h-3 w-3" />
            Még {Math.min(PRODUCTS_PER_PAGE, products.length - visible)} termék
          </button>
        </div>
      )}
    </div>
  );
}

interface GlobalChatWidgetProps {
  /** Called whenever the animation state should change.
   *  Use this to drive an <InayaAnimation> placed elsewhere on the page. */
  onAnimationState?: (state: AnimationState, products: BackendProduct[]) => void;
  /** If true, chat button and window are centered at the bottom */
  centered?: boolean;
}

const GlobalChatWidget = ({ onAnimationState, centered }: GlobalChatWidgetProps = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() =>
    localStorage.getItem(SESSION_KEY)
  );
  const [greeted, setGreeted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  // Auto-fetch greeting from AI when chat opens for the first time
  useEffect(() => {
    if (!isOpen || greeted) return;
    setGreeted(true);
    setIsLoading(true);

    const greetingMsg =
      language === "uk"
        ? "Привітайся коротко українською"
        : language === "en"
          ? "Say hi briefly in English"
          : "Köszönj röviden magyarul";

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/assistant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: greetingMsg, session_id: sessionId }),
        });
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (typeof data?.session_id === "string") {
          setSessionId(data.session_id);
          localStorage.setItem(SESSION_KEY, data.session_id);
        }
        const reply = data?.response ?? "Szia! Miben segíthetek?";
        setMessages([{ role: "assistant", content: reply }]);
      } catch {
        setMessages([{ role: "assistant", content: "Szia! 👋 Miben segíthetek?" }]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const send = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    onAnimationState?.("searching", []);

    try {
      const res = await fetch(`${API_BASE}/api/v1/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, session_id: sessionId }),
      });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();

      if (typeof data?.session_id === "string") {
        setSessionId(data.session_id);
        localStorage.setItem(SESSION_KEY, data.session_id);
      }

      const products: BackendProduct[] = Array.isArray(data?.products)
        ? data.products
        : [];

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.response || "Nem sikerült választ kapni.",
          products: products.length > 0 ? products : undefined,
        },
      ]);

      // Animate: results if products found, else idle
      if (products.length > 0) {
        onAnimationState?.("results", products);
        // Return to idle after 6 seconds
        setTimeout(() => onAnimationState?.("idle", []), 6000);
      } else {
        onAnimationState?.("idle", []);
      }
    } catch (err) {
      console.error("Chat error:", err);
      onAnimationState?.("idle", []);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Hiba történt a válasz lekérésekor. Próbáld újra! 🔄",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30 transition-transform hover:scale-110 safe-area-bottom ${
            centered ? "bottom-6 left-1/2 -translate-x-1/2" : "bottom-4 right-4 md:bottom-6 md:right-6"
          }`}
          aria-label="Chat megnyitása"
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        </button>
      )}

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
        <div style={{ width: '100%', maxWidth: '36rem', height: '90vh', maxHeight: '48rem' }} className="border border-border bg-card shadow-2xl shadow-black/50 overflow-hidden animate-fade-in flex flex-col rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-2">
              <InayaAvatar size="sm" />
              <div>
                <span className="font-semibold text-sm">Inaya</span>
                <p className="text-xs text-muted-foreground">AI Asszisztens</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
            {messages.map((message, index) => {
              const isLast = index === messages.length - 1;
              const isEmpty = message.role === "assistant" && !message.content;
              if (isLoading && isLast && isEmpty) return <ThinkingIndicator key={index} />;

              return (
                <div key={index}>
                  <ChatMessage
                    role={message.role}
                    content={message.content}
                    isLoading={isLoading && isLast && message.role === "assistant"}
                  />
                  {message.products && message.products.length > 0 && (
                    <ProductListWithScroll products={message.products} />
                  )}
                </div>
              );
            })}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <ThinkingIndicator />
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Kérdezz Inayától..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-base outline-none focus:border-primary/50"
                disabled={isLoading}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={send}
                disabled={!input.trim() || isLoading}
                className="h-9 w-9 rounded-lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        </div>
      )}
    </>
  );
};

export default GlobalChatWidget;
