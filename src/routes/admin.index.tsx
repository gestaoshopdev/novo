import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, Wallet, Target, CreditCard } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard · Atlas Suite" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4"
      >
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-primary">Super Admin</p>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">Dashboard Global</h1>
          <p className="text-sm text-muted-foreground mt-1">Visão geral do sistema e assinaturas.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Receita Recorrente (MRR)" value="R$ 14.500,00" delta={12.5} variant="primary" icon={Wallet} index={0} comparedTo="vs mês anterior" />
        <KpiCard label="Usuários Ativos" value="234" delta={5.2} variant="success" icon={Users} index={1} comparedTo="vs mês anterior" />
        <KpiCard label="Novas Assinaturas" value="45" delta={-2.1} variant="info" icon={Target} index={2} comparedTo="vs mês anterior" />
        <KpiCard label="Volume Transacionado (GMV)" value="R$ 1.2M" delta={18.4} variant="primary" icon={CreditCard} index={3} comparedTo="Total nas lojas clientes" />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
            <h3 className="text-lg font-semibold tracking-tight mb-4">Últimos Assinantes</h3>
            <div className="space-y-4">
               {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between pb-4 border-b border-border/50 last:border-0 last:pb-0">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                           U{i}
                        </div>
                        <div>
                           <p className="text-sm font-medium">Usuário Teste {i}</p>
                           <p className="text-xs text-muted-foreground">Plano Pro • há {i} hora{i > 1 ? 's' : ''}</p>
                        </div>
                     </div>
                     <div className="text-sm font-semibold text-success">+ R$ 97,00</div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
