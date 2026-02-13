
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Add embedding column to products table (768 dimensions for Gemini text-embedding-004)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS idx_products_embedding ON public.products
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- Create semantic search function
CREATE OR REPLACE FUNCTION public.semantic_search(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 100,
  filter_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  original_title text,
  price numeric,
  currency text,
  image_url text,
  affiliate_url text,
  store_name text,
  category text,
  subcategory text,
  gender text,
  tags text[],
  rating numeric,
  review_count integer,
  shipping_days text,
  shipping_cost text,
  similarity float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.original_title,
    p.price,
    p.currency,
    p.image_url,
    p.affiliate_url,
    p.store_name,
    p.category,
    p.subcategory,
    p.gender,
    p.tags,
    p.rating,
    p.review_count,
    p.shipping_days,
    p.shipping_cost,
    (1 - (p.embedding <=> query_embedding))::float AS similarity
  FROM public.products p
  WHERE p.embedding IS NOT NULL
    AND (1 - (p.embedding <=> query_embedding)) > match_threshold
    AND (filter_category IS NULL OR p.category ILIKE '%' || filter_category || '%')
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
