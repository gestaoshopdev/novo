import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ylsdljylqbnuajjyipwy.supabase.co';
const supabaseKey = 'sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
  console.log("Chamando RPC update_user_plan_by_admin...");
  const { data, error } = await supabase.rpc("update_user_plan_by_admin", {
    target_user_id: "00000000-0000-0000-0000-000000000000",
    new_plan: "Pro"
  });
  console.log("Resultado:", { data, error });
}

testRpc();
