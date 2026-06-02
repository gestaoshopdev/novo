-- Copie este código e execute no SQL Editor do Supabase

CREATE OR REPLACE FUNCTION manage_partner(
  p_target_user_id uuid,
  p_is_partner boolean,
  p_commission_rate integer,
  p_plan_type text,
  p_free_duration text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_expiry TEXT;
  v_capped_commission integer;
BEGIN
  -- Verificar se quem chama é admin
  IF (SELECT auth.jwt() ->> 'email') NOT IN ('jonathancasales.c@gmail.com', 'gustavo.2casales@gmail.com') THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem gerenciar parceiros.';
  END IF;

  -- Garantir que a comissão máxima seja 25%
  IF p_commission_rate > 25 THEN
    v_capped_commission := 25;
  ELSE
    v_capped_commission := p_commission_rate;
  END IF;

  -- Calcular data de expiração com base no benefício
  IF p_free_duration = 'vitalicio' THEN
    -- Vitalício: Adiciona 10 anos
    v_new_expiry := to_char(timezone('utc'::text, now() + interval '10 years'), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
  ELSIF p_free_duration = 'mensal' THEN
    -- Mensal: Adiciona 30 dias
    v_new_expiry := to_char(timezone('utc'::text, now() + interval '30 days'), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
  ELSE
    -- Padrão: Mantém a expiração atual, ou define para 30 dias se for nula.
    SELECT raw_user_meta_data->>'plan_expiry' INTO v_new_expiry
    FROM auth.users
    WHERE id = p_target_user_id;
    
    IF v_new_expiry IS NULL THEN
      v_new_expiry := to_char(timezone('utc'::text, now() + interval '30 days'), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
    END IF;
  END IF;

  -- Atualizar auth.users (user_metadata)
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            COALESCE(raw_user_meta_data, '{}'::jsonb),
            '{is_partner}',
            to_jsonb(p_is_partner)
          ),
          '{commission_rate}',
          to_jsonb(v_capped_commission)
        ),
        '{plan}',
        to_jsonb(p_plan_type)
      ),
      '{plan_expiry}',
      to_jsonb(v_new_expiry)
    )
  WHERE id = p_target_user_id;

  -- Atualizar public.profiles
  UPDATE public.profiles
  SET plan_type = p_plan_type
  WHERE id = p_target_user_id;

  -- Enforçar limites de catálogos do novo plano
  PERFORM enforce_catalog_limits(p_target_user_id, p_plan_type);

END;
$$;
