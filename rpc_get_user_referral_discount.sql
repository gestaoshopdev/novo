CREATE OR REPLACE FUNCTION get_user_referral_discount(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_id uuid;
  v_referrer_plan text;
  v_is_partner boolean;
  v_partner_rate integer;
  v_percentage numeric;
BEGIN
  -- 1. Verificar se o usuário foi indicado
  SELECT referrer_id INTO v_referrer_id
  FROM public.referrals
  WHERE referred_id = p_user_id
  LIMIT 1;

  -- Se não foi indicado, retorna 0
  IF v_referrer_id IS NULL THEN
    RETURN 0;
  END IF;

  -- 1.5 Verificar se o usuário já assinou um plano antes (se já possui plan_expiry)
  -- Se já assinou, ele não tem mais direito ao desconto de primeira mensalidade.
  IF (SELECT raw_user_meta_data->>'plan_expiry' FROM auth.users WHERE id = p_user_id) IS NOT NULL THEN
    RETURN 0;
  END IF;

  -- 2. Buscar o plano do indicador
  SELECT plan_type INTO v_referrer_plan
  FROM public.profiles
  WHERE id = v_referrer_id
  LIMIT 1;
  
  -- Se plan_type estiver nulo no perfil ou for Starter, tenta extrair do auth.users
  IF v_referrer_plan IS NULL OR v_referrer_plan = 'Starter' THEN
    SELECT raw_user_meta_data->>'plan' INTO v_referrer_plan
    FROM auth.users
    WHERE id = v_referrer_id;
  END IF;

  -- 3. Verificar se o indicador é parceiro e sua taxa
  SELECT (raw_user_meta_data->>'is_partner')::boolean, (raw_user_meta_data->>'commission_rate')::integer
  INTO v_is_partner, v_partner_rate
  FROM auth.users
  WHERE id = v_referrer_id;

  -- 4. Definir a porcentagem de desconto com base na comissão do indicador
  IF COALESCE(v_is_partner, false) AND COALESCE(v_partner_rate, 0) > 0 THEN
    -- Garantir que não passe de 25% (ou a regra que você tenha no webhook, mantendo igual)
    IF v_partner_rate > 25 THEN
      v_percentage := 0.25;
    ELSE
      v_percentage := v_partner_rate / 100.0;
    END IF;
  ELSIF v_referrer_plan = 'Elite' THEN
    v_percentage := 0.20;
  ELSIF v_referrer_plan = 'Pro' THEN
    v_percentage := 0.10;
  ELSE
    v_percentage := 0;
  END IF;

  RETURN v_percentage;
END;
$$;
