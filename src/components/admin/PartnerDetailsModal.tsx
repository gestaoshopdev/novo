import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatBRL } from "@/components/sales/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: any;
  commissions: any[];
}

export function PartnerDetailsModal({ open, onOpenChange, partner, commissions }: Props) {
  if (!partner) return null;

  const partnerCommissions = commissions.filter(c => c.referrer_id === partner.id);
  const totalEarned = partnerCommissions.reduce((acc, c) => acc + c.amount_cents, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Parceiro: {partner.full_name || partner.email}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="p-4 bg-muted rounded-xl">
            <p className="text-sm text-muted-foreground">Comissão Configurada</p>
            <p className="text-2xl font-bold">{partner.commission_rate}%</p>
          </div>
          <div className="p-4 bg-muted rounded-xl">
            <p className="text-sm text-muted-foreground">Total Gerado</p>
            <p className="text-2xl font-bold text-primary">{formatBRL(totalEarned / 100)}</p>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-4">Histórico de Indicações & Comissões</h3>
          {partnerCommissions.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhuma comissão gerada ainda.</p>
          ) : (
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-background text-xs text-muted-foreground uppercase border-b border-border">
                  <tr>
                    <th className="px-4 py-2">Data</th>
                    <th className="px-4 py-2">Indicado</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {partnerCommissions.map(c => (
                    <tr key={c.id}>
                      <td className="px-4 py-3">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {c.referred?.raw_user_meta_data?.name || 'Usuário'}<br/>
                        <span className="text-xs text-muted-foreground">{c.referred?.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'withdrawn' ? 'bg-success/20 text-success' : 
                          c.status === 'available' ? 'bg-primary/20 text-primary' : 
                          'bg-orange-500/20 text-orange-500'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-right">{formatBRL(c.amount_cents / 100)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
