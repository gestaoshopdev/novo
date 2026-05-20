-- Permitir que administradores atualizem o status dos saques (Marcar como Pago)
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
