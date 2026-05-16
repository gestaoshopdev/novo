import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ylsdljylqbnuajjyipwy.supabase.co";
const supabaseAnonKey = "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProfiles() {
  const { data, error } = await supabase.from('profiles').select('id, full_name, plan_type').order('created_at', { ascending: false }).limit(10);
  console.log("Error:", error);
  console.log("Profiles:", data);
}

checkProfiles();
