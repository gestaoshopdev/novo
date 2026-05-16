import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { SaleRow } from "@/components/sales/types";
import { useMemo } from "react";

const formatYAxis = (value: number) => {
  if (value === 0) return "R$ 0";
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1).replace('.0', '')}k`;
  return `R$ ${value}`;
};

interface Props {
  sales: SaleRow[];
  periodLabel?: string;
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function RevenueChart({ sales, periodLabel }: Props) {
  const chartData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      m: MONTHS[i],
      receita: 0,
      lucro: 0,
    }));

    const currentYear = new Date().getFullYear();

    sales.forEach((s) => {
      const d = new Date(s.date);
      if (d.getFullYear() === currentYear) {
        const m = d.getMonth();
        months[m].receita += s.total;
        months[m].lucro += s.profit;
      }
    });

    return months;
  }, [sales]);

  const ytdRevenue = useMemo(() => sales.reduce((acc, s) => acc + s.total, 0), [sales]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl bg-card border border-border shadow-card p-5 lg:p-6"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Receita & Lucro</p>
          <h3 className="text-xl font-semibold tracking-tight mt-1">R$ {ytdRevenue.toLocaleString("pt-BR")}<span className="text-sm font-normal text-muted-foreground ml-2">{periodLabel === "Total Acumulado" ? "YTD" : ""}</span></h3>
          <div className="flex items-center gap-1.5 mt-1 text-[12px] text-muted-foreground">
            {periodLabel || "Total acumulado no ano atual"}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[12px]">
          <Legend dot="bg-primary" label="Receita" />
          <Legend dot="bg-success" label="Lucro" />
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.68 0.19 268)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="oklch(0.68 0.19 268)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="prof" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.74 0.18 155)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="oklch(0.74 0.18 155)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="m" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#6b7280", fontSize: 10 }} 
              tickFormatter={formatYAxis} 
              width={45} 
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.2 0.022 260 / 0.95)", border: "1px solid oklch(0.38 0.025 260)",
                borderRadius: 12, backdropFilter: "blur(12px)", fontSize: 12,
              }}
              labelStyle={{ color: "oklch(0.97 0.005 260)", fontWeight: 600, marginBottom: 4 }}
              formatter={(v: number, name: string) => [`R$ ${v.toLocaleString("pt-BR")}`, name === "receita" ? "Receita" : "Lucro"]}
            />
            <Area type="monotone" dataKey="receita" stroke="oklch(0.68 0.19 268)" strokeWidth={2.25} fill="url(#rev)" />
            <Area type="monotone" dataKey="lucro" stroke="oklch(0.74 0.18 155)" strokeWidth={2.25} fill="url(#prof)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${dot}`} />{label}
    </div>
  );
}
