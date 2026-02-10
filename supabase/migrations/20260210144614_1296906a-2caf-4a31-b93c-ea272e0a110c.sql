-- Add category column to products table
ALTER TABLE public.products ADD COLUMN category text DEFAULT 'Egyéb';

-- Add index for category filtering
CREATE INDEX idx_products_category ON public.products (category);