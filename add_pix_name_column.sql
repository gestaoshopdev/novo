-- Adicionar a coluna pix_name na tabela payout_requests
ALTER TABLE public.payout_requests 
ADD COLUMN IF NOT EXISTS pix_name TEXT;
