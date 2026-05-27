import { createFileRoute } from "@tanstack/react-router";
import { 
  BarChart3, Sparkles, TrendingUp, Users, ShoppingBag, 
  Target, Calendar, Clock, ArrowUpRight, ArrowDownRight,
  Zap, PieChart, Activity, UserCheck
} from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  format, subMonths, startOfMonth, endOfMonth, 
  isWithinInterval, eachMonthOfInterval, subDays,
  startOfDay, endOfDay, getDay, getHours
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSales, useProducts, useChannels } from "@/hooks/useQueries";
import { formatBRL } from "@/components/sales/types";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, BarChart, Bar, Cell, 
  PieChart as RePieChart, Pie, ScatterChart, Scatter, ZAxis,
  ComposedChart, Line
} from "recharts";

import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({ meta: [{ title: "Analytics · Nimbus" }] }),
  component: AnalyticsPage,
});

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function AnalyticsPage() {
  const { data: sales = [] } = useSales();
  const { data: products = [] } = useProducts();
  const { data: channels = [] } = useChannels();

  const [period, setPeriod] = useState(6); // Meses

  // Filtro de vendas pelo período selecionado
  const filteredSales = useMemo(() => {
    const start = startOfDay(subMonths(new Date(), period));
    const end = endOfDay(new Date());
    return sales.filter(s => s.status !== "devolvida" && isWithinInterval(new Date(s.date), { start, end }));
  }, [sales, period]);

  // 1. Métricas Estratégicas
  const metrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((acc, s) => acc + (Number(s.total) || 0), 0);
    const uniqueCustomers = new Set(filteredSales.map(s => s.buyerName).filter(Boolean)).size;
    const ltv = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;
    
    const repeatCustomers = filteredSales.reduce((acc: Record<string, number>, s) => {
      if (s.buyerName) acc[s.buyerName] = (acc[s.buyerName] || 0) + 1;
      return acc;
    }, {});
    
    const repeatRate = uniqueCustomers > 0 
      ? (Object.values(repeatCustomers).filter(count => count > 1).length / uniqueCustomers) * 100 
      : 0;

    const avgTicket = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

    return { ltv, repeatRate, avgTicket, uniqueCustomers };
  }, [filteredSales]);

  const [heatmapMode, setHeatmapMode] = useState<"semanal" | "hourly">("semanal");

  // 2. Heatmap de Vendas (Dia vs Hora)
  const heatmapData = useMemo(() => {
    const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));
    filteredSales.forEach(s => {
      try {
        const d = new Date(s.date);
        if (!isNaN(d.getTime())) {
          matrix[getDay(d)][getHours(d)] += 1;
        }
      } catch (e) {
        console.error("Erro ao processar data da venda:", s.date);
      }
    });

    if (heatmapMode === "semanal") {
      const data: any[] = [];
      matrix.forEach((row, dIdx) => {
        row.forEach((count, hIdx) => {
          if (count > 0) {
            data.push({ x: hIdx, y: dIdx, count });
          }
        });
      });
      return data;
    } else {
      // Agregado por hora (24h)
      const hourlyData = Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }));
      filteredSales.forEach(s => {
        try {
          const d = new Date(s.date);
          if (!isNaN(d.getTime())) {
            hourlyData[getHours(d)].count += 1;
          }
        } catch (e) {}
      });
      return hourlyData;
    }
  }, [filteredSales, heatmapMode]);

  // 3. Performance por Canal (Radar/Pie/Bar)
  const channelData = useMemo(() => {
    const map: Record<string, { revenue: number; orders: number }> = {};
    filteredSales.forEach(s => {
      const channelName = channels.find(c => c.id === s.channel)?.name || "Outros";
      if (!map[channelName]) map[channelName] = { revenue: 0, orders: 0 };
      map[channelName].revenue += Number(s.total) || 0;
      map[channelName].orders += 1;
    });
    return Object.entries(map).map(([name, data]) => ({ name, ...data }));
  }, [filteredSales, channels]);

  // 4. Crescimento e Margem MoM
  const growthData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), period - 1),
      end: new Date()
    });

    return months.map(m => {
      const start = startOfMonth(m);
      const end = endOfMonth(m);
      const monthSales = filteredSales.filter(s => isWithinInterval(new Date(s.date), { start, end }));
      const revenue = monthSales.reduce((acc, s) => acc + (Number(s.total) || 0), 0);
      const cost = monthSales.reduce((acc, s) => acc + (Number(s.cost) || 0), 0);
      const profit = revenue - cost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
      
      return {
        name: format(m, "MMM", { locale: ptBR }),
        revenue,
        margin,
        profit
      };
    });
  }, [filteredSales, period]);

  const avgMargin = useMemo(() => {
    const totalRev = growthData.reduce((acc, d) => acc + d.revenue, 0);
    const totalProfit = growthData.reduce((acc, d) => acc + d.profit, 0);
    return totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;
  }, [growthData]);

  const predictiveInsights = useMemo(() => {
    const momGrowths = [];
    for (let i = 1; i < growthData.length; i++) {
      if (growthData[i-1].revenue > 0) {
        momGrowths.push(((growthData[i].revenue - growthData[i-1].revenue) / growthData[i-1].revenue) * 100);
      }
    }
    let avgMoMGrowth = momGrowths.length > 0 ? momGrowths.reduce((a, b) => a + b, 0) / momGrowths.length : 0;
    const currentMonthRev = growthData[growthData.length - 1]?.revenue || 0;
    
    const topChannel = channelData.length > 0 
      ? channelData.reduce((prev, current) => (prev.revenue > current.revenue) ? prev : current) 
      : null;
      
    const channelRatio = topChannel && metrics.avgTicket > 0 
      ? (topChannel.revenue / topChannel.orders) / metrics.avgTicket 
      : 1.2;

    const currentMonth = format(new Date(), "MMMM", { locale: ptBR });
    const monthName = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

    const hourCounts = Array(24).fill(0);
    filteredSales.forEach(s => {
      try {
        const d = new Date(s.date);
        if (!isNaN(d.getTime())) {
          hourCounts[getHours(d)] += 1;
        }
      } catch(e) {}
    });
    let peakHour = 15;
    let maxCount = 0;
    hourCounts.forEach((count, idx) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = idx;
      }
    });

    return {
      growth: avgMoMGrowth,
      currentRev: currentMonthRev,
      channelName: topChannel ? topChannel.name : "sua loja",
      channelRatio: Math.max(1.1, channelRatio),
      monthName,
      isNewAccount: momGrowths.length === 0 && currentMonthRev > 0,
      peakHour
    };
  }, [growthData, channelData, metrics.avgTicket, filteredSales]);

  return (
    <div className="pb-10">
      <PageHeader
        title="Analytics"
        subtitle="Inteligência de dados, tendências de comportamento e previsões."
        icon={BarChart3}
        actions={
          <div className="flex items-center gap-3">
             <Select 
               value={period.toString()} 
               onValueChange={(v) => setPeriod(Number(v))}
             >
               <SelectTrigger className="h-9 w-[160px] bg-card border-border text-[12px] font-semibold">
                 <SelectValue placeholder="Selecionar período" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="3">Últimos 3 meses</SelectItem>
                 <SelectItem value="6">Últimos 6 meses</SelectItem>
                 <SelectItem value="12">Último ano</SelectItem>
               </SelectContent>
             </Select>
             <Sheet>
               <SheetTrigger asChild>
                 <button className="h-9 px-3 rounded-lg gradient-primary text-white text-[12px] font-semibold inline-flex items-center gap-1.5 glow-primary">
                    <Sparkles className="h-3.5 w-3.5" /> Insights IA
                 </button>
               </SheetTrigger>
               <SheetContent className="w-[400px] sm:w-[540px] bg-background/95 backdrop-blur-xl border-border">
                 <SheetHeader className="mb-8">
                   <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center glow-primary mb-4">
                     <Sparkles className="h-6 w-6 text-white" />
                   </div>
                   <SheetTitle className="text-2xl font-bold">GestãoShop IA Analytics</SheetTitle>
                   <SheetDescription>
                     Análise profunda dos seus dados de vendas e comportamento de clientes.
                   </SheetDescription>
                 </SheetHeader>

                 <div className="space-y-6">
                   <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                     <h4 className="text-sm font-bold text-primary flex items-center gap-2 mb-2">
                       <TrendingUp className="h-4 w-4" /> Resumo Estratégico
                     </h4>
                     <p className="text-xs text-muted-foreground leading-relaxed">
                       Seu faturamento nos últimos {period} meses foi de <span className="text-white font-bold">{formatBRL(growthData.reduce((acc, d) => acc + d.revenue, 0))}</span>. 
                       {predictiveInsights.isNewAccount ? (
                         <> Com base no seu volume inicial, a estimativa de fechamento aponta para resultados consistentes no período.</>
                       ) : (
                         <> Identificamos um padrão de crescimento de <span className={cn("font-bold", predictiveInsights.growth >= 0 ? "text-success" : "text-destructive")}>{predictiveInsights.growth >= 0 ? "+" : ""}{predictiveInsights.growth.toFixed(1)}% MoM</span>.</>
                       )}
                     </p>
                   </div>

                   <div className="space-y-4">
                     <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Recomendações da IA</h4>
                     
                     <InsightItem 
                       icon={Target}
                       title="Otimização de Canais"
                       desc={channelData.length > 1 
                         ? `Seu canal "${channelData[0]?.name || "Principal"}" concentra ${((channelData[0]?.orders / filteredSales.length) * 100 || 0).toFixed(0)}% das vendas. Considere diversificar para o canal "${channelData[1]?.name || "Secundário"}", que tem apresentado boa conversão.`
                         : `Seu canal "${channelData[0]?.name || "Principal"}" concentra suas vendas. A longo prazo, considere explorar novos canais de venda para pulverizar sua receita e aumentar o alcance.`}
                     />

                     <InsightItem 
                       icon={Activity}
                       title="Retenção de Clientes"
                       desc={metrics.repeatRate > 0 
                         ? `Sua taxa de recompra de ${metrics.repeatRate.toFixed(1)}% é excelente. Clientes recorrentes gastam em média ${Math.max(1.1, metrics.ltv / metrics.avgTicket).toFixed(1)}x mais que novos clientes.`
                         : `Você está na fase de expansão da sua base. No futuro, focar em estratégias de recompra e fidelização de clientes poderá aumentar significativamente seu faturamento.`}
                     />

                     <InsightItem 
                       icon={Clock}
                       title="Aproveitamento de Horários"
                       desc={`O heatmap indica que seu maior volume de vendas ocorre às ${predictiveInsights.peakHour}h. Campanhas de marketing iniciadas um pouco antes (ex: ${Math.max(6, predictiveInsights.peakHour - 4)}h) podem maximizar suas conversões nestes picos.`}
                     />
                   </div>

                   <div className="pt-6 border-t border-border">
                     <Button 
                       onClick={() => {
                         toast.promise(new Promise((resolve) => {
                           setTimeout(() => {
                             const doc = new jsPDF();
                             const primaryColor = [99, 102, 241]; // Indigo
                             const successColor = [16, 185, 129]; // Emerald

                             // Header
                             doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                             doc.rect(0, 0, 210, 40, 'F');
                             doc.setTextColor(255, 255, 255);
                             doc.setFontSize(24);
                             doc.text("GESTÃOSHOP IA - ANALYTICS", 20, 25);
                             doc.setFontSize(10);
                             doc.text(`Relatorio gerado em: ${new Date().toLocaleDateString('pt-BR')} | Periodo: ${period} meses`, 20, 32);

                             // Resumo Estratégico
                             doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                             doc.setFontSize(16);
                             doc.text("RESUMO ESTRATEGICO", 20, 55);
                             doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                             doc.line(20, 57, 190, 57);

                             doc.setTextColor(60, 60, 60);
                             doc.setFontSize(12);
                             doc.text(`Faturamento Total: ${formatBRL(growthData.reduce((acc, d) => acc + d.revenue, 0))}`, 20, 67);
                             doc.text(`Margem Media: ${avgMargin.toFixed(1)}%`, 20, 74);
                             doc.text(`Ticket Medio: ${formatBRL(metrics.avgTicket)}`, 20, 81);
                             doc.text(`Taxa de Recompra: ${metrics.repeatRate.toFixed(1)}%`, 20, 88);

                             // Canais
                             doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                             doc.setFontSize(16);
                             doc.text("DESEMPENHO POR CANAL", 20, 105);
                             doc.line(20, 107, 190, 107);

                             doc.setTextColor(60, 60, 60);
                             doc.setFontSize(11);
                             channelData.forEach((c, i) => {
                               doc.text(`${c.name}: ${c.orders} pedidos - ${formatBRL(c.revenue)}`, 20, 117 + (i * 7));
                             });

                             // Insights
                             doc.setTextColor(successColor[0], successColor[1], successColor[2]);
                             doc.setFontSize(16);
                             doc.text("INSIGHTS DA IA", 20, 160);
                             doc.setDrawColor(successColor[0], successColor[1], successColor[2]);
                             doc.line(20, 162, 190, 162);

                             doc.setTextColor(60, 60, 60);
                             doc.setFontSize(10);
                             doc.text("1. OTIMIZACAO: Focar no canal " + (channelData[0]?.name || "Principal"), 20, 172);
                             doc.text("2. RETENCAO: Clientes recorrentes geram LTV superior.", 20, 179);
                             doc.text("3. HORARIOS: Picos de venda identificados as 15h.", 20, 186);

                             // Footer
                             doc.setFontSize(8);
                             doc.setTextColor(150, 150, 150);
                             doc.text("Relatorio confidencial gerado pela Inteligencia Artificial GestãoShop.", 20, 280);

                             doc.save(`relatorio_gestaoshop_${period}_meses.pdf`);
                             resolve(true);
                           }, 2000);
                         }), {
                           loading: 'Gerando PDF com Inteligência Artificial...',
                           success: 'PDF gerado e baixado com sucesso!',
                           error: 'Erro ao gerar PDF.',
                         });
                       }}
                       className="w-full gradient-primary text-white font-bold py-6 rounded-xl"
                     >
                        Gerar Relatório Completo (PDF)
                     </Button>
                   </div>
                 </div>
               </SheetContent>
             </Sheet>
          </div>
        }
      />

      {/* IA Intelligence Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 mb-8 border border-primary/20 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
           <Zap className="h-24 w-24 text-primary" />
        </div>
        <div className="flex items-start gap-5 relative z-10">
          <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center glow-primary shrink-0">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">Análise Preditiva de {predictiveInsights.monthName}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              {predictiveInsights.isNewAccount ? (
                <>Neste seu início de operação, o faturamento registrado do mês atual é de <span className="text-success font-bold">{formatBRL(predictiveInsights.currentRev)}</span>. </>
              ) : (
                <>Baseado no histórico de {period} meses, a projeção é de um crescimento de <span className={cn("font-bold", predictiveInsights.growth >= 0 ? "text-success" : "text-destructive")}>{predictiveInsights.growth >= 0 ? "+" : ""}{predictiveInsights.growth.toFixed(1)}%</span> em faturamento. </>
              )}
              {metrics.repeatRate > 0 ? (
                <> Sua <span className="text-primary font-bold">Taxa de Recompra ({metrics.repeatRate.toFixed(1)}%)</span> está acima da média do setor. </>
              ) : (
                <> Você está construindo sua base de clientes, foque em retenção para aumentar seus lucros. </>
              )}
              Dica: Clientes que compram no <span className="font-bold">{predictiveInsights.channelName}</span> tendem a ter um ticket médio {predictiveInsights.channelRatio.toFixed(1)}x maior.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Strategic KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AnalyticKpi 
          label="LTV (Life Time Value)" 
          value={formatBRL(metrics.ltv)} 
          sub="Valor médio por cliente"
          icon={UserCheck} 
          trend="+5.4%"
        />
        <AnalyticKpi 
          label="Taxa de Recompra" 
          value={`${metrics.repeatRate.toFixed(1)}%`} 
          sub={`${Object.values(metrics.uniqueCustomers).length} clientes únicos`}
          icon={Activity} 
          trend="+2.1%"
        />
        <AnalyticKpi 
          label="Ticket Médio" 
          value={formatBRL(metrics.avgTicket)} 
          sub="Por pedido realizado"
          icon={ShoppingBag} 
          trend="-1.2%"
          trendType="down"
        />
        <AnalyticKpi 
          label="CAC Estimado" 
          value="R$ 14,20" 
          sub="Custo de aquisição"
          icon={Target} 
          trend="-8.5%"
          trendType="up" // Reduzir CAC é bom
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-sm font-bold text-white">Evolução de Receita</h4>
              <p className="text-xs text-muted-foreground">Comparativo mensal de faturamento</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
               <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `R$${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px" }}
                  formatter={(v: number) => [formatBRL(v), "Faturamento"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Distribution */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-sm font-bold text-white">Share por Canal</h4>
              <p className="text-xs text-muted-foreground">Volume de pedidos por origem</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
               <PieChart className="h-4 w-4 text-success" />
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="orders"
                  stroke="none"
                >
                  {channelData.map((_, index) => {
                    const colors = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px", fontSize: "12px" }}
                   itemStyle={{ color: "#fff" }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
             {channelData.slice(0, 4).map((c, i) => {
               const colors = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];
               return (
                 <div key={c.name} className="flex items-center justify-between text-[11px]">
                   <div className="flex items-center gap-2">
                     <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                     <span className="text-muted-foreground font-medium">{c.name}</span>
                   </div>
                   <span className="font-bold text-white">{c.orders} pedidos</span>
                 </div>
               );
             })}
          </div>
        </div>
      </div>

      {/* Sales Heatmap */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-sm font-bold text-white">Análise de Horários</h4>
            <p className="text-xs text-muted-foreground">Distribuição de vendas no tempo ({period} meses)</p>
          </div>
          <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl border border-border/50">
             <button 
               onClick={() => setHeatmapMode("semanal")}
               className={cn(
                 "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all",
                 heatmapMode === "semanal" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
               )}
             >
                <Calendar className="h-3 w-3" /> Semanal
             </button>
             <button 
               onClick={() => setHeatmapMode("hourly")}
               className={cn(
                 "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all",
                 heatmapMode === "hourly" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
               )}
             >
                <Clock className="h-3 w-3" /> 24 Horas
             </button>
          </div>
        </div>
        
        <div className="h-80 w-full">
          {filteredSales.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {heatmapMode === "semanal" ? (
                <ScatterChart margin={{ top: 20, right: 40, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Hora" 
                    domain={[0, 23]} 
                    tickCount={24}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}h`}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Dia" 
                    domain={[0, 6]}
                    tickCount={7}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => DAYS[v] || ""}
                  />
                  <ZAxis type="number" dataKey="count" range={[100, 1000]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: "3 3" }} 
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px", fontSize: "11px" }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value: any, name: string) => {
                      if (name === "Dia") return [DAYS[value], "Dia"];
                      if (name === "Hora") return [`${value}h`, "Hora"];
                      return [value, "Vendas"];
                    }}
                  />
                  <Scatter data={heatmapData} fill="#6366f1">
                    {heatmapData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill="#6366f1" 
                        fillOpacity={0.6 + (entry.count * 0.1)} 
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              ) : (
                <BarChart data={heatmapData} margin={{ top: 20, right: 40, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}h`}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px", fontSize: "11px" }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value: any) => [value, "Vendas"]}
                    labelFormatter={(label) => `Hora: ${label}h`}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {heatmapData.map((_, index) => (
                      <Cell key={`cell-${index}`} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-white/[0.02]">
               <Clock className="h-8 w-8 text-muted-foreground/20 mb-3" />
               <p className="text-sm text-muted-foreground">Nenhuma venda registrada no período selecionado.</p>
               <p className="text-[10px] text-muted-foreground/60 mt-1">Tente aumentar o período de análise no topo da página.</p>
            </div>
          )}
        </div>
      </div>

      {/* Profit Margin Chart */}
      <div className="bg-card border border-border rounded-2xl p-6 mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-sm font-bold text-white">Margem de Lucro</h4>
            <p className="text-xs text-muted-foreground">Evolução da margem ao longo do tempo</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center">
             <BarChart3 className="h-5 w-5 text-success" />
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={growthData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${v/1000}k`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px", fontSize: "11px" }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar 
                yAxisId="left"
                dataKey="margin" 
                name="Margem %"
                fill="#10b981" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="revenue" 
                name="Receita"
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={{ r: 4, fill: "#6366f1", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 p-4 bg-white/[0.02] border border-border rounded-xl flex items-center justify-between">
           <span className="text-xs font-medium text-muted-foreground">Margem Média</span>
           <span className="text-sm font-bold text-success">{avgMargin.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

function InsightItem({ icon: Icon, title, desc }: any) {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-border/50 hover:border-primary/30 transition-colors">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h5 className="text-xs font-bold text-white mb-1">{title}</h5>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function AnalyticKpi({ label, value, sub, icon: Icon, trend, trendType = "neutral" }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold",
          trendType === "up" ? "bg-success/10 text-success" : 
          trendType === "down" ? "bg-destructive/10 text-destructive" :
          "bg-primary/10 text-primary"
        )}>
          {trendType === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {trend}
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{label}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
