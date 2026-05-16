import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

type Variant = "primary" | "success" | "warning" | "danger" | "info";

const variantClasses: Record<Variant, { bg: string; text: string; glow: string; ring: string }> = {
  primary: { bg: "gradient-primary", text: "text-primary", glow: "glow-primary", ring: "ring-primary/30" },
  success: { bg: "gradient-success", text: "text-success", glow: "glow-success", ring: "ring-success/30" },
  warning: { bg: "gradient-warning", text: "text-warning", glow: "glow-warning", ring: "ring-warning/30" },
  danger:  { bg: "gradient-danger",  text: "text-destructive", glow: "glow-danger", ring: "ring-destructive/30" },
  info:    { bg: "gradient-info",    text: "text-info", glow: "", ring: "ring-info/30" },
};

export interface KpiCardProps {
  label: string;
  value: string;
  delta?: number; // percent
  comparedTo?: string;
  icon: LucideIcon;
  variant?: Variant;
  spark?: number[];
  index?: number;
}

export function KpiCard({ label, value, delta, comparedTo = "vs. mês anterior", icon: Icon, variant = "primary", spark, index = 0 }: KpiCardProps) {
  const v = variantClasses[variant];
  const positive = delta !== undefined && delta >= 0;
  const sparkData = (spark ?? [3, 4, 3.6, 5, 4.4, 6.2, 5.6, 7.4, 7, 8.6]).map((y, i) => ({ i, y }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-2xl bg-card border border-border shadow-card p-5 hover:border-border-strong transition-colors"
    >
      {/* corner glow */}
      <div className={cn("absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity", v.bg)} />

      <div className="relative flex items-start justify-between">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md", v.bg)}>
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </div>
        {delta !== undefined && (
          <span className={cn(
            "flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md",
            positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
          )}>
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positive ? "+" : ""}{delta.toFixed(1)}%
          </span>
        )}
      </div>

      <div className="relative mt-5">
        <p className="text-[12px] text-muted-foreground tracking-wide">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight font-mono-tabular text-foreground">{value}</p>
        <p className="text-[11px] text-muted-foreground/80 mt-0.5">{comparedTo}</p>
      </div>

      {/* sparkline */}
      <div className="relative mt-3 h-10 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData}>
            <defs>
              <linearGradient id={`spark-${variant}-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.5} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="y"
              stroke="currentColor"
              strokeWidth={1.75}
              fill={`url(#spark-${variant}-${label})`}
              className={v.text}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
