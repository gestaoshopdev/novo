import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ylsdljylqbnuajjyipwy.supabase.co";
const supabaseAnonKey = "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugReferrals() {
  console.log("=== Debugging Referrals ===");
  
  // 1. Check all referral codes
  const { data: codes, error: e1 } = await supabase.from('referral_codes').select('*');
  console.log("Referral Codes:", codes);

  // 2. Check all referrals
  const { data: referrals, error: e2 } = await supabase.from('referrals').select('*');
  console.log("Referrals:", referrals);

  // 3. Check all commissions
  const { data: comms, error: e3 } = await supabase.from('commissions').select('*');
  console.log("Commissions:", comms);

  // 4. Check profiles
  const { data: profiles, error: e4 } = await supabase.from('profiles').select('id, email, plan_type');
  console.log("Profiles:", profiles);
}

debugReferrals();
