import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { SaleRow } from "@/components/sales/types";

interface Props {
  sales: SaleRow[];
}

const statusStyle: Record<string, string> = {
  concluida: "bg-success/15 text-success",
  pendente: "bg-warning/15 text-warning",
  devolvida: "bg-destructive/15 text-destructive",
};

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function RecentTransactions({ sales }: Props) {
  const recent = sales.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="rounded-2xl bg-card border border-border shadow-card overflow-hidden"
    >
      <div className="flex items-start justify-between p-5 lg:p-6 pb-4">
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Atividade recente</p>
          <h3 className="text-xl font-semibold tracking-tight mt-1">Vendas recentes</h3>
        </div>
        <Link to="/app/sales" className="text-[12px] text-primary hover:text-primary-glow font-medium">Ver tudo →</Link>
      </div>
      <div className="divide-y divide-border">
        {recent.map((s, i) => {
          const amount = s.total;
          const positive = amount > 0;
          return (
            <div key={s.id} className="flex items-center gap-3 px-5 lg:px-6 py-3 hover:bg-surface/40 transition-colors">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                <ArrowDownRight className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{s.buyerName || "Cliente Geral"}</p>
                <p className="text-[11px] text-muted-foreground">
                  {s.code} · {formatTime(s.date)}
                </p>
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${statusStyle[s.status || "concluida"] || statusStyle.concluida}`}>
                {s.status}
              </span>
              <span className={`text-[13px] font-mono-tabular font-semibold w-28 text-right ${positive ? "text-success" : "text-destructive"}`}>
                R$ {Math.abs(amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          );
        })}
        {recent.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Nenhuma venda registrada ainda.
          </div>
        )}
      </div>
    </motion.div>
  );
}
