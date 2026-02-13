-- Sync status table for tracking robot progress
CREATE TABLE public.sync_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_name TEXT NOT NULL,
  keyword TEXT NOT NULL,
  keyword_index INT NOT NULL DEFAULT 0,
  pages_completed INT NOT NULL DEFAULT 0,
  products_fetched INT NOT NULL DEFAULT 0,
  products_saved INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, done
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category_name, keyword)
);

-- Enable RLS
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage sync status
CREATE POLICY "Admins can view sync_status"
  ON public.sync_status FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert sync_status"
  ON public.sync_status FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sync_status"
  ON public.sync_status FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sync_status"
  ON public.sync_status FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Index for fast lookups
CREATE INDEX idx_sync_status_status ON public.sync_status (status);
CREATE INDEX idx_sync_status_category ON public.sync_status (category_name);