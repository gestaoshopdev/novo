-- Copie este código e execute no SQL Editor do Supabase para ativar a segurança de saques no banco de dados.

-- 1. Cria a função de validação de carência de saque
CREATE OR REPLACE FUNCTION check_payout_cooldown()
RETURNS TRIGGER AS $$
DECLARE
  v_plan TEXT;
  v_cooldown_days INT;
  v_last_payout TIMESTAMP WITH TIME ZONE;
  v_days_since_last NUMERIC;
BEGIN
  -- Obter o plano do usuário
  v_plan := get_user_plan(NEW.user_id);
  
  -- Tratar 'Básico' como 'Elite' conforme regras de negócio do app
  IF v_plan = 'Básico' THEN
    v_plan := 'Elite';
  END IF;

  -- Definir o tempo de carência (cooldown) em dias com base no plano
  IF v_plan = 'Pro' THEN
    v_cooldown_days := 15;
  ELSIF v_plan = 'Elite' THEN
    v_cooldown_days := 5;
  ELSE
    -- Se por acaso for outro plano que não deveria solicitar saques
    v_cooldown_days := 30;
  END IF;

  -- Verificar o último saque do usuário que NÃO foi rejeitado (status != 'rejected')
  SELECT created_at INTO v_last_payout
  FROM public.payout_requests
  WHERE user_id = NEW.user_id AND status != 'rejected'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_last_payout IS NOT NULL THEN
    -- Calcular a diferença em dias (1 dia = 86400 segundos)
    v_days_since_last := EXTRACT(EPOCH FROM (timezone('utc'::text, now()) - v_last_payout)) / 86400;

    IF v_days_since_last < v_cooldown_days THEN
      RAISE EXCEPTION 'Você só pode solicitar um novo saque após % dias do último saque. Faltam % dias.', 
        v_cooldown_days, 
        CEIL(v_cooldown_days - v_days_since_last);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Cria o trigger na tabela payout_requests
DROP TRIGGER IF EXISTS trg_check_payout_cooldown ON public.payout_requests;
CREATE TRIGGER trg_check_payout_cooldown
BEFORE INSERT ON public.payout_requests
FOR EACH ROW
EXECUTE FUNCTION check_payout_cooldown();
