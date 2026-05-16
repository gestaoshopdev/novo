import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Handshake, Users, Check, X, DollarSign, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { getAdminPayoutRequests, getAdminCommissions, markPayoutAsPaid } from "@/lib/referrals";
import { formatBRL } from "@/components/sales/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/partners")({
  head: () => ({ meta: [{ title: "Parceiros · Admin" }] }),
  component: AdminPartners,
});

function AdminPartners() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [receiptUrl, setReceiptUrl] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reqs = await getAdminPayoutRequests();
      const comms = await getAdminCommissions();
      setPayouts(reqs || []);
      setCommissions(comms || []);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar dados de parceiros");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedPayout || !receiptUrl) {
      toast.error("Insira a URL do comprovante");
      return;
    }
    
    try {
      await markPayoutAsPaid(selectedPayout.id, receiptUrl);
      toast.success("Saque marcado como pago com sucesso!");
      setSelectedPayout(null);
      setReceiptUrl("");
      fetchData();
    } catch (e) {
      toast.error("Erro ao processar pagamento");
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
                  <span className="text-muted-foreground">Chave PIX:</span>
                  <span className="font-mono font-bold select-all">{selectedPayout.pix_key}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="uppercase">{selectedPayout.pix_type}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Link do Comprovante</Label>
                <Input 
                  placeholder="https://sua-hospedagem.com/comprovante.jpg" 
                  value={receiptUrl} 
                  onChange={e => setReceiptUrl(e.target.value)} 
                />
              </div>

              <Button onClick={handleMarkAsPaid} className="w-full font-bold bg-success hover:bg-success/90 text-success-foreground">
                <Check className="w-4 h-4 mr-2" /> Marcar como Pago
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
