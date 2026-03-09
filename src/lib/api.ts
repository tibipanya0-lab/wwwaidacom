const API_BASE = "";

export interface ApiProduct {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url?: string | null;
  affiliate_url?: string | null;
  store_name: string;
  rating?: number | null;
  review_count?: number | null;
  shipping_days?: string | null;
  shipping_cost?: string | null;
  category?: string | null;
  discount?: string | null;
  original_price?: number | null;
}

export interface SearchResponse {
  results: ApiProduct[];
  total?: number;
}

export interface ProductsResponse {
  items: ApiProduct[];
  next_cursor?: string | null;
  has_more?: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
}

export interface ClassifyResponse {
  category: string;
  confidence?: number;
}

export interface BackendProduct {
  id: number;
  name: string;
  slug: string;
  image_url?: string | null;
  min_price?: number | null;
  currency: string;
  best_store?: string | null;
  stores?: string[];
  category_name?: string | null;
  category_slug?: string | null;
}

export interface AssistantResponse {
  session_id: string;
  response: string;
  cached: boolean;
  products: BackendProduct[];
  search_performed: boolean;
}

export async function searchProducts(query: string): Promise<ApiProduct[]> {
  const res = await fetch(`${API_BASE}/api/v1/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.hits ?? data.results ?? data.items ?? [];
}

export async function fetchProducts(cursor?: string | null): Promise<ProductsResponse> {
  let path = `/api/v1/products?limit=20`;
  if (cursor) path += `&cursor=${encodeURIComponent(cursor)}`;
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
  const data = await res.json();
  return {
    items: Array.isArray(data) ? data : data.items ?? data.results ?? [],
    next_cursor: data.next_cursor ?? data.cursor ?? null,
    has_more: data.has_more ?? (Array.isArray(data) ? data.length >= 20 : (data.items?.length ?? 0) >= 20),
  };
}

export async function chatWithProduct(productId: string, messages: ChatMessage[]): Promise<string> {
  const res = await fetch(`${API_BASE}/api/v1/chat/${productId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
  const data = await res.json();
  return data.reply ?? data.message ?? data.content ?? "";
}

export async function classifyProduct(text: string): Promise<ClassifyResponse> {
  const res = await fetch(`${API_BASE}/api/v1/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Classify failed: ${res.status}`);
  return res.json();
}
