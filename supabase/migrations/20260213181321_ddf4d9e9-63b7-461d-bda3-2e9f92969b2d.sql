
-- Enable unaccent extension
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA public;

-- Create a fuzzy search function that handles accents, multi-word, and searches across multiple columns
CREATE OR REPLACE FUNCTION public.search_products(
  search_query text,
  sort_field text DEFAULT 'created_at',
  sort_ascending boolean DEFAULT false,
  result_limit integer DEFAULT 40
)
RETURNS SETOF public.products
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  words text[];
  word text;
  base_query text;
  conditions text[];
  single_condition text;
  order_col text;
BEGIN
  -- Normalize: lowercase + unaccent the search query, split into words
  words := string_to_array(lower(public.unaccent(trim(search_query))), ' ');
  
  -- Remove empty strings
  words := array_remove(words, '');
  
  IF array_length(words, 1) IS NULL OR array_length(words, 1) = 0 THEN
    RETURN;
  END IF;
  
  -- Build conditions: each word must match at least one column
  conditions := ARRAY[]::text[];
  FOREACH word IN ARRAY words
  LOOP
    single_condition := format(
      '(lower(public.unaccent(title)) LIKE ''%%%s%%'' OR lower(public.unaccent(COALESCE(original_title, ''''))) LIKE ''%%%s%%'' OR lower(public.unaccent(COALESCE(category, ''''))) LIKE ''%%%s%%'' OR lower(public.unaccent(COALESCE(subcategory, ''''))) LIKE ''%%%s%%'' OR lower(public.unaccent(array_to_string(COALESCE(tags, ARRAY[]::text[]), '' ''))) LIKE ''%%%s%%'')',
      word, word, word, word, word
    );
    conditions := array_append(conditions, single_condition);
  END LOOP;
  
  -- Determine sort column
  IF sort_field = 'price' THEN
    order_col := 'price ASC';
  ELSE
    order_col := 'created_at DESC';
  END IF;
  
  -- Execute dynamic query with all word conditions (AND logic)
  RETURN QUERY EXECUTE format(
    'SELECT * FROM public.products WHERE %s ORDER BY %s LIMIT %s',
    array_to_string(conditions, ' AND '),
    order_col,
    result_limit
  );
END;
$$;
