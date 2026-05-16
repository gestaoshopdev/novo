import { createFileRoute } from "@tanstack/react-router";
import { 
  Wallet, Plus, ArrowDownToLine, ArrowUpFromLine, 
  Search, Filter, Calendar as CalendarIcon, Trash2,
  ChevronDown, X, TrendingUp, TrendingDown, Scale, PieChart,
  HelpCircle
} from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  format, startOfMonth, endOfMonth, isWithinInterval, 
  isSameDay, subDays, startOfDay, endOfDay 
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSales, useExpenses, useExpenseCategories, useProducts, useDeleteExpense } from "@/hooks/useQueries";
import { formatBRL } from "@/components/sales/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { DeleteExpenseModal } from "@/components/expenses/DeleteExpenseModal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { NewExpenseModal } from "@/components/expenses/NewExpenseModal";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CategoryIcon } from "@/components/shared/CategoryIcon";

export const Route = createFileRoute("/app/cashflow")({
  head: () => ({ meta: [{ title: "Fluxo de Caixa · Nimbus" }] }),
  component: CashflowPage,
});

type Movement = {
  id: string;
  date: string;
  type: "Entrada" | "Saída";
  description: string;
  category: string;
  profit: boolean;
  cash: boolean;
  value: number;
  origin: string;
  raw: any;
};

function CashflowPage() {
  const { data: sales = [] } = useSales();
  const { data: expenses = [] } = useExpenses();
  const { data: categories = [] } = useExpenseCategories();
  const { mutate: deleteExpense } = useDeleteExpense();
  const { data: products = [] } = useProducts();

  const [date, setDate] = useState<{ from: Date; to: Date }>({
    from: startOfDay(subDays(new Date(), 30)),
    to: endOfDay(new Date()),
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState<Movement | null>(null);

  const [period, setPeriod] = useState<string>("30days");

  const periodLabels: Record<string, string> = {
    "today": "Hoje",
    "yesterday": "Ontem",
    "7days": "Últimos 7 dias",
    "30days": "Últimos 30 dias",
    "month": "Mês Atual",
    "all": "Todo o período",
    "custom": "Personalizado"
  };

  const handlePeriodChange = (p: string) => {
    setPeriod(p);
    const now = new Date();
    switch (p) {
      case "today":
        setDate({ from: startOfDay(now), to: endOfDay(now) });
        break;
      case "yesterday":
        const yesterday = subDays(now, 1);
        setDate({ from: startOfDay(yesterday), to: endOfDay(yesterday) });
        break;
      case "7days":
        setDate({ from: startOfDay(subDays(now, 7)), to: endOfDay(now) });
        break;
      case "30days":
        setDate({ from: startOfDay(subDays(now, 30)), to: endOfDay(now) });
        break;
      case "month":
        setDate({ from: startOfMonth(now), to: endOfMonth(now) });
        break;
      case "all":
        setDate({ from: new Date(0), to: new Date() });
        break;
    }
  };

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Todos");
  const [filterOrigin, setFilterOrigin] = useState("Todas");
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  // Unificar movimentos
  const allMovements = useMemo(() => {
    const movements: Movement[] = [];

    // Vendas como Entradas
    sales.forEach(s => {
      if (s.status === "devolvida") return; // Ignora vendas devolvidas
      movements.push({
        id: `sale-${s.id}`,
        date: s.date,
        type: "Entrada",
        description: s.buyerName ? `Venda: ${s.buyerName}` : `Venda ${s.code}`,
        category: "Vendas",
        profit: true,
        cash: true,
        value: Number(s.total) || 0,
        origin: "Venda",
        raw: s
      });
    });

    // Despesas como Saídas
    expenses.forEach(e => {
      const cat = categories.find(c => c.id === e.category_id)?.name || "Outros";
      movements.push({
        id: `expense-${e.id}`,
        date: e.date,
        type: "Saída",
        description: e.description,
        category: cat,
        profit: false,
        cash: true,
        value: -(Number(e.value) || 0),
        origin: cat === "Fornecimento" ? "Compra" : "Manual",
        raw: e
      });
    });

    // Entradas e Saídas Manuais de Estoque (Custo)
    products.forEach(p => {
      p.history?.forEach(h => {
        // Ignora histórico sem quantidade ou que vieram do módulo de vendas
        if (!h.quantity) return;
        if (h.note?.startsWith("Venda") || h.note?.startsWith("Devolução da venda")) return;

        const cost = (p.costPrice || 0) * Math.abs(h.quantity);
        if (cost > 0) {
          const isIncrease = h.quantity > 0;
          movements.push({
            id: `stock-${p.sku}-${h.date}-${h.id || Math.random()}`,
            date: h.date,
            type: isIncrease ? "Saída" : "Entrada",
            description: isIncrease ? `Entrada de estoque: ${p.name}` : `Baixa de estoque: ${p.name}`,
            category: "Fornecimento",
            profit: false,
            cash: true,
            value: isIncrease ? -cost : cost,
            origin: isIncrease ? "Compra" : "Ajuste",
            raw: { ...h, isStock: true, sku: p.sku }
          });
        }
      });
    });

    return movements.sort((a, b) => {
      // 1. Isolar apenas o dia para agrupar corretamente
      const aDayStr = a.date.split("T")[0];
      const bDayStr = b.date.split("T")[0];
      
      const aDay = new Date(aDayStr + "T00:00:00").getTime();
      const bDay = new Date(bDayStr + "T00:00:00").getTime();
      
      const diff = bDay - aDay;
      
      // 2. Se for o mesmo dia, usar created_at para desempate preciso da ordem de criação
      if (diff === 0) {
        if (a.raw?.created_at && b.raw?.created_at) {
          return new Date(b.raw.created_at).getTime() - new Date(a.raw.created_at).getTime();
        }
        
        // Fallback: se tiverem datas com hora (como Vendas ou Estoque), usa o exato
        const aExact = new Date(a.date.includes("T") ? a.date : a.date + "T23:59:59").getTime();
        const bExact = new Date(b.date.includes("T") ? b.date : b.date + "T23:59:59").getTime();
        if (!isNaN(aExact) && !isNaN(bExact) && aExact !== bExact) {
          return bExact - aExact;
        }
      }
      
      return diff;
    });
  }, [sales, expenses, categories, products]);

  // Filtros de período para os KPIs
  const periodMovements = useMemo(() => {
    return allMovements.filter(m => {
      const d = new Date(m.date.includes("T") ? m.date : m.date + "T12:00:00");
      return isWithinInterval(d, { start: startOfDay(date.from), end: endOfDay(date.to) });
    });
  }, [allMovements, date]);

  // Filtros adicionais para a tabela
  const filteredMovements = useMemo(() => {
    return periodMovements.filter(m => {
      const matchesSearch = 
        m.description.toLowerCase().includes(search.toLowerCase()) ||
        m.category.toLowerCase().includes(search.toLowerCase()) ||
        m.origin.toLowerCase().includes(search.toLowerCase()) ||
        m.value.toString().includes(search);
      
      const matchesType = filterType === "Todos" || m.type === filterType;
      const matchesOrigin = filterOrigin === "Todas" || m.origin === filterOrigin;
      const matchesCategory = filterCategory === "Todas" || m.category === filterCategory;

      return matchesSearch && matchesType && matchesOrigin && matchesCategory;
    });
  }, [periodMovements, search, filterType, filterOrigin, filterCategory]);

  const metrics = useMemo(() => {
    const periodIn = periodMovements.filter(m => m.type === "Entrada").reduce((acc, m) => acc + m.value, 0);
    const periodOut = periodMovements.filter(m => m.type === "Saída").reduce((acc, m) => acc + m.value, 0);
    const result = periodIn + periodOut; // periodOut is negative

    // Lucro no período (Simplificado: total lucro das vendas - despesas que impactam lucro)
    // Aqui assumimos que despesas normais não impactam o lucro operacional bruto, mas reduzem o líquido
    // No entanto, para bater com a imagem, vamos calcular de forma simples.
    const saleProfit = periodMovements
      .filter(m => m.origin === "Venda")
      .reduce((acc, m) => acc + (Number(m.raw?.profit) || 0), 0);
    
    // Supondo que despesas de "Fornecimento" não tiram lucro (vão pro custo), mas outras sim?
    // Vamos simplificar: impacto no lucro = lucro das vendas - despesas administrativas
    const expenseImpact = periodMovements
      .filter(m => m.type === "Saída" && m.category !== "Fornecimento")
      .reduce((acc, m) => acc + m.value, 0);

    const totalHistoricalIn = allMovements.filter(m => m.type === "Entrada").reduce((acc, m) => acc + m.value, 0);
    const totalHistoricalOut = allMovements.filter(m => m.type === "Saída").reduce((acc, m) => acc + m.value, 0);

    return {
      periodIn,
      periodOut,
      result,
      historicalSaldo: totalHistoricalIn + totalHistoricalOut,
      profitImpact: saleProfit + expenseImpact
    };
  }, [periodMovements, allMovements]);

  const handleDeleteRequest = (m: Movement) => {
    if (m.origin === "Venda") {
      toast.error("Não é possível excluir uma venda pelo fluxo de caixa. Vá até a página de vendas.");
      return;
    }
    if (m.raw?.isStock) {
      toast.error("Não é possível excluir uma entrada de estoque por aqui. Vá até a página de produtos e edite o estoque.");
      return;
    }
    setMovementToDelete(m);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!movementToDelete?.raw?.id) return;
    deleteExpense(movementToDelete.raw.id, {
      onSuccess: () => {
        toast.success("Lançamento excluído!");
        setDeleteModalOpen(false);
      },
      onError: (err) => toast.error(`Erro: ${err.message}`)
    });
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <PageHeader
        title="Fluxo de Caixa"
        subtitle="Tudo interligado: vendas, estoque, despesas, recebimentos e ajustes."
        icon={Wallet}
        actions={
          <Button 
            onClick={() => setExpenseModalOpen(true)}
            className="bg-success hover:bg-success/90 text-success-foreground gap-2 font-bold shadow-lg shadow-success/20 h-10"
          >
            <Plus className="h-4 w-4" /> Novo Lançamento Manual
          </Button>
        }
      />

      {/* Period Selectors */}
      <div className="flex justify-end gap-3 mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-card border-border h-9 text-[12px] font-medium gap-2 min-w-[140px]">
              {periodLabels[period]} <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {Object.entries(periodLabels).map(([key, label]) => (
              <DropdownMenuItem key={key} onClick={() => handlePeriodChange(key)}>
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-card border-border h-9 text-[12px] font-medium min-w-[180px] justify-start gap-2">
              <CalendarIcon className="h-3.5 w-3.5 opacity-60" />
              {date.from.getTime() === 0 ? "Desde o início" : `${format(date.from, "dd/MM/yy")} - ${format(date.to, "dd/MM/yy")}`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date.from.getTime() === 0 ? new Date() : date.from}
              selected={{ from: date.from, to: date.to }}
              onSelect={(range: any) => {
                if (range?.from && range?.to) {
                  setDate({ from: range.from, to: range.to });
                  setPeriod("custom");
                } else if (range?.from) {
                  setDate({ from: range.from, to: range.from });
                  setPeriod("custom");
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <TooltipProvider>
          <CashKpi 
            label="Saldo no período" 
            value={metrics.result} 
            icon={Wallet} 
            tooltip="Entradas menos saídas de caixa só no intervalo de datas filtrado."
          />
          <CashKpi 
            label="Saldo acumulado" 
            value={metrics.historicalSaldo} 
            icon={Scale} 
            tooltip="Saldo total de todas as contas somadas desde o início do uso."
          />
          <CashKpi 
            label="Entradas de Caixa" 
            value={metrics.periodIn} 
            icon={ArrowDownToLine} 
            variant="success" 
            tooltip="Volume total bruto que entrou no caixa no período selecionado."
          />
          <CashKpi 
            label="Saídas de Caixa" 
            value={Math.abs(metrics.periodOut)} 
            icon={ArrowUpFromLine} 
            variant="destructive" 
            tooltip="Volume total bruto que saiu do caixa no período selecionado."
          />
          <CashKpi 
            label="Resultado de Caixa" 
            value={metrics.result} 
            icon={PieChart} 
            variant={metrics.result >= 0 ? "success" : "destructive"} 
            tooltip="Lucro ou prejuízo líquido baseado no fluxo financeiro do período."
          />
          <CashKpi 
            label="Impacto no Lucro" 
            value={metrics.profitImpact} 
            icon={TrendingUp} 
            variant="success" 
            tooltip="Lucro real das vendas subtraindo as despesas operacionais."
          />
        </TooltipProvider>
      </div>

      {/* Filters Bar */}
      <div className="bg-card/50 border border-border rounded-xl p-4 mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar por descrição, categoria, observações, origem ou valor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background border-border h-11"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest pl-1">Tipo</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-background border-border h-10 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Entrada">Entrada</SelectItem>
                <SelectItem value="Saída">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest pl-1">Origem</label>
            <Select value={filterOrigin} onValueChange={setFilterOrigin}>
              <SelectTrigger className="bg-background border-border h-10 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                <SelectItem value="Venda">Venda</SelectItem>
                <SelectItem value="Compra">Compra</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest pl-1">Categoria</label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="bg-background border-border h-10 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                <SelectItem value="Vendas">Vendas</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.name}>
                    <div className="flex items-center gap-2">
                      <CategoryIcon iconName={c.icon} categoryName={c.name} className="h-4 w-4 text-muted-foreground" />
                      <span>{c.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            className="h-10 border-border bg-background hover:bg-muted text-xs font-bold"
            onClick={() => {
              setSearch("");
              setFilterType("Todos");
              setFilterOrigin("Todas");
              setFilterCategory("Todas");
            }}
          >
            Limpar filtros
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground px-1 italic">
          Os resumos acima usam só o período de datas. A lista abaixo aplica também pesquisa e filtros.
        </p>
      </div>

      {/* Movements Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left">
            <thead>
              <tr className="bg-white/[0.02] text-muted-foreground border-b border-border">
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Data</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Tipo</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Descrição</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Categoria</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-center">Lucro</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-center">Caixa</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-right">Valor</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Origem</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredMovements.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 text-muted-foreground">
                    {format(new Date(m.date.includes("T") ? m.date : m.date + "T12:00:00"), "dd/MM/yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "font-medium",
                      m.type === "Entrada" ? "text-success" : "text-destructive"
                    )}>
                      {m.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground">{m.description}</td>
                  <td className="px-6 py-4 text-muted-foreground">{m.category}</td>
                  <td className="px-6 py-4 text-center text-muted-foreground font-medium">{m.profit ? "Sim" : "Não"}</td>
                  <td className="px-6 py-4 text-center text-muted-foreground font-medium">{m.cash ? "Sim" : "Não"}</td>
                  <td className={cn(
                    "px-6 py-4 text-right font-bold",
                    m.type === "Entrada" ? "text-success" : "text-destructive"
                  )}>
                    {m.type === "Saída" ? "- " : ""}{formatBRL(Math.abs(m.value))}
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-[11px] font-bold uppercase tracking-wider">
                      {m.origin}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDeleteRequest(m)} className="h-8 w-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMovements.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-20 text-center text-muted-foreground">
                    Nenhum lançamento encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewExpenseModal 
        open={expenseModalOpen} 
        onOpenChange={setExpenseModalOpen} 
        showProductCategories={true}
      />
      <DeleteExpenseModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        expenseDescription={movementToDelete?.description || ""}
      />
    </div>
  );
}

function CashKpi({ label, value, icon: Icon, variant = "neutral", tooltip }: { label: string; value: number; icon: any; variant?: string; tooltip?: string }) {
  const isNegative = value < 0;
  
  return (
    <div className="bg-card border border-border p-4 rounded-xl shadow-sm hover:border-border-strong transition-all group">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn(
          "h-7 w-7 rounded-lg flex items-center justify-center border transition-colors",
          variant === "success" ? "bg-success/10 border-success/20 text-success group-hover:bg-success/20" :
          variant === "destructive" ? "bg-destructive/10 border-destructive/20 text-destructive group-hover:bg-destructive/20" :
          "bg-muted/50 border-border text-muted-foreground group-hover:bg-muted"
        )}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest truncate flex-1">{label}</p>
        
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground opacity-40 hover:opacity-100 transition-all cursor-help">
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent 
              side="top"
              className="max-w-[220px] text-[11px] bg-[#1c1c1f] border-[#2c2c2f] text-white font-medium leading-relaxed p-2.5 shadow-2xl text-center rounded-lg"
            >
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className={cn(
        "text-lg font-bold tracking-tight",
        variant === "success" || (variant === "neutral" && value > 0) ? "text-success" :
        variant === "destructive" || (variant === "neutral" && value < 0) ? "text-destructive" :
        "text-foreground"
      )}>
        {formatBRL(value)}
      </p>
    </div>
  );
}
