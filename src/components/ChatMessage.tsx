import { Bot } from "lucide-react";
import ProductCard, { Product } from "./ProductCard";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

// Parse product data from AI response
const parseProducts = (content: string): { text: string; products: Product[] } => {
  const products: Product[] = [];
  
  // Pattern to match product listings like:
  // 1. **Product Name** - Store
  //    - Eredeti ár: X Ft
  //    - Akciós ár: Y Ft
  //    - Megtakarítás: Z%
  const productPattern = /\d+\.\s*\*\*([^*]+)\*\*\s*[-–]\s*([^\n]+)\n(?:[^\n]*(?:Eredeti|eredeti)[^\n]*?(\d[\d\s,.]*(?:Ft|HUF|EUR|€|\$))[^\n]*\n)?[^\n]*(?:Akciós|akciós|Ár|ár)[^\n]*?(\d[\d\s,.]*(?:Ft|HUF|EUR|€|\$))[^\n]*(?:\n[^\n]*(?:Megtakarítás|megtakarítás|kedvezmény)[^\n]*?(\d+%?))?/gi;
  
  let match;
  while ((match = productPattern.exec(content)) !== null) {
    products.push({
      name: match[1].trim(),
      store: match[2].trim().replace(/\*+/g, ''),
      originalPrice: match[3]?.trim(),
      salePrice: match[4]?.trim() || "Ár lekérdezés alatt",
      discount: match[5]?.trim(),
    });
  }

  // Simpler pattern for: **Product** - Store - Price
  if (products.length === 0) {
    const simplePattern = /\*\*([^*]+)\*\*[^\n]*?(\d[\d\s,.]*(?:Ft|HUF|EUR|€|\$))/gi;
    while ((match = simplePattern.exec(content)) !== null) {
      // Try to extract store name
      const storeMatch = content.slice(match.index, match.index + 200).match(/[-–]\s*([A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű\s]+?)(?:\s*[-–]|\s*\n|$)/);
      products.push({
        name: match[1].trim(),
        store: storeMatch?.[1]?.trim() || "Webáruház",
        salePrice: match[2].trim(),
      });
    }
  }

  // Remove duplicate products
  const uniqueProducts = products.filter((product, index, self) =>
    index === self.findIndex(p => p.name === product.name && p.store === product.store)
  );

  return { text: content, products: uniqueProducts };
};

const ChatMessage = ({ role, content, isLoading }: ChatMessageProps) => {
  const { products } = role === "assistant" ? parseProducts(content) : { products: [] };
  const hasProducts = products.length > 0;

  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div
        className={`max-w-[90%] rounded-2xl px-4 py-3 ${
          role === "user"
            ? "gradient-hero text-primary-foreground"
            : "bg-card border border-border"
        }`}
      >
        {role === "assistant" && (
          <div className="mb-2 flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary">Aida</span>
          </div>
        )}
        
        {/* Text content */}
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {content}
          {isLoading && (
            <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-primary" />
          )}
        </p>

        {/* Product Cards Grid */}
        {hasProducts && !isLoading && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
