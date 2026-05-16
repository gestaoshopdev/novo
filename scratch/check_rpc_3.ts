import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ylsdljylqbnuajjyipwy.supabase.co";
const supabaseAnonKey = "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.rpc("update_user_status_by_admin", { target_user_id: "00000000-0000-0000-0000-000000000000", new_status: "test" });
  console.log("RPC Error:", error?.message || "Success (updated 0 rows silently)");
}

check();
