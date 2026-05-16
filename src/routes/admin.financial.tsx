import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/admin/financial")({
  head: () => ({ meta: [{ title: "Financeiro · Admin" }] }),
  component: AdminFinancial,
});

function AdminFinancial() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold tracking-tight">Controle Financeiro</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe faturamento, repasses e taxas operacionais.</p>
      </motion.div>

      <div className="flex h-[400px] items-center justify-center rounded-2xl border border-dashed border-border bg-card/50">
         <div className="text-center">
            <h3 className="text-lg font-medium text-muted-foreground">Módulo em Desenvolvimento</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">Integração com AbacatePay para recebíveis da plataforma.</p>
         </div>
      </div>
    </div>
  );
}
