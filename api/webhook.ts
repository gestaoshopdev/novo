import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const payload = await request.json();
    const validEvents = ['checkout.completed', 'subscription.renewed', 'billing.paid'];
    if (validEvents.includes(payload.event)) {
      let rawMetadata = payload.data?.checkout?.metadata || payload.data?.metadata || payload.data?.customer?.metadata || payload.metadata;
      
      // Alguns gateways enviam metadata como string JSON
      if (typeof rawMetadata === 'string') {
        try {
          rawMetadata = JSON.parse(rawMetadata);
        } catch (e) {
          console.error("Erro ao fazer parse do metadata string:", e);
          rawMetadata = {};
        }
      }

      const metadata = rawMetadata || {};
      const userId = metadata.userId || metadata.user_id;
      const planId = metadata.planId || metadata.plan_id;

      if (!userId || !planId) {
        console.error("[Webhook] Payload recebido sem userId ou planId no metadata.", JSON.stringify(payload));
        return new Response("Missing metadata", { status: 400 });
      }

      const planName = planId.charAt(0).toUpperCase() + planId.slice(1);
      
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL || "https://ylsdljylqbnuajjyipwy.supabase.co",
        process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry"
      );

      const { error } = await supabase.rpc('process_webhook_payment', {
        p_user_id: userId,
        p_plan: planName,
        p_secret: 'atlas-webhook-secret-2026'
      });

      if (error) {
        console.error("[Webhook] Erro ao processar pagamento via RPC:", error);
        return new Response("Error updating plan", { status: 500 });
      }

      console.log(`[Webhook] Plano ${planName} atualizado com sucesso para o usuário ${userId}!`);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Webhook] Erro ao processar requisição:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
