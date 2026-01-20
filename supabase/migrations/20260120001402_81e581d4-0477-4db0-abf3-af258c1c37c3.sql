-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_percent INTEGER,
  discount_amount TEXT,
  min_order_amount TEXT,
  valid_until TIMESTAMP WITH TIME ZONE,
  category TEXT NOT NULL DEFAULT 'általános',
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Public read policy - everyone can see active coupons
CREATE POLICY "Anyone can view active coupons" 
ON public.coupons 
FOR SELECT 
USING (is_active = true);

-- Create index for faster store search
CREATE INDEX idx_coupons_store_name ON public.coupons(store_name);
CREATE INDEX idx_coupons_category ON public.coupons(category);
CREATE INDEX idx_coupons_is_active ON public.coupons(is_active);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_coupons_updated_at();