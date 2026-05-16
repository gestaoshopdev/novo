import { motion } from "framer-motion";

const stages = [
  { label: "Visitantes", value: 18420, color: "oklch(0.7 0.16 230)" },
  { label: "Leads", value: 7280, color: "oklch(0.68 0.19 268)" },
  { label: "Carrinho", value: 3140, color: "oklch(0.7 0.18 330)" },
  { label: "Checkout", value: 1890, color: "oklch(0.78 0.16 70)" },
  { label: "Pagos", value: 1247, color: "oklch(0.74 0.18 155)" },
];

export function SalesFunnel() {
  const max = stages[0].value;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl bg-card border border-border shadow-card p-5 lg:p-6"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Funil de vendas</p>
          <h3 className="text-xl font-semibold tracking-tight mt-1">6.77% conversão</h3>
        </div>
        <span className="text-[11px] text-muted-foreground">Últimos 30 dias</span>
      </div>

      <div className="space-y-2.5">
        {stages.map((s, i) => {
          const pct = (s.value / max) * 100;
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between text-[12px] mb-1">
                <span className="text-foreground">{s.label}</span>
                <span className="font-mono-tabular text-muted-foreground">{s.value.toLocaleString("pt-BR")}</span>
              </div>
              <div className="h-7 rounded-md bg-surface/60 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.25 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-md flex items-center justify-end pr-2 text-[10px] font-semibold text-black/80"
                  style={{ background: `linear-gradient(90deg, ${s.color}88, ${s.color})` }}
                >
                  {pct.toFixed(1)}%
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
