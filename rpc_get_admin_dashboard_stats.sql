-- Execute este script no editor SQL do seu painel do Supabase para atualizar a função.
-- Ele remove os dados do usuário de teste 'jcasales15@gmail.com' das métricas oficiais de MRR, Usuários Ativos, Novas Assinaturas e GMV.

CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_mrr numeric;
  v_prev_mrr numeric;
  v_active_users integer;
  v_prev_active_users integer;
  v_new_subscriptions_30d integer;
  v_prev_new_subscriptions_30d integer;
  v_total_gmv numeric;
  v_prev_gmv numeric;
  v_latest_subscribers json;
  v_admin_emails text[] := ARRAY['jonathancasales.c@gmail.com', 'gustavo.2casales@gmail.com'];
  v_test_email text := 'jcasales15@gmail.com';
  v_test_user_id uuid;
  v_mrr_spark numeric[];
  v_users_spark numeric[];
  v_subs_spark numeric[];
  v_gmv_spark numeric[];
  v_day_offset integer;
  v_day_mrr numeric;
  v_day_users numeric;
  v_day_subs numeric;
  v_day_gmv numeric;
BEGIN
  -- 1. Verificar se quem chama é admin
  IF (SELECT auth.jwt() ->> 'email') NOT IN ('jonathancasales.c@gmail.com', 'gustavo.2casales@gmail.com') THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  -- Obter o ID do usuário de teste para filtrar as vendas
  SELECT id INTO v_test_user_id 
  FROM public.profiles 
  WHERE lower(email) = lower(v_test_email) 
  LIMIT 1;

  -- 2. MRR Atual (exclui admins e o usuário de teste)
  SELECT COALESCE(SUM(
    CASE 
      WHEN lower(plan_type) IN ('starter', 'básico') THEN 9.90 
      WHEN lower(plan_type) = 'pro' THEN 14.90 
      WHEN lower(plan_type) = 'elite' THEN 19.90 
      ELSE 0 
    END
  ), 0) INTO v_total_mrr
  FROM public.profiles
  WHERE lower(status) = 'active' 
    AND email != ALL(v_admin_emails) 
    AND lower(email) != lower(v_test_email);

  -- MRR anterior (registrados há mais de 30 dias, exclui admins e o usuário de teste)
  SELECT COALESCE(SUM(
    CASE 
      WHEN lower(plan_type) IN ('starter', 'básico') THEN 9.90 
      WHEN lower(plan_type) = 'pro' THEN 14.90 
      WHEN lower(plan_type) = 'elite' THEN 19.90 
      ELSE 0 
    END
  ), 0) INTO v_prev_mrr
  FROM public.profiles
  WHERE lower(status) = 'active' 
    AND email != ALL(v_admin_emails)
    AND lower(email) != lower(v_test_email)
    AND created_at < (now() - interval '30 days');

  -- 3. Usuários Ativos (status = active ou trial, exclui admins e o usuário de teste)
  SELECT COUNT(*) INTO v_active_users
  FROM public.profiles
  WHERE lower(status) IN ('active', 'trial') 
    AND email != ALL(v_admin_emails)
    AND lower(email) != lower(v_test_email);

  -- Usuários ativos anteriores
  SELECT COUNT(*) INTO v_prev_active_users
  FROM public.profiles
  WHERE lower(status) IN ('active', 'trial') 
    AND email != ALL(v_admin_emails)
    AND lower(email) != lower(v_test_email)
    AND created_at < (now() - interval '30 days');

  -- 4. Novas Assinaturas (últimos 30 dias, exclui admins e o usuário de teste)
  SELECT COUNT(*) INTO v_new_subscriptions_30d
  FROM public.profiles
  WHERE lower(status) IN ('active', 'trial')
    AND email != ALL(v_admin_emails)
    AND lower(email) != lower(v_test_email)
    AND created_at >= (now() - interval '30 days');

  -- Período de 30 a 60 dias atrás
  SELECT COUNT(*) INTO v_prev_new_subscriptions_30d
  FROM public.profiles
  WHERE lower(status) IN ('active', 'trial')
    AND email != ALL(v_admin_emails)
    AND lower(email) != lower(v_test_email)
    AND created_at >= (now() - interval '60 days')
    AND created_at < (now() - interval '30 days');

  -- 5. GMV (Soma de vendas concluídas, excluindo as do usuário de teste)
  SELECT COALESCE(SUM(total), 0) INTO v_total_gmv
  FROM public.sales
  WHERE status = 'concluida'
    AND (v_test_user_id IS NULL OR user_id != v_test_user_id);

  -- GMV anterior (vendas há mais de 30 dias, excluindo as do usuário de teste)
  SELECT COALESCE(SUM(total), 0) INTO v_prev_gmv
  FROM public.sales
  WHERE status = 'concluida'
    AND (v_test_user_id IS NULL OR user_id != v_test_user_id)
    AND created_at < (now() - interval '30 days');

  -- 6. Gerar dados de Sparkline (histórico de 10 pontos)
  v_mrr_spark := '{}';
  v_users_spark := '{}';
  v_subs_spark := '{}';
  v_gmv_spark := '{}';
  
  FOR v_day_offset IN REVERSE 9..0 LOOP
    -- MRR acumulado
    SELECT COALESCE(SUM(
      CASE 
        WHEN lower(plan_type) IN ('starter', 'básico') THEN 9.90 
        WHEN lower(plan_type) = 'pro' THEN 14.90 
        WHEN lower(plan_type) = 'elite' THEN 19.90 
        ELSE 0 
      END
    ), 0) INTO v_day_mrr
    FROM public.profiles
    WHERE lower(status) = 'active' 
      AND email != ALL(v_admin_emails)
      AND lower(email) != lower(v_test_email)
      AND created_at <= (now() - (v_day_offset || ' days')::interval);
    v_mrr_spark := array_append(v_mrr_spark, v_day_mrr);

    -- Usuários ativos acumulados
    SELECT COUNT(*) INTO v_day_users
    FROM public.profiles
    WHERE lower(status) IN ('active', 'trial')
      AND email != ALL(v_admin_emails)
      AND lower(email) != lower(v_test_email)
      AND created_at <= (now() - (v_day_offset || ' days')::interval);
    v_users_spark := array_append(v_users_spark, v_day_users::numeric);

    -- Novas assinaturas
    SELECT COUNT(*) INTO v_day_subs
    FROM public.profiles
    WHERE lower(status) IN ('active', 'trial')
      AND email != ALL(v_admin_emails)
      AND lower(email) != lower(v_test_email)
      AND created_at <= (now() - (v_day_offset || ' days')::interval)
      AND created_at > (now() - ((v_day_offset + 1) || ' days')::interval);
    v_subs_spark := array_append(v_subs_spark, v_day_subs::numeric);

    -- GMV acumulado
    SELECT COALESCE(SUM(total), 0) INTO v_day_gmv
    FROM public.sales
    WHERE status = 'concluida'
      AND (v_test_user_id IS NULL OR user_id != v_test_user_id)
      AND created_at <= (now() - (v_day_offset || ' days')::interval);
    v_gmv_spark := array_append(v_gmv_spark, v_day_gmv);
  END LOOP;

  -- 7. Últimos Assinantes (últimos 5 que têm planos configurados, exclui o usuário de teste)
  SELECT COALESCE(json_agg(t), '[]'::json) INTO v_latest_subscribers
  FROM (
    SELECT 
      id,
      full_name,
      email,
      plan_type,
      status,
      created_at
    FROM public.profiles
    WHERE email != ALL(v_admin_emails)
      AND lower(email) != lower(v_test_email)
      AND plan_type IS NOT NULL 
      AND plan_type != ''
    ORDER BY created_at DESC
    LIMIT 5
  ) t;

  RETURN json_build_object(
    'total_mrr', v_total_mrr,
    'prev_mrr', v_prev_mrr,
    'active_users', v_active_users,
    'prev_active_users', v_prev_active_users,
    'new_subscriptions_30d', v_new_subscriptions_30d,
    'prev_new_subscriptions_30d', v_prev_new_subscriptions_30d,
    'total_gmv', v_total_gmv,
    'prev_gmv', v_prev_gmv,
    'mrr_spark', v_mrr_spark,
    'users_spark', v_users_spark,
    'subs_spark', v_subs_spark,
    'gmv_spark', v_gmv_spark,
    'latest_subscribers', v_latest_subscribers
  );
END;
$$;
