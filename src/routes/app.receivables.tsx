import { createFileRoute } from "@tanstack/react-router";
import { 
  Receipt, Search, History, Filter, Hourglass, 
  CheckCircle2, AlertCircle, Calendar as CalendarIcon,
  User, FileText, ChevronRight, MoreHorizontal
} from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format, isAfter, isBefore, startOfDay, endOfDay, addDays } from "date-fns";
import { useSales } from "@/hooks/useQueries";
import { formatBRL } from "@/components/sales/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";

import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/app/receivables")({
  head: () => ({ meta: [{ title: "Contas a Receber · Nimbus" }] }),
  component: ReceivablesPage,
});

function ReceivablesPage() {
  const { data: sales = [] } = useSales();
  const [search, setSearch] = useState("");
  const [showOverdue, setShowOverdue] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  // Filtrar vendas que geram "contas a receber" (fiado ou parcelado)
  const receivables = useMemo(() => {
    return sales.filter(s => 
      s.receiptType === "a_prazo" || s.receiptType === "parcelado"
    ).map(s => {
      const dueDate = addDays(new Date(s.date), 30);
      const isOverdue = isBefore(dueDate, startOfDay(new Date()));
      
      return {
        ...s,
        dueDate,
        isOverdue,
      };
    });
  }, [sales]);

  const metrics = useMemo(() => {
    const totalPending = receivables.reduce((acc, r) => acc + (Number(r.total) || 0), 0);
    
    const today = new Date();
    const salesReceivedToday = sales.filter(s => s.status === "concluida" && isSameDay(new Date(s.date), today));
    const receivedTodayValue = salesReceivedToday.reduce((acc, s) => acc + (Number(s.total) || 0), 0);
    
    const overdue = receivables.filter(r => r.isOverdue);
    const totalOverdueValue = overdue.reduce((acc, r) => acc + (Number(r.total) || 0), 0);

    return {
      totalPending,
      receivedToday: receivedTodayValue,
      countReceivedToday: salesReceivedToday.length,
      totalOverdue: totalOverdueValue,
      countOverdue: overdue.length
    };
  }, [receivables, sales]);

  const filteredReceivables = useMemo(() => {
    return receivables.filter(r => {
      const matchesSearch = 
        (r.buyerName || "").toLowerCase().includes(search.toLowerCase()) ||
        r.code.toLowerCase().includes(search.toLowerCase());
      
      const matchesOverdue = r.isOverdue ? showOverdue : showPending;
      const matchesType = filterType === "all" || r.receiptType === filterType;

      return matchesSearch && matchesOverdue && matchesType;
    });
  }, [receivables, search, showOverdue, showPending, filterType]);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <PageHeader
        title="Contas a Receber"
        subtitle="Gerencie pagamentos pendentes e recebimentos."
        icon={Receipt}
        actions={
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar cliente ou documento"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card border-border h-10 w-[240px] text-xs"
              />
            </div>
            <Button variant="outline" className="bg-card border-border gap-2 h-10 text-xs font-medium">
              <History className="h-4 w-4 opacity-60" /> Histórico por cliente
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Pendente</p>
              <h3 className="text-3xl font-bold text-success">{formatBRL(metrics.totalPending)}</h3>
            </div>
            <Hourglass className="h-5 w-5 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Recebido Hoje</p>
              <h3 className="text-3xl font-bold text-white">{formatBRL(metrics.receivedToday)}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">{metrics.countReceivedToday} transação(ões) liquidada(s)</p>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Atrasados</p>
              <h3 className="text-3xl font-bold text-destructive">{formatBRL(metrics.totalOverdue)}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">{metrics.countOverdue} título(s) vencido(s)</p>
            </div>
            <AlertCircle className="h-5 w-5 text-destructive opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-card border border-border rounded-xl min-h-[400px] flex flex-col shadow-2xl relative overflow-hidden">
        <div className="p-4 border-b border-border flex justify-end gap-2">
          {(filterType !== "all" || !showOverdue || !showPending) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setFilterType("all");
                setShowOverdue(true);
                setShowPending(true);
              }}
              className="h-9 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Limpar filtros
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 bg-background border-border gap-2 text-xs font-bold">
                <Filter className="h-3.5 w-3.5" /> Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked={showPending} onCheckedChange={setShowPending}>
                Pendente
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={showOverdue} onCheckedChange={setShowOverdue}>
                Atrasado
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Tipo de Recebimento</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilterType("all")} className={cn(filterType === "all" && "bg-muted font-bold")}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("a_prazo")} className={cn(filterType === "a_prazo" && "bg-muted font-bold")}>
                Fiado (A Prazo)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("parcelado")} className={cn(filterType === "parcelado" && "bg-muted font-bold")}>
                Parcelado
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          {filteredReceivables.length > 0 ? (
            <div className="w-full overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead>
                   <tr className="text-muted-foreground border-b border-border uppercase text-[10px] tracking-widest font-bold">
                     <th className="px-6 py-4">Vencimento</th>
                     <th className="px-6 py-4">Cliente</th>
                     <th className="px-6 py-4">Documento</th>
                     <th className="px-6 py-4 text-right">Valor</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4 text-right">Ações</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border/50">
                   {filteredReceivables.map(r => (
                     <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                       <td className="px-6 py-4 font-medium text-muted-foreground">{format(r.dueDate, "dd/MM/yyyy")}</td>
                       <td className="px-6 py-4 font-bold">{r.buyerName || "Consumidor Final"}</td>
                       <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{r.code}</td>
                       <td className="px-6 py-4 text-right font-bold">{formatBRL(r.total)}</td>
                       <td className="px-6 py-4">
                         <div className={cn(
                           "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                           r.isOverdue ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                         )}>
                           {r.isOverdue ? "Atrasado" : "Pendente"}
                         </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                         <Button variant="ghost" size="icon" className="h-8 w-8">
                           <MoreHorizontal className="h-4 w-4" />
                         </Button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          ) : (
            <div className="max-w-[400px]">
              <div className="h-16 w-16 bg-white/[0.03] border border-dashed border-border rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Nenhuma conta a receber. Lance vendas como fiado ou parcelado em Vendas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}
