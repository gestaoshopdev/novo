import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Settings, User, Crown, Calendar, Eye, EyeOff,
  ShoppingBag, DollarSign, TrendingUp, Package,
  Zap, BarChart3, Receipt, Wallet, Layers,
  Mail, ShieldCheck, CreditCard, HelpCircle, Trash2,
  Bell, CheckCircle2, AlertTriangle, Clock, MessageCircle, Users, GraduationCap,
  ChevronUp, ChevronDown
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useSales, useProducts, useCategories, useChannels, usePaymentMethods } from "@/hooks/useQueries";
import { uploadBase64Image } from "@/lib/api";
import { formatBRL } from "@/components/sales/types";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { UpgradePlanModal } from "@/components/billing/UpgradePlanModal";
import { ImageCropModal } from "@/components/ui/image-crop-modal";

import { useProfile } from "@/contexts/ProfileContext";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useNotifications } from "@/contexts/NotificationContext";
import { NumberInput } from "@/components/ui/number-input";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Configurações · Atlas Suite" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { name, photo, updateProfile, plan, planStatus, planExpiry, daysRemaining } = useProfile();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const search = (Route as any).useSearch();
  const [activeTab, setActiveTab] = useState(search?.tab || "visao-geral");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  useEffect(() => {
    if (search?.tab) {
      setActiveTab(search.tab);
    }
  }, [search?.tab]);
  const [localName, setLocalName] = useState(name);
  const [profileImage, setProfileImage] = useState<string | null>(photo);

  useEffect(() => {
    setLocalName(name);
    setProfileImage(photo);
  }, [name, photo]);
  
  // Company States
  const [companyName, setCompanyName] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("company_name") || "" : ""));
  const [companyPhone, setCompanyPhone] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("company_phone") || "" : ""));
  const [companyEmail, setCompanyEmail] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("company_email") || "" : ""));
  const [companyAddress, setCompanyAddress] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("company_address") || "" : ""));
  const [companyBairro, setCompanyBairro] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("company_bairro") || "" : ""));
  const [companyCidade, setCompanyCidade] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("company_cidade") || "" : ""));
  const [companyUF, setCompanyUF] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("company_uf") || "" : ""));
  const [companyCEP, setCompanyCEP] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("company_cep") || "" : ""));
  const [companyCNPJ, setCompanyCNPJ] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("company_cnpj") || "" : ""));
  const [companyLogo, setCompanyLogo] = useState<string | null>(() => (typeof window !== "undefined" ? localStorage.getItem("company_logo") || null : null));
  
  const { data: sales = [] } = useSales();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: channels = [] } = useChannels();
  const { data: paymentMethods = [] } = usePaymentMethods();
  const { addNotification } = useNotifications();
  
  // Notifications Preferences State
  const [prefs, setPrefs] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("atlas_notification_prefs");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          vendas: true,
          estoque: true,
          metas: true,
          sistema: false,
          email: true,
          push: true,
          ...parsed,
          estoqueMinimo: parsed.estoqueMinimo || 5,
          metaMensal: parsed.metaMensal || 5000
        };
      }
    }
    return {
      vendas: true,
      estoque: true,
      metas: true,
      sistema: false,
      email: true,
      push: true,
      estoqueMinimo: 5,
      metaMensal: 5000
    };
  });

  useEffect(() => {
    localStorage.setItem("atlas_notification_prefs", JSON.stringify(prefs));
  }, [prefs]);

  const handleSaveNotifs = () => {
    toast.success("Preferências de notificação salvas!");
  };

  const handleTestNotif = () => {
    const types = [];
    if (prefs.vendas) types.push({ title: "Nova Venda", desc: "Uma venda de R$ 120,00 foi realizada.", type: "success" });
    if (prefs.estoque) types.push({ title: "Estoque Baixo", desc: "O item 'Produto Teste' está acabando.", type: "warning" });
    if (prefs.metas) types.push({ title: "Meta de Vendas", desc: "Você atingiu 50% da sua meta!", type: "info" });
    
    if (types.length === 0) {
      return toast.error("Ative pelo menos uma categoria para testar.");
    }

    const random = types[Math.floor(Math.random() * types.length)];
    addNotification({
      title: random.title,
      desc: random.desc,
      type: random.type as any
    });
  };

  const handlePhotoClick = () => {
    document.getElementById("photo-upload")?.click();
  };

  // Crop Modal States
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string>("");
  const [cropTarget, setCropTarget] = useState<"profile" | "logo">("profile");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropSrc(reader.result as string);
        setCropTarget("profile");
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropSrc(reader.result as string);
        setCropTarget("logo");
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBase64: string) => {
    if (cropTarget === "profile") {
      setProfileImage(croppedBase64);
    } else {
      setCompanyLogo(croppedBase64);
    }
  };

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const handleSavePersonal = async () => {
    setIsSavingProfile(true);
    try {
      const finalPhoto = await uploadBase64Image(profileImage || "", "perfil");
      updateProfile(localName, finalPhoto);
      setProfileImage(finalPhoto);
      toast.success("Informações pessoais salvas com sucesso!");
    } catch (e) {
      toast.error("Erro ao salvar foto de perfil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const handleSaveCompany = async () => {
    if (typeof window !== "undefined") {
      setIsSavingCompany(true);
      try {
        const finalLogo = companyLogo ? await uploadBase64Image(companyLogo, "perfil") : null;
        if (finalLogo) setCompanyLogo(finalLogo);
        
        localStorage.setItem("company_name", companyName);
        localStorage.setItem("company_phone", companyPhone);
        localStorage.setItem("company_email", companyEmail);
        localStorage.setItem("company_address", companyAddress);
        localStorage.setItem("company_bairro", companyBairro);
        localStorage.setItem("company_cidade", companyCidade);
        localStorage.setItem("company_uf", companyUF);
        localStorage.setItem("company_cep", companyCEP);
        localStorage.setItem("company_cnpj", companyCNPJ);
        if (finalLogo) localStorage.setItem("company_logo", finalLogo);
        else localStorage.removeItem("company_logo");
        
        toast.success("Dados da empresa salvos com sucesso!");
      } catch (e) {
        toast.error("Erro ao salvar a logo da empresa.");
      } finally {
        setIsSavingCompany(false);
      }
    }
  };

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
    toast.info("Sessão encerrada");
  };

  const handleChangePassword = () => {
    setChangePasswordOpen(true);
  };

  const [clearDataOpen, setClearDataOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const handleClearData = () => {
    setClearDataOpen(true);
  };

  const handleDeleteAccount = () => {
    setDeleteAccountOpen(true);
  };

  const executeDeleteAccount = async () => {
    const toastId = toast.loading("Excluindo sua conta...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado");

      // 1. Limpar dados operacionais no Supabase apenas deste usuário
      // Deletar os produtos primeiro pode resolver problemas de cascade com sale_items dependendo de como o banco está configurado
      await supabase.from("products").delete().eq("user_id", user.id);
      await supabase.from("sales").delete().eq("user_id", user.id);
      await supabase.from("categories").delete().eq("user_id", user.id);
      await supabase.from("channels").delete().eq("user_id", user.id);
      await supabase.from("payment_methods").delete().eq("user_id", user.id);
      await supabase.from("expenses").delete().eq("user_id", user.id);
      await supabase.from("expense_categories").delete().eq("user_id", user.id);

      // Chamada RPC para deletar o usuário da Auth
      const { error: rpcError } = await supabase.rpc('delete_user');
      if (rpcError) console.error("RPC delete_user falhou, os dados operacionais foram apagados:", rpcError);

      // 2. Limpar LocalStorage
      if (typeof window !== "undefined") {
        localStorage.clear();
      }

      toast.success("Conta excluída com sucesso!", { id: toastId });
      
      // 3. Sair e redirecionar
      setTimeout(async () => {
        await signOut();
        navigate({ to: "/login" });
      }, 1500);
    } catch (err: any) {
      toast.error(`Erro ao excluir conta: ${err.message}`, { id: toastId });
    }
  };

  const executeClearData = async () => {
    const toastId = toast.loading("Limpando seus dados...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Deletar usando user_id é mais seguro e resolve o problema de tabelas que não possuem coluna 'id' (como products que usa 'sku')
      const resSales = await supabase.from("sales").delete().eq("user_id", user.id);
      const resProducts = await supabase.from("products").delete().eq("user_id", user.id);
      const resExpenses = await supabase.from("expenses").delete().eq("user_id", user.id);

      if (resSales.error || resProducts.error || resExpenses.error) {
        console.error("Sales:", resSales.error, "Products:", resProducts.error, "Expenses:", resExpenses.error);
        const firstError = resSales.error?.message || resProducts.error?.message || resExpenses.error?.message;
        throw new Error(firstError);
      }

      toast.success("Dados limpos com sucesso!", { id: toastId });
      setClearDataOpen(false);
      
      // Delay pequeno para o usuário ver o sucesso antes de recarregar
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      toast.error(`Erro ao limpar dados: ${err.message}`, { id: toastId });
    }
  };


  const stats = useMemo(() => {
    const revenue = sales.reduce((acc, s) => acc + s.total, 0);
    const profit = sales.reduce((acc, s) => acc + s.profit, 0);
    const avgTicket = sales.length > 0 ? revenue / sales.length : 0;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { revenue, profit, avgTicket, margin };
  }, [sales]);

  return (
    <div className="space-y-6 pb-10">
      {/* Profile Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-sm p-6 lg:p-8"
      >
        <div className="absolute top-0 right-0 p-4 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
          <Eye className="h-5 w-5" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-success/20 border-4 border-background flex items-center justify-center relative overflow-hidden group">
             {profileImage ? (
               <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
             ) : (
               <span className="text-4xl font-bold text-success">
                 {(name || user?.email || "U").charAt(0).toUpperCase()}
               </span>
             )}
          </div>
          
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{name || user?.email?.split('@')[0] || "Usuário"}</h1>
            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
              {user?.email}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                planStatus === "expired" ? "bg-red-500/15 text-red-500 border-red-500/20" : "bg-warning/15 text-warning border-warning/20"
              )}>
                <Crown className="h-3 w-3" /> {planStatus === "trial" ? "Teste Grátis" : planStatus === "expired" ? "Plano Expirado" : "Plano Ativo"}
              </span>
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                daysRemaining <= 3 ? "bg-red-500/15 text-red-500 border-red-500/20" : "bg-success/15 text-success border-success/20"
              )}>
                <Calendar className="h-3 w-3" /> {daysRemaining} {daysRemaining === 1 ? "dia" : "dias"}
              </span>
              {planExpiry && (
                <span className="text-xs text-muted-foreground ml-1">
                  Expira em {new Date(planExpiry).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total de Vendas" value={sales.length.toString()} icon={ShoppingBag} color="blue" />
        <SummaryCard label="Receita Total" value={formatBRL(stats.revenue)} icon={DollarSign} color="green" />
        <SummaryCard label="Lucro Líquido" value={formatBRL(stats.profit)} icon={TrendingUp} color="purple" />
        <SummaryCard label="Produtos" value={products.length.toString()} icon={Package} color="orange" />
      </div>

      {/* Tabs */}
      <div className="bg-card/50 border border-border p-1 rounded-xl flex overflow-x-auto no-scrollbar">
        <TabButton active={activeTab === "visao-geral"} onClick={() => setActiveTab("visao-geral")}>Visão Geral</TabButton>
        <TabButton active={activeTab === "assinatura"} onClick={() => setActiveTab("assinatura")}>Assinatura</TabButton>
        <TabButton active={activeTab === "configuracoes"} onClick={() => setActiveTab("configuracoes")}>Configurações</TabButton>
        <TabButton active={activeTab === "notificacoes"} onClick={() => setActiveTab("notificacoes")}>Notificações</TabButton>
        <TabButton active={activeTab === "ajuda"} onClick={() => setActiveTab("ajuda")}>Ajuda</TabButton>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "visao-geral" && (
          <div className="space-y-6">
            {/* Quick Shortcuts */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-foreground" />
                <h3 className="font-bold">Atalhos Rápidos</h3>
              </div>
              <p className="text-sm text-muted-foreground">Acesso rápido às principais funcionalidades do sistema</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                <Shortcut to="/app/sales" icon={ShoppingBag} label="Vendas" color="blue" />
                <Shortcut to="/app/products" icon={Package} label="Produtos" color="green" />
                <Shortcut to="/app/reports" icon={BarChart3} label="Relatórios" color="purple" />
                <Shortcut to="/app/analytics" icon={TrendingUp} label="Analytics" color="orange" />
                <Shortcut to="/app/expenses" icon={Receipt} label="Despesas" color="red" />
                <Shortcut to="/app/categories" icon={Layers} label="Categorias" color="indigo" />
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Info */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-foreground" />
                  <h3 className="font-bold">Informações da Conta</h3>
                </div>
                
                <div className="space-y-4">
                  <InfoItem label="Email" value={user?.email || ""} icon={Mail} />
                  <InfoItem label="Status" value={planStatus === "trial" ? "Trial" : planStatus === "expired" ? "Expirado" : "Ativo"} icon={ShieldCheck} badge={planStatus === "expired" ? "destructive" : "success"} />
                  <InfoItem label="Tipo de Plano" value={plan} icon={CreditCard} />
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-foreground" />
                  <h3 className="font-bold">Estatísticas Detalhadas</h3>
                </div>
                
                <div className="space-y-3.5">
                  <StatRow label="Categorias" value={categories.length.toString()} />
                  <StatRow label="Receita Total" value={formatBRL(stats.revenue)} />
                  <StatRow label="Lucro Bruto" value={formatBRL(stats.revenue - (stats.revenue * 0.4))} />
                  <StatRow label="Despesas" value="R$ 0,00" negative />
                  <StatRow label="Ticket Médio" value={formatBRL(stats.avgTicket)} />
                  <StatRow label="Margem de Lucro" value={`${stats.margin.toFixed(2)}%`} success />
                  <div className="h-px bg-border my-2" />
                  <StatRow label="Canais de Venda" value={channels.length.toString()} bold />
                  <StatRow label="Formas de Pagamento" value={paymentMethods.length.toString()} bold />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border/50 text-center space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Diagnóstico de Conta</p>
              <p className="text-[11px] text-muted-foreground select-all bg-background/50 inline-block px-2 py-1 rounded border border-border">ID: {user?.id}</p>
            </div>
          </div>
        )}

        {activeTab === "assinatura" && (
          <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-warning" />
                <h3 className="text-xl font-bold tracking-tight">Seu Plano</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Gerencie sua assinatura, renove ou faça upgrade.</p>
            </div>

            {/* Expiration Card */}
            <div className="bg-background/40 border border-border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    planStatus === "expired" ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
                  )}>
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {planStatus === "expired" ? "Expirado em" : "Expira em"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {planStatus === "expired" ? "Sua assinatura acabou" : `Restam ${daysRemaining} ${daysRemaining === 1 ? "dia" : "dias"} de acesso`}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "text-lg font-bold",
                  planStatus === "expired" ? "text-red-500" : "text-primary"
                )}>
                  {planExpiry ? new Date(planExpiry).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : "—"}
                </span>
              </div>
            </div>

            {/* Alert Box */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3">
              <HelpCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-500/90 leading-relaxed">
                Ao <span className="font-bold">renovar</span> o mesmo plano, o tempo restante é somado. Ao fazer <span className="font-bold">upgrade</span>, o novo plano começa a partir de hoje (dias restantes não são transferidos). Sem renovação automática.
              </p>
            </div>

            {/* Action Button */}
            <button 
              onClick={() => setUpgradeModalOpen(true)}
              className="w-full gradient-primary glow-primary border-transparent hover:opacity-90 text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-opacity shadow-lg"
            >
              <Crown className="h-4 w-4" /> Ver Planos e Fazer Upgrade
            </button>
          </div>
        )}

        {activeTab === "configuracoes" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Configurações da Conta</h2>
              <p className="text-sm text-muted-foreground mt-1">Gerencie suas informações pessoais, dados da empresa e segurança.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Personal and Company Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Informações Pessoais */}
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border/50 pb-4">
                    <User className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold">Informações Pessoais</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nome</Label>
                      <Input 
                        placeholder="Digite seu nome" 
                        value={localName}
                        onChange={(e) => setLocalName(e.target.value)}
                        className="bg-background/50 h-11" 
                      />
                      <p className="text-[11px] text-muted-foreground">Seu nome será exibido no perfil e na sidebar</p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Foto de Perfil</Label>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-success/20 border-2 border-border flex items-center justify-center text-2xl font-bold text-success overflow-hidden">
                          {profileImage ? (
                            <img src={profileImage} alt="Preview" className="h-full w-full object-cover" />
                          ) : (
                            (name || user?.email || "U").charAt(0).toUpperCase()
                          )}
                        </div>
                        <input 
                          type="file" 
                          id="photo-upload" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handlePhotoChange} 
                        />
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          className="gap-2 h-9 border-border bg-background/50"
                          onClick={handlePhotoClick}
                        >
                          <Zap className="h-3.5 w-3.5" /> Adicionar Foto
                        </Button>
                        <p className="text-[11px] text-muted-foreground">Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB</p>
                      </div>
                    </div>

                    <Button 
                      onClick={handleSavePersonal}
                      className="gradient-primary glow-primary border-transparent hover:opacity-90 text-white gap-2 font-bold h-10 px-6 mt-2 transition-opacity shadow-lg"
                    >
                       <User className="h-4 w-4" /> Salvar Alterações
                    </Button>
                  </div>
                </div>

                {/* Dados da Empresa */}
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
                  <div className="space-y-1 border-b border-border/50 pb-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-bold">Dados da Empresa</h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">Usados em recibos de venda. Todos os campos são opcionais. Para gerar recibos, preencha pelo menos o <span className="font-bold">nome da empresa</span> e um <span className="font-bold">contato</span>.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nome da empresa</Label>
                      <Input 
                        placeholder="Ex: Centro Automotivo Gama" 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="bg-background/50 h-11" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Telefone</Label>
                        <Input 
                          placeholder="(17) 99999-8888" 
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          className="bg-background/50 h-11" 
                        />
                      </div>
                       <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">E-mail</Label>
                        <Input 
                          placeholder="contato@empresa.com" 
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          className="bg-background/50 h-11" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Endereço da empresa</Label>
                      <textarea 
                        placeholder="Rua, número, complemento, referência..." 
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        className="w-full rounded-lg bg-background/50 border border-border p-3 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="Bairro" value={companyBairro} onChange={(e) => setCompanyBairro(e.target.value)} className="bg-background/50 h-11" />
                      <Input placeholder="Cidade" value={companyCidade} onChange={(e) => setCompanyCidade(e.target.value)} className="bg-background/50 h-11" />
                      <Input placeholder="UF" value={companyUF} onChange={(e) => setCompanyUF(e.target.value)} className="bg-background/50 h-11" />
                      <Input placeholder="CEP" value={companyCEP} onChange={(e) => setCompanyCEP(e.target.value)} className="bg-background/50 h-11" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CPF / CNPJ</Label>
                      <Input 
                        placeholder="CPF ou CNPJ" 
                        value={companyCNPJ}
                        onChange={(e) => setCompanyCNPJ(e.target.value)}
                        className="bg-background/50 h-11 max-w-sm" 
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Logo da empresa (opcional)</Label>
                      <p className="text-[11px] text-muted-foreground">Aparece no cabeçalho do recibo de venda. JPG, PNG ou GIF, máx. 2MB.</p>
                      
                      {companyLogo && (
                        <div className="h-20 w-40 rounded-lg border border-border bg-background/50 overflow-hidden mb-2">
                          <img src={companyLogo} alt="Logo Preview" className="h-full w-full object-contain p-2" />
                        </div>
                      )}

                      <input 
                        type="file" 
                        id="logo-upload" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleLogoChange} 
                      />
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm" 
                        className="gap-2 h-9 border-border bg-background/50"
                        onClick={() => document.getElementById("logo-upload")?.click()}
                      >
                        <Zap className="h-3.5 w-3.5" /> Enviar logo
                      </Button>
                    </div>

                    <Button 
                      onClick={handleSaveCompany}
                      className="bg-slate-800 hover:bg-slate-700 text-white gap-2 font-bold h-10 px-6 mt-4"
                    >
                       <Package className="h-4 w-4" /> Salvar Dados da Empresa
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column: Security & Danger Zone */}
              <div className="space-y-6">
                {/* Segurança */}
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border/50 pb-4">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold">Segurança</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email da Conta</Label>
                      <Input value={user?.email || ""} readOnly className="bg-background/30 h-11 text-muted-foreground" />
                      <p className="text-[11px] text-muted-foreground">O email não pode ser alterado. Entre em contato com o suporte se necessário.</p>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-background/30 space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-bold">
                          <ShieldCheck className="h-4 w-4" /> Senha
                        </div>
                        <p className="text-[11px] text-muted-foreground">Mantenha sua conta segura com uma senha forte</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleChangePassword}
                        className="w-full h-9 border-border bg-background/50"
                      >
                        Alterar Senha
                      </Button>
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={handleSignOut}
                      className="w-full gap-2 h-10 border-border bg-background/50 hover:bg-surface"
                    >
                      <Zap className="h-4 w-4 rotate-180" /> Sair da Conta
                    </Button>
                  </div>
                </div>




              </div>
            </div>

            <ChangePasswordModal open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
            <ClearDataModal open={clearDataOpen} onOpenChange={setClearDataOpen} onConfirm={executeClearData} />
            <DeleteAccountModal open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen} onConfirm={executeDeleteAccount} />
            <ImageCropModal 
              open={cropModalOpen}
              onOpenChange={setCropModalOpen}
              imageSrc={cropSrc}
              aspect={cropTarget === "profile" ? 1 : undefined}
              onCropComplete={handleCropComplete}
              title={cropTarget === "profile" ? "Recortar Foto de Perfil" : "Recortar Logo"}
              description={cropTarget === "profile" ? "Ajuste sua foto para o formato circular." : "Ajuste o enquadramento da logo da sua empresa."}
            />
          </div>
        )}

        {activeTab === "notificacoes" && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-xl font-bold tracking-tight">Preferências de Notificação</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Escolha como e quando você quer ser alertado</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleTestNotif}
                  className="h-9 gap-2"
                >
                  <Zap className="h-4 w-4" /> Testar Notificações
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                {/* Vendas & Financeiro */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">
                    <ShoppingBag className="h-4 w-4" /> Vendas & Financeiro
                  </div>
                  
                  <NotificationToggle 
                    title="Novas Vendas" 
                    desc="Receba um alerta sempre que uma nova venda for registrada." 
                    checked={prefs.vendas}
                    onChange={(v) => setPrefs({...prefs, vendas: v})}
                  />
                  
                  <div className="p-4 rounded-xl border border-border bg-background/30 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold">Metas de Faturamento</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">Avisar quando você atingir 50%, 80% e 100% da sua meta.</p>
                      </div>
                      <Switch checked={prefs.metas} onCheckedChange={(v) => setPrefs({...prefs, metas: v})} />
                    </div>
                    
                    {prefs.metas && (
                      <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                        <Label className="text-[12px] text-muted-foreground">Sua meta mensal (R$):</Label>
                        <div className="flex items-center gap-2">
                          <NumberInput 
                            className="w-32"
                            prefix="R$"
                            value={prefs.metaMensal}
                            onChange={(v) => setPrefs({...prefs, metaMensal: v})}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estoque & Produtos */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">
                    <Package className="h-4 w-4" /> Estoque & Produtos
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-background/30 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold">Estoque Baixo</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">Alerta automático quando um produto atingir o limite mínimo.</p>
                      </div>
                      <Switch checked={prefs.estoque} onCheckedChange={(v) => setPrefs({...prefs, estoque: v})} />
                    </div>
                    
                    {prefs.estoque && (
                      <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                        <Label className="text-[12px] text-muted-foreground">Notificar quando estoque for menor que</Label>
                        <div className="flex items-center gap-2">
                          <NumberInput 
                            className="w-32"
                            suffix="unid."
                            value={prefs.estoqueMinimo}
                            onChange={(v) => setPrefs({...prefs, estoqueMinimo: v})}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <NotificationToggle 
                    title="Relatórios do Sistema" 
                    desc="Avisar quando novos relatórios mensais forem gerados." 
                    checked={prefs.sistema}
                    onChange={(v) => setPrefs({...prefs, sistema: v})}
                  />
                </div>

              </div>

              <div className="pt-4 flex items-center justify-end border-t border-border mt-8">
                <Button 
                  onClick={handleSaveNotifs}
                  className="gradient-primary glow-primary border-transparent hover:opacity-90 text-white font-bold h-11 px-8 rounded-xl shadow-lg transition-opacity"
                >
                  Salvar Preferências
                </Button>
              </div>
            </div>
          </div>
        )}
        {activeTab === "ajuda" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Canais de Suporte */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-bold tracking-tight text-white">Precisa de Ajuda?</h2>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Tem dúvidas ou encontrou algum problema? Nossa equipe está pronta para ajudar você.
                    </p>
                  </div>

                  <button className="flex items-center gap-3 px-6 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all font-bold text-sm">
                    <Mail className="h-4 w-4" /> Enviar Email para Suporte
                  </button>
                </div>

                <div className="p-1 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/20">
                  <div className="p-8 rounded-[14px] bg-[#0c1a14]/60 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white">Junte-se à Nossa Comunidade</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                          Conecte-se com outros empreendedores, compartilhe experiências e receba dicas exclusivas.
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-success/20 flex items-center justify-center text-success shrink-0">
                        <MessageCircle className="h-6 w-6" />
                      </div>
                    </div>
                    
                    <a 
                      href="https://chat.whatsapp.com/EduDgMfANTaAy3EINb7bfw" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full h-12 flex items-center justify-center gap-2.5 rounded-xl bg-success hover:bg-success/90 text-white font-bold shadow-lg shadow-success/20 transition-all"
                    >
                      Entrar no Grupo do WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Informações e Tutoriais */}
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Informações de Contato</h4>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-background/30 border border-border/60 space-y-1">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">E-mail de Suporte</p>
                      <p className="text-sm font-bold text-white/90">gestaoshop.suporte@gmail.com</p>
                    </div>

                    <div className="p-4 rounded-xl bg-background/30 border border-border/60 space-y-1">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Horário de Atendimento</p>
                      <p className="text-sm font-bold text-white/90">Segunda a Sexta, 9h às 18h</p>
                    </div>
                  </div>
                </div>

                <Link to="/app/tutorials" className="flex items-center justify-between p-6 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all group">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">Tutoriais e Guias</p>
                    <p className="text-xs text-muted-foreground">Aprenda a usar o sistema</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <UpgradePlanModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    purple: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  };

  return (
    <div className={cn("rounded-2xl border p-5 space-y-3 bg-card", colors[color])}>
      <div className="h-10 w-10 rounded-xl bg-background/50 flex items-center justify-center shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-xs font-medium opacity-80 mt-1">{label}</p>
      </div>
    </div>
  );
}



function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Shortcut({ to, icon: Icon, label, color }: { to: string; icon: any; label: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-500 bg-blue-500/5 hover:bg-blue-500/10",
    green: "text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10",
    purple: "text-violet-500 bg-violet-500/5 hover:bg-violet-500/10",
    orange: "text-orange-500 bg-orange-500/5 hover:bg-orange-500/10",
    red: "text-rose-500 bg-rose-500/5 hover:bg-rose-500/10",
    indigo: "text-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10",
  };

  return (
    <Link 
      to={to}
      className={cn(
        "flex flex-col items-center gap-3 p-4 rounded-xl border border-border hover:border-border-strong transition-all",
        colors[color]
      )}
    >
      <div className="h-10 w-10 rounded-xl bg-background/50 flex items-center justify-center shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-bold text-foreground">{label}</span>
    </Link>
  );
}

function InfoItem({ label, value, icon: Icon, badge }: { label: string; value: string; icon: any; badge?: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
        {label}
      </p>
      <div className="flex items-center gap-3">
        {badge === "success" ? (
           <span className="text-sm font-bold text-success flex items-center gap-2">
             <Crown className="h-3.5 w-3.5" /> {value}
           </span>
        ) : (
          <span className="text-sm font-bold text-foreground">{value}</span>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value, negative, success, bold }: { label: string; value: string; negative?: boolean; success?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(
        "font-bold font-mono-tabular",
        negative ? "text-destructive" : success ? "text-success" : "text-foreground",
        bold && "text-base"
      )}>
        {value}
      </span>
    </div>
  );
}

function NotificationToggle({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-background/30 hover:border-border-strong transition-colors">
      <div className="space-y-0.5">
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ChangePasswordModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("Preencha todos os campos");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("As novas senhas não coincidem");
    }

    if (newPassword.length < 6) {
      return toast.error("A nova senha deve ter no mínimo 6 caracteres");
    }

    setIsPending(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;

      toast.success("Senha alterada com sucesso!");
      onOpenChange(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] p-0 overflow-hidden bg-card border-border shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-xl font-bold tracking-tight">Alterar Senha</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Senha Atual</Label>
            <div className="relative">
              <Input 
                type={showCurrent ? "text" : "password"} 
                placeholder="••••••••" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-background border-border h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nova Senha</Label>
            <div className="relative">
              <Input 
                type={showNew ? "text" : "password"} 
                placeholder="••••••••" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-background border-border h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input 
                type={showConfirm ? "text" : "password"} 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background border-border h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="px-4 h-11 font-medium hover:bg-background"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-success hover:bg-success/90 text-success-foreground px-8 h-11 font-bold shadow-lg shadow-success/20"
            >
              {isPending ? "Alterando..." : "Confirmar Alteração"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ClearDataModal({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (v: boolean) => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-0 overflow-hidden bg-[#0c0c0e] border-[#1c1c1f] shadow-2xl">
        <DialogHeader className="px-8 py-6 border-b border-[#1c1c1f]">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Layers className="h-5 w-5 text-orange-500" />
             </div>
             <DialogTitle className="text-xl font-bold tracking-tight text-white">Limpar todos os dados</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Você está prestes a apagar permanentemente <span className="text-orange-500 font-bold">todas as vendas, produtos, categorias e canais de venda</span>.
            </p>
            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
              <p className="text-xs text-orange-500/90 leading-relaxed font-medium">
                Sua conta, e-mail, senha e dados da empresa serão mantidos. Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={onConfirm}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20"
            >
              Sim, desejo limpar meus dados
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="w-full h-12 font-medium text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              Cancelar e voltar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAccountModal({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (v: boolean) => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-0 overflow-hidden bg-[#0c0c0e] border-[#1c1c1f] shadow-2xl">
        <DialogHeader className="px-8 py-6 border-b border-[#1c1c1f]">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
             </div>
             <DialogTitle className="text-xl font-bold tracking-tight text-white">Excluir sua conta?</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Esta ação é <span className="text-destructive font-bold uppercase">irreversível</span>. Todos os seus dados de vendas, produtos, configurações e informações da empresa serão <span className="text-destructive font-bold">DELETADOS PARA SEMPRE</span>.
            </p>
            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10">
              <p className="text-xs text-destructive/90 leading-relaxed font-medium">
                Você não poderá recuperar esses dados após confirmar. Sua conta no Atlas Suite será encerrada permanentemente.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={onConfirm}
              className="w-full bg-destructive hover:bg-destructive/90 text-white h-12 font-bold text-sm rounded-xl shadow-lg shadow-destructive/20"
            >
              Sim, tenho certeza e quero excluir
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="w-full h-12 font-medium text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              Não, manter minha conta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

