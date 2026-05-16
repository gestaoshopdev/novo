import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { 
  FileText, Calendar as CalendarIcon, Wallet, TrendingUp, 
  ShoppingBag, Receipt, Percent, Target, ChevronRight,
  BarChart3, LineChart, Package, Tag, Share2, ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths, subDays, eachDayOfInterval, isSameDay, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageHeader } from "@/components/shared/PageHeader";
import { useSales, useProducts, useChannels } from "@/hooks/useQueries";
import { formatBRL, DEFAULT_CHANNELS } from "@/components/sales/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
  CartesianGrid,
  Cell
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const formatYAxis = (value: number) => {
  if (value === 0) return "R$ 0";
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1).replace('.0', '')}k`;
  return `R$ ${value}`;
};

export const Route = createFileRoute("/app/reports")({
  head: () => ({ meta: [{ title: "Relatórios · Nimbus" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data: sales = [] } = useSales();
  const { data: products = [] } = useProducts();
  const { data: channels = [] } = useChannels();

  const [date, setDate] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const [period, setPeriod] = useState<"hoje" | "ontem" | "7dias" | "30dias" | "mes" | "tudo" | "custom">("mes");
  const [customOpen, setCustomOpen] = useState(false);

  useEffect(() => {
    const now = new Date();
    switch (period) {
      case "hoje":
        setDate({ from: now, to: now });
        break;
      case "ontem":
        setDate({ from: subDays(now, 1), to: subDays(now, 1) });
        break;
      case "7dias":
        setDate({ from: subDays(now, 7), to: now });
        break;
      case "30dias":
        setDate({ from: subDays(now, 30), to: now });
        break;
      case "mes":
        setDate({ from: startOfMonth(now), to: endOfMonth(now) });
        break;
      case "tudo":
        setDate({ from: new Date(0), to: now });
        break;
      case "custom":
        break;
    }
  }, [period]);

  const filteredSales = useMemo(() => {
    return sales
      .filter((s) => {
        if (s.status === "devolvida") return false; // Ignora vendas devolvidas
        const d = new Date(s.date);
        return isWithinInterval(d, { start: startOfDay(date.from), end: endOfDay(date.to) });
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, date]);

  const metrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((acc, s) => acc + (Number(s.total) || 0), 0);
    const totalProfit = filteredSales.reduce((acc, s) => acc + (Number(s.profit) || 0), 0);
    const totalQty = filteredSales.reduce((acc, s) => acc + (s.items?.reduce((a, b) => a + (Number(b.quantity) || 0), 0) || 0), 0);
    const avgTicket = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalProfit,
      totalQty,
      salesCount: filteredSales.length,
      avgTicket,
      margin,
    };
  }, [filteredSales]);

  // Chart: Este mês vs. mês passado (Simplificado para o período selecionado vs anterior equivalente)
  const comparisonData = useMemo(() => {
    const prevFrom = subMonths(date.from, 1);
    const prevTo = subMonths(date.to, 1);
    
    const prevSales = sales.filter(s => s.status !== "devolvida" && isWithinInterval(new Date(s.date), { start: prevFrom, end: prevTo }));
    
    const currentRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
    const prevRevenue = prevSales.reduce((acc, s) => acc + s.total, 0);
    
    const currentProfit = filteredSales.reduce((acc, s) => acc + s.profit, 0);
    const prevProfit = prevSales.reduce((acc, s) => acc + s.profit, 0);

    return [
      { name: "Vendas", atual: currentRevenue, passado: prevRevenue },
      { name: "Lucro", atual: currentProfit, passado: prevProfit },
    ];
  }, [sales, filteredSales, date]);

  // Chart: Vendas por dia
  const dailyData = useMemo(() => {
    let start = date.from;
    const end = date.to;

    // Se "Todo o período", pega a data da primeira venda
    if (start.getTime() === 0) {
      const validSales = sales.filter(s => s.status !== "devolvida");
      if (validSales.length > 0) {
        const earliest = validSales.reduce((min, s) => {
          const d = new Date(s.date).getTime();
          return d < min ? d : min;
        }, new Date().getTime());
        start = new Date(earliest);
      } else {
        start = end;
      }
    }

    // Se o período for apenas 1 dia (Hoje/Ontem), pegamos os últimos 7 dias até a data
    // para o gráfico formar uma linha em vez de um único ponto flutuando.
    if (isSameDay(start, end)) {
      start = subDays(end, 6);
    }

    // Prevenção de crash: limitar a no máximo 365 dias no gráfico diário
    if (end.getTime() - start.getTime() > 365 * 24 * 60 * 60 * 1000) {
      start = subDays(end, 365);
    }

    const days = eachDayOfInterval({ start, end });
    return days.map(day => {
      // Usamos 'sales' (todas) e não 'filteredSales' para que os 7 dias de preenchimento 
      // mostrem dados reais do histórico recente, dando melhor contexto visual.
      const daySales = sales.filter(s => s.status !== "devolvida" && isSameDay(new Date(s.date), day));
      return {
        date: format(day, "dd/MM/yy"),
        faturamento: daySales.reduce((acc, s) => acc + s.total, 0),
        lucro: daySales.reduce((acc, s) => acc + s.profit, 0),
        count: daySales.length,
      };
    });
  }, [sales, date]);

  const [dailyModalOpen, setDailyModalOpen] = useState(false);

  // Top produtos (Completo)
  const allProducts = useMemo(() => {
    const map: Record<string, { name: string; value: number; revenue: number }> = {};
    filteredSales.forEach(s => {
      s.items?.forEach(it => {
        if (!map[it.sku]) map[it.sku] = { name: it.productName || "Sem nome", value: 0, revenue: 0 };
        const qty = it.quantity || 0;
        const price = it.unitPrice || 0;
        map[it.sku].value += qty;
        map[it.sku].revenue += price * qty;
      });
    });
    return Object.values(map)
      .map(p => ({ ...p, revenue: isNaN(p.revenue) ? 0 : p.revenue }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSales]);

  // Lucro por categoria (Completo)
  const allCategories = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSales.forEach(s => {
      const saleTotal = s.total || 0;
      const saleProfit = s.profit || 0;
      
      s.items?.forEach(it => {
        const prod = products.find(p => p.sku === it.sku);
        const cat = prod?.category || "Sem categoria";
        
        const itemPrice = it.unitPrice || 0;
        const itemQty = it.quantity || 0;
        
        const itemShare = saleTotal > 0 ? (itemPrice * itemQty) / saleTotal : 0;
        const itemProfit = saleProfit * itemShare;
        
        map[cat] = (map[cat] || 0) + itemProfit;
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: isNaN(value) ? 0 : value })).sort((a, b) => b.value - a.value);
  }, [filteredSales, products]);

  // Vendas por canal (Completo)
  const allChannels = useMemo(() => {
    const map: Record<string, { faturamento: number; lucro: number }> = {};
    filteredSales.forEach(s => {
      const channelId = s.channel || "direto";
      const total = s.total || 0;
      const profit = s.profit || 0;
      if (!map[channelId]) map[channelId] = { faturamento: 0, lucro: 0 };
      map[channelId].faturamento += total;
      map[channelId].lucro += profit;
    });
    return Object.entries(map).map(([id, data]) => {
      const dbChannel = channels.find(c => c.id === id);
      const defChannel = DEFAULT_CHANNELS.find(c => c.id === id);
      
      let name = dbChannel?.name || defChannel?.name || id;
      if (name === "direto" || name === "null") name = "Direto / Outros";
      
      return { 
        name, 
        value: isNaN(data.faturamento) ? 0 : data.faturamento, 
        faturamento: isNaN(data.faturamento) ? 0 : data.faturamento, 
        lucro: isNaN(data.lucro) ? 0 : data.lucro 
      };
    }).sort((a, b) => b.value - a.value);
  }, [filteredSales, channels]);

  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [channelsModalOpen, setChannelsModalOpen] = useState(false);

  return (
    <div className="pb-10">
      <PageHeader
        title="Relatórios"
        subtitle="Análise detalhada do seu negócio"
        icon={BarChart3}
        actions={
          <>
            {period === "custom" && (
              <Popover open={customOpen} onOpenChange={setCustomOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-card border-border h-9 text-[12px] font-medium min-w-[200px] justify-start gap-2">
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
                        setCustomOpen(false);
                      } else if (range?.from) {
                        setDate({ from: range.from, to: range.from });
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-card border-border h-9 text-[12px] font-medium gap-2">
                  {period === "hoje" && "Hoje"}
                  {period === "ontem" && "Ontem"}
                  {period === "7dias" && "Últimos 7 dias"}
                  {period === "30dias" && "Últimos 30 dias"}
                  {period === "mes" && "Mês Atual"}
                  {period === "tudo" && "Todo o período"}
                  {period === "custom" && "Personalizado"}
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setPeriod("hoje")}>Hoje</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod("ontem")}>Ontem</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod("7dias")}>Últimos 7 dias</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod("30dias")}>Últimos 30 dias</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod("mes")}>Mês Atual</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod("tudo")}>Todo o período</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setPeriod("custom"); setCustomOpen(true); }}>Personalizado</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <ReportKpi label="Total em vendas" value={formatBRL(metrics.totalRevenue)} icon={Wallet} />
        <ReportKpi label="Lucro líquido" value={formatBRL(metrics.totalProfit)} icon={TrendingUp} variant="success" />
        <ReportKpi label="Itens vendidos" value={metrics.totalQty.toString()} icon={ShoppingBag} />
        <ReportKpi label="Lançamentos" value={metrics.salesCount.toString()} icon={Receipt} />
        <ReportKpi label="Ticket médio" value={formatBRL(metrics.avgTicket)} icon={Target} />
        <ReportKpi label="Margem s/ faturamento" value={`${metrics.margin.toFixed(1)}%`} icon={Percent} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        {/* Mês vs Mês Passado */}
        <ChartCard title="Este mês vs. mês passado" icon={BarChart3}>
          <div className="h-64 mt-4">
             <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider font-bold mb-4 justify-end">
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /> {format(date.from, "MMMM", { locale: ptBR })}</div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-warning" /> {format(subMonths(date.from, 1), "MMMM", { locale: ptBR })}</div>
             </div>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "oklch(0.65 0.015 260)" }} dy={10} />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    tickFormatter={formatYAxis}
                    width={45}
                  />
                  <Tooltip 
                    cursor={{ fill: "oklch(0.3 0.02 260 / 0.2)" }}
                    contentStyle={{ background: "oklch(0.2 0.022 260 / 0.95)", border: "1px solid oklch(0.38 0.025 260)", borderRadius: 12 }}
                  />
                  <Bar dataKey="atual" fill="oklch(0.68 0.19 268)" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="passado" fill="oklch(0.78 0.16 70)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
             </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-border/50">
             <div>
               <p className="text-[10px] text-muted-foreground uppercase font-bold">Vendas</p>
               <p className="text-sm font-semibold">{formatBRL(metrics.totalRevenue)}</p>
               <div className="h-1 w-8 bg-border rounded-full mt-1" />
             </div>
             <div>
               <p className="text-[10px] text-muted-foreground uppercase font-bold">Lucro</p>
               <p className="text-sm font-semibold">{formatBRL(metrics.totalProfit)}</p>
               <div className="h-1 w-8 bg-border rounded-full mt-1" />
             </div>
             <div>
               <p className="text-[10px] text-muted-foreground uppercase font-bold">Quantidade</p>
               <p className="text-sm font-semibold">{metrics.totalQty} itens</p>
               <div className="h-1 w-8 bg-border rounded-full mt-1" />
             </div>
          </div>
        </ChartCard>

        {/* Vendas por dia */}
        <ChartCard title="Vendas por dia" icon={LineChart} onSeeAll={() => setDailyModalOpen(true)}>
           <div className="h-64 mt-4">
              <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider font-bold mb-4 justify-end">
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /> Faturamento</div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-success" /> Lucro</div>
             </div>
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={dailyData}>
                 <defs>
                   <linearGradient id="faturamento" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="oklch(0.68 0.19 268)" stopOpacity={0.3} />
                     <stop offset="95%" stopColor="oklch(0.68 0.19 268)" stopOpacity={0} />
                   </linearGradient>
                   <linearGradient id="lucro" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="oklch(0.74 0.18 155)" stopOpacity={0.3} />
                     <stop offset="95%" stopColor="oklch(0.74 0.18 155)" stopOpacity={0} />
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                 <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "oklch(0.65 0.015 260)" }} minTickGap={30} dy={10} />
                 <YAxis 
                   axisLine={false}
                   tickLine={false}
                   tick={{ fontSize: 10, fill: "#6b7280" }}
                   tickFormatter={formatYAxis}
                   width={45}
                 />
                 <Tooltip 
                   contentStyle={{ background: "oklch(0.2 0.022 260 / 0.95)", border: "1px solid oklch(0.38 0.025 260)", borderRadius: 12 }}
                 />
                 <Area type="monotone" dataKey="faturamento" stroke="oklch(0.68 0.19 268)" fillOpacity={1} fill="url(#faturamento)" strokeWidth={2} />
                 <Area type="monotone" dataKey="lucro" stroke="oklch(0.74 0.18 155)" fillOpacity={1} fill="url(#lucro)" strokeWidth={2} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ListCard title="Top produtos" icon={Package} data={allProducts.slice(0, 5)} suffix="itens" onSeeAll={() => setProductsModalOpen(true)} />
        <ListCard title="Lucro por categoria" icon={Tag} data={allCategories.slice(0, 5)} isCurrency onSeeAll={() => setCategoriesModalOpen(true)} />
        <ListCard title="Vendas por canal" icon={Share2} data={allChannels.slice(0, 5)} isCurrency showChart onSeeAll={() => setChannelsModalOpen(true)} />
      </div>

      {/* Histórico do Período */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Histórico do período</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Últimos {filteredSales.length} lançamentos</p>
          </div>
          <Link to="/app/sales" className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground inline-flex items-center px-3 rounded-md hover:bg-muted/50 transition-colors">
            Ver todos <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border/50">
                <th className="px-6 py-3 font-semibold uppercase text-[10px] tracking-widest">Data</th>
                <th className="px-6 py-3 font-semibold uppercase text-[10px] tracking-widest">Produto</th>
                <th className="px-6 py-3 font-semibold uppercase text-[10px] tracking-widest text-center">Qtd</th>
                <th className="px-6 py-3 font-semibold uppercase text-[10px] tracking-widest">Canal</th>
                <th className="px-6 py-3 font-semibold uppercase text-[10px] tracking-widest">Pagamento</th>
                <th className="px-6 py-3 font-semibold uppercase text-[10px] tracking-widest text-right">Total</th>
                <th className="px-6 py-3 font-semibold uppercase text-[10px] tracking-widest text-right">Lucro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredSales.slice(0, 10).map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">{format(new Date(s.date), "dd/MM/yy")}</td>
                  <td className="px-6 py-4 font-medium">
                    {s.items.length === 1 ? s.items[0].productName : `${s.items[0].productName} +${s.items.length - 1}`}
                  </td>
                  <td className="px-6 py-4 text-center">{s.items.reduce((acc, it) => acc + it.quantity, 0)}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {channels.find(c => c.id === s.channel)?.name || 
                     DEFAULT_CHANNELS.find(c => c.id === s.channel)?.name || 
                     (s.channel === null || s.channel === "null" ? "Direto" : s.channel)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground uppercase text-[11px] font-bold">{s.payment}</td>
                  <td className="px-6 py-4 text-right font-medium">{formatBRL(s.total)}</td>
                  <td className="px-6 py-4 text-right font-bold text-success">{formatBRL(s.profit)}</td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-muted-foreground">
                    Nenhuma venda encontrada neste período
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal Vendas por Dia */}
      <Dialog open={dailyModalOpen} onOpenChange={setDailyModalOpen}>
        <DialogContent className="max-w-3xl bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle>Resumo por dia — completo</DialogTitle>
            <DialogDescription>
              Faturamento, lucro e quantidade de lançamentos por dia no período filtrado.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto pr-2 mt-4">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card border-b border-border/50">
                <tr className="text-left text-muted-foreground">
                  <th className="px-4 py-3 font-semibold uppercase text-[10px] tracking-widest">Data</th>
                  <th className="px-4 py-3 font-semibold uppercase text-[10px] tracking-widest text-center">Lançamentos</th>
                  <th className="px-4 py-3 font-semibold uppercase text-[10px] tracking-widest text-right">Faturamento</th>
                  <th className="px-4 py-3 font-semibold uppercase text-[10px] tracking-widest text-right">Lucro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {dailyData.filter(d => d.count > 0).map((d) => (
                  <tr key={d.date} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 text-muted-foreground font-mono">{d.date}</td>
                    <td className="px-4 py-4 text-center font-bold">{d.count}</td>
                    <td className="px-4 py-4 text-right font-medium">{formatBRL(d.faturamento)}</td>
                    <td className="px-4 py-4 text-right font-bold text-success">{formatBRL(d.lucro)}</td>
                  </tr>
                ))}
                {dailyData.every(d => d.count === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground">
                      Nenhum dado neste período
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Top Produtos */}
      <Dialog open={productsModalOpen} onOpenChange={setProductsModalOpen}>
        <DialogContent className="max-w-2xl bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle>Desempenho por produto</DialogTitle>
            <DialogDescription>
              Volume de vendas e faturamento gerado por cada produto no período.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-2 mt-4">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card border-b border-border/50">
                <tr className="text-left text-muted-foreground">
                  <th className="px-4 py-3 font-semibold uppercase text-[10px] tracking-widest">Produto</th>
                  <th className="px-4 py-3 font-semibold uppercase text-[10px] tracking-widest text-center">Qtd Vendida</th>
                  <th className="px-4 py-3 font-semibold uppercase text-[10px] tracking-widest text-right">Faturamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {allProducts.map((p) => (
                  <tr key={p.name} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-medium">{p.name}</td>
                    <td className="px-4 py-4 text-center font-bold">{p.value}</td>
                    <td className="px-4 py-4 text-right">{formatBRL(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Lucro por Categoria */}
      <Dialog open={categoriesModalOpen} onOpenChange={setCategoriesModalOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle>Lucro por categoria — detalhado</DialogTitle>
            <DialogDescription>
              Distribuição do lucro líquido entre as categorias de produtos.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-2 mt-4">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card border-b border-border/50">
                <tr className="text-left text-muted-foreground">
                  <th className="px-4 py-3 font-semibold uppercase text-[10px] tracking-widest">Categoria</th>
                  <th className="px-4 py-3 font-semibold uppercase text-[10px] tracking-widest text-right">Lucro Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {allCategories.map((c) => (
                  <tr key={c.name} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-medium">{c.name}</td>
                    <td className="px-4 py-4 text-right font-bold text-success">{formatBRL(c.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Vendas por Canal */}
      <Dialog open={channelsModalOpen} onOpenChange={setChannelsModalOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle>Vendas por canal — detalhado</DialogTitle>
            <DialogDescription>
              Volume de faturamento originado em cada canal de venda.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-2 mt-4">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card border-b border-border/50">
                <tr className="text-left text-muted-foreground">
                  <th className="px-4 py-3 font-semibold uppercase text-[10px] tracking-widest">Canal</th>
                  <th className="px-4 py-3 font-semibold uppercase text-[10px] tracking-widest text-right">Faturamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {allChannels.map((c) => (
                  <tr key={c.name} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-medium">{c.name}</td>
                    <td className="px-4 py-4 text-right font-bold">{formatBRL(c.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReportKpi({ label, value, icon: Icon, variant = "primary" }: { label: string; value: string; icon: any; variant?: string }) {
  return (
    <div className="bg-card border border-border p-5 rounded-2xl">
      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{label}</p>
      <div className="flex items-end justify-between mt-1">
        <p className={cn("text-2xl font-bold tracking-tight", variant === "success" ? "text-success" : "text-foreground")}>
          {value}
        </p>
        <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, icon: Icon, children, onSeeAll }: { title: string; icon: any; children: React.ReactNode; onSeeAll?: () => void }) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-success" />
          <h3 className="font-semibold tracking-tight">{title}</h3>
        </div>
        {onSeeAll && (
          <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground" onClick={onSeeAll}>
            Ver todos <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

function ListCard({ title, icon: Icon, data, isCurrency, suffix, showChart, onSeeAll }: { title: string; icon: any; data: any[]; isCurrency?: boolean; suffix?: string; showChart?: boolean; onSeeAll?: () => void }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="bg-card border border-border p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h3 className="font-semibold tracking-tight">{title}</h3>
        </div>
        {onSeeAll && (
          <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground" onClick={onSeeAll}>
            Ver todos <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground truncate max-w-[150px]">{item.name}</span>
              <span className="font-bold">{isCurrency ? formatBRL(item.value) : `${item.value} ${suffix || ''}`}</span>
            </div>
            {showChart ? (
              <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden relative">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${((item.faturamento || item.value) / maxValue) * 100}%` }}
                   className="absolute top-0 left-0 h-full rounded-full bg-warning"
                 />
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${((item.lucro || 0) / maxValue) * 100}%` }}
                   className="absolute top-0 left-0 h-full rounded-full bg-success z-10"
                 />
              </div>
            ) : (
              <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${(item.value / maxValue) * 100}%` }}
                   className={cn("h-full rounded-full", i === 0 ? "bg-success" : "bg-primary/60")}
                 />
              </div>
            )}
          </div>
        ))}
        {data.length === 0 && (
          <div className="py-10 text-center text-xs text-muted-foreground">Sem dados</div>
        )}
      </div>
      {showChart && (
        <div className="mt-6 pt-6 border-t border-border/50 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest">
           <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-warning" /> Faturamento</div>
           <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-success" /> Lucro</div>
        </div>
      )}
    </div>
  );
}
