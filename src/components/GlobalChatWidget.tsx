import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import InayaAvatar from "./InayaAvatar";
import ThinkingIndicator from "./ThinkingIndicator";
import ChatMessage from "./ChatMessage";
import { useLanguage } from "@/contexts/LanguageContext";

type Message = { role: "user" | "assistant"; content: string };

const GlobalChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // For now, respond with a placeholder - can be connected to a general chat endpoint later
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: language === "en"
          ? "I can help you find the best deals! Try searching for a product on our search page. 🛒"
          : language === "uk"
          ? "Я можу допомогти знайти найкращі пропозиції! Спробуйте пошук товарів. 🛒"
          : "Segítek megtalálni a legjobb ajánlatokat! Próbáld ki a keresést a termékek között. 🛒"
      }]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30 transition-transform hover:scale-110 safe-area-bottom"
          aria-label="Chat megnyitása"
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        </button>
      )}

      {/* Chat panel */}
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
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  isLoading={isLoading && isLast && message.role === "assistant"}
                />
              );
            })}
            {isLoading && messages[messages.length - 1]?.role === "user" && <ThinkingIndicator />}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
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
