-- Corrige a tabela e todas as políticas de segurança (RLS) para saque (payout_requests)

-- 1. Garante que a coluna pix_name existe
ALTER TABLE public.payout_requests ADD COLUMN IF NOT EXISTS pix_name TEXT;

-- 2. Garante que o RLS está ativado
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- 3. Remove as políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Dono pode ler e inserir saques" ON public.payout_requests;
DROP POLICY IF EXISTS "Dono pode solicitar saques" ON public.payout_requests;
DROP POLICY IF EXISTS "Admins podem atualizar saques" ON public.payout_requests;
DROP POLICY IF EXISTS "Admins podem ler saques" ON public.payout_requests;
DROP POLICY IF EXISTS "Admins podem ler todos os saques" ON public.payout_requests;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios saques" ON public.payout_requests;
DROP POLICY IF EXISTS "Usuários podem criar saques" ON public.payout_requests;

-- 4. Cria política de LEITURA (SELECT)
-- O usuário pode ler seus próprios saques OR Admins podem ler tudo
CREATE POLICY "Permitir leitura de saques" 
ON public.payout_requests 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  (auth.jwt() ->> 'email') IN ('jonathancasales.c@gmail.com', 'gustavo.2casales@gmail.com', 'jcasales15@gmail.com')
);

-- 5. Cria política de INSERÇÃO (INSERT)
-- O usuário pode criar saques para si mesmo
CREATE POLICY "Permitir criacao de saques" 
ON public.payout_requests 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
);

-- 6. Cria política de ATUALIZAÇÃO (UPDATE)
-- Apenas Admins podem atualizar saques (para marcar como pago, rejeitado, etc)
CREATE POLICY "Permitir admins atualizarem saques" 
ON public.payout_requests 
FOR UPDATE 
USING (
  (auth.jwt() ->> 'email') IN ('jonathancasales.c@gmail.com', 'gustavo.2casales@gmail.com', 'jcasales15@gmail.com')
);
