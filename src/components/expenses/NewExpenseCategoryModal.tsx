import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useCreateExpenseCategory, useUpdateExpenseCategory } from "@/hooks/useQueries";
import { toast } from "sonner";
import { type ExpenseCategory } from "@/lib/api";
import { cn } from "@/lib/utils";
import { PREDEFINED_ICONS } from "@/components/shared/CategoryIcon";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingCategory?: ExpenseCategory | null;
}

export function NewExpenseCategoryModal({ open, onOpenChange, editingCategory }: Props) {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Layers");
  const { mutate: createCategory, isPending: isCreating } = useCreateExpenseCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateExpenseCategory();
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      setName(editingCategory?.name || "");
      setSelectedIcon(editingCategory?.icon || "Layers");
    }
  }, [open, editingCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return toast.error("O nome é obrigatório");

    if (editingCategory) {
      updateCategory({ id: editingCategory.id, updates: { name, icon: selectedIcon } }, {
        onSuccess: () => {
          toast.success("Categoria atualizada!");
          onOpenChange(false);
        },
        onError: (err: any) => toast.error(`Erro: ${err.message}`)
      });
    } else {
      createCategory({ name, icon: selectedIcon }, {
        onSuccess: () => {
          toast.success("Categoria criada!");
          onOpenChange(false);
        },
        onError: (err: any) => toast.error(`Erro: ${err.message}`)
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] p-0 overflow-hidden bg-card border-border shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {editingCategory ? "Editar Categoria" : "Nova Categoria de Gasto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Nome da Categoria</Label>
            <Input 
              placeholder="Ex: Tráfego Pago, Aluguel, etc." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Escolha um Ícone</Label>
            <div className="grid grid-cols-6 gap-2 p-3 rounded-xl border border-border bg-background/30 max-h-[200px] overflow-y-auto custom-scrollbar">
              {PREDEFINED_ICONS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedIcon(item.name)}
                  className={cn(
                    "flex items-center justify-center p-2 rounded-lg transition-all hover:scale-110",
                    selectedIcon === item.name
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                      : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  )}
                  title={item.name}
                >
                  <item.icon className="h-5 w-5" />
                </button>
              ))}
            </div>
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
              className="bg-primary text-primary-foreground px-8 h-11 font-bold shadow-lg shadow-primary/20"
            >
              {isPending ? "Salvando..." : editingCategory ? "Salvar" : "Criar Categoria"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
