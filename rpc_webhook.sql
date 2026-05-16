-- Copie este código e execute no SQL Editor do Supabase

CREATE OR REPLACE FUNCTION process_webhook_payment(p_user_id uuid, p_plan text, p_secret text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_expiry TEXT;
  v_referrer_id uuid;
  v_referrer_plan text;
  v_commission_cents integer;
  v_percentage numeric;
  v_available_at timestamp with time zone;
BEGIN
  -- 1. Verificar a senha do webhook para segurança
  IF p_secret != 'atlas-webhook-secret-2026' THEN
    RAISE EXCEPTION 'Acesso negado. Senha do webhook incorreta.';
  END IF;

  -- 2. Calcular nova data de expiração (+30 dias)
  v_new_expiry := to_char(timezone('utc'::text, now() + interval '30 days'), 'YYYY-MM-DD"T"HH24:MI:SS"Z"');

  -- 3. Atualizar auth.users (user_metadata)
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
      jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{plan}',
        to_jsonb(p_plan)
      ),
      '{plan_expiry}',
      to_jsonb(v_new_expiry)
    )
  WHERE id = p_user_id;

  -- 4. Atualizar public.profiles (se aplicável)
  UPDATE public.profiles
  SET plan_type = p_plan
  WHERE id = p_user_id;

  -- 5. Lógica de Comissionamento (Indique e Ganhe)
  -- 5.1 Verificar se o usuário foi indicado
  SELECT referrer_id INTO v_referrer_id
  FROM public.referrals
  WHERE referred_id = p_user_id
  LIMIT 1;

  IF v_referrer_id IS NOT NULL THEN
    -- 5.2 Buscar o plano do indicador
    SELECT plan_type INTO v_referrer_plan
    FROM public.profiles
    WHERE id = v_referrer_id
    LIMIT 1;
    
    -- Se plan_type estiver nulo no perfil ou for Starter, tenta extrair do auth.users (user_metadata->>'plan')
    -- Isso garante que pegamos o plano correto caso a tabela profiles esteja desatualizada
    IF v_referrer_plan IS NULL OR v_referrer_plan = 'Starter' THEN
      SELECT raw_user_meta_data->>'plan' INTO v_referrer_plan
      FROM auth.users
      WHERE id = v_referrer_id;
    END IF;

    -- Bloco de cálculo de comissão com suporte a parceiros
    DECLARE
      v_is_partner BOOLEAN;
      v_partner_rate INTEGER;
    BEGIN
      SELECT (raw_user_meta_data->>'is_partner')::boolean, (raw_user_meta_data->>'commission_rate')::integer
      INTO v_is_partner, v_partner_rate
      FROM auth.users
      WHERE id = v_referrer_id;
      
      -- 5.3 Definir a porcentagem baseada em ser parceiro ou no plano
      IF COALESCE(v_is_partner, false) AND COALESCE(v_partner_rate, 0) > 0 THEN
        -- Garantir que não passe de 25%
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

      -- 5.4 Se a porcentagem for maior que 0, calcular e inserir comissão
      IF v_percentage > 0 THEN
        -- Define o valor base em centavos dependendo do plano assinado
        IF p_plan = 'Starter' THEN
          v_commission_cents := 990 * v_percentage;
        ELSIF p_plan = 'Pro' THEN
          v_commission_cents := 1490 * v_percentage;
        ELSIF p_plan = 'Elite' THEN
          v_commission_cents := 1990 * v_percentage;
        ELSE
          v_commission_cents := 0;
        END IF;

        -- Inserir comissão pendente para liberar em 7 dias
        IF v_commission_cents > 0 THEN
          v_available_at := now() + interval '7 days';
          
          INSERT INTO public.commissions (referrer_id, referred_id, amount_cents, status, available_at)
          VALUES (v_referrer_id, p_user_id, v_commission_cents, 'pending', v_available_at);
        END IF;
      END IF;
    END;
  END IF;

END;
$$;
