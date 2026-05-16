import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Ticket, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/coupons")({
  head: () => ({ meta: [{ title: "Cupons · Admin" }] }),
  component: AdminCoupons,
});

function AdminCoupons() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Cupons de Desconto</h1>
          <p className="text-sm text-muted-foreground mt-1">Gere cupons promocionais para assinaturas na plataforma.</p>
        </div>
        <button className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm">
           <Plus className="w-4 h-4" /> Novo Cupom
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="p-5 rounded-xl border border-border bg-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">BEMVINDO20</span>
               </div>
               <span className="text-xs font-semibold px-2 py-1 bg-success/15 text-success rounded-md uppercase">Ativo</span>
            </div>
            <p className="text-2xl font-bold">20% OFF</p>
            <p className="text-xs text-muted-foreground mt-1">Válido para todos os planos</p>
            <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
               <span>Usos: 15 / 100</span>
               <span>Validade: 30/06/2026</span>
            </div>
         </div>
      </div>
    </div>
  );
}
