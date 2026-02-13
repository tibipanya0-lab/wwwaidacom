
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
BEGIN
  -- Normalize: lowercase + unaccent the search query, split into words
  words := string_to_array(lower(public.unaccent(trim(search_query))), ' ');
  words := array_remove(words, '');
  
  IF array_length(words, 1) IS NULL OR array_length(words, 1) = 0 THEN
    RETURN;
  END IF;
  
  -- Build two sets of conditions:
  -- 1) title_conditions: word must appear in title (strict)
  -- 2) all_conditions: word can appear in any column (broad)
  title_conditions := ARRAY[]::text[];
  all_conditions := ARRAY[]::text[];
  
  FOREACH word IN ARRAY words
  LOOP
    single_title_cond := format(
      '(lower(public.unaccent(title)) LIKE ''%%%s%%'' OR lower(public.unaccent(COALESCE(original_title, ''''))) LIKE ''%%%s%%'')',
      word, word
    );
    title_conditions := array_append(title_conditions, single_title_cond);
    
    single_all_cond := format(
      '(lower(public.unaccent(title)) LIKE ''%%%s%%'' OR lower(public.unaccent(COALESCE(original_title, ''''))) LIKE ''%%%s%%'' OR lower(public.unaccent(COALESCE(category, ''''))) LIKE ''%%%s%%'' OR lower(public.unaccent(COALESCE(subcategory, ''''))) LIKE ''%%%s%%'' OR lower(public.unaccent(array_to_string(COALESCE(tags, ARRAY[]::text[]), '' ''))) LIKE ''%%%s%%'')',
      word, word, word, word, word
    );
    all_conditions := array_append(all_conditions, single_all_cond);
  END LOOP;
  
  -- Determine sort
  IF sort_field = 'price' THEN
    order_clause := 'price ASC';
  ELSIF sort_field = 'relevance' THEN
    -- Title matches first (score 1), then others (score 0), then by review_count
    order_clause := format(
      'CASE WHEN %s THEN 0 ELSE 1 END ASC, COALESCE(review_count, 0) DESC',
      array_to_string(title_conditions, ' AND ')
    );
  ELSE
    order_clause := 'created_at DESC';
  END IF;
  
  -- Return products matching ANY column, ordered by relevance (title match priority)
  RETURN QUERY EXECUTE format(
    'SELECT * FROM public.products WHERE %s ORDER BY %s LIMIT %s',
    array_to_string(all_conditions, ' AND '),
    order_clause,
    result_limit
  );
END;
$function$;
