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

    const finalizePayment = async () => {
      try {
        // Atualiza a sessão local para pegar as alterações feitas pelo webhook (plano atualizado)
        await supabase.auth.refreshSession();
        
        // Aguarda mais um instante para garantir que o webhook do AbacatePay terminou
        // caso o redirecionamento tenha sido muito rápido
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Atualiza novamente por precaução
        await supabase.auth.refreshSession();

      } catch (error) {
        console.error("Erro ao atualizar sessão:", error);
      } finally {
        setProcessing(false);
        
        // Redireciona para o sistema
        timeoutId = setTimeout(() => {
          navigate({ to: '/app' });
        }, 4000);
      }
    };

    finalizePayment();

    return () => {
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
