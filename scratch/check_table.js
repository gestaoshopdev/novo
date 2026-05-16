import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ylsdljylqbnuajjyipwy.supabase.co";
const supabaseAnonKey = "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable() {
  const { data, error } = await supabase.from('referrals').select('id').limit(1);
  console.log("Error:", error);
  console.log("Data:", data);
}

checkTable();
