-- Copie este código e execute no SQL Editor do Supabase para registrar a função de limpeza de catálogos, produtos e fotos excedentes.

CREATE OR REPLACE FUNCTION enforce_catalog_limits(p_user_id uuid, p_plan text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_catalogs integer;
  v_max_products_per_catalog integer;
  v_max_photos_per_product integer;
  v_plan_lower text;
BEGIN
  v_plan_lower := lower(p_plan);
  
  -- 1. Definir limites com base no plano assinado
  IF v_plan_lower = 'starter' OR v_plan_lower = 'básico' THEN
    v_max_catalogs := 1;
    v_max_products_per_catalog := 10;
    v_max_photos_per_product := 1;
  ELSIF v_plan_lower = 'pro' THEN
    v_max_catalogs := 5;
    v_max_products_per_catalog := 60;
    v_max_photos_per_product := 5;
  ELSE
    v_max_catalogs := 10; -- Elite / Outros
    v_max_products_per_catalog := 500;
    v_max_photos_per_product := 10;
  END IF;

  -- 2. Excluir as associações de produtos dos catálogos excedentes
  DELETE FROM public.catalog_products
  WHERE catalog_id IN (
    SELECT id FROM (
      SELECT id, row_number() OVER (ORDER BY created_at ASC) as rn
      FROM public.catalogs
      WHERE user_id = p_user_id
    ) t
    WHERE t.rn > v_max_catalogs
  );

  -- 3. Excluir os catálogos excedentes (mantendo os mais antigos de acordo com o limite)
  DELETE FROM public.catalogs
  WHERE id IN (
    SELECT id FROM (
      SELECT id, row_number() OVER (ORDER BY created_at ASC) as rn
      FROM public.catalogs
      WHERE user_id = p_user_id
    ) t
    WHERE t.rn > v_max_catalogs
  );

  -- 4. Excluir associações de produtos excedentes em cada catálogo restante (mantendo os mais antigos baseados na criação do produto)
  DELETE FROM public.catalog_products cp
  WHERE cp.user_id = p_user_id
    AND (cp.catalog_id, cp.product_sku) IN (
      SELECT t.catalog_id, t.product_sku FROM (
        SELECT cp_inner.catalog_id, cp_inner.product_sku,
               row_number() OVER (PARTITION BY cp_inner.catalog_id ORDER BY p.created_at ASC) as rn
        FROM public.catalog_products cp_inner
        JOIN public.products p ON cp_inner.product_sku = p.sku AND cp_inner.user_id = p.user_id
        WHERE cp_inner.user_id = p_user_id
      ) t
      WHERE t.rn > v_max_products_per_catalog
    );

  -- 5. Sincronizar o campo in_catalog na tabela de produtos
  UPDATE public.products p
  SET in_catalog = EXISTS (
    SELECT 1 
    FROM public.catalog_products cp
    WHERE cp.product_sku = p.sku AND cp.user_id = p.user_id
  )
  WHERE p.user_id = p_user_id;

  -- 6. Ajustar limite de fotos por produto (mantendo as mais antigas, que são as primeiras do array)
  UPDATE public.products
  SET 
    photos = photos[1:v_max_photos_per_product],
    photo = CASE 
      WHEN photos IS NULL OR array_length(photos, 1) = 0 OR photos[1] IS NULL THEN NULL
      ELSE photos[1]
    END
  WHERE user_id = p_user_id;

  -- 7. Forçar limites visuais dos catálogos (cores e banner)
  IF v_plan_lower = 'starter' OR v_plan_lower = 'básico' THEN
    -- No plano starter/básico: remove banner_image e restaura cores padrão
    UPDATE public.catalogs
    SET colors = '{"background": "#0F172A", "primary": "#10B981", "card": "#FFFFFF", "text": "#111827", "price": "#10B981", "button": "#10B981"}'::jsonb
    WHERE user_id = p_user_id;
  ELSIF v_plan_lower = 'pro' THEN
    -- No plano pro: remove apenas o banner_image, mantendo as cores customizadas
    UPDATE public.catalogs
    SET colors = COALESCE(colors, '{}'::jsonb) - 'banner_image'
    WHERE user_id = p_user_id;
  END IF;

END;
$$;
