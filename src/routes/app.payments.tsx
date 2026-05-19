import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { 
  CreditCard, Banknote, Zap, FileText, Plus, Pencil, Trash2, HelpCircle 
} from "lucide-react";
import { useState, useMemo } from "react";
import { usePaymentMethods, useSales, useDeletePaymentMethod } from "@/hooks/useQueries";
import { formatBRL, type PaymentMethodInfo, DEFAULT_PAYMENT_METHODS } from "@/components/sales/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { NewPaymentMethodModal } from "@/components/payments/NewPaymentMethodModal";
import { PageHeader } from "@/components/shared/PageHeader";
import { DeletePaymentMethodModal } from "@/components/payments/DeletePaymentMethodModal";

export const Route = createFileRoute("/app/payments")({
  head: () => ({ meta: [{ title: "Formas de Pagamento · Atlas Suite" }] }),
  component: PaymentsPage,
});

const ICON_MAP: Record<string, any> = {
  CreditCard,
  Banknote,
  Zap,
  FileText,
};

function PaymentsPage() {
  const { data: methods = [], isLoading } = usePaymentMethods();
  const { data: sales = [] } = useSales();
  const { mutate: deleteMethod } = useDeletePaymentMethod();
  
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodInfo | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethodInfo | null>(null);

  const statsByMethod = useMemo(() => {
    const stats: Record<string, { count: number; total: number; fees: number }> = {};
    
    methods.forEach(m => {
      stats[m.id] = { count: 0, total: 0, fees: 0 };
    });

    sales.forEach(s => {
      if (stats[s.payment]) {
        stats[s.payment].count += 1;
        stats[s.payment].total += s.total;
        stats[s.payment].fees += s.fees;
      }
    });

    return stats;
  }, [methods, sales]);

  const handleEdit = (method: PaymentMethodInfo) => {
    setEditingMethod(method);
    setNewModalOpen(true);
  };

  const handleDeleteRequest = (method: PaymentMethodInfo) => {
    setMethodToDelete(method);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!methodToDelete) return;
    deleteMethod(methodToDelete.id, {
      onSuccess: () => {
        toast.success("Método excluído com sucesso!");
        setDeleteModalOpen(false);
      },
      onError: () => toast.error("Erro ao excluir método.")
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Formas de Pagamento"
        subtitle="Configure as taxas de cada método"
        icon={CreditCard}
        actions={
          <Button 
            onClick={() => {
              setEditingMethod(null);
              setNewModalOpen(true);
            }}
            className="gradient-primary text-white gap-2 font-bold shadow-lg glow-primary border-transparent hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Novo Método
          </Button>
        }
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods.map((method, index) => {
          const Icon = ICON_MAP[method.icon || "CreditCard"] || HelpCircle;
          const stats = statsByMethod[method.id] || { count: 0, total: 0, fees: 0 };
          const colorClass = method.color === "red" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success";

          return (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:border-border-strong transition-colors"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", colorClass)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg leading-none">{method.name}</h3>
                        {DEFAULT_PAYMENT_METHODS.some(dm => dm.id === method.id) && (
                          <span className="text-[9px] font-bold uppercase tracking-widest bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border/50">
                            Padrão
                          </span>
                        )}
                      </div>
                      <p className={cn("text-xs mt-2 font-medium", method.fee_value === 0 ? "text-success" : "text-destructive")}>
                        {method.fee_value === 0 ? "Sem taxas" : (
                          method.fee_type === "percent" ? `${method.fee_value}%` : formatBRL(method.fee_value)
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleEdit(method)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!DEFAULT_PAYMENT_METHODS.some(dm => dm.id === method.id) && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteRequest(method)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vendas</span>
                    <span className="font-semibold">{stats.count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Recebido</span>
                    <span className="font-bold">{formatBRL(stats.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total em Taxas</span>
                    <span className="font-semibold text-destructive">- {formatBRL(stats.fees)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <NewPaymentMethodModal 
        open={newModalOpen} 
        onOpenChange={setNewModalOpen} 
        editingMethod={editingMethod}
      />

      <DeletePaymentMethodModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        methodName={methodToDelete?.name || ""}
      />
    </div>
  );
}
