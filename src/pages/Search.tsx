import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "@/components/ChatMessage";
import ThinkingIndicator from "@/components/ThinkingIndicator";
import LuxuryBackground from "@/components/LuxuryBackground";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aida-chat`;

const Search = () => {
  const [searchParams] = useSearchParams();
  const isCouponMode = searchParams.get("coupon") === "true";
  const initialQuery = searchParams.get("q") || "";
  
  const getInitialMessage = () => {
    if (isCouponMode) {
      return "Szia! 🎫 Melyik áruházhoz vagy márkához keresel kupont? Szívesen körülnézek!";
    }
    return "Szia! 👋 Aida vagyok, a személyes vásárlási asszisztensed. Divat, autóalkatrész vagy lakberendezés terén segítsek ma? 🛍️";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: getInitialMessage(),
    },
  ]);
  const [input, setInput] = useState("");
  const [hasProcessedInitialQuery, setHasProcessedInitialQuery] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Process initial query from URL
  useEffect(() => {
    if (initialQuery && !hasProcessedInitialQuery && !isLoading) {
      setHasProcessedInitialQuery(true);
      sendMessageWithContent(initialQuery);
    }
  }, [initialQuery, hasProcessedInitialQuery, isLoading]);

  const sendMessageWithContent = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: content.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
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
          searchQuery: content.trim(),
          isCouponSearch: isCouponMode
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

      // Add empty assistant message
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
      // Remove empty assistant message if error
      if (assistantContent === "") {
        setMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    await sendMessageWithContent(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQueries = isCouponMode
    ? [
        "Temu kuponkódok",
        "Shein akciós kuponok",
        "Amazon kedvezmények",
        "AliExpress promóciók",
      ]
    : [
        "Levi's farmer férfi - Shein vagy Trendyol",
        "Fékbetét Golf 7-hez - AutoDoc vagy eBay",
        "Sarokkanapé szürke - Bonami vagy VidaXL",
        "Női nyári ruha - Wish vagy Shein",
      ];

  return (
    <div className="min-h-screen flex flex-col relative">
      <LuxuryBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-amber-500/20 bg-black/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Vissza</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold">Aida</span>
              <p className="text-xs text-muted-foreground">AI Shopping Asszisztens</p>
            </div>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-3xl px-4 py-6">
          {/* Welcome Section */}
          {messages.length === 1 && (
            <div className="mb-8 text-center animate-fade-in">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl gradient-hero shadow-glow">
                <Sparkles className="h-10 w-10 text-primary-foreground" />
              </div>
              <h1 className="mb-2 text-2xl font-bold">Üdv! Aida vagyok 👋</h1>
              <p className="text-muted-foreground">
                Írd le mit keresel, és megtalálom a legjobb árakat 100+ áruházból!
              </p>

              {/* Suggested Queries */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {suggestedQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(query)}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-all hover:border-primary/50 hover:bg-card/80"
                  >
                    <ShoppingBag className="mr-2 inline h-4 w-4 text-primary" />
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1;
              const isEmptyAssistant = message.role === "assistant" && !message.content;
              
              // Show ThinkingIndicator instead of empty assistant message while loading
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
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 border-t border-amber-500/20 bg-black/80 backdrop-blur-lg">
        <div className="container mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Írd le mit keresel..."
                className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-12 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                disabled={isLoading}
              />
            </div>
            <Button
              variant="hero"
              size="icon"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="h-12 w-12 rounded-xl"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Aida AI segít megtalálni a legjobb ajánlatokat
          </p>
        </div>
      </div>
    </div>
  );
};

export default Search;
