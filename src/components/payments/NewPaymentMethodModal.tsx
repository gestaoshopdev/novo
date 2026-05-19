import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, HelpCircle } from "lucide-react";
import { useCreatePaymentMethod, useUpdatePaymentMethod } from "@/hooks/useQueries";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { NumberInput } from "@/components/ui/number-input";
import { type PaymentMethodInfo } from "@/components/sales/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingMethod?: PaymentMethodInfo | null;
}

export function NewPaymentMethodModal({ open, onOpenChange, editingMethod }: Props) {
  const [name, setName] = useState("");
  const [feePercent, setFeePercent] = useState("");
  const [feeFixed, setFeeFixed] = useState("");
  const [hasInstallments, setHasInstallments] = useState(false);
  const [installmentFees, setInstallmentFees] = useState<Record<number, string>>({});

  const { mutate: createMethod, isPending: isCreating } = useCreatePaymentMethod();
  const { mutate: updateMethod, isPending: isUpdating } = useUpdatePaymentMethod();
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      if (editingMethod) {
        setName(editingMethod.name);
        setFeePercent(editingMethod.fee_type === "percent" ? editingMethod.fee_value.toString() : "");
        setFeeFixed(editingMethod.fee_type === "fixed" ? editingMethod.fee_value.toString() : "");
        const hasInst = Object.keys(editingMethod.installment_fees || {}).length > 0;
        setHasInstallments(hasInst);
        
        const instFees: Record<number, string> = {};
        Object.entries(editingMethod.installment_fees || {}).forEach(([k, v]) => {
          instFees[parseInt(k)] = v.toString();
        });
        setInstallmentFees(instFees);
      } else {
        setName("");
        setFeePercent("");
        setFeeFixed("");
        setHasInstallments(false);
        setInstallmentFees({});
      }
    }
  }, [open, editingMethod]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return toast.error("O nome é obrigatório");

    const feesJson: Record<number, number> = {};
    if (hasInstallments) {
      Object.entries(installmentFees).forEach(([k, v]) => {
        const val = parseFloat(v);
        if (!isNaN(val)) feesJson[parseInt(k)] = val;
      });
    }

    const payload = {
      name,
      fee_type: parseFloat(feeFixed) > 0 ? "fixed" : "percent" as const,
      fee_value: parseFloat(feePercent) || parseFloat(feeFixed) || 0,
      installment_fees: feesJson,
      icon: "CreditCard",
      color: (parseFloat(feePercent) > 0 || parseFloat(feeFixed) > 0 || Object.keys(feesJson).length > 0) ? "red" : "green",
    };

    if (editingMethod) {
      updateMethod({ id: editingMethod.id, updates: payload }, {
        onSuccess: () => {
          toast.success("Método atualizado com sucesso!");
          onOpenChange(false);
        },
        onError: (err: any) => toast.error(`Erro ao atualizar: ${err.message}`)
      });
    } else {
      createMethod(payload, {
        onSuccess: () => {
          toast.success("Método cadastrado com sucesso!");
          onOpenChange(false);
        },
        onError: (err: any) => toast.error(`Erro ao cadastrar: ${err.message}`)
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-0 overflow-hidden bg-card border-border shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {editingMethod ? "Editar Método de Pagamento" : "Novo Método de Pagamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Nome</Label>
            <Input 
              placeholder="Ex: Cartão de Crédito" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Taxa (%)</Label>
              <NumberInput
                suffix="%"
                step={0.01}
                placeholder="0.00"
                value={Number(feePercent)}
                onChange={(v) => setFeePercent(v.toString())}
                className="bg-background border-border h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Taxa Fixa (R$)</Label>
              <NumberInput
                prefix="R$"
                step={0.01}
                placeholder="0.00"
                value={Number(feeFixed)}
                onChange={(v) => setFeeFixed(v.toString())}
                className="bg-background border-border h-11"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="installments" 
                checked={hasInstallments}
                onCheckedChange={(v) => setHasInstallments(!!v)}
                className="h-5 w-5 rounded-md border-primary/50"
              />
              <label htmlFor="installments" className="text-sm font-bold cursor-pointer select-none">
                Taxa varia por nº de parcelas
              </label>
            </div>

            {hasInstallments && (
              <div className="p-4 rounded-xl bg-background/50 border border-border/60 space-y-4">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Preencha só as parcelas que você usa. As que ficarem em branco usam a taxa padrão acima.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
                  {[2,3,4,5,6,7,8,9,10,11,12].map(n => (
                    <div key={n} className="flex items-center gap-2">
                      <span className="text-sm font-bold text-muted-foreground w-5">{n}x</span>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01"
                          value={installmentFees[n] || ""}
                          onChange={(e) => setInstallmentFees(prev => ({ ...prev, [n]: e.target.value }))}
                          className="h-8 w-14 pr-5 pl-2 text-xs bg-background/80 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="px-6 h-11 font-medium hover:bg-background"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="gradient-primary text-white px-8 h-11 font-bold shadow-lg glow-primary border-transparent hover:opacity-90 transition-opacity"
            >
              {isPending ? (editingMethod ? "Salvando..." : "Cadastrando...") : (editingMethod ? "Salvar Alterações" : "Cadastrar")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
