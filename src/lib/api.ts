export const API_BASE = window.location.hostname === "inaya.hu" ? "" : "https://citations-cast-friends-bookmarks.trycloudflare.com";

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
  offset?: number;
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
  const res = await fetch(`${API_BASE}/api/v1/search/?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const data = await res.json();
  const hits: any[] = Array.isArray(data) ? data : data.hits ?? data.results ?? data.items ?? [];
  return hits.map(mapHit);
}

function mapHit(h: any): ApiProduct {
  return {
    id: h.id,
    title: h.title || h.name || "",
    price: h.price ?? h.min_price ?? 0,
    currency: h.currency || "HUF",
    image_url: h.image_url,
    affiliate_url: h.affiliate_url,
    store_name: h.store_name || h.best_store || (h.stores && h.stores[0]) || "Áruház",
    rating: h.rating,
    review_count: h.review_count,
    shipping_days: h.shipping_days,
    shipping_cost: h.shipping_cost,
    category: h.category || h.category_name,
    discount: h.discount,
    original_price: h.original_price,
  };
}

export async function fetchProductsMeili(offset: number = 0, limit: number = 20, query: string = "*"): Promise<ProductsResponse> {
  const res = await fetch(`${API_BASE}/api/v1/search/?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error(`Meili fetch failed: ${res.status}`);
  const data = await res.json();
  const hits: any[] = data.hits ?? data.results ?? data.items ?? [];
  const total = data.total ?? data.estimatedTotalHits ?? 0;
  return {
    items: hits.map(mapHit),
    offset: offset + hits.length,
    has_more: offset + hits.length < total,
  };
}

export async function fetchProductsApi(cursor?: string | null): Promise<ProductsResponse> {
  let path = `${API_BASE}/api/v1/products/?limit=40`;
  if (cursor) path += `&cursor=${encodeURIComponent(cursor)}`;
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Products API failed: ${res.status}`);
  const data = await res.json();
  const raw: any[] = Array.isArray(data) ? data : data.items ?? data.results ?? [];
  return {
    items: raw.map(mapHit),
    next_cursor: data.next_cursor ?? data.cursor ?? null,
    has_more: data.has_more ?? raw.length >= 40,
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
// build trigger
