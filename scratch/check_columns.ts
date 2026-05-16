import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ylsdljylqbnuajjyipwy.supabase.co";
const supabaseAnonKey = "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
  // We try to query with 'id' and 'user_id' to see which one throws an error
  const { error: err1 } = await supabase.from('profiles').select('id').limit(1);
  console.log("Select id error:", err1?.message || "No error");

  const { error: err2 } = await supabase.from('profiles').select('user_id').limit(1);
  console.log("Select user_id error:", err2?.message || "No error");
  
  const { error: err3 } = await supabase.from('profiles').select('status').limit(1);
  console.log("Select status error:", err3?.message || "No error");
}

checkColumns();
