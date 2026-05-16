
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ylsdljylqbnuajjyipwy.supabase.co";
const supabaseAnonKey = "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Checking Supabase connection and tables...");

  // Test Authh
  const { data: auth, error: authErr } = await supabase.auth.getSession();
  console.log("Auth session check:", authErr ? `Error: ${authErr.message}` : "OK (No session)");

  // List tables (or try to select from one)
  const tables = ['products', 'categories', 'sales', 'channels', 'contacts', 'profiles', 'users'];

  for (const table of tables) {
    const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`Table '${table}': Error -> ${error.message}`);
    } else {
      console.log(`Table '${table}': OK -> ${count} rows`);
    }
  }
}

test();
