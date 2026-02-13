ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS review_count integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS shipping_days text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS shipping_cost text DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_products_rating ON public.products (rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_products_review_count ON public.products (review_count DESC NULLS LAST);