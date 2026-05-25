-- Copie este código e execute no SQL Editor do Supabase para criar a RPC que lista todas as indicações.
-- Esta RPC é protegida para acesso exclusivo dos administradores cadastrados.

CREATE OR REPLACE FUNCTION get_admin_referrals()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se quem chama é admin
  IF (SELECT auth.jwt() ->> 'email') NOT IN ('jonathancasales.c@gmail.com', 'gustavo.2casales@gmail.com') THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  RETURN (
    SELECT COALESCE(json_agg(
      json_build_object(
        'id', r.id,
        'referrer_id', r.referrer_id,
        'referred_id', r.referred_id,
        'created_at', r.created_at,
        'referrer_email', ur.email,
        'referred_email', ufd.email,
        'referred_name', ufd.raw_user_meta_data->>'name'
      ) ORDER BY r.created_at DESC
    ), '[]'::json)
    FROM public.referrals r
    JOIN auth.users ur ON ur.id = r.referrer_id
    JOIN auth.users ufd ON ufd.id = r.referred_id
  );
END;
$$;
