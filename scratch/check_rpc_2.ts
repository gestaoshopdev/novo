import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ylsdljylqbnuajjyipwy.supabase.co";
const supabaseAnonKey = "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRpc() {
  const { data, error } = await supabase.rpc("update_user_status_by_admin", {
    target_user_id: "test",
    new_status: "blocked"
  });
  console.log("RPC Check:", error?.message || "No error");
}

checkRpc();
