import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useCreateExpense, useUpdateExpense, useExpenseCategories, useCategories } from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { NumberInput } from "@/components/ui/number-input";
import { toast } from "sonner";
import * as api from "@/lib/api";
import { type Expense } from "@/lib/api";
import { CategoryIcon } from "@/components/shared/CategoryIcon";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingExpense?: Expense | null;
  showProductCategories?: boolean;
}
export function NewExpenseModal({ open, onOpenChange, editingExpense, showProductCategories }: Props) {
  const queryClient = useQueryClient();
  const { data: expenseCategories = [] } = useExpenseCategories();
  const { data: productCategories = [] } = useCategories();
  
  const expenseGroupCategories = useMemo(() => {
    const uniqueMap = new Map();

    // 1. Padrões essenciais sempre existem
    const defaultCats = [
      { id: "def-1", name: "Tráfego Pago" },
      { id: "def-2", name: "Transporte" },
      { id: "def-3", name: "Funcionários" },
      { id: "def-4", name: "Fornecimento" },
      { id: "def-5", name: "Outros" },
    ];

    defaultCats.forEach(dc => {
      uniqueMap.set(dc.name, dc);
    });

    // 2. Adiciona as de gastos (filtrando as que tem nome igual a produtos)
    expenseCategories.forEach(c => {
      // Se for padrão, já está lá
      const isDefault = defaultCats.some(dc => dc.name === c.name);
      if (isDefault) {
        // Substitui o mock pelo id real
        uniqueMap.set(c.name, c);
        return;
      }

      // Se for de produto, ignora (para não duplicar/poluir)
      const isProductCat = productCategories.some(pc => pc.name === c.name);
      if (isProductCat) return;

      uniqueMap.set(c.name, c);
    });

    const result = Array.from(uniqueMap.values());
    result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [expenseCategories, productCategories]);

  const productGroupCategories = useMemo(() => {
    const result = [...productCategories];
    result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [productCategories]);

  const { mutate: createExpense, isPending: isCreating } = useCreateExpense();
  const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense();
  const isPending = isCreating || isUpdating;

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      if (editingExpense) {
        setDate(new Date(editingExpense.date));
        setCategoryId(editingExpense.category_id);
        setDescription(editingExpense.description);
        setValue(editingExpense.value.toString());
        setNotes(editingExpense.notes || "");
      } else {
        setDate(new Date());
        setCategoryId("");
        setDescription("");
        setValue("");
        setNotes("");
      }
    }
  }, [open, editingExpense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return toast.error("Selecione uma categoria");
    if (!description) return toast.error("A descrição é obrigatória");
    if (!value) return toast.error("O valor é obrigatório");

    let finalCategoryId = categoryId;
    
    const existsInExpense = expenseCategories.find(c => c.id === categoryId);
    const existsInProduct = productCategories.find(c => c.id === categoryId);
    
    if (!existsInExpense && !existsInProduct) {
      // É uma categoria que ainda não existe na tabela de gastos. Precisamos criá-la na tabela de gastos.
      const selectedName = expenseGroupCategories.find(c => c.id === categoryId)?.name;
      
      // Busca pelo nome para evitar duplicatas
      const realCatByName = expenseCategories.find(c => c.name === selectedName && !c.id.startsWith("def-"));
      
      if (realCatByName) {
        finalCategoryId = realCatByName.id;
      } else if (selectedName) {
        try {
          const newCat = await api.createExpenseCategory({ name: selectedName });
          finalCategoryId = newCat.id;
          queryClient.invalidateQueries({ queryKey: ["expense_categories"] });
        } catch (err: any) {
          return toast.error("Erro ao registrar categoria: " + err.message);
        }
      } else {
        return toast.error("Categoria inválida.");
      }
    }

    const payload = {
      date: date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      category_id: finalCategoryId,
      description,
      value: parseFloat(value),
      notes,
    };

    if (editingExpense) {
      updateExpense({ id: editingExpense.id, updates: payload }, {
        onSuccess: () => {
          toast.success("Gasto atualizado!");
          onOpenChange(false);
        },
        onError: (err: any) => toast.error(`Erro: ${err.message}`)
      });
    } else {
      createExpense(payload, {
        onSuccess: () => {
          toast.success("Gasto registrado!");
          onOpenChange(false);
        },
        onError: (err: any) => toast.error(`Erro: ${err.message}`)
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-0 overflow-hidden bg-card border-border shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {editingExpense ? "Editar Gasto" : "Novo Gasto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background border-border h-11 px-3",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-border bg-card shadow-2xl" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={ptBR}
                    className="p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Valor (R$)</Label>
              <NumberInput
                prefix="R$"
                placeholder="0,00"
                value={parseFloat(value) || 0}
                onChange={(v) => setValue(v.toString())}
                step={0.01}
                className="bg-background border-border h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="bg-background border-border h-11">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Categorias de gastos</SelectLabel>
                  {expenseGroupCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <CategoryIcon iconName={c.icon} categoryName={c.name} className="h-4 w-4 text-muted-foreground" />
                        <span>{c.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
                
                {showProductCategories && productGroupCategories.length > 0 && (
                  <>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Categorias de produtos</SelectLabel>
                      {productGroupCategories.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            <CategoryIcon iconName={c.icon} categoryName={c.name} className="h-4 w-4 text-muted-foreground" />
                            <span>{c.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Descrição</Label>
            <Input 
              placeholder="Ex: Compra de suprimentos" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border-border h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Observações (Opcional)</Label>
            <Textarea 
              placeholder="Detalhes adicionais..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-background border-border min-h-[80px]"
            />
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
              className="bg-success hover:bg-success/90 text-success-foreground px-8 h-11 font-bold shadow-lg shadow-success/20"
            >
              {isPending ? "Salvando..." : editingExpense ? "Salvar" : "Registrar Gasto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
