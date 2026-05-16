import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/obrigado')({
  component: Obrigado,
})

function Obrigado() {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isActive = true;

    const finalizePayment = async () => {
      try {
        console.log("[Obrigado] Aguardando webhook atualizar a conta...");
        
        // Polling para checar se o plano mudou
        let updated = false;
        for (let i = 0; i < 8; i++) {
          if (!isActive) break;
          const { data } = await supabase.auth.refreshSession();
          const currentPlan = data.user?.user_metadata?.plan;
          
          if (currentPlan && currentPlan !== 'Teste' && currentPlan !== 'Starter') {
            console.log("[Obrigado] Plano atualizado detectado:", currentPlan);
            updated = true;
            break;
          }
          
          // Espera 2 segundos antes de tentar de novo (total de até 16s)
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (!updated) {
          console.warn("[Obrigado] Tempo limite excedido aguardando webhook. O plano pode atualizar em alguns minutos.");
        }

      } catch (error) {
        console.error("Erro ao atualizar sessão:", error);
      } finally {
        if (isActive) {
          setProcessing(false);
          timeoutId = setTimeout(() => {
            navigate({ to: '/app' });
          }, 3000);
        }
      }
    };

    finalizePayment();

    return () => {
      isActive = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen min-h-[400px] bg-background text-foreground p-4 text-center">
      {processing ? (
        <>
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
          <h1 className="text-2xl font-bold tracking-tight mb-2">Confirmando Pagamento...</h1>
          <p className="text-muted-foreground">Por favor, aguarde enquanto validamos o seu acesso.</p>
        </>
      ) : (
        <>
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
            <CheckCircle2 className="w-24 h-24 text-primary relative z-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Pagamento confirmado!</h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Seu acesso foi liberado com sucesso. Redirecionando para o sistema...
          </p>
          <div className="mt-8 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        </>
      )}
    </div>
  );
}
