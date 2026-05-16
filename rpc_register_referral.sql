-- Copie este código e execute no SQL Editor do Supabase

CREATE OR REPLACE FUNCTION register_referral(p_code text, p_referred_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_id uuid;
BEGIN
  -- Buscar o ID do afiliado dono do código (bypassa RLS)
  SELECT user_id INTO v_referrer_id
  FROM public.referral_codes
  WHERE code = upper(p_code)
  LIMIT 1;

  IF v_referrer_id IS NOT NULL THEN
    -- Inserir a indicação (bypassa RLS)
    -- Usa ON CONFLICT DO NOTHING caso já exista uma indicação para este usuário
    BEGIN
      INSERT INTO public.referrals (referrer_id, referred_id)
      VALUES (v_referrer_id, p_referred_id);
    EXCEPTION WHEN unique_violation THEN
      -- Já existe indicação, ignorar silenciosamente
    END;
    
    RETURN true;
  END IF;

  RETURN false;
END;
$$;
