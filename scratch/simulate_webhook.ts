import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ylsdljylqbnuajjyipwy.supabase.co";
const supabaseAnonKey = "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Buscando ID do usuário 'titi'...");
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, plan_type')
    .ilike('full_name', '%titi%')
    .limit(1);

  if (error || !profiles || profiles.length === 0) {
    console.error("Usuário 'titi' não encontrado:", error?.message);
    return;
  }

  const profile = profiles[0];
  console.log("Usuário encontrado!", profile);

  console.log("Simulando webhook de pagamento do AbacatePay...");
  const response = await fetch("http://localhost:8080/api/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "checkout.completed",
      data: {
        metadata: {
          userId: profile.id,
          planId: "pro"
        }
      }
    })
  });

  const responseText = await response.text();
  console.log("Status HTTP:", response.status);
  console.log("Resposta do Webhook:", responseText);
}

run();
