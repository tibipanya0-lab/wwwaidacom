
CREATE OR REPLACE FUNCTION public.search_products(search_query text, sort_field text DEFAULT 'relevance'::text, sort_ascending boolean DEFAULT false, result_limit integer DEFAULT 200)
 RETURNS SETOF products
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  words text[];
  word text;
  title_conditions text[];
  all_conditions text[];
  single_title_cond text;
  single_all_cond text;
  order_clause text;
  fashion_words text[] := ARRAY['polo', 'póló', 'ing', 'nadrag', 'nadrág', 'ruha', 'szoknya', 'kabat', 'kabát', 'cipo', 'cipő', 'pulover', 'pulóver', 'dzseki'];
  is_fashion boolean := false;
BEGIN
  -- Normalize: lowercase + unaccent the search query, split into words
  words := string_to_array(lower(public.unaccent(trim(search_query))), ' ');
  words := array_remove(words, '');
  
  IF array_length(words, 1) IS NULL OR array_length(words, 1) = 0 THEN
    RETURN;
  END IF;

  -- Check if this is a fashion-related search
  FOREACH word IN ARRAY words
  LOOP
    IF lower(public.unaccent(word)) = ANY(fashion_words) THEN
      is_fashion := true;
    END IF;
  END LOOP;
  
  -- Build conditions using WORD BOUNDARY matching (\\m and \\M = word start/end in PostgreSQL regex)
  -- This prevents 'polo' from matching 'apolo', 'napolo' etc.
  title_conditions := ARRAY[]::text[];
  all_conditions := ARRAY[]::text[];
  
  FOREACH word IN ARRAY words
  LOOP
    -- Title: strict word boundary match
    single_title_cond := format(
      '(lower(public.unaccent(title)) ~* ''\\m%s\\M'' OR lower(public.unaccent(COALESCE(original_title, ''''))) ~* ''\\m%s\\M'')',
      word, word
    );
    title_conditions := array_append(title_conditions, single_title_cond);
    
    -- Broad: word boundary match across all searchable columns
    single_all_cond := format(
      '(lower(public.unaccent(title)) ~* ''\\m%s\\M'' OR lower(public.unaccent(COALESCE(original_title, ''''))) ~* ''\\m%s\\M'' OR lower(public.unaccent(COALESCE(category, ''''))) ~* ''\\m%s\\M'' OR lower(public.unaccent(COALESCE(subcategory, ''''))) ~* ''\\m%s\\M'' OR lower(public.unaccent(array_to_string(COALESCE(tags, ARRAY[]::text[]), '' ''))) ~* ''\\m%s\\M'')',
      word, word, word, word, word
    );
    all_conditions := array_append(all_conditions, single_all_cond);
  END LOOP;
  
  -- Determine sort
  IF sort_field = 'price' THEN
    order_clause := 'price ASC';
  ELSIF sort_field = 'relevance' THEN
    IF is_fashion THEN
      -- Fashion boost: title match in Divat category first, then title match in other categories, then rest
      order_clause := format(
        'CASE WHEN (%s) AND lower(COALESCE(category, '''')) LIKE ''%%divat%%'' THEN 0 WHEN (%s) THEN 1 ELSE 2 END ASC, COALESCE(review_count, 0) DESC',
        array_to_string(title_conditions, ' AND '),
        array_to_string(title_conditions, ' AND ')
      );
    ELSE
      -- Standard: title matches first, then others
      order_clause := format(
        'CASE WHEN %s THEN 0 ELSE 1 END ASC, COALESCE(review_count, 0) DESC',
        array_to_string(title_conditions, ' AND ')
      );
    END IF;
  ELSE
    order_clause := 'created_at DESC';
  END IF;
  
  -- Execute: match products where the word appears as a whole word in any column
  RETURN QUERY EXECUTE format(
    'SELECT * FROM public.products WHERE %s ORDER BY %s LIMIT %s',
    array_to_string(all_conditions, ' AND '),
    order_clause,
    result_limit
  );
END;
$function$;
