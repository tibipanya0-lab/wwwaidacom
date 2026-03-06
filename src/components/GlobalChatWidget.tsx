import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import InayaAvatar from "./InayaAvatar";
import ThinkingIndicator from "./ThinkingIndicator";
import ChatMessage from "./ChatMessage";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { BackendProduct } from "@/lib/api";

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

const GlobalChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() =>
    localStorage.getItem(SESSION_KEY)
  );
  const endRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const getInitialMessage = () => {
    if (language === "uk") return "Привіт! 👋 Я Inaya, ваш персональний асистент. Чим можу допомогти?";
    if (language === "en") return "Hi! 👋 I'm Inaya, your personal assistant. How can I help?";
    return "Szia! 👋 Inaya vagyok, a személyes asszisztensed. Miben segíthetek?";
  };

  useEffect(() => {
    setMessages([{ role: "assistant", content: getInitialMessage() }]);
  }, [language]);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const send = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-proxy", {
        body: {
          message: userMsg.content,
          session_id: sessionId,
        },
      });

      if (error) throw error;

      if (typeof data?.session_id === "string") {
        setSessionId(data.session_id);
        localStorage.setItem(SESSION_KEY, data.session_id);
      }

      const responseText: string =
        data?.response ?? data?.reply ?? data?.message ?? data?.content ?? "";

      const products: BackendProduct[] = Array.isArray(data?.products)
        ? data.products
        : [];

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: responseText || "Nem sikerült választ kapni.",
          products: products.length > 0 ? products : undefined,
        },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
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
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30 transition-transform hover:scale-110 safe-area-bottom"
          aria-label="Chat megnyitása"
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-96 md:max-w-[calc(100vw-3rem)] h-[85vh] md:h-auto md:max-h-[32rem] rounded-t-2xl md:rounded-2xl border border-border bg-card shadow-2xl shadow-black/50 overflow-hidden animate-fade-in safe-area-bottom flex flex-col">
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
                    <div className="mt-2 space-y-1.5 pl-8">
                      {message.products.map((product) => (
                        <ProductCardMini key={product.id} product={product} />
                      ))}
                    </div>
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
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
                disabled={isLoading}
              />
              <Button variant="ghost" size="icon" onClick={send} disabled={!input.trim() || isLoading} className="h-9 w-9 rounded-lg">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalChatWidget;
