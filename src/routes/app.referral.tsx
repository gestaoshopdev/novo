import { createFileRoute } from "@tanstack/react-router";
import { Gift, Lock, Copy, Share2, DollarSign, TrendingUp, Users, ArrowRight, Wallet, CheckCircle2, Clock, Hourglass, Eye, AlertCircle, FileText, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { getReferralCode, createReferralCode, getCommissions, getPayoutRequests, requestPayout, Commission, ReferralCode } from "@/lib/referrals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UpgradePlanModal } from "@/components/billing/UpgradePlanModal";
import { formatBRL } from "@/components/sales/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/app/referral")({
  head: () => ({ meta: [{ title: "Indique e Ganhe · Atlas Suite" }] }),
  component: ReferralPage,
});

function ReferralPage() {
  const { plan, planStatus, name, isPartner, commissionRate } = useProfile();
  const { user } = useAuth();
  
  const rateToDisplay = isPartner ? `${commissionRate}%` : (plan === 'Elite' ? '20%' : '15%');
  
  const cleanName = (name.split(' ')[0] || "SEUNOME").toUpperCase().replace(/[^A-Z0-9]/g, '');
  const exampleCode = `${cleanName}10`;

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create code state
  const [newCode, setNewCode] = useState("");
  const [isCreatingCode, setIsCreatingCode] = useState(false);

  // Payout state
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [pixName, setPixName] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [simulatedBalance, setSimulatedBalance] = useState(0);
  const [pixType, setPixType] = useState("cpf");
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [selectedPayoutDetails, setSelectedPayoutDetails] = useState<any>(null);
  const [bypassCooldown, setBypassCooldown] = useState(false);

  useEffect(() => {
    if (user && (plan === "Pro" || plan === "Elite") && planStatus !== "trial") {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, plan, planStatus]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const code = await getReferralCode(user.id);
      setReferralCode(code);
      
      const comms = await getCommissions(user.id);
      setCommissions(comms);
      
      const payouts = await getPayoutRequests(user.id);
      setPayoutRequests(payouts);
    } catch (e) {
      console.error("Erro ao buscar dados de afiliado", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async () => {
    if (!user || !newCode) return;
    setIsCreatingCode(true);
    try {
      // Validate code (alphanumeric, max 15 chars)
      const cleanCode = newCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (cleanCode.length < 4) {
        toast.error("O código deve ter pelo menos 4 caracteres.");
        return;
      }
      
      const created = await createReferralCode(user.id, cleanCode);
      setReferralCode(created);
      toast.success("Código de indicação criado com sucesso!");
    } catch (e: any) {
      toast.error(e.message?.includes('duplicate key') ? "Este código já está em uso por outra pessoa." : "Erro ao criar código.");
    } finally {
      setIsCreatingCode(false);
    }
  };

  const handleCopyLink = () => {
    if (!referralCode) return;
    const link = `${window.location.origin}/login?ref=${referralCode.code}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleRequestPayout = async () => {
    if (!user || !pixKey || !pixName) return;

    // Validar cooldown no lado do cliente preventivamente
    const cooldownInfo = getPayoutCooldownInfo();
    if (cooldownInfo.isCooldownActive) {
      toast.error(`Você só pode solicitar um novo saque após ${plan === 'Pro' ? '15' : '5'} dias do último saque. Faltam ${cooldownInfo.daysRemaining} dias.`);
      return;
    }

    setIsRequestingPayout(true);
    try {
      await requestPayout(user.id, Math.floor(availableAmount * 100), pixName, pixKey, pixType);
      toast.success("Solicitação de saque enviada! O pagamento será realizado em até 48 horas.", { duration: 5000 });
      setPayoutModalOpen(false);
      setPixKey("");
      setPixName("");
      fetchData(); // reload
    } catch (e: any) {
      console.error(e);
      toast.error(`Erro ao solicitar saque: ${e?.message || JSON.stringify(e)}`);
    } finally {
      setIsRequestingPayout(false);
    }
  };

  const pendingAmount = commissions.filter(c => c.status === 'pending').reduce((acc, c) => acc + c.amount_cents, 0) / 100;
  const baseAvailableAmount = commissions.filter(c => c.status === 'available').reduce((acc, c) => acc + c.amount_cents, 0) / 100;
  const processingPayoutsAmount = payoutRequests.filter(p => p.status === 'requested').reduce((acc, p) => acc + p.amount_cents, 0) / 100;
  const availableAmount = Math.max(0, baseAvailableAmount - processingPayoutsAmount) + simulatedBalance;
  console.log("DEBUG BALANCES:", {
    baseAvailableAmount,
    processingPayoutsAmount,
    simulatedBalance,
    availableAmount,
    commissionsCount: commissions.length,
    payoutRequestsCount: payoutRequests.length
  });
  const withdrawnAmount = commissions.filter(c => c.status === 'withdrawn').reduce((acc, c) => acc + c.amount_cents, 0) / 100;

  const getPayoutCooldownInfo = () => {
    if (bypassCooldown) {
      return { isCooldownActive: false, daysRemaining: 0, nextPayoutDate: null };
    }

    if (plan !== "Pro" && plan !== "Elite") {
      return { isCooldownActive: false, daysRemaining: 0, nextPayoutDate: null };
    }

    const cooldownDays = plan === "Pro" ? 15 : 5;

    // Achar o último saque que não foi rejeitado (status 'requested' ou 'paid')
    const lastValidPayout = payoutRequests.find(p => p.status !== "rejected");

    if (!lastValidPayout) {
      return { isCooldownActive: false, daysRemaining: 0, nextPayoutDate: null };
    }

    const lastPayoutDate = new Date(lastValidPayout.created_at);
    const nextPayoutDate = new Date(lastPayoutDate.getTime() + cooldownDays * 24 * 60 * 60 * 1000);
    const now = new Date();

    const timeDiff = nextPayoutDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return {
      isCooldownActive: daysRemaining > 0,
      daysRemaining: Math.max(0, daysRemaining),
      nextPayoutDate,
      lastPayoutDate,
    };
  };

  const cooldownInfo = getPayoutCooldownInfo();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Indique e Ganhe" subtitle="Carregando painel de parceiro..." icon={Gift} />
        <div className="flex justify-center p-12"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
      </div>
    );
  }

  // Se for Starter ou plano em teste, mostra tela de bloqueio
  if (plan === "Starter" || !plan || planStatus === "trial") {
    return (
      <div className="space-y-6">
        <PageHeader title="Indique e Ganhe" subtitle="Programa de indicação para parceiros Atlas Suite." icon={Gift} />
        
        <div className="bg-card border border-border rounded-2xl p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
            <Lock className="w-64 h-64" />
          </div>
          
          <div className="max-w-xl mx-auto space-y-6 relative z-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight">Recurso Exclusivo para Assinantes Ativos</h2>
            <p className="text-muted-foreground text-lg">
              Ative sua assinatura (Pro ou Elite) para liberar seu Link de Indicação Exclusivo. 
              Ganhe 15% (Pro) ou 20% (Elite) de comissão recorrente por cada amigo indicado!
            </p>
            
            <div className="pt-4">
              <Button onClick={() => setUpgradeModalOpen(true)} className="gap-2 h-12 px-8 font-bold text-base shadow-lg shadow-primary/20">
                Fazer Upgrade Agora <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <UpgradePlanModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Indique e Ganhe" 
        subtitle={`Você é um parceiro ${plan}. Convide amigos e ganhe ${rateToDisplay} de comissão!`} 
        icon={Gift} 
      />

      {!referralCode ? (
        <div className="bg-card border border-border rounded-2xl p-8 max-w-2xl">
          <h3 className="text-xl font-bold mb-2">Crie seu código de parceiro</h3>
          <p className="text-muted-foreground mb-6">Escolha um código único que será usado nos seus links de indicação. Ex: {exampleCode}</p>
          
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label>Seu Código Exclusivo</Label>
              <Input 
                placeholder="SEU_CODIGO" 
                value={newCode} 
                onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} 
                maxLength={15}
                className="h-12 text-lg font-bold tracking-widest uppercase"
              />
            </div>
            <Button 
              onClick={handleCreateCode} 
              disabled={isCreatingCode || !newCode} 
              className="h-12 px-8 font-bold"
            >
              Criar Código
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Seção de Link e Métricas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Box do Link */}
            <div className="lg:col-span-2 bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 text-primary flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Seu Link de Indicação
                </h3>
                <p className="text-sm text-muted-foreground mb-6">Compartilhe este link. Você ganhará {rateToDisplay} sobre todas as mensalidades pagas por quem se cadastrar por ele.</p>
              </div>
              
              <div className="flex items-center gap-3 bg-background border border-border p-2 rounded-xl">
                <div className="flex-1 px-4 py-2 font-mono text-sm sm:text-base text-foreground bg-muted/30 rounded-lg truncate select-all">
                  {window.location.origin}/login?ref={referralCode.code}
                </div>
                <Button onClick={handleCopyLink} variant="default" className="gap-2 font-bold shrink-0">
                  <Copy className="h-4 w-4" /> Copiar
                </Button>
              </div>
            </div>

            {/* Box de Ação Financeira */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Saldo Disponível</p>
                <p className="text-4xl font-black text-foreground">{formatBRL(availableAmount)}</p>
                {user?.email === 'jcasales15@gmail.com' && (
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                    [Base: {baseAvailableAmount} | Proc: {processingPayoutsAmount} | Sim: {simulatedBalance}]
                  </p>
                )}
              </div>
              <Button 
                onClick={() => setPayoutModalOpen(true)} 
                disabled={availableAmount < 30 || cooldownInfo.isCooldownActive} 
                className="w-full font-bold h-11 bg-success hover:bg-success/90 text-success-foreground"
              >
                {cooldownInfo.isCooldownActive 
                  ? `Saque Bloqueado (${cooldownInfo.daysRemaining}d restantes)` 
                  : "Solicitar Saque (Min. R$ 30)"}
              </Button>
              {cooldownInfo.isCooldownActive && (
                <div className="flex items-start gap-2.5 text-xs text-amber-500 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 text-left w-full mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Carência de Saque Ativa</p>
                    <p className="mt-0.5 text-muted-foreground/80">
                      Você pode solicitar saques a cada {plan === 'Pro' ? '15' : '5'} dias neste plano. Próximo saque disponível em: <strong className="text-foreground">{cooldownInfo.nextPayoutDate?.toLocaleDateString()}</strong>.
                    </p>
                  </div>
                </div>
              )}
              {user?.email === 'jcasales15@gmail.com' && (
                <div className="w-full space-y-2 mt-2">
                  <Button 
                    onClick={() => setSimulatedBalance(prev => prev === 50 ? 0 : 50)} 
                    variant="outline" 
                    className="w-full text-xs h-8 border-dashed border-primary text-primary"
                  >
                    {simulatedBalance === 50 ? "(Teste) Remover Saldo Simulado" : "(Teste) Carregar Saldo de R$ 50"}
                  </Button>
                  <Button 
                    onClick={() => setBypassCooldown(prev => !prev)} 
                    variant="outline" 
                    className="w-full text-xs h-8 border-dashed border-amber-500 text-amber-500 font-medium"
                  >
                    {bypassCooldown ? "(Teste) Ativar Carência Real" : "(Teste) Ignorar Carência (Bypass)"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Saldo Pendente</p>
                <p className="text-2xl font-bold">{formatBRL(pendingAmount)}</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Hourglass className="h-5 w-5 text-amber-500 animate-pulse" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Em Processamento</p>
                <p className="text-2xl font-bold">{formatBRL(processingPayoutsAmount)}</p>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Já Sacado</p>
                <p className="text-2xl font-bold">{formatBRL(withdrawnAmount)}</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Conversões</p>
                <p className="text-2xl font-bold">{commissions.length}</p>
              </div>
            </div>
          </div>

          {/* Tabela de Comissões */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-lg">Últimas Comissões</h3>
            </div>
            {commissions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto opacity-20 mb-3" />
                <p>Nenhuma indicação registrada ainda.</p>
                <p className="text-sm mt-1">Compartilhe seu link para começar a ganhar!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-medium">Data</th>
                      <th className="px-6 py-4 font-medium">Valor Gerado</th>
                      <th className="px-6 py-4 font-medium">Libera em</th>
                      <th className="px-6 py-4 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((c) => (
                      <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-6 py-4">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold text-success">+{formatBRL(c.amount_cents / 100)}</td>
                        <td className="px-6 py-4 text-muted-foreground">{new Date(c.available_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            c.status === 'available' ? 'bg-success/20 text-success' :
                            c.status === 'pending' ? 'bg-blue-500/20 text-blue-500' :
                            c.status === 'withdrawn' ? 'bg-muted text-muted-foreground' :
                            'bg-red-500/20 text-red-500'
                          }`}>
                            {c.status === 'available' ? 'Disponível' :
                             c.status === 'pending' ? 'Pendente' :
                             c.status === 'withdrawn' ? 'Sacado' : 'Cancelado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tabela de Histórico de Saques */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden mt-6">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-lg">Histórico de Saques</h3>
            </div>
            {payoutRequests.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto opacity-20 mb-3" />
                <p>Nenhuma solicitação de saque ainda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-medium">Data</th>
                      <th className="px-6 py-4 font-medium">Valor</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutRequests.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-6 py-4">
                          <span className="font-medium text-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-foreground">{formatBRL(p.amount_cents / 100)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.status === 'paid' ? 'bg-success/20 text-success' :
                            p.status === 'requested' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-destructive/20 text-destructive'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              p.status === 'paid' ? 'bg-success' :
                              p.status === 'requested' ? 'bg-blue-500' :
                              'bg-destructive'
                            }`} />
                            {p.status === 'paid' ? 'Pago' :
                             p.status === 'requested' ? 'Pendente' : 'Rejeitado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            onClick={() => setSelectedPayoutDetails(p)} 
                            size="sm" 
                            variant="outline" 
                            className="h-8 gap-1.5 text-xs font-semibold"
                          >
                            <Eye className="h-3.5 w-3.5" /> Ver Detalhes
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payout Modal */}
          <Dialog open={payoutModalOpen} onOpenChange={setPayoutModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Solicitar Saque PIX</DialogTitle>
                <DialogDescription>
                  Você está solicitando o saque de <strong>{formatBRL(availableAmount)}</strong>.
                  O valor será transferido para a chave informada em até 48 horas.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tipo de Chave PIX</Label>
                  <Select 
                    value={pixType} 
                    onValueChange={(val) => {
                      setPixType(val);
                      setPixKey(""); // Clear key on type change
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpf">CPF / CNPJ</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="phone">Telefone</SelectItem>
                      <SelectItem value="random">Chave Aleatória</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sua Chave PIX</Label>
                  <Input 
                    placeholder={
                      pixType === "cpf" ? "000.000.000-00 ou 00.000.000/0000-00" :
                      pixType === "phone" ? "(00) 90000-0000" :
                      pixType === "email" ? "seu-email@dominio.com" :
                      "Digite sua chave PIX"
                    } 
                    maxLength={
                      pixType === "cpf" ? 18 :
                      pixType === "phone" ? 15 :
                      undefined
                    }
                    value={pixKey} 
                    onChange={e => {
                      const val = e.target.value;
                      if (pixType === "cpf") {
                        setPixKey(formatCpfCnpj(val));
                      } else if (pixType === "phone") {
                        setPixKey(formatPhone(val));
                      } else {
                        setPixKey(val);
                      }
                    }} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nome Completo do Titular</Label>
                  <Input 
                    placeholder="Nome igual ao cadastrado no banco" 
                    value={pixName} 
                    onChange={e => setPixName(e.target.value)} 
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setPayoutModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleRequestPayout} disabled={isRequestingPayout || !pixKey || !pixName} className="bg-success text-success-foreground hover:bg-success/90 font-bold">
                  Confirmar Saque
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de Detalhes do Saque */}
          <Dialog open={!!selectedPayoutDetails} onOpenChange={(o) => !o && setSelectedPayoutDetails(null)}>
            <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" /> Detalhes do Saque
                </DialogTitle>
                <DialogDescription>
                  Acompanhe as informações e o status do seu pedido de saque.
                </DialogDescription>
              </DialogHeader>

              {selectedPayoutDetails && (
                <div className="space-y-4 py-2 overflow-y-auto flex-1 min-h-0 pr-1">
                  {/* Bloco de Valor e Status */}
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-2xl border border-border/50 text-center space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Valor do Resgate</span>
                    <span className="text-3xl font-black text-foreground">{formatBRL(selectedPayoutDetails.amount_cents / 100)}</span>
                    
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-1 ${
                      selectedPayoutDetails.status === 'paid' ? 'bg-success/20 text-success' :
                      selectedPayoutDetails.status === 'requested' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-destructive/20 text-destructive'
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${
                        selectedPayoutDetails.status === 'paid' ? 'bg-success' :
                        selectedPayoutDetails.status === 'requested' ? 'bg-blue-500' :
                        'bg-destructive'
                      }`} />
                      {selectedPayoutDetails.status === 'paid' ? 'Pago' :
                       selectedPayoutDetails.status === 'requested' ? 'Pendente' : 'Rejeitado'}
                    </span>
                  </div>

                  {/* Informações detalhadas */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">Dados da Transferência</h4>
                    
                    <div className="grid grid-cols-2 gap-3.5 bg-muted/10 p-3.5 rounded-xl border border-border/30 text-sm">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Tipo de Chave PIX</span>
                        <p className="font-semibold uppercase text-foreground">{selectedPayoutDetails.pix_type}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Chave PIX</span>
                        <div className="flex items-center gap-1.5">
                          <p className="font-mono font-semibold truncate text-foreground select-all">{selectedPayoutDetails.pix_key}</p>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(selectedPayoutDetails.pix_key);
                              toast.success("Chave Pix copiada!");
                            }}
                            className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="col-span-2 space-y-1 border-t border-border/30 pt-2">
                        <span className="text-xs text-muted-foreground">Nome do Titular</span>
                        <p className="font-semibold text-foreground">{selectedPayoutDetails.pix_name || "Não informado"}</p>
                      </div>
                      
                      <div className="space-y-1 border-t border-border/30 pt-2">
                        <span className="text-xs text-muted-foreground">Solicitado em</span>
                        <p className="text-xs font-semibold text-foreground">
                          {new Date(selectedPayoutDetails.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1 border-t border-border/30 pt-2">
                        <span className="text-xs text-muted-foreground">
                          {selectedPayoutDetails.status === 'paid' ? 'Pago em' : 'Última atualização'}
                        </span>
                        <p className="text-xs font-semibold text-foreground">
                          {new Date(selectedPayoutDetails.updated_at || selectedPayoutDetails.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Informações ou Comprovante */}
                  {selectedPayoutDetails.status === 'requested' && (
                    <div className="flex gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-500 text-sm">
                      <Clock className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Aguardando pagamento</p>
                        <p className="text-xs mt-0.5 text-blue-400">O processamento de saques é concluído em até 48 horas úteis.</p>
                      </div>
                    </div>
                  )}

                  {selectedPayoutDetails.status === 'rejected' && (
                    <div className="flex gap-3 bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-destructive text-sm">
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Solicitação Recusada</p>
                        <p className="text-xs mt-0.5 text-destructive/85">Esta solicitação de saque foi recusada. Verifique os dados do Pix e tente novamente ou entre em contato com o suporte.</p>
                      </div>
                    </div>
                  )}

                  {selectedPayoutDetails.status === 'paid' && (
                    <div className="space-y-2 pt-1">
                      <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">Comprovante de Pagamento</h4>
                      {selectedPayoutDetails.receipt_url ? (
                        <div className="space-y-2">
                          {/* Verificamos se a URL é de imagem */}
                          {(selectedPayoutDetails.receipt_url.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)/) || 
                            (selectedPayoutDetails.receipt_url.includes('supabase') && !selectedPayoutDetails.receipt_url.toLowerCase().endsWith('.pdf'))) ? (
                            <div className="rounded-xl overflow-hidden border border-border bg-muted/30 p-2 flex flex-col items-center gap-1.5">
                              <img 
                                src={selectedPayoutDetails.receipt_url} 
                                alt="Comprovante de Pagamento" 
                                className="max-h-[160px] max-w-full object-contain rounded-lg shadow-sm"
                              />
                              <a 
                                href={selectedPayoutDetails.receipt_url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold py-0.5"
                              >
                                <ExternalLink className="h-3 w-3" /> Visualizar em Tela Cheia
                              </a>
                            </div>
                          ) : (
                            <a 
                              href={selectedPayoutDetails.receipt_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="w-full h-12 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all flex items-center justify-center gap-2 font-bold text-sm"
                            >
                              <FileText className="h-4 w-4" /> Visualizar Documento / PDF <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Comprovante de pagamento não anexado.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <DialogFooter className="pt-2 border-t border-border/30">
                <Button onClick={() => setSelectedPayoutDetails(null)} className="w-full sm:w-auto">
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

function Sparkles(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  );
}

function formatCpfCnpj(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length <= 11) {
    return clean
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else {
    return clean
      .substring(0, 14)
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }
}

function formatPhone(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length <= 10) {
    return clean
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  } else {
    return clean
      .substring(0, 11)
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
  }
}
