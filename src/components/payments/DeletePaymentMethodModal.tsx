import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  methodName: string;
}

export function DeletePaymentMethodModal({ open, onOpenChange, onConfirm, methodName }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-0 overflow-hidden bg-[#0c0c0e] border-[#1c1c1f] shadow-2xl">
        <DialogHeader className="px-8 py-6 border-b border-[#1c1c1f]">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
             </div>
             <DialogTitle className="text-xl font-bold tracking-tight text-white">Excluir Método?</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Você está prestes a excluir o método <span className="text-white font-bold">{methodName}</span>. 
            </p>
            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10">
              <p className="text-xs text-destructive/90 leading-relaxed font-medium">
                Vendas já registradas com este método não serão apagadas, mas você não poderá mais selecioná-lo em novas vendas. Esta ação não pode ser desfeita.
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
