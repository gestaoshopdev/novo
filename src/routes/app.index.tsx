import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Wallet, ArrowDownToLine, TrendingUp, Receipt, Percent,
  ShoppingBag, Coins, DollarSign, Users, Target, Calendar, Filter,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ChannelsChart } from "@/components/dashboard/ChannelsChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { useSales, useProducts } from "@/hooks/useQueries";
import { useState, useMemo } from "react";
import { 
  isWithinInterval, 
  subDays, 
  subMonths,
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
import { formatBRL } from "@/components/sales/types";
import { PageHeader } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard · Atlas Suite" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: sales = [] } = useSales();
  const { data: products = [] } = useProducts();
  const [period, setPeriod] = useState<string>("all");

  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter(sale => {
      if (sale.status === "devolvida") return false; // Ignora vendas devolvidas
      const saleDate = new Date(sale.date);
      switch (period) {
        case "today":
          return isSameDay(saleDate, now);
        case "yesterday":
          return isSameDay(saleDate, subDays(now, 1));
        case "7days":
          return isWithinInterval(saleDate, { 
            start: startOfDay(subDays(now, 7)), 
            end: endOfDay(now) 
          });
        case "30days":
          return isWithinInterval(saleDate, { 
            start: startOfDay(subDays(now, 30)), 
            end: endOfDay(now) 
          });
        case "month":
          return isWithinInterval(saleDate, { 
            start: startOfMonth(now), 
            end: endOfMonth(now) 
          });
        default:
          return true;
      }
    });
  }, [sales, period]);

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
      avgTicket,
      margin,
      salesCount: filteredSales.length,
      activeProducts: products.filter(p => p.stock > 0).length
    };
  }, [filteredSales, products]);

  const previousSales = useMemo(() => {
    if (period === "all") return [];
    
    const now = new Date();
    return sales.filter(sale => {
      if (sale.status === "devolvida") return false;
      const saleDate = new Date(sale.date);
      switch (period) {
        case "today":
          return isSameDay(saleDate, subDays(now, 1));
        case "yesterday":
          return isSameDay(saleDate, subDays(now, 2));
        case "7days":
          return isWithinInterval(saleDate, { 
            start: startOfDay(subDays(now, 14)), 
            end: endOfDay(subDays(now, 7)) 
          });
        case "30days":
          return isWithinInterval(saleDate, { 
            start: startOfDay(subDays(now, 60)), 
            end: endOfDay(subDays(now, 30)) 
          });
        case "month":
          const prevMonth = subMonths(now, 1);
          return isWithinInterval(saleDate, { 
            start: startOfMonth(prevMonth), 
            end: endOfMonth(prevMonth) 
          });
        default:
          return false;
      }
    });
  }, [sales, period]);

  const previousMetrics = useMemo(() => {
    const totalRevenue = previousSales.reduce((acc, s) => acc + (Number(s.total) || 0), 0);
    const totalProfit = previousSales.reduce((acc, s) => acc + (Number(s.profit) || 0), 0);
    const totalQty = previousSales.reduce((acc, s) => acc + (s.items?.reduce((a, b) => a + (Number(b.quantity) || 0), 0) || 0), 0);
    const avgTicket = previousSales.length > 0 ? totalRevenue / previousSales.length : 0;
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    return {
      totalRevenue,
      totalProfit,
      totalQty,
      avgTicket,
      margin,
      salesCount: previousSales.length,
    };
  }, [previousSales]);

  const calcDelta = (current: number, previous: number) => {
    if (current === 0 && previous === 0) return 0;
    if (period === "all" || previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  const periodLabels: Record<string, string> = {
    all: "Total Acumulado",
    today: "Hoje",
    yesterday: "Ontem",
    "7days": "Últimos 7 dias",
    "30days": "Últimos 30 dias",
    month: "Mês Atual",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PageHeader
          title="Dashboard Geral"
          subtitle="Visão geral consolidada das suas vendas e estoque."
          icon={TrendingUp}
          actions={
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 h-9 px-3 rounded-lg bg-card border border-border text-[12px] font-medium hover:border-border-strong transition outline-none">
                    <Calendar className="h-3.5 w-3.5" /> {periodLabels[period]}
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
            </div>
          }
        />
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <KpiCard label="Receita Total" value={formatBRL(metrics.totalRevenue)} delta={calcDelta(metrics.totalRevenue, previousMetrics.totalRevenue)} variant="primary" icon={Wallet} index={0} comparedTo="Total histórico" />
        <KpiCard label="Lucro Líquido" value={formatBRL(metrics.totalProfit)} delta={calcDelta(metrics.totalProfit, previousMetrics.totalProfit)} variant="success" icon={TrendingUp} index={1} comparedTo="Total histórico" />
        <KpiCard label="Ticket Médio" value={formatBRL(metrics.avgTicket)} delta={calcDelta(metrics.avgTicket, previousMetrics.avgTicket)} variant="info" icon={Receipt} index={2} comparedTo="Por venda" />
        <KpiCard label="Margem Líquida" value={`${metrics.margin.toFixed(1)}%`} delta={calcDelta(metrics.margin, previousMetrics.margin)} variant="success" icon={Percent} index={3} comparedTo="Média global" />
        <KpiCard label="Qtd Vendida" value={metrics.totalQty.toString()} delta={calcDelta(metrics.totalQty, previousMetrics.totalQty)} variant="info" icon={ShoppingBag} index={4} comparedTo="Itens totais" />
        <KpiCard label="Vendas Realizadas" value={metrics.salesCount.toString()} delta={calcDelta(metrics.salesCount, previousMetrics.salesCount)} variant="primary" icon={Target} index={5} comparedTo="Total de pedidos" />
        <KpiCard label="Produtos em Estoque" value={metrics.activeProducts.toString()} variant="info" icon={ShoppingBag} index={6} comparedTo="SKUs ativos" />
        <KpiCard label="Clientes Atendidos" value={metrics.salesCount.toString()} delta={calcDelta(metrics.salesCount, previousMetrics.salesCount)} variant="primary" icon={Users} index={7} comparedTo="Base de vendas" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2"><RevenueChart sales={filteredSales} periodLabel={periodLabels[period]} /></div>
        <ChannelsChart sales={filteredSales} periodLabel={periodLabels[period]} />
      </div>

      {/* Activity */}
      <RecentTransactions sales={filteredSales} />
    </div>
  );
}
