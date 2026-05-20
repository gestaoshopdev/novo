-- 1. Permitir que administradores leiam TODOS os saques (necessário para retornar os dados após atualizar)
DROP POLICY IF EXISTS "Admins podem ler saques" ON public.payout_requests;
CREATE POLICY "Admins podem ler saques" 
ON public.payout_requests 
FOR SELECT 
USING (
  (auth.jwt() ->> 'email') IN (
    'jonathancasales.c@gmail.com', 
    'gustavo.2casales@gmail.com', 
    'jcasales15@gmail.com'
  )
);

-- 2. Permitir que administradores atualizem TODOS os saques
DROP POLICY IF EXISTS "Admins podem atualizar saques" ON public.payout_requests;
CREATE POLICY "Admins podem atualizar saques" 
ON public.payout_requests 
FOR UPDATE 
USING (
  (auth.jwt() ->> 'email') IN (
    'jonathancasales.c@gmail.com', 
    'gustavo.2casales@gmail.com', 
    'jcasales15@gmail.com'
  )
);
