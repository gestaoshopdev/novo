-- Copie este código e execute no SQL Editor do Supabase.
-- Esta função permite que usuários anônimos (clientes acessando o catálogo público) consultem o plano do vendedor sem restrições de RLS.

CREATE OR REPLACE FUNCTION get_public_profile(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_build_object('plan_type', plan_type)
    FROM public.profiles
    WHERE id = p_user_id
  );
END;
$$;
