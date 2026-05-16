import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export function HealthScore({ score = 87 }: { score?: number }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-2xl bg-card border border-border shadow-card p-5 lg:p-6 flex flex-col"
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Saúde Financeira</p>
        <Heart className="h-4 w-4 text-success" />
      </div>

      <div className="relative mt-3 mx-auto h-32 w-32">
        <svg className="-rotate-90" viewBox="0 0 100 100" width="128" height="128">
          <circle cx="50" cy="50" r="42" stroke="oklch(0.3 0.02 260 / 0.5)" strokeWidth="8" fill="none" />
          <motion.circle
            cx="50" cy="50" r="42"
            stroke="url(#health-grad)" strokeWidth="8" fill="none" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          />
          <defs>
            <linearGradient id="health-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.74 0.18 155)" />
              <stop offset="100%" stopColor="oklch(0.7 0.16 230)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tracking-tight font-mono-tabular text-gradient-success">{score}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Excelente</span>
        </div>
      </div>

      <div className="mt-4 space-y-1.5 text-[12px]">
        <Row label="Liquidez" value="Forte" tone="success" />
        <Row label="Margem líquida" value="32.4%" tone="success" />
        <Row label="Endividamento" value="Baixo" tone="success" />
        <Row label="Crescimento" value="+18% MoM" tone="info" />
      </div>
    </motion.div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: "success" | "info" | "warning" }) {
  const c = tone === "success" ? "text-success" : tone === "info" ? "text-info" : "text-warning";
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${c}`}>{value}</span>
    </div>
  );
}
