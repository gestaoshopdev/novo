import { History, ArrowDown, ArrowUp, Settings2, Plus, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProductRow, StockMovement } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  product: ProductRow | null;
}

const typeMeta: Record<StockMovement["type"], { label: string; icon: React.ReactNode; color: string }> = {
  entrada: { label: "Entrada", icon: <ArrowDown className="h-3.5 w-3.5" />, color: "text-success bg-success/10" },
  saida: { label: "Saída", icon: <ArrowUp className="h-3.5 w-3.5" />, color: "text-destructive bg-destructive/10" },
  ajuste: { label: "Ajuste", icon: <Settings2 className="h-3.5 w-3.5" />, color: "text-warning bg-warning/10" },
  criacao: { label: "Criação", icon: <Plus className="h-3.5 w-3.5" />, color: "text-primary bg-primary/10" },
  edicao: { label: "Edição", icon: <Pencil className="h-3.5 w-3.5" />, color: "text-muted-foreground bg-surface" },
};

export function ProductHistoryModal({ open, onOpenChange, product }: Props) {
  if (!product) return null;
  const history = [...(product.history || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[540px] p-0 gap-0 bg-card border-border overflow-hidden max-h-[88vh]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Histórico — {product.name}
            </DialogTitle>
          </div>
          <p className="text-[12px] text-muted-foreground font-mono-tabular mt-1">{product.sku}</p>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-5 max-h-[calc(88vh-160px)]">
          {history.length === 0 ? (
            <div className="text-center py-10">
              <History className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground">
                Nenhuma movimentação registrada ainda.
              </p>
            </div>
          ) : (
            <ol className="relative border-l border-border ml-2 space-y-4">
              {history.map((m) => {
                const meta = typeMeta[m.type];
                return (
                  <li key={m.id} className="ml-4">
                    <span
                      className={`absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full ${meta.color} ring-4 ring-card`}
                    >
                      {meta.icon}
                    </span>
                    <div className="rounded-lg border border-border bg-surface/40 px-3 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold">{meta.label}</span>
                        <span className="text-[11px] text-muted-foreground font-mono-tabular">
                          {new Date(m.date).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-[12px] text-muted-foreground">
                          {m.note || "Sem observação"}
                        </span>
                        {m.quantity !== 0 && (
                          <span
                            className={`text-[12px] font-mono-tabular font-semibold ${
                              m.quantity > 0 ? "text-success" : "text-destructive"
                            }`}
                          >
                            {m.quantity > 0 ? "+" : ""}
                            {m.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-card">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-lg bg-surface border border-border text-[13px] font-medium hover:border-border-strong transition"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
