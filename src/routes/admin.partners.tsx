import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Handshake, Users, Check, X, DollarSign, ExternalLink, UserPlus, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getAdminPayoutRequests, getAdminCommissions, markPayoutAsPaid, getAdminPartners, removePartner } from "@/lib/referrals";
import { ManagePartnerModal } from "@/components/admin/ManagePartnerModal";
import { PartnerDetailsModal } from "@/components/admin/PartnerDetailsModal";
import { formatBRL } from "@/components/sales/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/partners")({
  head: () => ({ meta: [{ title: "Parceiros · Admin" }] }),
  component: AdminPartners,
});

function AdminPartners() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [managePartnerOpen, setManagePartnerOpen] = useState(false);
  const [selectedPartnerDetails, setSelectedPartnerDetails] = useState<any>(null);
  
  const [partnerToRemove, setPartnerToRemove] = useState<any>(null);
  const [removingPartner, setRemovingPartner] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reqs = await getAdminPayoutRequests();
      const comms = await getAdminCommissions();
      const parts = await getAdminPartners();
      setPayouts(reqs || []);
      setCommissions(comms || []);
      setPartners(parts || []);
    } catch (e: any) {
      console.error(e);
      toast.error(`Erro ao carregar dados: ${e.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePartner = async () => {
    if (!partnerToRemove) return;
    setRemovingPartner(true);
    try {
      await removePartner(partnerToRemove.id);
      toast.success("Parceiro removido com sucesso!");
      fetchData();
    } catch (e: any) {
      toast.error(`Erro ao remover parceiro: ${e.message || 'Erro desconhecido'}`);
    } finally {
      setRemovingPartner(false);
      setPartnerToRemove(null);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedPayout || !receiptFile) {
      toast.error("Selecione o arquivo do comprovante");
      return;
    }
    
    setIsUploading(true);
    try {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${selectedPayout.id}-${Math.random()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payouts')
        .upload(filePath, receiptFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('payouts')
        .getPublicUrl(filePath);

      await markPayoutAsPaid(selectedPayout.id, publicUrlData.publicUrl);
      toast.success("Saque marcado como pago com sucesso!");
      setSelectedPayout(null);
      setReceiptFile(null);
      fetchData();
    } catch (e: any) {
      console.error(e);
      toast.error(`Erro ao processar pagamento: ${e.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const pendingPayouts = payouts.filter(p => p.status === 'requested');

  return (
    <div className="space-y-6 pb-12">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Parceiros de Indicação</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de afiliados, comissões a pagar e saques.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="p-6 rounded-2xl border border-border bg-card flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
               <Handshake className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg">Total Gerado em Comissões</h3>
            <p className="text-3xl font-black mt-2 text-foreground">
               {formatBRL(commissions.reduce((acc, c) => acc + c.amount_cents, 0) / 100)}
            </p>
         </div>

         <div className="p-6 rounded-2xl border border-border bg-card flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4">
               <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg">Saques Pendentes</h3>
            <p className="text-3xl font-black mt-2 text-orange-500">
               {pendingPayouts.length}
            </p>
         </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden mt-6">
        <div className="p-6 border-b border-border">
          <h3 className="font-bold text-lg">Solicitações de Saque</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : payouts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Nenhuma solicitação de saque.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium">Afiliado</th>
                  <th className="px-6 py-4 font-medium">Chave PIX</th>
                  <th className="px-6 py-4 font-medium text-right">Valor</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-6 py-4">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {p.user?.raw_user_meta_data?.name || 'Usuário'} <br/>
                      <span className="text-xs text-muted-foreground">{p.user?.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-xs mb-1">{p.pix_name || 'Não informado'}</div>
                      <span className="font-mono bg-muted px-2 py-1 rounded select-all">{p.pix_key}</span>
                      <div className="text-xs text-muted-foreground mt-1 uppercase">{p.pix_type}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-right">{formatBRL(p.amount_cents / 100)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'paid' ? 'bg-success/20 text-success' : 'bg-orange-500/20 text-orange-500'
                      }`}>
                        {p.status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.status === 'requested' && (
                        <Button onClick={() => setSelectedPayout(p)} size="sm" className="bg-success text-success-foreground hover:bg-success/90">
                          Pagar
                        </Button>
                      )}
                      {p.status === 'paid' && p.receipt_url && (
                        <a href={p.receipt_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1 justify-end">
                          Comprovante <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-8">
        <h3 className="font-bold text-lg">Parceiros Comerciais</h3>
        <Button onClick={() => setManagePartnerOpen(true)} className="bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Adicionar Parceiro Manual
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden mt-4">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : partners.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Nenhum parceiro comercial cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Parceiro</th>
                  <th className="px-6 py-4 font-medium">Plano</th>
                  <th className="px-6 py-4 font-medium">Comissão</th>
                  <th className="px-6 py-4 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-6 py-4">
                      {p.full_name || 'Usuário'} <br/>
                      <span className="text-xs text-muted-foreground">{p.email}</span>
                    </td>
                    <td className="px-6 py-4 uppercase font-bold">{p.plan_type}</td>
                    <td className="px-6 py-4 font-bold">{p.commission_rate}%</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setPartnerToRemove(p)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors" title="Remover Parceiro">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Button onClick={() => setSelectedPartnerDetails(p)} size="sm" variant="outline">
                          Detalhes
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={!!selectedPayout} onOpenChange={(o) => !o && setSelectedPayout(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
            <DialogDescription>Transfira o valor pelo seu banco e insira o link do comprovante.</DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-bold text-xl">{formatBRL(selectedPayout.amount_cents / 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nome:</span>
                  <span className="font-bold">{selectedPayout.pix_name || 'Não informado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chave PIX:</span>
                  <span className="font-mono font-bold select-all">{selectedPayout.pix_key}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="uppercase">{selectedPayout.pix_type}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Comprovante (Imagem ou PDF)</Label>
                <Input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={e => setReceiptFile(e.target.files?.[0] || null)} 
                />
              </div>

              <Button onClick={handleMarkAsPaid} disabled={isUploading} className="w-full font-bold bg-success hover:bg-success/90 text-success-foreground">
                {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />} 
                {isUploading ? "Enviando e Marcando..." : "Marcar como Pago"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog.Root open={!!partnerToRemove} onOpenChange={(open) => !open && setPartnerToRemove(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]" />
          <AlertDialog.Content className="fixed left-[50%] top-[50%] z-[60] w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
            <div className="flex flex-col gap-2">
              <AlertDialog.Title className="text-lg font-semibold text-destructive flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Remover Parceiro?
              </AlertDialog.Title>
              <AlertDialog.Description className="text-sm text-muted-foreground">
                Tem certeza que deseja remover <strong>{partnerToRemove?.email}</strong> da lista de parceiros comerciais? Ele deixará de receber comissões customizadas.
              </AlertDialog.Description>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <button className="h-10 px-4 rounded-lg border border-border bg-surface hover:bg-muted transition-colors text-sm font-medium">
                  Cancelar
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button 
                  onClick={handleRemovePartner}
                  disabled={removingPartner}
                  className="h-10 px-4 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity text-sm font-semibold flex items-center gap-2"
                >
                  {removingPartner ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sim, Remover Parceiro"}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <ManagePartnerModal 
        open={managePartnerOpen} 
        onOpenChange={setManagePartnerOpen} 
        onSuccess={fetchData}
      />

      <PartnerDetailsModal 
        open={!!selectedPartnerDetails} 
        onOpenChange={(o) => !o && setSelectedPartnerDetails(null)} 
        partner={selectedPartnerDetails}
        commissions={commissions}
      />

    </div>
  );
}
