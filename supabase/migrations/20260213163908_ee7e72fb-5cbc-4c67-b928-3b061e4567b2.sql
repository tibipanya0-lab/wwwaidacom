-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Fast text search on title and original_title
CREATE INDEX IF NOT EXISTS idx_products_title_trgm ON public.products USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_original_title_trgm ON public.products USING gin (original_title gin_trgm_ops);

-- Category and subcategory filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products (subcategory);
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products (gender);

-- Sorting by price and created_at
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products (price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

-- Tags search using GIN
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING gin (tags);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_category_price ON public.products (category, price);

-- Unique constraint on affiliate_url for upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_affiliate_url ON public.products (affiliate_url);