import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Pega URL e Key do .env ou usa os fallbacks
const supabaseUrl = "https://ylsdljylqbnuajjyipwy.supabase.co";
const supabaseAnonKey = "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRpc() {
  console.log("Chamando process_webhook_payment...");
  
  // Substitua pelo userId real que o cliente está testando, ou um aleatório
  const { data, error } = await supabase.rpc('process_webhook_payment', {
    p_user_id: '00000000-0000-0000-0000-000000000000',
    p_plan: 'Pro',
    p_secret: 'atlas-webhook-secret-2026'
  });

  console.log("Error:", error);
  console.log("Data:", data);
}

testRpc();
