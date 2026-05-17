import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ylsdljylqbnuajjyipwy.supabase.co";
const supabaseAnonKey = "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRpc() {
  const { data, error } = await supabase.rpc('register_referral', {
    p_code: 'TESTE',
    p_referred_id: '00000000-0000-0000-0000-000000000000'
  });
  console.log("Error:", error);
  console.log("Data:", data);
}

testRpc();
