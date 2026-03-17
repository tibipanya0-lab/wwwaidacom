import { useState, useRef, useEffect, useCallback } from "react";
import { Send, X } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import InayaAvatar from "./InayaAvatar";

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
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const send = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setIsThinking(false);

    // Add empty assistant message for streaming
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      // Try streaming endpoint first
      const res = await fetch(`${API_BASE}/api/v1/chat/${productId}/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          session_id: sessionId,
        }),
      });

      if (!res.ok || !res.body) throw new Error("stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            const eventType = line.slice(7).trim();
            // Read next data line
            continue;
          }
          if (line.startsWith("data: ")) {
            const rawData = line.slice(6);
            try {
              const payload = JSON.parse(rawData);
              // Determine event type from previous line
              if (payload.session_id) {
                setSessionId(payload.session_id);
              } else if (payload.text !== undefined) {
                fullText += payload.text;
                setIsThinking(false);
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: fullText };
                  return updated;
                });
              } else if (Object.keys(payload).length === 0) {
                // Could be thinking or done event - check what came before
              }
            } catch {}
          }
          // Handle event+data pairs
          if (line === "event: thinking") {
            setIsThinking(true);
          } else if (line === "event: thinking_done") {
            setIsThinking(false);
          } else if (line === "event: done") {
            // Stream complete
          }
        }
      }

      // If streaming produced no text, remove the empty message
      if (!fullText) {
        setMessages(prev => prev.filter((_, i) => i !== prev.length - 1));
        throw new Error("empty stream");
      }
    } catch {
      // Fallback to non-streaming
      try {
        // Remove the empty streaming message
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last.role === "assistant" && !last.content) {
            return prev.slice(0, -1);
          }
          return prev;
        });

        const res2 = await fetch(`${API_BASE}/api/v1/chat/${productId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMsg.content,
            session_id: sessionId,
          }),
        });
        if (!res2.ok) throw new Error("fallback failed");
        const data = await res2.json();
        if (data.session_id) setSessionId(data.session_id);
        const reply = data?.response ?? data?.reply ?? "Nem sikerült választ kapni.";
        setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      } catch {
        setMessages(prev => [...prev, { role: "assistant", content: "Hiba történt. Próbáld újra!" }]);
      }
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  }, [input, isLoading, productId, sessionId]);

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
        {isThinking && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 bg-muted border border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-block animate-pulse">🤔</span>
                <span>Gondolkodom...</span>
              </div>
            </div>
          </div>
        )}
        {isLoading && !isThinking && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 bg-muted border border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>·</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>·</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>·</span>
                </div>
              </div>
            </div>
          </div>
        )}
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
