import { useEffect, useState } from "react";
import { ArrowDownToLine, Package2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { generateId } from "@/lib/utils";
import type { ProductRow, StockMovement } from "./types";
import { statusFromStock } from "./types";
import { NumberInput } from "@/components/ui/number-input";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  product: ProductRow | null;
  onApply: (updated: ProductRow, movement: StockMovement) => void;
}

const inputCls =
  "w-full h-10 px-3 rounded-lg bg-surface/60 border border-border text-[13px] focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition";

export function StockEntryModal({ open, onOpenChange, product, onApply }: Props) {
  const [type, setType] = useState<"entrada" | "saida" | "ajuste">("entrada");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setType("entrada");
      setQty("1");
      setNote("");
    }
  }, [open]);

  if (!product) return null;

  const numeric = Number(qty) || 0;
  const delta = type === "saida" ? -numeric : type === "entrada" ? numeric : numeric - product.stock;
  const projected = type === "ajuste" ? numeric : product.stock + delta;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numeric < 0) return toast.error("Quantidade inválida");
    if (type === "saida" && numeric > product.stock)
      return toast.error("Saída maior que o estoque atual");

    const movement: StockMovement = {
      id: generateId(),
      date: new Date().toISOString(),
      type,
      quantity: type === "ajuste" ? numeric - product.stock : type === "saida" ? -numeric : numeric,
      note: note.trim() || undefined,
    };

    const updated: ProductRow = {
      ...product,
      stock: projected,
      status: statusFromStock(projected),
      history: [...(product.history || []), movement],
    };
    onApply(updated, movement);
    toast.success(
      type === "entrada"
        ? `+${numeric} adicionados ao estoque`
        : type === "saida"
          ? `-${numeric} retirados do estoque`
          : `Estoque ajustado para ${numeric}`,
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] p-0 gap-0 bg-card border-border overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="h-4 w-4 text-primary" />
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Movimentação de Estoque
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div className="rounded-lg bg-surface/40 border border-border px-3 py-2.5 flex items-center gap-3">
            <Package2 className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">{product.name}</p>
              <p className="text-[11px] text-muted-foreground font-mono-tabular">
                {product.sku} · estoque atual: {product.stock}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold mb-2">Tipo de movimentação</label>
            <div className="grid grid-cols-3 gap-2">
              {(["entrada", "saida", "ajuste"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`h-9 rounded-lg border text-[12px] font-medium capitalize transition ${
                    type === t
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface/40 hover:border-border-strong"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold mb-1.5">
              {type === "ajuste" ? "Novo total em estoque" : "Quantidade"}
            </label>
            <NumberInput
              min={0}
              value={Number(qty)}
              onChange={(v) => setQty(v.toString())}
              className="bg-surface/60 border border-border h-10"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold mb-1.5">Observação</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Ex: Reposição fornecedor X"
              className={`${inputCls} h-auto py-2 resize-none`}
            />
          </div>

          <div className="rounded-lg border border-border bg-surface/30 px-3 py-2.5 flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Estoque após movimentação</span>
            <span
              className={`font-mono-tabular font-semibold ${
                projected <= 0
                  ? "text-destructive"
                  : projected < 10
                    ? "text-warning"
                    : "text-success"
              }`}
            >
              {projected}
            </span>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-card">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-lg bg-surface border border-border text-[13px] font-medium hover:border-border-strong transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={submit}
            className="h-9 px-5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:opacity-90 transition shadow-sm"
          >
            Confirmar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
