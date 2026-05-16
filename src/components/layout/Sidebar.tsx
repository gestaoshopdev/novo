import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, Tags, ShoppingCart, Radio, CreditCard,
  Wallet, Receipt, TrendingDown, BarChart3, FileText, BookOpen,
  Store, Gift, Settings, Sparkles, Zap, Users, ChevronRight, Bell, GraduationCap, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/assets/logo.png";
import { UpgradePlanModal } from "@/components/billing/UpgradePlanModal";

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string };

const groups: { label: string; items: Item[] }[] = [
  {
    label: "Visão Geral",
    items: [
      { to: "/app", label: "Dashboard", icon: LayoutDashboard },
      { to: "/app/analytics", label: "Analytics", icon: BarChart3, badge: "IA" },
      { to: "/app/reports", label: "Relatórios", icon: FileText },
    ],
  },
  {
    label: "Vendas",
    items: [
      { to: "/app/sales", label: "Vendas", icon: ShoppingCart },
      { to: "/app/channels", label: "Canais", icon: Radio },
      { to: "/app/payments", label: "Pagamentos", icon: CreditCard },
      { to: "/app/crm", label: "CRM", icon: Users },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { to: "/app/products", label: "Produtos", icon: Package },
      { to: "/app/categories", label: "Categorias", icon: Tags },
      { to: "/app/catalog", label: "Catálogo", icon: BookOpen },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { to: "/app/cashflow", label: "Fluxo de Caixa", icon: Wallet },
      { to: "/app/receivables", label: "Contas a Receber", icon: Receipt },
      { to: "/app/expenses", label: "Gastos", icon: TrendingDown },
      { to: "/app/referral", label: "Indique e Ganhe", icon: Gift },
    ],
  },
  {
    label: "Configurações e Suporte",
    items: [
      { to: "/app/tutorials", label: "Tutoriais", icon: GraduationCap },
      { to: "/app/automations", label: "Automações", icon: Zap, badge: "Novo" },
      { to: "/app/settings", label: "Configurações", icon: Settings },
    ],
  },
];

import { useProfile } from "@/contexts/ProfileContext";

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { name, plan, planStatus, photo } = useProfile();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [showUpgradeCard, setShowUpgradeCard] = useState(true);

  return (
    <>
      <aside className="hidden lg:flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar sticky top-0">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border">
          <img src={Logo} alt="GestãoShop" className="h-18 w-auto drop-shadow-[0_0_10px_rgba(var(--primary),0.2)]" />
        </div>

        {/* Workspace switcher */}
        <Link 
          to="/app/settings" 
          search={{ tab: "assinatura" }}
          className="mx-3 mt-3 flex items-center justify-between px-3 py-2.5 rounded-lg bg-sidebar-accent/40 hover:bg-sidebar-accent transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md gradient-primary flex items-center justify-center text-[11px] font-bold text-white uppercase shadow-sm glow-primary overflow-hidden">
              {photo ? (
                <img src={photo} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                (name || "U").charAt(0)
              )}
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[13px] font-medium text-sidebar-foreground truncate max-w-[120px]">
                {name || "Minha Empresa"}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {planStatus === "trial" ? "Plano Teste" : `Plano ${plan}`}
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-sidebar-foreground transition-colors" />
        </Link>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {groups.map((g) => (
            <div key={g.label}>
              <div className="px-2 mb-1.5 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/70">
                {g.label}
              </div>
              <ul className="space-y-0.5">
                {g.items.map((item) => {
                  const active = pathname === item.to || (item.to !== "/app" && pathname.startsWith(item.to));
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={cn(
                          "relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all group",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                        )}
                      >
                        {active && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full gradient-primary"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase",
                            item.badge === "IA" ? "gradient-primary text-white" : "bg-success/15 text-success",
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Upgrade card */}
        {showUpgradeCard && (
          <div className="p-3">
            <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-primary/20 via-fuchsia-500/10 to-transparent border border-primary/20 group/card">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowUpgradeCard(false);
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all z-20 border border-white/10"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-primary/30 blur-2xl" />
              <Sparkles className="h-4 w-4 text-primary mb-2" />
              <p className="text-[12px] font-semibold text-sidebar-foreground leading-tight">Desbloqueie a IA Pro</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">Insights preditivos e automações ilimitadas.</p>
              <button 
                onClick={() => setUpgradeModalOpen(true)}
                className="mt-3 w-full text-[11px] font-semibold py-1.5 rounded-md gradient-primary text-white hover:opacity-90 transition relative z-10"
              >
                Atualizar plano
              </button>
            </div>
          </div>
        )}
      </aside>

      <UpgradePlanModal 
        open={upgradeModalOpen} 
        onOpenChange={setUpgradeModalOpen} 
      />
    </>
  );
}
