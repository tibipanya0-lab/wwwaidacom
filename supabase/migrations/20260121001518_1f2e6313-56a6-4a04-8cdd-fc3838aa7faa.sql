-- Fix function search path for check_coupon_expiration
CREATE OR REPLACE FUNCTION public.check_coupon_expiration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.valid_until IS NOT NULL AND NEW.valid_until < now() THEN
    NEW.is_active := false;
  END IF;
  RETURN NEW;
END;
$$;