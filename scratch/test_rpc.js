import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  // Simular login como admin para que auth.jwt() tenha o email
  // Como estamos testando via anon_key sem login, o jwt não terá o email e a RPC vai dar 'Acesso negado' 
  // a menos que a gente use a service_role_key. Mas a RPC não checa service_role.
  
  // Vamos apenas testar se a RPC existe chamando ela (mesmo que dê erro de acesso negado).
  // Se ela não existir, dará um erro diferente.
  const { data, error } = await supabase.rpc('get_partners_by_admin');
  console.log("Error:", error);
  console.log("Data:", data);
}

test();
