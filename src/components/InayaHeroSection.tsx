/**
 * InayaHeroSection.tsx
 * Főoldal hero szekció:
 *   - Felül: InayaAnimation 3D (idle → searching → results)
 *   - Alul: Inline chat ablak (ugyanaz a Supabase ai-proxy backend)
 */

import { useState, useRef, useEffect } from "react";
import { Send, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import InayaAnimation, { AnimationState } from "./InayaAnimation";
import ThinkingIndicator from "./ThinkingIndicator";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { BackendProduct } from "@/lib/api";
import InayaAvatar from "./InayaAvatar";

const SESSION_KEY = "inaya_hero_session_id";

type Message = {
  role: "user" | "assistant";
  content: string;
  products?: BackendProduct[];
};

// ─── Mini product card (inline, no external deps) ────────────────────────────

function ProductCardMini({ product }: { product: BackendProduct }) {
  return (
    <a
      href={`/termek/${product.slug}`}
      className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-black/40 p-2 transition-colors hover:border-amber-400/60 hover:bg-black/60"
    >
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-black/50">
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
          <ShoppingBag className="m-auto mt-2.5 h-6 w-6 text-amber-500/40" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-amber-100 leading-tight line-clamp-2">
          {product.name}
        </p>
        {product.min_price != null && (
          <p className="text-xs font-bold text-amber-400 mt-0.5">
            {product.min_price.toLocaleString("hu-HU")} {product.currency}
          </p>
        )}
        {product.best_store && (
          <p className="text-[10px] text-amber-500/70">{product.best_store}</p>
        )}
      </div>
      <span className="text-amber-500/60 text-sm">→</span>
    </a>
  );
}

// ─── Chat message bubble ──────────────────────────────────────────────────────

function HeroChatMessage({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-r from-amber-600 to-amber-500 text-black font-medium"
            : "bg-white/5 border border-amber-500/20 text-amber-50"
        }`}
      >
        {!isUser && (
          <div className="mb-1.5 flex items-center gap-1.5">
            <InayaAvatar size="xs" />
            <span className="text-[11px] font-semibold text-amber-400">Inaya</span>
          </div>
        )}
        <p className="whitespace-pre-wrap">{msg.content}</p>
        {msg.products && msg.products.length > 0 && (
          <div className="mt-2.5 space-y-1.5">
            {msg.products.map((p) => (
              <ProductCardMini key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── InayaHeroSection ─────────────────────────────────────────────────────────

const InayaHeroSection = () => {
  const [animState, setAnimState] = useState<AnimationState>("idle");
  const [animProducts, setAnimProducts] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() =>
    localStorage.getItem(SESSION_KEY)
  );
  const [greeted, setGreeted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Greeting on first mount
  useEffect(() => {
    if (greeted) return;
    setGreeted(true);
    setIsLoading(true);

    const greetingMsg =
      language === "uk"
        ? "Привітайся коротко українською як торговий асистент"
        : language === "en"
          ? "Say hi briefly in English as a shopping assistant"
          : "Köszönj röviden magyarul mint vásárlási asszisztens";

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("ai-proxy", {
          body: { message: greetingMsg, session_id: sessionId },
        });
        if (error) throw error;
        if (typeof data?.session_id === "string") {
          setSessionId(data.session_id);
          localStorage.setItem(SESSION_KEY, data.session_id);
        }
        const reply = data?.response ?? "Szia! Kérdezz bármit – segítek megtalálni a legjobb árat! 🛍️";
        setMessages([{ role: "assistant", content: reply }]);
      } catch {
        setMessages([
          {
            role: "assistant",
            content: "Szia! 👋 Kérdezz bármit – segítek megtalálni a legjobb árat!",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setAnimState("searching");
    setAnimProducts([]);

    try {
      const { data, error } = await supabase.functions.invoke("ai-proxy", {
        body: { message: userMsg.content, session_id: sessionId },
      });
      if (error) throw error;

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

      if (products.length > 0) {
        setAnimState("results");
        setAnimProducts(products.map((p) => p.name));
        setTimeout(() => {
          setAnimState("idle");
          setAnimProducts([]);
        }, 7000);
      } else {
        setAnimState("idle");
      }
    } catch {
      setAnimState("idle");
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
    <section
      className="relative flex flex-col items-center px-4 pt-6 pb-12"
      style={{
        background:
          "linear-gradient(180deg, #030308 0%, #06060f 55%, transparent 100%)",
      }}
    >
      {/* ── 3D Animation ── */}
      <div className="w-full max-w-2xl">
        <InayaAnimation
          state={animState}
          products={animProducts}
          style={{ height: "clamp(260px, 42vw, 480px)" }}
          className="w-full"
        />
      </div>

      {/* ── Inline Chat ── */}
      <div className="w-full max-w-2xl mt-3 flex flex-col rounded-2xl border border-amber-500/20 bg-black/70 backdrop-blur-md shadow-2xl shadow-amber-900/20 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[120px] max-h-[320px]">
          {messages.map((msg, i) => (
            <HeroChatMessage key={i} msg={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-amber-500/20 rounded-2xl px-4 py-2.5">
                <ThinkingIndicator />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="border-t border-amber-500/20 p-3 bg-black/40">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Kérdezz Inayától... (pl. Mutass Samsung telefonokat)"
              className="flex-1 rounded-xl border border-amber-500/25 bg-white/5 px-4 py-2.5 text-sm text-amber-50 placeholder:text-amber-500/40 outline-none focus:border-amber-400/50 transition-colors"
              disabled={isLoading}
            />
            <Button
              onClick={send}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-10 w-10 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-lg shadow-amber-900/30 shrink-0 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1.5 text-center text-[11px] text-amber-500/40">
            AI által hajtva – Inaya.hu ár-összehasonlító
          </p>
        </div>
      </div>
    </section>
  );
};

export default InayaHeroSection;
