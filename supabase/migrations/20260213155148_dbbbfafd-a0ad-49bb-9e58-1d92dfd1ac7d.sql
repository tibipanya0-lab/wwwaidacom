
-- Rename 'name' to 'title'
ALTER TABLE public.products RENAME COLUMN name TO title;

-- Add new columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_title text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags text[];

-- Make affiliate_url unique
ALTER TABLE public.products ADD CONSTRAINT products_affiliate_url_unique UNIQUE (affiliate_url);
