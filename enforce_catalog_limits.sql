-- Copie este código e execute no SQL Editor do Supabase para registrar a função de limpeza de catálogos excedentes.

CREATE OR REPLACE FUNCTION enforce_catalog_limits(p_user_id uuid, p_plan text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_catalogs integer;
  v_plan_lower text;
BEGIN
  v_plan_lower := lower(p_plan);
  
  -- Definir o limite de catálogos com base no plano assinado
  IF v_plan_lower = 'starter' OR v_plan_lower = 'básico' THEN
    v_max_catalogs := 1;
  ELSIF v_plan_lower = 'pro' THEN
    v_max_catalogs := 5;
  ELSE
    v_max_catalogs := 10; -- Elite / Outros
  END IF;

  -- 1. Excluir as associações de produtos dos catálogos excedentes
  DELETE FROM public.catalog_products
  WHERE catalog_id IN (
    SELECT id FROM (
      SELECT id, row_number() OVER (ORDER BY created_at ASC) as rn
      FROM public.catalogs
      WHERE user_id = p_user_id
    ) t
    WHERE t.rn > v_max_catalogs
  );

  -- 2. Excluir os catálogos excedentes (mantendo os mais antigos de acordo com o limite)
  DELETE FROM public.catalogs
  WHERE id IN (
    SELECT id FROM (
      SELECT id, row_number() OVER (ORDER BY created_at ASC) as rn
      FROM public.catalogs
      WHERE user_id = p_user_id
    ) t
    WHERE t.rn > v_max_catalogs
  );
END;
$$;
