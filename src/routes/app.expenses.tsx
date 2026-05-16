import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingDown, Plus, Pencil, Trash2, Calendar, 
  ChevronDown, Filter, DollarSign, BarChart3, 
  Layers, Package, Wallet, ShoppingBag, 
  Zap, Car, Users, MoreHorizontal
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { 
  useExpenses,
  useExpenseCategories, 
  useDeleteExpense, 
  useDeleteExpenseCategory,
  useCreateExpenseCategory
} from "@/hooks/useQueries";
import { formatBRL } from "@/components/sales/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { NewExpenseCategoryModal } from "@/components/expenses/NewExpenseCategoryModal";
import { NewExpenseModal } from "@/components/expenses/NewExpenseModal";
import { DeleteExpenseCategoryModal } from "@/components/expenses/DeleteExpenseCategoryModal";
import { DeleteExpenseModal } from "@/components/expenses/DeleteExpenseModal";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { type Expense, type ExpenseCategory } from "@/lib/api";
import { 
  Area, AreaChart, ResponsiveContainer, 
  Tooltip, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Cell
} from "recharts";
import { 
  isWithinInterval, 
  subDays, 
  startOfDay, 
  endOfDay, 
  startOfMonth, 
  endOfMonth,
  isSameDay
} from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/app/expenses")({
  head: () => ({ meta: [{ title: "Gastos Operacionais · Atlas Suite" }] }),
  component: ExpensesPage,
});

const CHART_COLORS = [
  "#ef4444", // red-500
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
];

const formatYAxis = (value: number) => {
  if (value === 0) return "R$ 0";
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1).replace('.0', '')}k`;
  return `R$ ${value}`;
};

function ExpensesPage() {
  const { data: expenses = [] } = useExpenses();
  const { data: categories = [], isLoading: isLoadingCats } = useExpenseCategories();
  const { mutate: deleteExpense } = useDeleteExpense();
  const { mutate: deleteCategory } = useDeleteExpenseCategory();
  const { mutate: createCategory } = useCreateExpenseCategory();

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [deleteCatModalOpen, setDeleteCatModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ExpenseCategory | null>(null);

  const [deleteExpenseModalOpen, setDeleteExpenseModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());

  const [period, setPeriod] = useState<string>("month");
  const [filterCat, setFilterCat] = useState<string>("all");

  const periodLabels: Record<string, string> = {
    all: "Todo período",
    today: "Hoje",
    yesterday: "Ontem",
    "7days": "Últimos 7 dias",
    "30days": "Últimos 30 dias",
    month: "Este Mês",
  };

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(expense => {
      // Filter by category
      if (filterCat !== "all" && expense.category_id !== filterCat) return false;

      // Filter by date
      const d = new Date(expense.date.includes("T") ? expense.date : expense.date + "T12:00:00");
      switch (period) {
        case "today": return isSameDay(d, now);
        case "yesterday": return isSameDay(d, subDays(now, 1));
        case "7days": return isWithinInterval(d, { start: startOfDay(subDays(now, 7)), end: endOfDay(now) });
        case "30days": return isWithinInterval(d, { start: startOfDay(subDays(now, 30)), end: endOfDay(now) });
        case "month": return isWithinInterval(d, { start: startOfMonth(now), end: endOfMonth(now) });
        default: return true;
      }
    });
  }, [expenses, period, filterCat]);

  const displayCategories = useMemo(() => {
    return categories;
  }, [categories]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + curr.value, 0);
  }, [filteredExpenses]);

  const expensesByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      const catName = categories.find(c => c.id === e.category_id)?.name || "Outros";
      data[catName] = (data[catName] || 0) + e.value;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.value - b.value);
  }, [filteredExpenses, categories]);

  const expensesByDate = useMemo(() => {
    const data: Record<string, number> = {};
    
    // Fill last 7 days to ensure chart always has a timeline
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      data[dateStr] = 0;
    }

    // Sort expenses by date
    const sorted = [...filteredExpenses].sort((a, b) => {
      const aTime = a.date.includes("T") ? new Date(a.date).getTime() : new Date(a.date + "T12:00:00").getTime();
      const bTime = b.date.includes("T") ? new Date(b.date).getTime() : new Date(b.date + "T12:00:00").getTime();
      return aTime - bTime;
    });
    
    sorted.forEach(e => {
      const d = new Date(e.date.includes("T") ? e.date : e.date + "T12:00:00");
      const dateStr = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      data[dateStr] = (data[dateStr] || 0) + e.value;
    });

    return Object.entries(data).map(([date, value]) => ({ date, value }));
  }, [expenses]);

  const handleEditCategory = (cat: ExpenseCategory) => {
    setEditingCategory(cat);
    setCategoryModalOpen(true);
  };

  const handleEditExpense = (exp: Expense) => {
    setEditingExpense(exp);
    setExpenseModalOpen(true);
  };

  const handleDeleteExpenseRequest = (exp: Expense) => {
    setExpenseToDelete(exp);
    setDeleteExpenseModalOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedExpenses.size === expenses.length && expenses.length > 0) {
      setSelectedExpenses(new Set());
    } else {
      setSelectedExpenses(new Set(expenses.map(e => e.id)));
    }
  };

  const toggleSelectExpense = (id: string) => {
    const newSet = new Set(selectedExpenses);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedExpenses(newSet);
  };

  const confirmDeleteExpense = () => {
    if (!expenseToDelete) return;
    deleteExpense(expenseToDelete.id, {
      onSuccess: () => {
        toast.success("Gasto excluído!");
        setDeleteExpenseModalOpen(false);
      },
      onError: (err: any) => toast.error(`Erro: ${err.message}`)
    });
  };

  const handleDeleteCategoryRequest = (cat: ExpenseCategory) => {
    setCategoryToDelete(cat);
    setDeleteCatModalOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    deleteCategory(categoryToDelete.id, {
      onSuccess: () => {
        toast.success("Categoria excluída!");
        setDeleteCatModalOpen(false);
      },
      onError: (err: any) => toast.error(`Erro: ${err.message}`)
    });
  };

  const handleBulkDelete = () => {
    if (selectedExpenses.size === 0) return;
    // Opcional: mostrar modal de confirmação para todas. 
    // Para simplificar e manter a fluidez como solicitado, 
    // vamos iterar chamando deleteExpense para cada ID:
    selectedExpenses.forEach(id => {
      deleteExpense(id, {
        onError: (err: any) => {
          toast.error("Erro ao apagar um dos gastos: " + err.message);
        }
      });
    });
    toast.success(`${selectedExpenses.size} gasto(s) excluído(s)`);
    setSelectedExpenses(new Set());
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Gastos Operacionais"
        subtitle="Gerencie seus custos e despesas"
        icon={TrendingDown}
        actions={
          <>
            <Button 
              variant="outline"
              onClick={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
              className="bg-card border-border hover:bg-white/5 gap-2 font-bold h-11"
            >
              <Plus className="h-4 w-4" /> Nova Categoria
            </Button>
            <Button 
              onClick={() => {
                setEditingExpense(null);
                setExpenseModalOpen(true);
              }}
              className="bg-success hover:bg-success/90 text-success-foreground gap-2 font-bold shadow-lg shadow-success/20 h-11"
            >
              <Plus className="h-4 w-4" /> Novo Gasto
            </Button>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total de Gastos</p>
                <h3 className="text-3xl font-bold text-destructive">{formatBRL(totalExpenses)}</h3>
              </div>
            </div>
            <div className="h-2 w-full bg-border/50 rounded-full overflow-hidden mt-4">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: "65%" }}
                 className="h-full bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.3)]"
               />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">Evolução dos Gastos</h4>
                    <p className="text-[10px] text-muted-foreground">Histórico mensal</p>
                  </div>
               </div>
            </div>
            <div className="h-[120px] w-full">
              {expenses.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={expensesByDate} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: "#6b7280" }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      tickFormatter={formatYAxis}
                      width={45}
                    />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px", fontSize: "12px" }}
                      itemStyle={{ color: "#fff", fontWeight: "bold" }}
                      formatter={(value: number) => [formatBRL(value), "Gasto"]}
                      labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-white/5 rounded-xl border border-dashed border-border">
                  <p className="text-xs text-muted-foreground italic">Nenhum gasto registrado</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">Gastos por Categoria</h4>
                    <p className="text-[10px] text-muted-foreground">Distribuição de despesas</p>
                  </div>
               </div>
            </div>
            <div className="flex flex-col h-full gap-4">
              <div className="h-[120px] w-full">
                {expenses.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expensesByCategory} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={false} 
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#6b7280" }}
                        tickFormatter={formatYAxis}
                        width={45}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {expensesByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} fillOpacity={0.8} />
                        ))}
                      </Bar>
                      <Tooltip 
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px", fontSize: "12px" }}
                        itemStyle={{ color: "#fff", fontWeight: "bold" }}
                        formatter={(value: number) => [formatBRL(value), "Total"]}
                        labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center bg-white/5 rounded-xl border border-dashed border-border">
                    <p className="text-xs text-muted-foreground italic">Selecione um período</p>
                  </div>
                )}
              </div>

              {/* Legenda Customizada */}
              {expenses.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-2">
                  {expensesByCategory.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-sm" 
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} 
                      />
                      <span className="text-[11px] font-medium text-muted-foreground">{item.name}</span>
                      <span className="text-[11px] font-bold text-white">{formatBRL(item.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Pills */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Categorias de Gastos</h4>
        <div className="flex flex-wrap gap-3">
          {displayCategories.map((cat) => {
            return (
              <div 
                key={cat.id} 
                className="group flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-default"
              >
                <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                  <CategoryIcon iconName={cat.icon} categoryName={cat.name} className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{cat.name}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                  <button onClick={() => handleEditCategory(cat)} className="h-6 w-6 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors">
                    <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                  {!["Tráfego Pago", "Transporte", "Outros", "Funcionários", "Fornecimento"].includes(cat.name) && (
                    <button onClick={() => handleDeleteCategoryRequest(cat)} className="h-6 w-6 rounded-md hover:bg-destructive/20 flex items-center justify-center transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-border bg-white/[0.02] flex items-center justify-between">
           <h4 className="text-sm font-bold text-white">Últimos Lançamentos</h4>
           <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 cursor-pointer hover:border-primary/50 transition-colors outline-none">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium">{periodLabels[period]}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {Object.entries(periodLabels).map(([key, label]) => (
                    <DropdownMenuItem key={key} onClick={() => setPeriod(key)}>
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn("h-8 w-8", filterCat !== "all" && "text-primary bg-primary/10")}>
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setFilterCat("all")}>
                    Todas as categorias
                  </DropdownMenuItem>
                  {displayCategories.map(c => (
                    <DropdownMenuItem key={c.id} onClick={() => setFilterCat(c.id)}>
                      <div className="flex items-center gap-2">
                        <CategoryIcon iconName={c.icon} categoryName={c.name} className="h-4 w-4 text-muted-foreground" />
                        <span>{c.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-6 py-4 w-10">
                  <Checkbox 
                    className="rounded-full h-4 w-4 border-[1.5px] border-primary/50 bg-transparent data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                    checked={selectedExpenses.size === filteredExpenses.length && filteredExpenses.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Data</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Descrição</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Observações</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Valor</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredExpenses.map((expense) => {
                const cat = categories.find(c => c.id === expense.category_id);
                return (
                  <tr key={expense.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 w-10">
                      <Checkbox 
                        className="rounded-full h-4 w-4 border-[1.5px] border-primary/50 bg-transparent data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                        checked={selectedExpenses.has(expense.id)}
                        onCheckedChange={() => toggleSelectExpense(expense.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-medium text-muted-foreground">
                        {new Date(expense.date.includes("T") ? expense.date : expense.date + "T12:00:00").toLocaleDateString("pt-BR")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-background border border-border">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <span className="text-xs font-bold text-foreground">{cat?.name || "Outros"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-foreground line-clamp-1">{expense.description}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-muted-foreground line-clamp-1 italic">
                        {expense.notes || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className="text-sm font-bold text-destructive">{formatBRL(expense.value)}</span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEditExpense(expense)} className="h-8 w-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors">
                          <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button onClick={() => handleDeleteExpenseRequest(expense)} className="h-8 w-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-dashed border-border">
                          <DollarSign className="h-6 w-6 text-muted-foreground/50" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-muted-foreground">Nenhum gasto registrado no período</p>
                          <p className="text-xs text-muted-foreground/60">Clique em Novo Gasto para começar a organizar suas finanças.</p>
                       </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk action bar */}
      <AnimatePresence>
        {selectedExpenses.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-border bg-card/60 backdrop-blur px-4 py-3 flex items-center gap-4 shadow-2xl"
          >
            <span className="text-sm text-muted-foreground">
              Ações: <span className="text-foreground font-medium">{selectedExpenses.size} selecionado(s)</span>
            </span>
            <div className="flex items-center gap-1">
              <BulkBtn icon={Trash2} label="Excluir Todos" danger onClick={handleBulkDelete} />
            </div>
            <button
              onClick={() => setSelectedExpenses(new Set())}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            >
              Limpar seleção
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <NewExpenseCategoryModal 
        open={categoryModalOpen} 
        onOpenChange={setCategoryModalOpen} 
        editingCategory={editingCategory}
      />
      <NewExpenseModal 
        open={expenseModalOpen} 
        onOpenChange={setExpenseModalOpen} 
        editingExpense={editingExpense}
      />
      <DeleteExpenseCategoryModal
        open={deleteCatModalOpen}
        onOpenChange={setDeleteCatModalOpen}
        onConfirm={confirmDeleteCategory}
        categoryName={categoryToDelete?.name || ""}
      />
      <DeleteExpenseModal
        open={deleteExpenseModalOpen}
        onOpenChange={setDeleteExpenseModalOpen}
        onConfirm={confirmDeleteExpense}
        expenseDescription={expenseToDelete?.description || ""}
      />
    </div>
  );
}

function BulkBtn({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-background hover:text-foreground transition-colors",
        danger && "hover:text-destructive",
      )}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}
