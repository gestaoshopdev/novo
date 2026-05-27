-- Copie este código e execute no SQL Editor do Supabase

CREATE OR REPLACE FUNCTION update_user_plan_by_admin(target_user_id uuid, new_plan text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_expiry TEXT;
BEGIN
  -- Verificar se quem chama é admin
  IF (SELECT auth.jwt() ->> 'email') NOT IN ('jonathancasales.c@gmail.com', 'gustavo.2casales@gmail.com') THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem alterar planos.';
  END IF;

  -- Calcular nova data de expiração (+30 dias) no formato ISO 8601
  v_new_expiry := to_char(timezone('utc'::text, now() + interval '30 days'), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');

  -- Atualizar auth.users (user_metadata)
  -- Adiciona/atualiza o plano E a data de expiração para o novo ciclo de 30 dias
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
      jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{plan}',
        to_jsonb(new_plan)
      ),
      '{plan_expiry}',
      to_jsonb(v_new_expiry)
    )
  WHERE id = target_user_id;

  -- Atualizar a tabela public.profiles (se houver a coluna plan_type)
  UPDATE public.profiles
  SET plan_type = new_plan
  WHERE id = target_user_id;

  -- Enforçar limites de catálogos do novo plano
  PERFORM enforce_catalog_limits(target_user_id, new_plan);

END;
$$;
