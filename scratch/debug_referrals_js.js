import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ylsdljylqbnuajjyipwy.supabase.co";
const supabaseAnonKey = "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkReferrals() {
  console.log("Checking profiles...");
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  if (pError) console.error("Profiles error:", pError);
  else console.log("Profiles count:", profiles.length);

  console.log("\nChecking referrals...");
  const { data: referrals, error: rError } = await supabase.from('referrals').select('*');
  if (rError) console.error("Referrals error:", rError);
  else console.log("Referrals count:", referrals.length);

  console.log("\nChecking commissions...");
  const { data: commissions, error: cError } = await supabase.from('commissions').select('*');
  if (cError) console.error("Commissions error:", cError);
  else console.log("Commissions:", commissions);

  console.log("\nChecking payout requests...");
  const { data: payouts, error: payError } = await supabase.from('payout_requests').select('*');
  if (payError) console.error("Payouts error:", payError);
  else console.log("Payouts:", payouts);
}

checkReferrals();
