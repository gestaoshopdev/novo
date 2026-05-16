import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

const insights = [
  {
    icon: TrendingUp, variant: "success",
    title: "Margem do produto X subiu 12%",
    desc: "Aumente o estoque nos próximos 14 dias para capturar a tendência.",
  },
  {
    icon: AlertTriangle, variant: "warning",
    title: "CAC do Instagram aumentou 28%",
    desc: "Sugiro pausar campanhas com ROAS abaixo de 1.8 e realocar para WhatsApp.",
  },
  {
    icon: Lightbulb, variant: "info",
    title: "Oportunidade: ticket médio +R$ 42",
    desc: "Bundles com produto Y aumentariam o ticket médio em 18% nos próximos 30 dias.",
  },
];

const variantBg: Record<string, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

export function ForecastInsights() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl glass border border-primary/20 shadow-card p-5 lg:p-6 relative overflow-hidden"
    >
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full gradient-primary opacity-20 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center glow-primary">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">IA · Insights preditivos</p>
            <h3 className="text-base font-semibold tracking-tight">Central de inteligência</h3>
          </div>
        </div>

        <div className="space-y-3">
          {insights.map((it, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex gap-3 p-3 rounded-xl bg-surface/50 border border-border hover:border-border-strong transition-colors group"
            >
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${variantBg[it.variant]}`}>
                <it.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium leading-snug text-foreground">{it.title}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{it.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <button className="mt-4 w-full py-2 rounded-lg bg-surface/60 border border-border text-[12px] font-medium hover:border-primary/40 hover:text-primary transition-all">
          Perguntar à IA →
        </button>
      </div>
    </motion.div>
  );
}
