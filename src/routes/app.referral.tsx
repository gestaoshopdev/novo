import { createFileRoute } from "@tanstack/react-router";
import { Gift, Lock, Copy, Share2, DollarSign, TrendingUp, Users, ArrowRight, Wallet, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { getReferralCode, createReferralCode, getCommissions, getPayoutRequests, Commission, ReferralCode } from "@/lib/referrals";
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
  const { plan, planStatus, name } = useProfile();
  const { user } = useAuth();
  
  const cleanName = (name.split(' ')[0] || "SEUNOME").toUpperCase().replace(/[^A-Z0-9]/g, '');
  const exampleCode = `${cleanName}10`;

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create code state
  const [newCode, setNewCode] = useState("");
  const [isCreatingCode, setIsCreatingCode] = useState(false);

  // Payout state
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [pixKey, setPixKey] = useState("");
  const [pixType, setPixType] = useState("cpf");
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

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
    if (!user || !pixKey) return;
    setIsRequestingPayout(true);
    try {
      await requestPayout(user.id, Math.floor(availableAmount * 100), pixKey, pixType);
      toast.success("Solicitação de saque enviada com sucesso!");
      setPayoutModalOpen(false);
      setPixKey("");
      fetchData(); // reload
    } catch (e) {
      toast.error("Erro ao solicitar saque.");
    } finally {
      setIsRequestingPayout(false);
    }
  };

  const pendingAmount = commissions.filter(c => c.status === 'pending').reduce((acc, c) => acc + c.amount_cents, 0) / 100;
  const availableAmount = commissions.filter(c => c.status === 'available').reduce((acc, c) => acc + c.amount_cents, 0) / 100;
  const withdrawnAmount = commissions.filter(c => c.status === 'withdrawn').reduce((acc, c) => acc + c.amount_cents, 0) / 100;

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
              Ganhe 10% (Pro) ou 20% (Elite) de comissão recorrente por cada amigo indicado!
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
        subtitle={`Você é um parceiro ${plan}. Convide amigos e ganhe ${plan === 'Elite' ? '20%' : '10%'} de comissão!`} 
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
                <p className="text-sm text-muted-foreground mb-6">Compartilhe este link. Você ganhará {plan === 'Elite' ? '20%' : '10%'} sobre todas as mensalidades pagas por quem se cadastrar por ele.</p>
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
              </div>
              <Button onClick={() => setPayoutModalOpen(true)} disabled={availableAmount < 30} className="w-full font-bold h-11 bg-success hover:bg-success/90 text-success-foreground">
                Solicitar Saque (Min. R$ 30)
              </Button>
            </div>
          </div>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Saldo Pendente (Em carência)</p>
                <p className="text-2xl font-bold">{formatBRL(pendingAmount)}</p>
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
                <p className="text-sm text-muted-foreground font-medium">Total de Conversões</p>
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

          {/* Payout Modal */}
          <Dialog open={payoutModalOpen} onOpenChange={setPayoutModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Solicitar Saque PIX</DialogTitle>
                <DialogDescription>
                  Você está solicitando o saque de <strong>{formatBRL(availableAmount)}</strong>.
                  O valor será transferido para a chave informada em até 3 dias úteis.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tipo de Chave PIX</Label>
                  <Select value={pixType} onValueChange={setPixType}>
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
                    placeholder="Digite sua chave PIX" 
                    value={pixKey} 
                    onChange={e => setPixKey(e.target.value)} 
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setPayoutModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleRequestPayout} disabled={isRequestingPayout || !pixKey} className="bg-success text-success-foreground hover:bg-success/90 font-bold">
                  Confirmar Saque
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
