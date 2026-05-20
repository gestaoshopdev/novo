-- Execute este código no SQL Editor do Supabase para adicionar R$ 50,00 de saldo para jcasales15@gmail.com

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Tentar encontrar o usuário pelo email
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'jcasales15@gmail.com' LIMIT 1;

  -- Se não encontrou pelo auth.users, tentamos ver se há alguma forma de pegar no metadata
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário jcasales15@gmail.com não encontrado.';
  END IF;

  -- Inserir uma comissão de teste (R$ 50,00 = 5000 centavos) já disponível
  INSERT INTO commissions (referrer_id, referred_id, amount_cents, status, created_at, available_at)
  VALUES (
    v_user_id,
    gen_random_uuid(), -- ID falso para o "indicado"
    5000,              -- R$ 50,00
    'available',       -- Status liberado para saque
    now() - interval '10 days',
    now() - interval '3 days'
  );

  RAISE NOTICE 'Comissão de R$ 50,00 adicionada com sucesso para o usuário!';
END $$;
