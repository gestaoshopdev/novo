-- 1. Tabela referral_codes
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS e Politicas
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Qualquer um pode ler os codigos" ON public.referral_codes FOR SELECT USING (true);
CREATE POLICY "Apenas o dono pode gerenciar seu codigo" ON public.referral_codes FOR ALL USING (auth.uid() = user_id);

-- 2. Tabela referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(referred_id) -- Um usuário só pode ser indicado por uma pessoa
);

-- Habilitar RLS e Politicas
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dono pode ler suas indicações" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
-- Inserção é feita via backend/service_role ou trigger seguro (aqui vamos liberar pros autenticados criarem pra si)
CREATE POLICY "Usuário pode se vincular a uma indicacao" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referred_id);

-- 3. Tabela commissions
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'available', 'withdrawn', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  available_at TIMESTAMP WITH TIME ZONE NOT NULL -- Data limite da carência (ex: +7 dias)
);

-- Habilitar RLS e Politicas
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dono pode ler suas proprias comissoes" ON public.commissions FOR SELECT USING (auth.uid() = referrer_id);

-- 4. Tabela payout_requests
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  pix_key TEXT NOT NULL,
  pix_type TEXT NOT NULL CHECK (pix_type IN ('cpf', 'email', 'phone', 'random')),
  status TEXT NOT NULL CHECK (status IN ('requested', 'paid', 'rejected')),
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS e Politicas
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dono pode ler e inserir saques" ON public.payout_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Dono pode solicitar saques" ON public.payout_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. RPC para Atualizar Status da Comissão Facilmente
CREATE OR REPLACE FUNCTION mark_commissions_as_withdrawn(p_user_id UUID, p_amount_cents INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Este é um cenário simplificado. Apenas atualiza as comissões 'available' para 'withdrawn'
  -- na ordem das mais antigas até fechar o valor do resgate. 
  -- Como o saque normalmente puxa todo o saldo disponível, simplificamos atualizando tudo.
  UPDATE public.commissions
  SET status = 'withdrawn'
  WHERE referrer_id = p_user_id AND status = 'available';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC para Ler o Plano do Usuário (útil para descobrir se o indicador é Pro/Elite)
CREATE OR REPLACE FUNCTION get_user_plan(target_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_plan TEXT;
BEGIN
  SELECT raw_user_meta_data->>'plan' INTO v_plan
  FROM auth.users
  WHERE id = target_user_id;
  
  RETURN COALESCE(v_plan, 'Starter');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
