import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  // Apenas GET e POST são aceitos
  if (request.method !== 'GET' && request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');
  
  // Segredo padrão para segurança caso a variável de ambiente não esteja configurada
  const expectedSecret = process.env.KEEP_ALIVE_SECRET || 'atlas-keepalive-secret-2026';
  
  if (secret !== expectedSecret) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }), 
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || 'https://ylsdljylqbnuajjyipwy.supabase.co',
      process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry'
    );

    // Consulta simples na tabela 'profiles' para gerar atividade no banco
    const startTime = Date.now();
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    const durationMs = Date.now() - startTime;

    if (error) {
      console.error('[Keep-Alive] Erro ao consultar o banco de dados:', error);
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Failed to query database',
          error: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: 'ok',
        message: 'Keep-alive query executed successfully',
        durationMs,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('[Keep-Alive] Exceção inesperada:', err);
    return new Response(
      JSON.stringify({
        status: 'error',
        message: 'Internal server error',
        error: err.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
