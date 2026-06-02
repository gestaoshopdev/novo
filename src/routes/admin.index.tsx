import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, Wallet, Target, CreditCard, Loader2 } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard · Atlas Suite" }] }),
  component: AdminDashboard,
});

interface Subscriber {
  id: string;
  full_name: string | null;
  email: string;
  plan_type: string;
  status: string;
  created_at: string;
}

interface DashboardStats {
  total_mrr: number;
  prev_mrr: number;
  active_users: number;
  prev_active_users: number;
  new_subscriptions_30d: number;
  prev_new_subscriptions_30d: number;
  total_gmv: number;
  prev_gmv: number;
  mrr_spark: number[];
  users_spark: number[];
  subs_spark: number[];
  gmv_spark: number[];
  latest_subscribers: Subscriber[];
}

const ADMIN_EMAILS = ["jonathancasales.c@gmail.com", "gustavo.2casales@gmail.com"];
const TEST_EMAIL = "jcasales15@gmail.com";

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // 1. Tentar puxar dados reais via RPC (função segura que criamos no Supabase)
      const { data, error } = await supabase.rpc("get_admin_dashboard_stats");

      if (error) {
        throw error;
      }

      if (data) {
        setStats(data as DashboardStats);
        setUsingFallback(false);
      }
    } catch (err: any) {
      console.warn("Erro ao buscar estatísticas via RPC, utilizando fallback no client-side:", err);
      setUsingFallback(true);
      
      // Fallback client-side para manter o dashboard funcionando se a RPC ainda não tiver sido criada
      try {
        const { data: profiles, error: pError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (pError) throw pError;

        // Filtrar administradores e usuário de teste
        const realUsers = (profiles || []).filter(
          p => !ADMIN_EMAILS.includes(p.email) && p.email.toLowerCase() !== TEST_EMAIL.toLowerCase()
        );

        // 1. Calcular MRR (usuários ativos)
        const getPlanPrice = (plan: string) => {
          const lower = (plan || "").toLowerCase();
          if (lower === "pro") return 14.90;
          if (lower === "elite") return 19.90;
          if (lower === "starter" || lower === "básico") return 9.90;
          return 0;
        };

        const activeUsersList = realUsers.filter(u => u.status === "active");
        const totalMrr = activeUsersList.reduce((acc, u) => acc + getPlanPrice(u.plan_type), 0);

        // MRR de usuários criados há mais de 30 dias
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - 30);
        
        const prevActiveUsersList = activeUsersList.filter(u => new Date(u.created_at) < limitDate);
        const prevMrr = prevActiveUsersList.reduce((acc, u) => acc + getPlanPrice(u.plan_type), 0);

        // 2. Usuários Ativos (status active ou trial)
        const activeOrTrialUsers = realUsers.filter(u => u.status === "active" || u.status === "trial");
        const activeUsersCount = activeOrTrialUsers.length;
        const prevActiveUsersCount = activeOrTrialUsers.filter(u => new Date(u.created_at) < limitDate).length;

        // 3. Novas assinaturas nos últimos 30 dias
        const newSubscriptions = activeOrTrialUsers.filter(u => new Date(u.created_at) >= limitDate).length;
        
        const limit60Days = new Date();
        limit60Days.setDate(limit60Days.getDate() - 60);
        const prevNewSubscriptions = activeOrTrialUsers.filter(
          u => new Date(u.created_at) >= limit60Days && new Date(u.created_at) < limitDate
        ).length;

        // 4. Últimos assinantes
        const latestSubscribers: Subscriber[] = realUsers
          .filter(u => u.plan_type && u.plan_type !== "")
          .slice(0, 5)
          .map(u => ({
            id: u.id,
            full_name: u.full_name,
            email: u.email,
            plan_type: u.plan_type,
            status: u.status,
            created_at: u.created_at
          }));

        setStats({
          total_mrr: totalMrr,
          prev_mrr: prevMrr,
          active_users: activeUsersCount,
          prev_active_users: prevActiveUsersCount,
          new_subscriptions_30d: newSubscriptions,
          prev_new_subscriptions_30d: prevNewSubscriptions,
          total_gmv: 0, // Fallback não consegue calcular GMV de todos os tenants por RLS
          prev_gmv: 0,
          mrr_spark: [totalMrr * 0.9, totalMrr * 0.95, totalMrr],
          users_spark: [activeUsersCount * 0.9, activeUsersCount * 0.95, activeUsersCount],
          subs_spark: [newSubscriptions * 0.8, newSubscriptions * 0.9, newSubscriptions],
          gmv_spark: [0, 0, 0],
          latest_subscribers: latestSubscribers,
        });
      } catch (fallbackErr) {
        console.error("Falha crítica no fallback do client-side:", fallbackErr);
        toast.error("Erro ao carregar dados do painel.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatBRL = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatGMV = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}K`;
    }
    return formatBRL(value);
  };

  const getPlanPriceForSubscriber = (plan: string) => {
    const lower = (plan || "").toLowerCase();
    if (lower === "pro") return "R$ 14,90";
    if (lower === "elite") return "R$ 19,90";
    if (lower === "starter" || lower === "básico") return "R$ 9,90";
    return "R$ 0,00";
  };

  const getInitials = (name: string | null, email: string) => {
    const displayName = name || email.split("@")[0];
    return displayName
      .split(" ")
      .filter(Boolean)
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";
  };

  // Calcular deltas com segurança
  const calculateDelta = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando métricas reais do dashboard...</p>
      </div>
    );
  }

  const currentStats = stats || {
    total_mrr: 0,
    prev_mrr: 0,
    active_users: 0,
    prev_active_users: 0,
    new_subscriptions_30d: 0,
    prev_new_subscriptions_30d: 0,
    total_gmv: 0,
    prev_gmv: 0,
    mrr_spark: [],
    users_spark: [],
    subs_spark: [],
    gmv_spark: [],
    latest_subscribers: [],
  };

  const mrrDelta = calculateDelta(currentStats.total_mrr, currentStats.prev_mrr);
  const usersDelta = calculateDelta(currentStats.active_users, currentStats.prev_active_users);
  const subsDelta = calculateDelta(currentStats.new_subscriptions_30d, currentStats.prev_new_subscriptions_30d);
  const gmvDelta = calculateDelta(currentStats.total_gmv, currentStats.prev_gmv);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4"
      >
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-primary">Super Admin</p>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">Dashboard Global</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral do sistema e assinaturas.
            {usingFallback && (
              <span className="ml-2 text-xs text-amber-500 font-medium">
                (Modo de visualização simplificada - execute a RPC para liberar o GMV)
              </span>
            )}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Receita Recorrente (MRR)"
          value={formatBRL(currentStats.total_mrr)}
          delta={mrrDelta}
          variant="primary"
          icon={Wallet}
          index={0}
          comparedTo="vs mês anterior"
          spark={currentStats.mrr_spark.length > 0 ? currentStats.mrr_spark : undefined}
        />
        <KpiCard
          label="Usuários Ativos"
          value={String(currentStats.active_users)}
          delta={usersDelta}
          variant="success"
          icon={Users}
          index={1}
          comparedTo="vs mês anterior"
          spark={currentStats.users_spark.length > 0 ? currentStats.users_spark : undefined}
        />
        <KpiCard
          label="Novas Assinaturas"
          value={String(currentStats.new_subscriptions_30d)}
          delta={subsDelta}
          variant="info"
          icon={Target}
          index={2}
          comparedTo="vs mês anterior (últimos 30d)"
          spark={currentStats.subs_spark.length > 0 ? currentStats.subs_spark : undefined}
        />
        <KpiCard
          label="Volume Transacionado (GMV)"
          value={formatGMV(currentStats.total_gmv)}
          delta={gmvDelta}
          variant="primary"
          icon={CreditCard}
          index={3}
          comparedTo="Total acumulado nas lojas"
          spark={currentStats.gmv_spark.length > 0 ? currentStats.gmv_spark : undefined}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight mb-4">Últimos Assinantes</h3>
          <div className="space-y-4">
            {currentStats.latest_subscribers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum assinante encontrado.</p>
            ) : (
              currentStats.latest_subscribers.map((subscriber, i) => (
                <div
                  key={subscriber.id}
                  className="flex items-center justify-between pb-4 border-b border-border/50 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {getInitials(subscriber.full_name, subscriber.email)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{subscriber.full_name || subscriber.email.split("@")[0]}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        Plano {subscriber.plan_type} •{" "}
                        {formatDistanceToNow(new Date(subscriber.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-success">
                    + {getPlanPriceForSubscriber(subscriber.plan_type)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

