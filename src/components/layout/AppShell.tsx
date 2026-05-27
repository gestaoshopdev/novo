import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import { UpgradePlanModal } from "@/components/billing/UpgradePlanModal";
import { ExpiryWarningModal } from "@/components/billing/ExpiryWarningModal";
import { Lock, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function AppShell() {
  const { planStatus, daysRemaining, planExpiry, plan } = useProfile();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [expiryWarningOpen, setExpiryWarningOpen] = useState(false);
  const [simulateExpiry, setSimulateExpiry] = useState(false);

  console.log("[AppShell] Render - planStatus:", planStatus, "daysRemaining:", daysRemaining, "expiryWarningOpen:", expiryWarningOpen, "simulateExpiry:", simulateExpiry);

  useEffect(() => {
    // Só disparar o popup se o plano estiver ativo (assinante) e estiver a 5 dias ou menos do vencimento
    // Controlado via sessionStorage para aparecer apenas uma vez por login (nova sessão)
    if (
      planStatus === "active" &&
      daysRemaining <= 5 &&
      daysRemaining > 0 &&
      sessionStorage.getItem("hasShownExpiryWarning") !== "true"
    ) {
      console.log("[AppShell] useEffect triggering warning modal");
      setExpiryWarningOpen(true);
      sessionStorage.setItem("hasShownExpiryWarning", "true");
    }
  }, [planStatus, daysRemaining]);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        
        {planStatus === "expired" ? (
           <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 blur-[100px] pointer-events-none" />
              <div className="w-full max-w-lg bg-card border border-destructive/20 shadow-[0_0_50px_rgba(220,38,38,0.1)] rounded-3xl p-10 text-center relative z-10 flex flex-col items-center">
                 <div className="h-20 w-20 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-6 ring-8 ring-destructive/5">
                    <Lock className="h-10 w-10" />
                 </div>
                 <h2 className="text-3xl font-bold tracking-tight mb-3">Tempo Esgotado</h2>
                 <p className="text-muted-foreground text-[16px] mb-8 leading-relaxed">
                    As 72 horas de teste no plano Elite acabaram. Para não perder seus dados e continuar gerenciando seu negócio, escolha o plano ideal para você agora mesmo.
                 </p>
                 <button 
                    onClick={() => setModalOpen(true)}
                    className="w-full h-14 rounded-xl gradient-primary text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] transition-all shadow-xl shadow-primary/20"
                 >
                    <Sparkles className="h-5 w-5" />
                    Escolher Meu Plano
                 </button>
              </div>
           </main>
        ) : (
          <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">
            <Outlet />
          </main>
        )}
      </div>

      {/* Botão de Simulação (exclusivo para jcasales15@gmail.com) */}
      {user?.email === "jcasales15@gmail.com" && (
        <motion.div 
          drag
          dragMomentum={false}
          className="fixed bottom-6 left-6 z-[60] flex flex-col gap-2 cursor-grab active:cursor-grabbing select-none"
        >
          {/* Painel de Depuração Visual */}
          <div className="bg-black/95 text-white text-[11px] p-3 rounded-xl border border-white/20 font-mono space-y-1 shadow-2xl">
            <div className="font-bold text-amber-400 mb-1 flex items-center justify-between gap-2">
              <span>🔍 DEBUG EXPIRY</span>
              <span className="text-[9px] text-gray-400 font-normal">(Arraste para mover)</span>
            </div>
            <div>warningOpen: {expiryWarningOpen ? "✅ TRUE" : "❌ FALSE"}</div>
            <div>simulate: {simulateExpiry ? "✅ TRUE" : "❌ FALSE"}</div>
            <div>planStatus: {planStatus}</div>
            <div>days: {daysRemaining}</div>
            <div className="pt-1 text-[9px] text-gray-400">plan: {plan}</div>
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("[AppShell] Simulate button clicked");
              sessionStorage.removeItem("hasShownExpiryWarning");
              setSimulateExpiry(true);
              setExpiryWarningOpen(true);
            }}
            className="h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-transform hover:scale-105 pointer-events-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simular 5 Dias Restantes
          </button>
        </motion.div>
      )}

      {/* Modais Globais de Assinatura */}
      <UpgradePlanModal open={modalOpen} onOpenChange={setModalOpen} />
      <ExpiryWarningModal
        open={expiryWarningOpen}
        onOpenChange={(val) => {
          console.log("[AppShell] ExpiryWarningModal onOpenChange triggered:", val);
          setExpiryWarningOpen(val);
        }}
        daysRemaining={simulateExpiry ? 5 : daysRemaining}
        planExpiry={simulateExpiry ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() : planExpiry}
        currentPlanName={plan}
        onOpenUpgradeModal={() => setModalOpen(true)}
      />
    </div>
  );
}
