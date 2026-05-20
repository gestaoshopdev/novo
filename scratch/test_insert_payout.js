import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ylsdljylqbnuajjyipwy.supabase.co";
const supabaseAnonKey = "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase
    .from('payout_requests')
    .insert([{ user_id: "00000000-0000-0000-0000-000000000000", amount_cents: 5000, pix_key: "61999796882", pix_type: "phone", status: "requested" }])
    .select()
    .single();
  console.log("Error:", error);
}

test();
