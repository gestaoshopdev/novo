import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ylsdljylqbnuajjyipwy.supabase.co";
// Using the anon key from the previous scratch file
const supabaseAnonKey = "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkReferrals() {
  console.log("Checking profiles...");
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  if (pError) console.error("Profiles error:", pError);
  else console.log("Profiles:", profiles);

  console.log("\nChecking referrals...");
  const { data: referrals, error: rError } = await supabase.from('referrals').select('*');
  if (rError) console.error("Referrals error:", rError);
  else console.log("Referrals:", referrals);

  console.log("\nChecking commissions...");
  const { data: commissions, error: cError } = await supabase.from('commissions').select('*');
  if (cError) console.error("Commissions error:", cError);
  else console.log("Commissions:", commissions);
}

checkReferrals();
