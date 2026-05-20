-- 1. Criar o bucket "payouts" se ele não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payouts', 'payouts', true) 
ON CONFLICT (id) DO NOTHING;

-- 2. Habilitar permissão para leitura pública (para os afiliados conseguirem visualizar o comprovante depois)
DROP POLICY IF EXISTS "Qualquer um pode ver comprovantes" ON storage.objects;
CREATE POLICY "Qualquer um pode ver comprovantes" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'payouts');

-- 3. Habilitar permissão para Administradores enviarem arquivos
DROP POLICY IF EXISTS "Admins podem enviar comprovantes" ON storage.objects;
CREATE POLICY "Admins podem enviar comprovantes" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'payouts' AND auth.role() = 'authenticated');
