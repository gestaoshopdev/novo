import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { PLANS, createUpgradeBilling } from "@/lib/abacatepay";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Logo from "@/assets/logo.png";

interface UpgradePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradePlanModal({ open, onOpenChange }: UpgradePlanModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);

  useEffect(() => {
    async function fetchDiscount() {
      if (!open) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.rpc('get_user_referral_discount', { p_user_id: user.id });
        if (data && typeof data === 'number') {
          setDiscount(data);
        }
      }
    }
    fetchDiscount();
  }, [open]);

  const handleSubscribe = async (planId: keyof typeof PLANS) => {
    if (loading) return;
    
    try {
      setLoading(planId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para assinar um plano.");
        setLoading(null);
        return;
      }

      console.log(`[Checkout] Iniciando assinatura para o plano: ${planId} (User: ${user.id})`);
      
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
      setLoading(null);
    }
  };

  const plans = [
    {
      id: "starter" as const,
      name: PLANS.starter.name,
      description: PLANS.starter.description,
      price: "9,90",
      features: ["1 Catálogo Digital", "Até 10 produtos", "1 foto por produto", "Dashboard de vendas", "Suporte via E-mail"],
      popular: false,
    },
    {
      id: "pro" as const,
      name: PLANS.pro.name,
      description: PLANS.pro.description,
      price: "14,90",
      features: ["5 Catálogos Digitais", "Até 60 produtos por catálogo", "5 fotos por produto", "Personalização de cores", "Suporte prioritário via WhatsApp"],
      popular: true,
    },
    {
      id: "elite" as const,
      name: PLANS.elite.name,
      description: PLANS.elite.description,
      price: "19,90",
      features: ["10 Catálogos Digitais", "Até 500 produtos por catálogo", "10 fotos por produto", "Remoção da marca d'água", "Capa personalizada"],
      popular: false,
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-4xl p-0 overflow-hidden border-none bg-background"
      )}>
        <DialogHeader className="sr-only">
          <DialogTitle>Upgrade de Plano</DialogTitle>
          <DialogDescription>Escolha um plano para fazer o upgrade da sua conta.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full overflow-y-auto">
          <div className="px-8 pb-8 pt-2 text-center space-y-2 border-b border-border/50 bg-gradient-to-br from-background via-background to-primary/5">
              <div className="mx-auto flex items-center justify-center mb-0">
                <img src={Logo} alt="GestãoShop" className="h-28 w-auto" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Faça o Upgrade do seu Plano</h2>
              {discount > 0 ? (
                <p className="text-green-500 font-medium bg-green-500/10 py-1.5 px-4 rounded-full inline-block mt-2 shadow-sm border border-green-500/20">
                  🎉 Parabéns! Você ganhou {Math.round(discount * 100)}% de desconto na sua primeira mensalidade!
                </p>
              ) : (
                <p className="text-muted-foreground">Escolha o melhor plano para escalar suas operações e decole suas vendas.</p>
              )}
            </div>

            <div className="p-8 grid gap-6 md:grid-cols-3 bg-muted/20">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col p-6 rounded-xl border bg-background transition-all duration-200",
                    plan.popular 
                      ? "border-primary shadow-[0_0_20px_rgba(var(--primary),0.15)] scale-105 z-10" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] rounded-full text-[10px] font-bold text-white tracking-wider uppercase shadow-md">
                      Mais Popular
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
                    <p className="text-[13px] text-muted-foreground h-10 mt-1">{plan.description}</p>
                  </div>

                  <div className="mb-6 flex items-baseline text-foreground">
                    <span className="text-2xl font-bold tracking-tight">R$</span>
                    {discount > 0 ? (
                      <div className="flex flex-col ml-1 items-start justify-center">
                        <span className="text-lg font-medium text-muted-foreground line-through decoration-red-500/50 decoration-2 -mb-1">
                          {plan.price}
                        </span>
                        <span className="text-4xl font-black tracking-tight text-green-500 drop-shadow-sm">
                          {((PLANS[plan.id].priceCentavos * (1 - discount)) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-4xl font-black tracking-tight ml-1">{plan.price}</span>
                    )}
                    <span className="text-sm font-medium text-muted-foreground ml-1">{discount > 0 ? "/1º mês" : "/mês"}</span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[13px]">
                        <div className="mt-0.5 rounded-full bg-primary/20 p-0.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-foreground/80 leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading !== null}
                    className={cn(
                      "w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2",
                      plan.popular
                        ? "bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] text-white hover:opacity-90 shadow-md"
                        : "bg-muted text-foreground hover:bg-muted/80",
                      loading === plan.id && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {loading === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Gerando PIX...
                      </>
                    ) : (
                      "Assinar Agora"
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}
