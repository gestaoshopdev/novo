import { motion } from "framer-motion";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { type SaleRow, DEFAULT_CHANNELS } from "@/components/sales/types";
import { useMemo } from "react";
import { useChannels } from "@/hooks/useQueries";

interface Props {
  sales: SaleRow[];
  periodLabel?: string;
}

const COLORS = [
  "oklch(0.74 0.18 155)",
  "oklch(0.7 0.18 330)",
  "oklch(0.68 0.19 268)",
  "oklch(0.78 0.16 70)",
  "oklch(0.7 0.16 230)",
  "oklch(0.82 0.14 110)",
  "oklch(0.65 0.2 30)",
];

export function ChannelsChart({ sales, periodLabel }: Props) {
  const { data: channelsList = [] } = useChannels();

  const data = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach((s) => {
      if (s.status === "devolvida") return; // Ignora vendas devolvidas
      const key = s.channel || "indefinido";
      map[key] = (map[key] || 0) + s.total;
    });

    return Object.entries(map).map(([channelId, value], i) => {
      const dbChannel = channelsList.find((c) => c.id === channelId);
      const defChannel = DEFAULT_CHANNELS.find((c) => c.id === channelId);
      
      let name = dbChannel?.name || defChannel?.name || channelId;
      
      if (!name || name === "indefinido" || name === "null" || name === "---" || name === "—") {
        name = "Direto / Outros";
      }

      return {
        name,
        value,
        color: COLORS[i % COLORS.length],
      };
    })
    .sort((a, b) => b.value - a.value)
    .filter(item => item.value > 0);
  }, [sales, channelsList]);

  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-2xl bg-card border border-border shadow-card p-5 lg:p-6"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Vendas por canal</p>
          <h3 className="text-xl font-semibold tracking-tight mt-1">{data.length} {data.length === 1 ? 'canal ativo' : 'canais ativos'}</h3>
        </div>
        <span className="text-[11px] bg-secondary/50 px-2 py-1 rounded-md text-muted-foreground">{periodLabel || "Total Acumulado"}</span>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ left: -20, right: 20, top: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fill: "oklch(0.85 0.01 260)", fontSize: 11 }} 
              axisLine={false} 
              tickLine={false} 
              width={100}
            />
            <Tooltip
              cursor={{ fill: "oklch(1 0 0 / 0.05)" }}
              contentStyle={{ 
                background: "oklch(0.2 0.022 260 / 0.95)", 
                border: "1px solid oklch(0.38 0.025 260)", 
                borderRadius: 12, 
                fontSize: 12,
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.5)",
                color: "oklch(0.85 0.01 260)"
              }}
              labelStyle={{ color: "oklch(0.97 0.005 260)", fontWeight: 600, marginBottom: 4 }}
              itemStyle={{ color: "oklch(0.85 0.01 260)" }}
              formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Receita"]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
              {data.map((c, i) => <Cell key={i} fill={c.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-x-4 gap-y-2">
        {data.map((c) => (
          <div key={c.name} className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: c.color }} />
              <span className="text-muted-foreground truncate">{c.name}</span>
            </div>
            <span className="font-medium text-foreground ml-2">{total > 0 ? ((c.value / total) * 100).toFixed(1) : 0}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
