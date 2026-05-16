-- Copie este código e execute no SQL Editor do Supabase

CREATE OR REPLACE FUNCTION remove_partner(p_target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se quem chama é admin
  IF (SELECT auth.jwt() ->> 'email') NOT IN ('jonathancasales.c@gmail.com', 'gustavo.2casales@gmail.com') THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem gerenciar parceiros.';
  END IF;

  -- Atualizar auth.users (user_metadata) removendo o status de parceiro
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
      jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{is_partner}',
        'false'::jsonb
      ),
      '{commission_rate}',
      '0'::jsonb
    )
  WHERE id = p_target_user_id;

END;
$$;
