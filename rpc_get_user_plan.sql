-- Copie este código e execute no SQL Editor do Supabase

CREATE OR REPLACE FUNCTION get_user_plan(target_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan text;
  v_auth_plan text;
BEGIN
  -- 1. Tentar pegar da tabela profiles primeiro
  SELECT plan_type INTO v_plan
  FROM public.profiles
  WHERE id = target_user_id;

  -- 2. Se for nulo ou 'Starter' (pode estar desatualizado), consultar a sessão real do usuário
  IF v_plan IS NULL OR v_plan = 'Starter' THEN
    BEGIN
      SELECT raw_user_meta_data->>'plan' INTO v_auth_plan
      FROM auth.users
      WHERE id = target_user_id;
      
      IF v_auth_plan IS NOT NULL THEN
        v_plan := v_auth_plan;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Silencioso caso haja problemas de permissão interna
    END;
  END IF;

  RETURN COALESCE(v_plan, 'Starter');
END;
$$;
