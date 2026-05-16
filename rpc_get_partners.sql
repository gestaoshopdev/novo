-- Copie este código e execute no SQL Editor do Supabase

CREATE OR REPLACE FUNCTION get_partners_by_admin()
RETURNS TABLE (
  id uuid,
  email varchar,
  full_name text,
  commission_rate integer,
  plan_type text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se quem chama é admin
  IF (SELECT auth.jwt() ->> 'email') NOT IN ('jonathancasales.c@gmail.com', 'gustavo.2casales@gmail.com') THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem ver parceiros.';
  END IF;

  RETURN QUERY
  SELECT 
    u.id, 
    u.email, 
    (u.raw_user_meta_data->>'name')::text as full_name,
    (u.raw_user_meta_data->>'commission_rate')::integer as commission_rate,
    (u.raw_user_meta_data->>'plan')::text as plan_type,
    u.created_at
  FROM auth.users u
  WHERE u.raw_user_meta_data->>'is_partner' = 'true';
END;
$$;
