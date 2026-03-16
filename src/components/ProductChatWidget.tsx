import { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import InayaAvatar from "./InayaAvatar";
import ThinkingIndicator from "./ThinkingIndicator";

interface ProductChatWidgetProps {
  productId: string;
  productTitle: string;
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

const ProductChatWidget = ({ productId, productTitle }: ProductChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `Szia! 👋 Kérdezz bátran erről a termékről: "${productTitle}"` },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    try {
      const lastUserMessage = updated.filter((m) => m.role === "user").pop();
      const res = await fetch(`${API_BASE}/api/v1/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: lastUserMessage?.content ?? "" }),
      });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();

      const reply = data?.response ?? data?.reply ?? data?.message ?? data?.content ?? "Nem sikerült választ kapni.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Product chat error:", err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Hiba történt. Próbáld újra!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30 transition-transform hover:scale-110"
      >
        <InayaAvatar size="sm" className="border-primary/50" />
      </button>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
    <div style={{ width: '100%', maxWidth: '36rem', height: '90vh', maxHeight: '48rem' }} className="border border-border bg-card shadow-2xl shadow-black/50 overflow-hidden animate-fade-in flex flex-col rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <InayaAvatar size="sm" />
          <div>
            <span className="font-semibold text-sm">Inaya</span>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{productTitle}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-base ${
              msg.role === "user"
                ? "gradient-hero text-primary-foreground"
                : "bg-muted border border-border"
            }`}>
              {msg.role === "assistant" && (
                <div className="mb-1 flex items-center gap-2">
                  <InayaAvatar size="xs" />
                  <span className="text-xs font-semibold text-primary">Inaya</span>
                </div>
              )}
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && <ThinkingIndicator />}
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
            placeholder="Kérdezz a termékről..."
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-base outline-none focus:border-primary/50"
            disabled={isLoading}
          />
          <Button variant="ghost" size="icon" onClick={send} disabled={!input.trim() || isLoading} className="h-9 w-9 rounded-lg">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ProductChatWidget;

