import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowRight, Check, Zap, BarChart3, Wallet, Bot, ShieldCheck,
  Workflow, LineChart, Star, PieChart, Filter, DownloadCloud, Clock, PlayCircle, TrendingUp,
  Search, Bell, Moon, HelpCircle, Package, Layers, Database, Calculator, CreditCard, ChevronRight, Plus,
  BookOpen, Link as LinkIcon, Share2, ShoppingCart, Eye, Store, LayoutDashboard
} from "lucide-react";
import Logo from "@/assets/logo.png";
import Icon from "@/assets/icon.png";
import KitFerramentasImg from "@/assets/kit-ferramentas.png";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GestãoShop — Plataforma SaaS de operações premium" },
      { name: "description", content: "ERP + CRM + financeiro + vendas em uma única plataforma com IA preditiva, automações e dashboards de nível Series A." },
      { property: "og:title", content: "GestãoShop — Operações premium" },
      { property: "og:description", content: "A plataforma all-in-one para operar e escalar seu negócio com inteligência." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mesh background */}
      <div className="absolute inset-0 -z-10" style={{ backgroundImage: "var(--gradient-mesh)" }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[1000px] gradient-primary opacity-20 blur-[120px] rounded-full -z-10" />

      <Nav />
      <Hero />
      <AllFeaturesSection />
      <CatalogFeatureSection />
      <ReportsSection />
      <FAQSection />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-40 glass-strong border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="GestãoShop" className="h-24 w-auto drop-shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:scale-105 transition-transform" />
        </div>
        <div className="hidden md:flex items-center gap-8 text-[13px] text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">Produto</a>
          <a href="#preview" className="hover:text-foreground transition">Plataforma</a>
          <a href="#pricing" className="hover:text-foreground transition">Preços</a>
          <a href="#" className="hover:text-foreground transition">Documentação</a>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:inline text-[13px] text-muted-foreground hover:text-foreground transition px-3 py-1.5">Entrar</Link>
          <Link to="/login" search={{ mode: "signup" }} className="group h-9 px-4 rounded-lg gradient-primary text-white text-[13px] font-semibold inline-flex items-center gap-1.5 glow-primary hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300">
            Começar Grátis <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-24 pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 xl:gap-24">
          
          {/* Left Text */}
          <div className="w-full lg:w-auto flex-none text-left z-10 shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-[11px] font-bold tracking-widest uppercase text-primary mb-6"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-gradient-primary">DÊ INICIO HOJE MESMO AO SEU TESTE GRATUITO DE 3 DIAS</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
              className="text-[38px] sm:text-5xl lg:text-[42px] xl:text-[54px] font-bold tracking-tight leading-[1.1]"
            >
              <span className="lg:whitespace-nowrap">Sua operação inteira,</span>
              <br />
              <span className="text-gradient-primary lg:whitespace-nowrap">em uma plataforma só.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-[15px] md:text-[17px] text-muted-foreground leading-relaxed max-w-lg"
            >
              ERP, CRM, financeiro e vendas com IA preditiva, automações e dashboards de nível enterprise.
              Construído para fundadores que pensam em escala.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-10 flex flex-col sm:flex-row items-center sm:justify-start gap-3"
            >
              <Link to="/login" search={{ mode: "signup" }} className="group h-12 px-6 rounded-xl gradient-primary text-white text-[15px] font-semibold inline-flex items-center gap-2 glow-primary hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300">
                Começar grátis <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="mt-6 text-[12px] text-muted-foreground"
            >
              Sem cartão de crédito · Setup em 2 minutos · Cancele quando quiser
            </motion.p>
          </div>

          {/* Right Visual */}
          <div className="w-full flex-1 relative z-0 flex justify-center lg:justify-start">
             <motion.div
               initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
               className="w-full max-w-[800px] lg:max-w-[1000px] xl:max-w-[1100px] relative"
             >
               <div className="absolute inset-0 -z-10 gradient-primary blur-[100px] opacity-20 scale-90" />
               
               {/* Floating Cards */}
               <FloatingCard 
                 title="Receita Total" value="R$ 27.850,40" trend="+18.2%" icon="green" 
                 className="-left-16 -top-8 -rotate-[8deg]" delay={0.8}
               />
               <FloatingCard 
                 title="Lucro Líquido" value="R$ 27.850,40" trend="+12.5%" icon="green" 
                 className="-right-12 top-6 rotate-[6deg]" delay={1.0}
               />
               <FloatingCard 
                 title="Margem Média" value="R$ 348,90" trend="+3.2%" icon="green" 
                 className="-left-12 bottom-20 rotate-[5deg]" delay={1.2}
               />
               <FloatingCard 
                 title="Margem Líquida" value="21.6%" trend="+3.2%" icon="blue" 
                 className="-right-16 bottom-32 -rotate-[6deg]" delay={1.4}
               />

               <DashboardMockup />
             </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="w-full relative shadow-2xl shadow-primary/10 rounded-2xl overflow-hidden border border-border/50 bg-[#0A0D14]">
      <svg viewBox="0 0 1100 850" className="w-full h-auto block" preserveAspectRatio="xMidYMid meet">
        <foreignObject width="1100" height="850">
          <div className="w-[1100px] h-[850px] bg-[#0A0D14] flex">
            {/* Sidebar */}
            <div className="w-[240px] border-r border-border/50 bg-[#0B0E16] hidden md:flex flex-col p-4 shrink-0 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 mb-8 px-2 text-foreground font-semibold">
          <Zap className="h-5 w-5 text-primary" />
          <span className="tracking-tight text-sm">GestãoShop</span>
        </div>
        
        <div className="flex items-center gap-3 p-2 rounded-xl bg-surface/50 mb-8 border border-border/30">
          <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-[11px] text-white font-bold">U</div>
          <div className="flex flex-col">
            <span className="text-[12px] font-medium leading-none text-foreground">Usuário</span>
            <span className="text-[10px] text-muted-foreground mt-1">Plano Teste</span>
          </div>
        </div>

        <div className="space-y-6 flex-1">
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">Visão Geral</div>
            <div className="flex flex-col gap-1">
              <div className="px-2 py-2 rounded-lg bg-primary/15 text-primary text-[12px] font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Dashboard
              </div>
              <div className="px-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-colors text-[12px] flex items-center justify-between">
                <div className="flex items-center gap-2"><LineChart className="h-4 w-4" /> Analytics</div>
                <span className="px-1.5 py-0.5 rounded-md bg-primary text-white text-[8px] font-bold">IA</span>
              </div>
              <div className="px-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-colors text-[12px] flex items-center gap-2">
                <Bot className="h-4 w-4" /> Relatórios
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">Vendas</div>
            <div className="flex flex-col gap-1">
              <div className="px-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-colors text-[12px] flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Vendas
              </div>
              <div className="px-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-colors text-[12px] flex items-center gap-2">
                <Workflow className="h-4 w-4" /> Canais
              </div>
              <div className="px-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-colors text-[12px] flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Pagamentos
              </div>
              <div className="px-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-colors text-[12px] flex items-center gap-2">
                <Bot className="h-4 w-4" /> CRM
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">Catálogo</div>
            <div className="flex flex-col gap-1">
              <div className="px-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-colors text-[12px] flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Produtos
              </div>
              <div className="px-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-colors text-[12px] flex items-center gap-2">
                <Workflow className="h-4 w-4" /> Categorias
              </div>
              <div className="px-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-colors text-[12px] flex items-center gap-2">
                <Bot className="h-4 w-4" /> Catálogo
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">Financeiro</div>
            <div className="flex flex-col gap-1">
              <div className="px-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-colors text-[12px] flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Fluxo de Caixa
              </div>
              <div className="px-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-colors text-[12px] flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Contas a Receber
              </div>
              <div className="px-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-colors text-[12px] flex items-center gap-2">
                <LineChart className="h-4 w-4" /> Gastos
              </div>
              <div className="px-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-colors text-[12px] flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Indique e Ganhe
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 lg:p-8 bg-[#080B11] min-w-0 relative">
        <div className="absolute top-0 right-0 w-96 h-96 gradient-primary opacity-5 blur-[100px] rounded-full -z-10" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="flex-1 max-w-md h-10 rounded-full bg-[#10131C] border border-border/50 flex items-center px-4">
            <span className="text-[12px] text-muted-foreground">Pesquisar produtos, clientes, transações...</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-9 px-4 rounded-full gradient-primary text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-lg shadow-primary/20">
              + Nova venda
            </div>
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <Bot className="h-4 w-4 text-muted-foreground" />
              <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-[10px] text-white font-bold ml-2">U</div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5">Operação Real-Time</div>
            <h2 className="text-2xl font-semibold text-foreground mb-1">Dashboard Geral</h2>
            <p className="text-[13px] text-muted-foreground">Visão geral consolidada das suas vendas e estoque.</p>
          </div>
          <div className="h-8 px-3 rounded-md bg-[#10131C] border border-border/50 text-muted-foreground text-[11px] font-medium flex items-center gap-1.5 hover:bg-surface/50 transition cursor-pointer">
            <Bot className="h-3.5 w-3.5" /> Total Acumulado
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-4 mb-4 flex-none">
          {[
            { title: "Receita Total", value: "R$ 8.250,00", sub: "Total histórico", icon: "purple", trend: "+100.0%" },
            { title: "Lucro Líquido", value: "R$ 5.521,50", sub: "Total histórico", icon: "green", trend: "+100.0%" },
            { title: "Ticket Médio", value: "R$ 8.250,00", sub: "Por venda", icon: "blue", trend: "+100.0%" },
            { title: "Margem Líquida", value: "66.9%", sub: "Média global", icon: "green", trend: "+100.0%" },
            { title: "Qtd Vendida", value: "150", sub: "Itens totais", icon: "blue", trend: "+100.0%" },
            { title: "Vendas Realizadas", value: "1", sub: "Total de pedidos", icon: "purple", trend: "+100.0%" },
            { title: "Produtos em Estoque", value: "0", sub: "SKUs ativos", icon: "blue", trend: "" },
            { title: "Clientes Atendidos", value: "1", sub: "Base de vendas", icon: "purple", trend: "+100.0%" },
          ].map((card, i) => (
            <div key={i} className="bg-[#10131C] border border-border/40 rounded-2xl p-4 flex flex-col justify-between group hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5">
              <div className="flex justify-between items-start mb-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  card.icon === 'purple' ? 'bg-primary/20 text-primary' : 
                  card.icon === 'green' ? 'bg-success/20 text-success' : 
                  'bg-info/20 text-info'
                }`}>
                  <BarChart3 className="h-4 w-4" />
                </div>
                {card.trend && (
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${card.trend.startsWith('+') ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted-foreground'}`}>{card.trend}</span>
                )}
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground mb-1">{card.title}</div>
                <div className="text-xl font-bold text-foreground tracking-tight mb-0.5">{card.value}</div>
                <div className="text-[10px] text-muted-foreground/60">{card.sub}</div>
              </div>
              <svg className="w-full h-8 mt-3 opacity-60" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path 
                  d="M0,15 Q10,12 20,16 T40,10 T60,12 T80,8 T100,10 L100,20 L0,20 Z" 
                  fill="currentColor" 
                  className={card.icon === 'purple' ? 'text-primary/10' : card.icon === 'green' ? 'text-success/10' : 'text-info/10'} 
                />
                <path 
                  d="M0,15 Q10,12 20,16 T40,10 T60,12 T80,8 T100,10" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                  className={card.icon === 'purple' ? 'text-primary' : card.icon === 'green' ? 'text-success' : 'text-info'} 
                />
              </svg>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-3 gap-4 flex-1">
          <div className="col-span-2 bg-[#10131C] border border-border/40 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Receita & Lucro</div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-bold text-foreground">R$ 8.250</h3>
                  <span className="text-[10px] text-muted-foreground">YTD</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Total Acumulado</div>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /> Receita</span>
                <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-success" /> Lucro</span>
              </div>
            </div>
          </div>
          <div className="bg-[#10131C] border border-border/40 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Vendas por Canal</div>
                <h3 className="text-lg font-bold text-foreground">1 canal ativo</h3>
              </div>
              <div className="h-6 px-2 rounded-md bg-[#1A1D27] text-muted-foreground text-[9px] font-medium flex items-center">
                Total Acumulado
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      </foreignObject>
      </svg>
    </div>
  );
}

function FloatingCard({ title, value, trend, icon, className, delay = 0 }: { title: string, value: string, trend: string, icon: 'purple' | 'green' | 'blue', className: string, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
      transition={{ 
        opacity: { duration: 0.8, delay },
        scale: { duration: 0.8, delay },
        y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: delay + 0.8 }
      }}
      className={`absolute z-20 bg-[#10131C]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-3 flex flex-col justify-between shadow-2xl shadow-black/60 w-[160px] hidden xl:flex ${className}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`h-6 w-6 rounded-lg flex items-center justify-center ${
          icon === 'purple' ? 'bg-primary/20 text-primary' : 
          icon === 'green' ? 'bg-success/20 text-success' : 
          'bg-info/20 text-info'
        }`}>
          <BarChart3 className="h-3 w-3" />
        </div>
        {trend && (
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${trend.startsWith('+') ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted-foreground'}`}>{trend}</span>
        )}
      </div>
      <div>
        <div className="text-[9px] text-muted-foreground mb-0.5">{title}</div>
        <div className="text-[14px] font-bold text-foreground tracking-tight mb-0">{value}</div>
      </div>
      <svg className="w-full h-6 mt-3 opacity-60" viewBox="0 0 100 20" preserveAspectRatio="none">
        <path 
          d="M0,15 Q10,12 20,16 T40,10 T60,12 T80,8 T100,10 L100,20 L0,20 Z" 
          fill="currentColor" 
          className={icon === 'purple' ? 'text-primary/10' : icon === 'green' ? 'text-success/10' : 'text-info/10'} 
        />
        <path 
          d="M0,15 Q10,12 20,16 T40,10 T60,12 T80,8 T100,10" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
          className={icon === 'purple' ? 'text-primary' : icon === 'green' ? 'text-success' : 'text-info'} 
        />
      </svg>
    </motion.div>
  );
}

function ReportsMockup() {
  return (
    <div className="w-full h-full bg-[#0A0D14] flex text-foreground overflow-hidden shadow-2xl relative">
      {/* Sidebar */}
      <div className="w-[22%] border-r border-white/5 bg-[#0B0E16] flex flex-col shrink-0 py-[2cqw] overflow-hidden">
        <div className="flex items-center gap-[0.8cqw] mb-[3cqw] px-[3cqw]">
          <Zap className="h-[2cqw] w-[2cqw] text-primary fill-primary/20" />
          <span className="tracking-tight text-[1.5cqw] font-bold">GestãoShop</span>
        </div>
        
        <div className="flex items-center justify-between mb-[4cqw] px-[1.5cqw] py-[1cqw] mx-[1.5cqw] bg-white/5 rounded-[1cqw] border border-white/5">
          <div className="flex items-center gap-[1cqw]">
            <div className="h-[3cqw] w-[3cqw] rounded-[0.8cqw] bg-primary/20 flex items-center justify-center text-primary text-[1.2cqw] font-bold">U</div>
            <div className="hidden sm:block">
              <div className="text-[1.1cqw] font-bold">Usuário</div>
              <div className="text-[0.9cqw] text-muted-foreground">Plano Teste</div>
            </div>
          </div>
          <ChevronRight className="h-[1.2cqw] w-[1.2cqw] text-muted-foreground" />
        </div>

        <div className="flex-1 overflow-y-auto px-[1.5cqw] space-y-[2cqw]">
          <div>
            <div className="text-[0.9cqw] font-bold text-muted-foreground uppercase tracking-widest px-[1cqw] mb-[1cqw]">Visão Geral</div>
            <div className="space-y-[0.3cqw]">
              <div className="flex items-center gap-[1cqw] px-[1cqw] py-[0.8cqw] rounded-[0.6cqw] text-muted-foreground text-[1.1cqw] hover:bg-white/5 transition-colors">
                <BarChart3 className="h-[1.4cqw] w-[1.4cqw]" /> <span className="hidden md:inline">Dashboard</span>
              </div>
              <div className="flex items-center gap-[1cqw] px-[1cqw] py-[0.8cqw] rounded-[0.6cqw] text-muted-foreground text-[1.1cqw] hover:bg-white/5 transition-colors">
                <LineChart className="h-[1.4cqw] w-[1.4cqw]" /> <span className="hidden md:inline">Analytics</span>
              </div>
              <div className="flex items-center justify-between px-[1cqw] py-[0.8cqw] rounded-[0.6cqw] bg-primary/10 text-primary text-[1.1cqw] font-bold border border-primary/20">
                <div className="flex items-center gap-[1cqw]">
                  <PieChart className="h-[1.4cqw] w-[1.4cqw]" /> <span className="hidden md:inline">Relatórios</span>
                </div>
                <div className="w-[0.6cqw] h-[0.6cqw] rounded-full bg-primary" />
              </div>
            </div>
          </div>

          <div>
            <div className="text-[0.9cqw] font-bold text-muted-foreground uppercase tracking-widest px-[1cqw] mb-[1cqw]">Vendas</div>
            <div className="space-y-[0.3cqw]">
              <div className="flex items-center gap-[1cqw] px-[1cqw] py-[0.8cqw] rounded-[0.6cqw] text-muted-foreground text-[1.1cqw] hover:bg-white/5 transition-colors">
                <Wallet className="h-[1.4cqw] w-[1.4cqw]" /> <span className="hidden md:inline">Vendas</span>
              </div>
              <div className="flex items-center gap-[1cqw] px-[1cqw] py-[0.8cqw] rounded-[0.6cqw] text-muted-foreground text-[1.1cqw] hover:bg-white/5 transition-colors">
                <Bot className="h-[1.4cqw] w-[1.4cqw]" /> <span className="hidden md:inline">Canais</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#080B11] min-w-0">
        {/* Top Bar */}
        <div className="h-[6cqw] border-b border-white/5 flex items-center justify-between px-[3cqw] shrink-0">
          <div className="flex-1 max-w-[40cqw]">
            <div className="relative group">
              <Search className="absolute left-[1cqw] top-1/2 -translate-y-1/2 h-[1.5cqw] w-[1.5cqw] text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="w-full bg-white/5 border border-white/10 rounded-[0.6cqw] py-[0.8cqw] pl-[3.5cqw] pr-[1cqw] text-[1.1cqw] focus:outline-none"
                readOnly
              />
            </div>
          </div>
          
          <div className="flex items-center gap-[1.5cqw] ml-[2cqw]">
            <button className="h-[3.5cqw] px-[1.5cqw] gradient-primary text-white text-[1.1cqw] font-bold rounded-[0.6cqw] flex items-center gap-[0.8cqw]">
              <Plus className="h-[1.5cqw] w-[1.5cqw]" /> <span className="hidden lg:inline">Nova venda</span>
            </button>
            <div className="flex items-center gap-[1cqw] border-l border-white/10 pl-[1.5cqw]">
              <Bell className="h-[1.5cqw] w-[1.5cqw] text-muted-foreground" />
              <div className="h-[3cqw] w-[3cqw] rounded-[0.6cqw] bg-primary/20 flex items-center justify-center text-primary text-[1cqw] font-bold border border-primary/20">U</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-[3cqw] custom-scrollbar">
          <div className="flex justify-between items-end mb-[4cqw]">
            <div>
              <div className="text-[1cqw] font-bold text-primary uppercase tracking-wider mb-[0.5cqw]">Operação Real-Time</div>
              <h3 className="text-[2.5cqw] font-extrabold tracking-tight">Relatórios</h3>
              <p className="text-[1.2cqw] text-muted-foreground">Análise detalhada do seu negócio</p>
            </div>
            <div className="h-[3.5cqw] px-[1.5cqw] bg-white/5 text-[1.1cqw] text-muted-foreground rounded-[0.6cqw] flex items-center gap-[0.8cqw] border border-white/10">
              Mês Atual <ChevronRight className="h-[1cqw] w-[1cqw] rotate-90" />
            </div>
          </div>

          {/* Top Cards */}
          <div className="grid grid-cols-3 gap-[2cqw] mb-[3cqw]">
            <div className="bg-[#10131C] border border-white/5 rounded-[1.5cqw] p-[2cqw] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-[1.5cqw]">
                 <div className="text-[0.9cqw] font-bold text-muted-foreground uppercase tracking-widest">Total em Vendas</div>
                 <Wallet className="h-[1.5cqw] w-[1.5cqw] text-muted-foreground/50" />
              </div>
              <div className="text-[2.2cqw] font-bold tracking-tight">R$ 8.250,00</div>
            </div>
            <div className="bg-[#10131C] border border-success/20 rounded-[1.5cqw] p-[2cqw] flex flex-col justify-between border-b-[0.3cqw] border-b-success relative overflow-hidden">
              <div className="absolute -right-[2cqw] -bottom-[2cqw] w-[8cqw] h-[8cqw] bg-success/10 blur-[2cqw] rounded-full" />
              <div className="flex justify-between items-start mb-[1.5cqw] relative z-10">
                 <div className="text-[0.9cqw] font-bold text-success uppercase tracking-widest">Lucro Líquido</div>
                 <TrendingUp className="h-[1.5cqw] w-[1.5cqw] text-success" />
              </div>
              <div className="text-[2.2cqw] font-bold text-success tracking-tight relative z-10">R$ 5.521,50</div>
            </div>
            <div className="bg-[#10131C] border border-white/5 rounded-[1.5cqw] p-[2cqw] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-[1.5cqw]">
                 <div className="text-[0.9cqw] font-bold text-muted-foreground uppercase tracking-widest">Itens Vendidos</div>
                 <BarChart3 className="h-[1.5cqw] w-[1.5cqw] text-muted-foreground/50" />
              </div>
              <div className="text-[2.2cqw] font-bold tracking-tight">150</div>
            </div>
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-2 gap-[2cqw] flex-1 min-h-0">
            <div className="bg-[#10131C] border border-white/5 rounded-[1.5cqw] p-[2cqw] flex flex-col min-h-[20cqw]">
              <div className="flex justify-between items-center mb-[2cqw]">
                 <div className="text-[1.1cqw] font-bold flex items-center gap-[0.8cqw]"><BarChart3 className="h-[1.5cqw] w-[1.5cqw] text-primary" /> Performance</div>
              </div>
              <div className="flex-1 flex items-end justify-center gap-[4cqw] pb-[2cqw] border-b border-white/5 relative">
                <div className="w-[4cqw] h-[80%] bg-primary rounded-t-[0.5cqw] shadow-[0_0_20px_rgba(var(--primary),0.2)]" />
                <div className="w-[4cqw] h-[55%] bg-primary/30 rounded-t-[0.5cqw]" />
              </div>
            </div>
            <div className="bg-[#10131C] border border-white/5 rounded-[1.5cqw] p-[2cqw] flex flex-col min-h-[20cqw]">
               <div className="flex justify-between items-center mb-[2cqw]">
                 <div className="text-[1.1cqw] font-bold flex items-center gap-[0.8cqw]"><LineChart className="h-[1.5cqw] w-[1.5cqw] text-info" /> Vendas</div>
              </div>
               <div className="flex-1 relative pb-[2cqw] border-b border-white/5">
                  <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full stroke-info fill-none overflow-visible" strokeWidth="2">
                     <path d="M0,45 L10,10 L20,35 L30,40 L40,30 L50,15 L60,25 L70,10 L80,5 L90,20 L100,5" />
                  </svg>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReportsSection() {
  return (
    <section className="relative py-32 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-center">
          
          {/* Left Text */}
          <div className="w-full text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-[11px] font-bold tracking-widest uppercase text-primary mb-6"
            >
              <LineChart className="h-3.5 w-3.5" />
              <span className="text-gradient-primary">RELATÓRIOS INTELIGENTES</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-[46px] font-bold tracking-tight leading-[1.1]"
            >
              Relatórios que <br/>
              <span className="text-gradient-primary">transformam dados</span><br/>
              em decisões.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-[15px] md:text-[17px] text-muted-foreground leading-relaxed max-w-lg"
            >
              Acompanhe todos os indicadores do seu negócio em tempo real. Visualize vendas, lucro, ticket médio, margem e muito mais em dashboards intuitivos e personalizáveis.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 space-y-7"
            >
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-[#10131C] border border-border/40 flex items-center justify-center text-primary shadow-lg shadow-black/20">
                  <LineChart className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-foreground">Indicadores em tempo real</h4>
                  <p className="text-[13px] text-muted-foreground mt-0.5">Acompanhe métricas atualizadas automaticamente.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-[#10131C] border border-border/40 flex items-center justify-center text-primary shadow-lg shadow-black/20">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-foreground">Dashboards personalizáveis</h4>
                  <p className="text-[13px] text-muted-foreground mt-0.5">Monte suas visualizações do jeito que seu negócio precisa.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-[#10131C] border border-border/40 flex items-center justify-center text-success shadow-lg shadow-black/20">
                  <DownloadCloud className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-foreground">Relatórios completos</h4>
                  <p className="text-[13px] text-muted-foreground mt-0.5">Filtros avançados e exportação em poucos cliques.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-[#10131C] border border-border/40 flex items-center justify-center text-primary shadow-lg shadow-black/20">
                  <PieChart className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-foreground">Análises que geram resultado</h4>
                  <p className="text-[13px] text-muted-foreground mt-0.5">Entenda tendências e tome decisões com mais segurança.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row items-center gap-6"
            >
              <Link to="/login" search={{ mode: "signup" }} className="group h-11 px-6 rounded-xl gradient-primary text-white text-[14px] font-semibold inline-flex items-center gap-2 glow-primary hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300">
                Explorar relatórios <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <button className="text-[13px] text-muted-foreground hover:text-foreground font-medium flex items-center gap-2 transition group">
                Ver demonstração <span className="h-6 w-6 rounded-full border border-border flex items-center justify-center group-hover:border-foreground transition-colors"><PlayCircle className="h-3 w-3" /></span>
              </button>
            </motion.div>
          </div>

          {/* Right Visual: 3D Laptop Mockup */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
            className="w-[120%] lg:w-[130%] xl:w-[150%] relative z-0 mt-12 lg:mt-0 flex justify-center -ml-6 lg:-ml-12 xl:-ml-24"
          >
             <div className="absolute inset-0 -z-10 gradient-primary blur-[120px] opacity-20 scale-90" />
             
             {/* Perspective Container */}
             <div className="relative w-full" style={{ perspective: '1600px' }}>
                <div 
                  className="relative origin-right" 
                  style={{ transform: 'rotateY(-12deg) rotateX(4deg)' }}
                >
                  {/* STABLE 3D LAPTOP CONTAINER */}
                  <div className="relative w-full aspect-[1.3] perspective-[2000px] max-w-[800px] mx-auto">
                     <div 
                       className="absolute inset-0" 
                       style={{ transform: 'rotateY(-15deg) rotateX(5deg)', transformStyle: 'preserve-3d' }}
                     >
                       
                       {/* Screen / Lid */}
                       <div className="absolute top-[5%] left-[10%] right-[10%] bottom-[30%] bg-[#18191d] rounded-t-[1.5rem] p-2 sm:p-3 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 z-20">
                         <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-black/80" />
                         <div className="w-full h-full bg-[#0A0D14] rounded-lg overflow-hidden border border-black/80 relative shadow-inner" style={{ containerType: 'size' }}>
                             <ReportsMockup />
                         </div>
                         <div className="absolute bottom-1 sm:bottom-1.5 left-1/2 -translate-x-1/2 text-[6px] sm:text-[8px] font-bold text-white/20 tracking-widest uppercase">GestãoShop</div>
                       </div>

                       {/* Keyboard Deck (Base) - Attached to bottom of screen (70%) */}
                       <div 
                          className="absolute top-[70%] left-[10%] right-[10%] h-[75%] origin-top z-30"
                          style={{ transform: 'rotateX(72deg)', transformStyle: 'preserve-3d' }}
                       >
                          {/* Deck Surface */}
                          <div className="absolute inset-0 bg-gradient-to-b from-[#2a2b38] to-[#121318] rounded-b-[2rem] sm:rounded-b-[3rem] border border-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col items-center">
                             <div className="absolute inset-y-0 left-0 w-[20%] bg-blue-500/20 blur-2xl rounded-bl-full" />
                             <div className="absolute inset-y-0 right-0 w-[20%] bg-purple-500/30 blur-2xl rounded-br-full" />
                             
                             {/* Keyboard Recess & Keys */}
                             <div className="w-[85%] h-[55%] mt-[4%] bg-[#0A0D14] rounded-md border border-white/5 opacity-90 p-[1.5%] flex flex-col gap-[2%] shadow-inner">
                                {/* Row 1: Function keys */}
                                <div className="flex w-full h-[12%] gap-[1%]">
                                  {Array.from({ length: 14 }).map((_, i) => (
                                    <div key={i} className="bg-[#1e1f24] rounded-sm flex-1 border border-white/10 shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                                  ))}
                                </div>
                                {/* Row 2: Numbers */}
                                <div className="flex w-full h-[16%] gap-[1%]">
                                  {Array.from({ length: 14 }).map((_, i) => (
                                    <div key={i} className="bg-[#1e1f24] rounded-sm flex-1 border border-white/10 shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                                  ))}
                                </div>
                                {/* Row 3: QWERTY */}
                                <div className="flex w-full h-[16%] gap-[1%]">
                                  <div className="bg-[#1e1f24] rounded-sm flex-[1.5] border border-white/10 shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                                  {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="bg-[#1e1f24] rounded-sm flex-1 border border-white/10 shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                                  ))}
                                  <div className="bg-[#1e1f24] rounded-sm flex-[1.5] border border-white/10 shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                                </div>
                                {/* Row 4: ASDF */}
                                <div className="flex w-full h-[16%] gap-[1%]">
                                  <div className="bg-[#1e1f24] rounded-sm flex-[1.8] border border-white/10 shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                                  {Array.from({ length: 11 }).map((_, i) => (
                                    <div key={i} className="bg-[#1e1f24] rounded-sm flex-1 border border-white/10 shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                                  ))}
                                  <div className="bg-[#1e1f24] rounded-sm flex-[2.2] border border-white/10 shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                                </div>
                                {/* Row 5: ZXCV */}
                                <div className="flex w-full h-[16%] gap-[1%]">
                                  <div className="bg-[#1e1f24] rounded-sm flex-[2.5] border border-white/10 shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                                  {Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className="bg-[#1e1f24] rounded-sm flex-1 border border-white/10 shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                                  ))}
                                  <div className="bg-[#1e1f24] rounded-sm flex-[2.5] border border-white/10 shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                                </div>
                                {/* Row 6: Spacebar */}
                                <div className="flex w-full h-[16%] gap-[1%]">
                                  {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="bg-[#1e1f24] rounded-sm flex-1 border border-white/10 shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                                  ))}
                                  <div className="bg-[#1e1f24] rounded-sm flex-[6] border border-white/10 shadow-[0_1px_1px_rgba(0,0,0,0.5)]" /> {/* Spacebar */}
                                  {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="bg-[#1e1f24] rounded-sm flex-1 border border-white/10 shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                                  ))}
                                </div>
                             </div>
                             
                             {/* Trackpad */}
                             <div className="w-[30%] h-[20%] mt-[4%] bg-[#1A1D27] rounded-sm border border-black/50 shadow-inner" />
                             
                             {/* Notch */}
                             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[15%] h-[4%] bg-black/60 rounded-b-md" />
                          </div>
                          
                          {/* Bottom Edge Thickness (Attached in 3D Space!) */}
                          <div 
                             className="absolute top-[100%] left-0 right-0 h-[12px] sm:h-[16px] bg-gradient-to-r from-[#0a0b0e] via-[#1a1b22] to-[#0a0b0e] rounded-b-[2rem] sm:rounded-b-[3rem] border border-t-0 border-white/10 shadow-[0_30px_60px_rgba(0,0,0,1)] origin-top"
                             style={{ transform: 'rotateX(-72deg)' }}
                          />
                       </div>
                       
                     </div>
                  </div>
                </div>
             </div>
          </motion.div>
        </div>

        {/* Bottom Metrics Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-32 bg-[#0B0E16]/80 backdrop-blur-md border border-white/5 rounded-3xl p-6 lg:p-8 flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-row lg:justify-center items-center gap-8 lg:gap-12 divide-y md:divide-y-0 md:divide-x lg:divide-x divide-white/10 shadow-2xl shadow-black/40"
        >
           <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-4 first:pl-0 first:pt-0 border-transparent">
             <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
               <Clock className="h-5 w-5 text-primary" />
             </div>
             <div>
               <div className="text-[16px] md:text-[18px] font-bold text-foreground">100% Em tempo real</div>
               <div className="text-[12px] text-muted-foreground mt-0.5">Dados atualizados automaticamente</div>
             </div>
           </div>
           
           <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-8">
             <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center shrink-0">
               <Filter className="h-5 w-5 text-info" />
             </div>
             <div>
               <div className="text-[16px] md:text-[18px] font-bold text-foreground">Filtros avançados</div>
               <div className="text-[12px] text-muted-foreground mt-0.5">Encontre exatamente o que precisa</div>
             </div>
           </div>
           
           <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-8">
             <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
               <DownloadCloud className="h-5 w-5 text-success" />
             </div>
             <div>
               <div className="text-[16px] md:text-[18px] font-bold text-foreground">Exportação fácil</div>
               <div className="text-[12px] text-muted-foreground mt-0.5">PDF, Excel e CSV em um clique</div>
             </div>
           </div>
        </motion.div>
      </div>
    </section>
  );
}

const allFeatures = [
  {
    icon: LayoutDashboard,
    title: "Dashboard Inteligente",
    desc: "Visão completa do seu negócio: faturamento, lucro, margem, estoque e vendas recentes em tempo real.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: Package,
    title: "Controle de Produtos e Estoque",
    desc: "Cadastre produtos com fotos, preço de custo e venda, controle estoque com entradas e histórico completo.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: ShoppingCart,
    title: "Registro de Vendas",
    desc: "Registre vendas com múltiplos itens, escolha canal e forma de pagamento, gere recibos e acompanhe parcelas.",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: CreditCard,
    title: "Formas de Pagamento e Taxas",
    desc: "Cadastre Dinheiro, PIX, Cartão, etc. Defina taxas por forma de pagamento para cálculo preciso de lucro.",
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    icon: Store,
    title: "Canais de Venda",
    desc: "Organize vendas por canal — Loja Física, Instagram, WhatsApp, iFood — e compare desempenho de cada um.",
    color: "bg-pink-500/10 text-pink-500",
  },
  {
    icon: BookOpen,
    title: "Catálogo Digital",
    desc: "Crie catálogos online com link próprio para compartilhar no WhatsApp. Analytics de visualizações incluído.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Analytics e Relatórios",
    desc: "Gráficos de evolução, vendas por canal, lucro por período e relatórios exportáveis para decisões com dados.",
    color: "bg-cyan-500/10 text-cyan-500",
  },
  {
    icon: Wallet,
    title: "Fluxo de Caixa e Financeiro",
    desc: "Controle entradas, saídas, gastos operacionais e contas a receber. Saiba exatamente onde seu dinheiro está.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: Share2,
    title: "Indique e Ganhe",
    desc: "Gere seu link de afiliado, receba 20% de comissão por cada assinatura e ofereça desconto na primeira mensalidade dos indicados.",
    color: "bg-amber-500/10 text-amber-500",
  },
];

function AllFeaturesSection() {
  return (
    <section className="relative py-24 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-[11px] font-bold tracking-widest uppercase text-primary mb-6"
          >
            <Zap className="h-3.5 w-3.5" />
            <span className="text-gradient-primary">RECURSOS</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4"
          >
            Tudo para gerenciar seu negócio
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[15px] md:text-[17px] text-muted-foreground max-w-2xl"
          >
            Do cadastro de produtos ao fluxo de caixa, cada funcionalidade foi pensada para facilitar o dia a dia de quem vende.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="bg-[#0B0E16] border border-border/40 rounded-2xl p-6 md:p-8 hover:border-border-strong hover:bg-[#10131C] transition-colors group"
            >
              <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:shadow-primary/40 transition-all">
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-[18px] font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-[14px] leading-relaxed text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CatalogFeatureSection() {
  return (
    <>
      <section className="relative py-32 overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto px-6">
           {/* Section 1: Hero-like */}
           <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Left Text */}
              <div className="w-full lg:w-1/2 text-left z-10">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-[11px] font-bold tracking-widest uppercase text-primary mb-6"
                 >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span className="text-gradient-primary">CATÁLOGOS ONLINE</span>
                 </motion.div>

                 <motion.h2
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-[40px] md:text-[54px] font-bold tracking-tight leading-[1.1]"
                 >
                    Seu catálogo.<br/>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#818CF8] to-[#C084FC]">Seu link.</span><br/>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#818CF8] to-[#C084FC]">Mais vendas.</span>
                 </motion.h2>

                 <motion.p
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-6 text-[15px] md:text-[17px] text-muted-foreground leading-relaxed max-w-md"
                 >
                    Crie um catálogo online dos seus produtos e compartilhe seu link exclusivo com quem quiser. Fácil para você gerenciar, simples para seu cliente comprar.
                 </motion.p>

                 <motion.div
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-10 flex flex-col sm:flex-row items-center sm:justify-start gap-4"
                 >
                    <Link to="/login" search={{ mode: "signup" }} className="group h-12 px-8 rounded-xl gradient-primary text-white text-[15px] font-semibold inline-flex items-center gap-2 glow-primary hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300">
                      Começar grátis <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                 </motion.div>

                 <motion.div
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-6 flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground"
                 >
                    <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Sem cartão de crédito</span>
                    <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Setup em 2 minutos</span>
                    <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Cancele quando quiser</span>
                 </motion.div>
              </div>

              {/* Right Visuals */}
              <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end lg:pr-10">
                 <div className="absolute inset-0 gradient-primary opacity-20 blur-[100px] rounded-full scale-75 -z-10" />
                 
                 {/* Desktop Mockup */}
                 <motion.div 
                    initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative w-full max-w-[500px] rounded-[1.2rem] bg-[#0A0D14] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col mt-10 lg:mt-0"
                 >
                    <div className="h-8 bg-[#10131C] border-b border-border flex items-center gap-2 px-4 shrink-0">
                       <span className="h-2 w-2 rounded-full bg-destructive/70" />
                       <span className="h-2 w-2 rounded-full bg-warning/70" />
                       <span className="h-2 w-2 rounded-full bg-success/70" />
                       <div className="ml-4 flex-1 h-5 rounded bg-white/5 border border-white/5 flex items-center justify-center text-[9px] text-muted-foreground gap-1.5">
                          <BookOpen className="h-2.5 w-2.5" /> gestaoshop.com.br/c/minhaloja
                       </div>
                    </div>
                    <div className="flex-1 bg-background relative overflow-hidden flex flex-col h-[420px]">
                       {/* Banner */}
                       <div className="h-[120px] bg-primary shrink-0" />
                       {/* Profile */}
                       <div className="flex flex-col items-center -mt-8 mb-4 px-6 z-10 shrink-0">
                          <div className="h-[60px] w-[60px] rounded-full border-4 border-background overflow-hidden bg-surface flex items-center justify-center">
                             <img src={Icon} alt="Minha Loja" className="w-full h-full object-contain p-1.5 bg-white drop-shadow-sm" />
                          </div>
                          <h3 className="mt-2 text-[15px] font-bold text-foreground">Minha Loja</h3>
                       </div>
                       {/* Content */}
                       <div className="px-6 flex-1 overflow-hidden">
                          <p className="text-[9px] font-bold text-primary uppercase tracking-widest text-center mb-4">Meus Produtos</p>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="bg-card border border-border rounded-xl p-2.5 flex flex-col gap-2">
                                <div className="aspect-[4/3] rounded-lg bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden">
                                   <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-foreground text-background text-[7px] font-bold z-10">Novo</div>
                                   <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&auto=format&fit=crop" alt="Smartphone" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                   <p className="text-[11px] font-medium text-foreground leading-tight">Smartphone Premium</p>
                                   <p className="text-[12px] font-bold text-foreground mt-1">R$ 1299,90</p>
                                </div>
                             </div>
                             <div className="bg-card border border-border rounded-xl p-2.5 flex flex-col gap-2">
                                <div className="aspect-[4/3] rounded-lg bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden">
                                   <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-destructive text-destructive-foreground text-[7px] font-bold z-10">Promo</div>
                                   <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&auto=format&fit=crop" alt="Fone Bluetooth" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                   <p className="text-[11px] font-medium text-foreground leading-tight">Fone Bluetooth</p>
                                   <p className="text-[12px] font-bold text-foreground mt-1">R$ 199,90</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </motion.div>

                 {/* Mobile Mockup Floating */}
                 <motion.div 
                    initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
                    className="absolute -right-8 top-12 w-[240px] rounded-[2.5rem] bg-[#0A0D14] border-[6px] border-[#252833] shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col z-20"
                 >
                    <div className="h-6 w-full flex justify-center pt-2 shrink-0 bg-[#0A0D14] relative">
                       <div className="w-20 h-[14px] rounded-full bg-[#1A1D27] z-30" />
                    </div>
                    <div className="h-8 bg-[#0A0D14] flex items-center justify-center px-4 border-b border-white/5 shrink-0 relative z-20">
                       <div className="flex-1 h-[20px] rounded bg-white/5 flex items-center justify-center text-[8px] text-muted-foreground gap-1.5">
                          <BookOpen className="h-2.5 w-2.5" /> gestaoshop...
                       </div>
                    </div>
                    <div className="flex-1 bg-background relative overflow-hidden flex flex-col h-[460px]">
                       <div className="h-[100px] bg-primary shrink-0" />
                       <div className="flex flex-col items-center -mt-6 mb-2 px-4 z-10 shrink-0">
                          <div className="h-12 w-12 rounded-full border-[3px] border-background overflow-hidden bg-surface flex items-center justify-center">
                             <img src={Icon} alt="Minha Loja" className="w-full h-full object-contain p-1.5 bg-white drop-shadow-sm" />
                          </div>
                          <h3 className="mt-1 text-[12px] font-bold text-foreground">Minha Loja</h3>
                       </div>
                       <div className="px-3 flex-1 overflow-hidden">
                          <p className="text-[7px] font-bold text-primary uppercase tracking-widest text-center mb-2">Meus Produtos</p>
                          <div className="grid grid-cols-2 gap-1.5">
                             <div className="bg-card border border-border rounded-lg p-1.5 flex flex-col gap-1">
                                <div className="aspect-square rounded-md bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden">
                                   <div className="absolute top-1 left-1 px-1 py-[1px] rounded bg-foreground text-background text-[5px] font-bold">Novo</div>
                                   <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&auto=format&fit=crop" alt="Smartphone" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                   <p className="text-[7px] font-medium text-foreground leading-[1] truncate">Smartphone Premium</p>
                                   <p className="text-[8px] font-bold text-foreground mt-0.5">R$ 1299,90</p>
                                </div>
                             </div>
                             <div className="bg-card border border-border rounded-lg p-1.5 flex flex-col gap-1">
                                <div className="aspect-square rounded-md bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden">
                                   <div className="absolute top-1 left-1 px-1 py-[1px] rounded bg-destructive text-destructive-foreground text-[5px] font-bold">Promo</div>
                                   <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&auto=format&fit=crop" alt="Fone Bluetooth" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                   <p className="text-[7px] font-medium text-foreground leading-[1] truncate">Fone Bluetooth</p>
                                   <p className="text-[8px] font-bold text-foreground mt-0.5">R$ 199,90</p>
                                </div>
                             </div>
                             <div className="bg-card border border-border rounded-lg p-1.5 flex flex-col gap-1">
                                <div className="aspect-square rounded-md bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden">
                                   <img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=200&auto=format&fit=crop" alt="Smartwatch" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                   <p className="text-[7px] font-medium text-foreground leading-[1] truncate">Smartwatch Pro</p>
                                   <p className="text-[8px] font-bold text-foreground mt-0.5">R$ 899,90</p>
                                </div>
                             </div>
                             <div className="bg-card border border-border rounded-lg p-1.5 flex flex-col gap-1">
                                <div className="aspect-square rounded-md bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden">
                                   <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=200&auto=format&fit=crop" alt="Notebook" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                   <p className="text-[7px] font-medium text-foreground leading-[1] truncate">Notebook Slim</p>
                                   <p className="text-[8px] font-bold text-foreground mt-0.5">R$ 4299,90</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </motion.div>

                 {/* Link Bubbles */}
                 <div className="absolute -left-12 bottom-6 z-30 flex flex-col gap-3">
                    <motion.div 
                       initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.6 }}
                       className="bg-white rounded-[2rem] py-4 px-10 shadow-2xl flex items-center gap-3 w-fit"
                    >
                       <LinkIcon className="h-6 w-6 text-primary" />
                       <span className="text-[19px] font-bold tracking-tight text-primary">gestaoshop.com.br/c/minhaloja</span>
                    </motion.div>
                    <motion.div 
                       initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.8 }}
                       className="bg-[#1A1D27]/95 backdrop-blur-md rounded-[2rem] p-2 pr-6 shadow-2xl flex items-center gap-3 border border-white/10 w-fit ml-10"
                    >
                       <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center">
                          <LinkIcon className="h-4 w-4 text-white" />
                       </div>
                       <span className="text-[14px] text-gray-200 font-medium">Seu link exclusivo de catálogo</span>
                    </motion.div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Section 2: How it works */}
      <section className="py-24 bg-[#0A0D14]">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-16">
              <motion.div
                 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                 className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-[11px] font-bold tracking-widest uppercase text-primary mb-3"
              >
                 <Sparkles className="h-3.5 w-3.5" />
                 <span className="text-gradient-primary">SIMPLES PARA VOCÊ. FÁCIL PARA SEU CLIENTE.</span>
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Como funciona o Catálogo Online</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                 { icon: BookOpen, title: "Crie seu catálogo", desc: "Adicione seus produtos, organize categorias, preços e imagens em poucos cliques." },
                 { icon: LinkIcon, title: "Seu link exclusivo", desc: "Receba um link único e personalizado para o seu catálogo online." },
                 { icon: Share2, title: "Compartilhe onde quiser", desc: "Envie por WhatsApp, redes sociais, e-mail ou até imprima em materiais." },
                 { icon: ShoppingCart, title: "Clientes compram de você", desc: "Seu cliente visualiza os produtos e entra em contato para comprar. Simples assim!" },
              ].map((item, i) => (
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                    key={i} className="bg-[#10131C] border border-white/5 rounded-2xl p-8 flex flex-col items-start hover:border-primary/30 transition-colors group relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                    <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:shadow-primary/40 transition-all">
                       <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 relative z-10">{item.title}</h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed relative z-10">{item.desc}</p>
                 </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Section 3: Benefits */}
      <section className="py-24 bg-background overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              
              <div className="w-full lg:w-1/2 text-left z-10">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-[11px] font-bold tracking-widest uppercase text-primary mb-6"
                 >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="text-gradient-primary">VENDAS MAIS INTELIGENTES</span>
                 </motion.div>
                 <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-10">Mais benefícios para<br/>o seu negócio</h2>
                 
                 <div className="space-y-8">
                    {[
                       { title: "Catálogo sempre atualizado", desc: "Altere preços, produtos e fotos e tudo é atualizado na hora." },
                       { title: "Acesso de qualquer lugar", desc: "Seu catálogo fica disponível 24h por dia, em qualquer dispositivo." },
                       { title: "Mais profissionalismo", desc: "Passe mais confiança com um catálogo moderno e personalizado." },
                       { title: "Sem taxas por visualização", desc: "Compartilhe quantas vezes quiser. Sem limites, sem surpresas." },
                    ].map((b, i) => (
                       <motion.div 
                          initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                          key={i} className="flex gap-4 group"
                       >
                          <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-primary/20">
                             <Check className="h-3 w-3 text-white" />
                          </div>
                          <div>
                             <h4 className="text-[13px] font-bold text-white uppercase tracking-wider mb-1">{b.title}</h4>
                             <p className="text-[14px] text-muted-foreground">{b.desc}</p>
                          </div>
                       </motion.div>
                    ))}
                 </div>
              </div>

              {/* Right Mockup */}
              <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end">
                 <div className="absolute inset-0 gradient-primary opacity-10 blur-[100px] rounded-full scale-90 -z-10" />
                 
                 <motion.div 
                    initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative w-full max-w-[560px] rounded-2xl bg-[#0A0D14] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                 >
                    {/* Browser top */}
                    <div className="h-8 bg-[#10131C] border-b border-border flex items-center gap-2 px-4 shrink-0">
                       <span className="h-2 w-2 rounded-full bg-destructive/70" />
                       <span className="h-2 w-2 rounded-full bg-warning/70" />
                       <span className="h-2 w-2 rounded-full bg-success/70" />
                       <div className="ml-4 flex-1 h-5 rounded bg-white/5 border border-white/5 flex items-center justify-center text-[9px] text-muted-foreground gap-1.5">
                          <BookOpen className="h-2.5 w-2.5" /> gestaoshop.com.br/c/minhaloja
                       </div>
                    </div>
                    
                    <div className="flex-1 bg-background relative overflow-y-auto overflow-x-hidden flex flex-col h-[400px]">
                       {/* Banner & Profile */}
                       <div className="h-24 bg-primary shrink-0 relative flex items-center justify-center">
                          <div className="absolute -bottom-6 flex flex-col items-center">
                             <div className="h-[50px] w-[50px] rounded-full border-[3px] border-background overflow-hidden bg-surface flex items-center justify-center shadow-lg">
                                <img src={Icon} alt="Minha Loja" className="w-full h-full object-contain p-1.5 bg-white drop-shadow-sm" />
                             </div>
                             <h3 className="mt-1 text-[14px] font-bold text-white drop-shadow-md">Minha Loja</h3>
                          </div>
                       </div>
                       
                       <div className="px-6 pt-12 pb-6 flex-1 flex flex-col gap-6">
                          <div>
                             <p className="text-[8px] font-bold text-primary uppercase tracking-widest text-center mb-3">Meus Produtos</p>
                             <div className="grid grid-cols-4 gap-2">
                                {[
                                   { title: "Smartphone Premium", price: "R$ 1299,90", tag: "Novo", tbg: "bg-foreground text-background", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&auto=format&fit=crop" },
                                   { title: "Fone Bluetooth", price: "R$ 199,90", tag: "Promo", tbg: "bg-destructive text-destructive-foreground", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&auto=format&fit=crop" },
                                   { title: "Kit Ferramentas", price: "R$ 55,00", tag: "Novo", tbg: "bg-foreground text-background", img: KitFerramentasImg },
                                   { title: "Relógio Digital", price: "R$ 149,90", tag: "Promo", tbg: "bg-destructive text-destructive-foreground", img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=200&auto=format&fit=crop" },
                                ].map((p, i) => (
                                   <div key={i} className="bg-card border border-border rounded-xl p-2 flex flex-col gap-1.5">
                                      <div className="aspect-[4/3] rounded-md bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden">
                                         <div className={`absolute top-1 left-1 px-1 py-[1px] rounded text-[6px] font-bold ${p.tbg} z-10`}>{p.tag}</div>
                                         <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                         <p className="text-[8px] font-medium text-foreground leading-tight truncate">{p.title}</p>
                                         <p className="text-[9px] font-bold text-foreground mt-0.5">{p.price}</p>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                             <div className="bg-[#10131C] border border-border/50 rounded-xl p-3 hover:border-primary/30 transition-colors">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                                   <Eye className="h-4 w-4 text-primary" />
                                </div>
                                <div className="text-xl font-bold text-white">1.248</div>
                                <div className="text-[8px] text-muted-foreground mt-0.5 leading-tight">Visualizações<br/>nos últimos 30 dias</div>
                             </div>
                             <div className="bg-[#10131C] border border-border/50 rounded-xl p-3 hover:border-primary/30 transition-colors">
                                <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center mb-2">
                                   <LinkIcon className="h-4 w-4 text-info" />
                                </div>
                                <div className="text-xl font-bold text-white">324</div>
                                <div className="text-[8px] text-muted-foreground mt-0.5 leading-tight">Cliques no link<br/>neste mês</div>
                             </div>
                             <div className="bg-[#10131C] border border-border/50 rounded-xl p-3 hover:border-primary/30 transition-colors">
                                <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center mb-2">
                                   <ShoppingCart className="h-4 w-4 text-destructive" />
                                </div>
                                <div className="text-xl font-bold text-white">87</div>
                                <div className="text-[8px] text-muted-foreground mt-0.5 leading-tight">Pedidos realizados<br/>através do catálogo</div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              </div>

           </div>
        </div>
      </section>

      {/* Section 4: Bottom CTA inside Catalog */}
      <section className="py-24 bg-background">
         <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div 
               initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
               className="relative rounded-[2rem] bg-[#10131C] border border-white/5 p-12 overflow-hidden shadow-2xl"
            >
               <div className="absolute inset-0 gradient-primary opacity-10 blur-3xl -z-10" />
               <p className="text-[10px] font-bold tracking-widest uppercase text-primary mb-4">Pronto para começar?</p>
               <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">Crie agora seu catálogo e comece a vender mais.</h2>
               <p className="text-[15px] text-muted-foreground mb-10">É rápido, fácil e gratuito para começar.</p>
               
               <div className="flex flex-col items-center gap-6">
                  <Link to="/login" search={{ mode: "signup" }} className="group h-12 px-8 rounded-xl gradient-primary text-white text-[15px] font-semibold inline-flex items-center gap-2 glow-primary hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300">
                     Começar grátis <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <div className="flex flex-wrap items-center justify-center gap-6 text-[12px] text-muted-foreground">
                     <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Sem cartão de crédito</span>
                     <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Setup em 2 minutos</span>
                     <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Cancele quando quiser</span>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>
    </>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: "O que é o GestãoShop?",
      answer: "É uma plataforma completa (all-in-one) que integra ERP, CRM, gestão financeira e catálogo de vendas em um único lugar, permitindo escalar sua operação com automações e inteligência artificial."
    },
    {
      question: "Preciso de cartão de crédito para testar?",
      answer: "Não. Você pode começar seu teste gratuito de 3 dias sem cadastrar nenhum cartão de crédito e explorar todas as funcionalidades sem compromisso."
    },
    {
      question: "A plataforma funciona no celular?",
      answer: "Sim. O GestãoShop é totalmente responsivo e permite que você controle seu negócio de qualquer dispositivo, seja computador, tablet ou smartphone."
    },
    {
      question: "Posso cancelar minha assinatura a qualquer momento?",
      answer: "Com certeza. Não possuímos contratos de fidelidade. Você pode cancelar ou alterar seu plano quando desejar, diretamente pelo painel."
    },
    {
      question: "Há suporte caso eu tenha dúvidas?",
      answer: "Sim! Oferecemos suporte rápido e eficiente via chat e e-mail para todos os nossos clientes, garantindo que você nunca fique travado na operação."
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-surface/30 border-t border-border/40">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-[11px] font-bold tracking-widest uppercase text-primary mb-6"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="text-gradient-primary">TIRE SUAS DÚVIDAS</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
          >
            Perguntas Frequentes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground"
          >
            Tudo o que você precisa saber sobre o GestãoShop.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/40">
                <AccordionTrigger className="text-left text-[15px] font-semibold hover:text-primary hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-[14px] leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

const plans = [
  { 
    name: "Starter", 
    price: "R$ 9,90", 
    desc: "Para pequenos negócios.", 
    features: ["1 Catálogo Digital", "Até 10 produtos", "1 foto por produto", "Dashboard de vendas", "Suporte via E-mail"], 
    cta: "Assinar Starter", 
    highlight: false 
  },
  { 
    name: "Pro", 
    price: "R$ 14,90", 
    desc: "Para escalar sua operação.", 
    features: ["5 Catálogos Digitais", "Até 60 produtos por catálogo", "5 fotos por produto", "Personalização de cores", "Suporte prioritário via WhatsApp"], 
    cta: "Assinar Pro", 
    highlight: true 
  },
  { 
    name: "Elite", 
    price: "R$ 19,90", 
    desc: "Operação nível enterprise.", 
    features: ["10 Catálogos Digitais", "Até 500 produtos por catálogo", "10 fotos por produto", "Remoção da marca d'água", "Capa personalizada"], 
    cta: "Assinar Elite", 
    highlight: false 
  },
];

function Pricing() {
  return (
    <section id="pricing" className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex flex-col items-center w-full max-w-5xl mx-auto text-center mb-14">
         <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-[11px] font-bold tracking-widest uppercase text-primary mb-6"
         >
            <CreditCard className="h-3.5 w-3.5" />
            <span className="text-gradient-primary">PLANOS</span>
         </motion.div>
        <h2 className="text-3xl md:text-4xl lg:whitespace-nowrap font-bold tracking-tight text-foreground">Preço transparente. Escala sem surpresas.</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className={`relative rounded-2xl p-6 border transition-all duration-500 group ${p.highlight ? "border-primary/40 bg-card glow-primary" : "border-border bg-card hover:border-primary/50"} shadow-card hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1`}
          >
            {p.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full gradient-primary text-white text-[10px] font-bold tracking-widest uppercase">Mais popular</div>
            )}
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">{p.desc}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-semibold font-mono-tabular">{p.price}</span>
              {p.price !== "Custom" && <span className="text-xs text-muted-foreground">/mês</span>}
            </div>
            <ul className="mt-5 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13px]">
                  <Check className={`h-4 w-4 mt-0.5 shrink-0 ${p.highlight ? "text-primary" : "text-success"}`} />
                  <span className="text-foreground/90">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/login"
              search={{ mode: "signup" }}
              className={`mt-6 w-full h-10 rounded-lg text-[13px] font-semibold flex items-center justify-center transition ${p.highlight ? "gradient-primary text-white hover:opacity-90" : "bg-surface border border-border hover:border-border-strong"}`}
            >
              {p.cta}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="max-w-5xl mx-auto px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl p-12 text-center border border-primary/30 glass"
      >
        <div className="absolute inset-0 gradient-primary opacity-15" />
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full gradient-primary opacity-30 blur-3xl" />
        <div className="relative">
          <Zap className="h-8 w-8 mx-auto text-primary mb-4" />
          <h3 className="text-3xl md:text-4xl font-semibold tracking-tight">Pronto para operar como uma startup Series A?</h3>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Junte-se a 12.000+ empresas que escalam com GestãoShop.</p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/login" search={{ mode: "signup" }} className="group h-12 px-6 rounded-xl gradient-primary text-white text-[14px] font-semibold inline-flex items-center gap-2 glow-primary hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300">
              Começar grátis <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />)}
              <span className="ml-1.5">4.9/5 · 1.200+ reviews</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 py-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <img src={Icon} alt="GestãoShop" className="h-8 w-8" />
          <span>© 2025 GestãoShop. Todos os direitos reservados.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/admin" className="hover:text-primary transition font-medium">Acesso Administrativo</Link>
          <a href="#" className="hover:text-foreground transition">Termos</a>
          <a href="#" className="hover:text-foreground transition">Privacidade</a>
          <a href="#" className="hover:text-foreground transition">Status</a>
        </div>
      </div>
    </footer>
  );
}
