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
    // Atualiza a sessão silenciosamente
    supabase.auth.refreshSession().catch(console.error);

    // Redireciona rapidamente
    const timeoutId = setTimeout(() => {
      navigate({ to: '/app' });
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen min-h-[400px] bg-background text-foreground p-4 text-center">
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
    </div>
  );
}
