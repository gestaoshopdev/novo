import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  categoryName: string;
}

export function DeleteExpenseCategoryModal({ open, onOpenChange, onConfirm, categoryName }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-0 overflow-hidden bg-[#0c0c0e] border-[#1c1c1f] shadow-2xl">
        <DialogHeader className="px-8 py-6 border-b border-[#1c1c1f]">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
             </div>
             <DialogTitle className="text-xl font-bold tracking-tight text-white">Excluir Categoria?</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Você está prestes a excluir a categoria <span className="text-white font-bold">{categoryName}</span>. 
            </p>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-500/90 leading-relaxed font-medium">
                Gastos já registrados com esta categoria não serão apagados, mas ficarão listados como "Sem Categoria". Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={onConfirm}
              className="w-full bg-destructive hover:bg-destructive/90 text-white h-12 font-bold text-sm rounded-xl shadow-lg shadow-destructive/20"
            >
              Sim, desejo excluir
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="w-full h-12 font-medium text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              Cancelar e voltar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
