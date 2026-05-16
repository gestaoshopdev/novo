import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useProfile } from "@/contexts/ProfileContext";
import { UpgradePlanModal } from "@/components/billing/UpgradePlanModal";
import { Lock, Sparkles } from "lucide-react";
import { useState } from "react";

export function AppShell() {
  const { planStatus } = useProfile();
  const [modalOpen, setModalOpen] = useState(false);

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
              <UpgradePlanModal open={modalOpen} onOpenChange={setModalOpen} />
           </main>
        ) : (
          <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">
            <Outlet />
          </main>
        )}
      </div>
    </div>
  );
}
