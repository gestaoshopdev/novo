-- Copie este código e execute no SQL Editor do Supabase

CREATE OR REPLACE FUNCTION get_admin_payout_requests()
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
        'id', p.id,
        'user_id', p.user_id,
        'amount_cents', p.amount_cents,
        'pix_key', p.pix_key,
        'pix_type', p.pix_type,
        'status', p.status,
        'receipt_url', p.receipt_url,
        'created_at', p.created_at,
        'user', json_build_object(
          'id', u.id,
          'email', u.email,
          'raw_user_meta_data', u.raw_user_meta_data
        )
      ) ORDER BY p.created_at DESC
    ), '[]'::json)
    FROM public.payout_requests p
    JOIN auth.users u ON u.id = p.user_id
  );
END;
$$;


CREATE OR REPLACE FUNCTION get_admin_commissions()
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
        'id', c.id,
        'referrer_id', c.referrer_id,
        'referred_id', c.referred_id,
        'amount_cents', c.amount_cents,
        'status', c.status,
        'created_at', c.created_at,
        'available_at', c.available_at,
        'referrer', json_build_object(
          'id', ur.id,
          'email', ur.email,
          'raw_user_meta_data', ur.raw_user_meta_data
        ),
        'referred', json_build_object(
          'id', ufd.id,
          'email', ufd.email,
          'raw_user_meta_data', ufd.raw_user_meta_data
        )
      ) ORDER BY c.created_at DESC
    ), '[]'::json)
    FROM public.commissions c
    JOIN auth.users ur ON ur.id = c.referrer_id
    JOIN auth.users ufd ON ufd.id = c.referred_id
  );
END;
$$;
