import React, { useState } from "react";
import { AlertTriangle, Clock, Calendar, Sparkles, Loader2, X } from "lucide-react";
import { PLANS, createUpgradeBilling } from "@/lib/abacatepay";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExpiryWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  daysRemaining: number;
  planExpiry: string | null;
  currentPlanName: string;
  onOpenUpgradeModal: () => void;
}

export function ExpiryWarningModal({
  open,
  onOpenChange,
  daysRemaining,
  planExpiry,
  currentPlanName,
  onOpenUpgradeModal,
}: ExpiryWarningModalProps) {
  console.log("[ExpiryWarningModal] Render - open:", open, "daysRemaining:", daysRemaining, "planExpiry:", planExpiry, "currentPlanName:", currentPlanName);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const getPlanId = (planName: string): "starter" | "pro" | "elite" => {
    if (!planName) return "starter";
    const name = planName.toLowerCase();
    if (name === "pro") return "pro";
    if (name === "elite" || name === "básico") return "elite";
    return "starter";
  };

  const planId = getPlanId(currentPlanName);
  const planInfo = PLANS[planId];

  const handleRenew = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para renovar seu plano.");
        setLoading(false);
        return;
      }

      console.log(`[Checkout] Iniciando renovação para o plano: ${planId} (User: ${user.id})`);
      const returnUrl = `${window.location.origin}/obrigado`;

      const result = await createUpgradeBilling({
        data: {
          planId,
          returnUrl,
          userId: user.id
        }
      });

      if (result && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error("A resposta do servidor não contém o link de checkout.");
      }
    } catch (error: any) {
      console.error("[Checkout Error]", error);
      const message = error.message || "Erro inesperado ao gerar o link de pagamento.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = planExpiry 
    ? format(parseISO(planExpiry), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : "data indeterminada";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop de Fundo com desfoque */}
      <div 
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200" 
      />

      {/* Card do Modal */}
      <div className="relative w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 shadow-2xl overflow-hidden z-[101] animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Glow decorativo de fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-primary/5 pointer-events-none" />

        {/* Botão de Fechar no topo direito */}
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-20"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center space-y-2 relative z-10 shrink-0">
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 ring-8 ring-amber-500/5 animate-pulse">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Sua Assinatura está Vencendo!
          </h2>
          <p className="text-muted-foreground text-sm">
            Não deixe seu negócio parar! Evite o bloqueio dos seus catálogos e vendas renovando sua conta.
          </p>
        </div>

        {/* Grid de Informações de Prazo */}
        <div className="grid grid-cols-2 gap-4 py-6 relative z-10">
          <div className="p-4 bg-muted/40 rounded-2xl border border-border/50 text-center flex flex-col items-center justify-center">
            <Clock className="h-5 w-5 text-amber-500 mb-1" />
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Prazo Restante</span>
            <p className="text-lg font-extrabold text-foreground mt-0.5">
              {daysRemaining === 0 ? "Expira hoje" : `${daysRemaining} ${daysRemaining === 1 ? "dia" : "dias"}`}
            </p>
          </div>

          <div className="p-4 bg-muted/40 rounded-2xl border border-border/50 text-center flex flex-col items-center justify-center">
            <Calendar className="h-5 w-5 text-primary mb-1" />
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Vencimento</span>
            <p className="text-xs font-bold text-foreground mt-1 leading-tight">
              {formattedDate.split(" às ")[0]}
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3 relative z-10 flex flex-col">
          <button
            onClick={handleRenew}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-75 disabled:pointer-events-none text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/10"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando PIX de Renovação...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Renovar Plano {planInfo?.name || currentPlanName} (R$ {((planInfo?.priceCentavos || 990) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onOpenUpgradeModal();
            }}
            className="w-full h-11 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm transition"
          >
            Ver outras opções de planos
          </button>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full py-1 text-xs text-muted-foreground hover:text-foreground transition font-medium text-center"
          >
            Lembrar mais tarde
          </button>
        </div>
      </div>
    </div>
  );
}
