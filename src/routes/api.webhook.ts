import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/api/webhook')({
  beforeLoad: async ({ request }) => {
    try {
      const payload = await request.json()
      console.log("[Webhook] Recebido payload do AbacatePay:", payload)

      if (payload.event === 'checkout.completed') {
        // O AbacatePay pode enviar o metadata na raiz do data ou dentro de customer
        const metadata = payload.data?.metadata || payload.data?.customer?.metadata || {}
        const userId = metadata.userId
        const planId = metadata.planId

        if (!userId || !planId) {
          console.error("[Webhook] Payload recebido sem userId ou planId no metadata.", JSON.stringify(payload))
          return new Response("Missing metadata", { status: 400 })
        }

        const planName = planId.charAt(0).toUpperCase() + planId.slice(1)
        
        const { error } = await supabase.rpc('process_webhook_payment', {
          p_user_id: userId,
          p_plan: planName,
          p_secret: 'atlas-webhook-secret-2026'
        })

        if (error) {
          console.error("[Webhook] Erro ao processar pagamento via RPC:", error)
          return new Response("Error updating plan", { status: 500 })
        }

        console.log(`[Webhook] Plano ${planName} atualizado com sucesso para o usuário ${userId}!`)
      }

      return new Response("OK", { status: 200 })
    } catch (error) {
      console.error("[Webhook] Erro ao processar requisição:", error)
      return new Response("Internal Server Error", { status: 500 })
    }
  },
  component: () => null
})
