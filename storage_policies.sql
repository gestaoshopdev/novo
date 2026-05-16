-- Copie todo este código e cole no SQL Editor do Supabase, depois clique em RUN.

-- 1. Políticas de Segurança para o bucket 'produtos'
CREATE POLICY "Permitir upload produtos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'produtos');
CREATE POLICY "Permitir update produtos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'produtos');
CREATE POLICY "Permitir leitura produtos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'produtos');

-- 2. Políticas de Segurança para o bucket 'perfil'
CREATE POLICY "Permitir upload perfil" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'perfil');
CREATE POLICY "Permitir update perfil" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'perfil');
CREATE POLICY "Permitir leitura perfil" ON storage.objects FOR SELECT TO public USING (bucket_id = 'perfil');
