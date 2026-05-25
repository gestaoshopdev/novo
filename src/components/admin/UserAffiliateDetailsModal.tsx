import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatBRL } from "@/components/sales/types";
import { Users, DollarSign, Wallet, Clock, Gift, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  commissions: any[];
  payouts: any[];
  referrals: any[];
}

export function UserAffiliateDetailsModal({
  open,
  onOpenChange,
  userId,
  userEmail,
  userName,
  commissions = [],
  payouts = [],
  referrals = [],
}: Props) {
  const [activeTab, setActiveTab] = useState<"referrals" | "commissions" | "payouts">("referrals");

  if (!userId) return null;

  // Filter data for this specific user
  const userCommissions = commissions.filter((c) => c.referrer_id === userId);
  const userPayouts = payouts.filter((p) => p.user_id === userId);
  const userReferrals = referrals.filter((r) => r.referrer_id === userId);

  // Compute metrics
  const totalEarned = userCommissions.reduce((acc, c) => acc + c.amount_cents, 0) / 100;
  const pendingAmount = userCommissions.filter((c) => c.status === "pending").reduce((acc, c) => acc + c.amount_cents, 0) / 100;
  const baseAvailableAmount = userCommissions.filter((c) => c.status === "available").reduce((acc, c) => acc + c.amount_cents, 0) / 100;
  const processingPayoutsAmount = userPayouts.filter((p) => p.status === "requested").reduce((acc, p) => acc + p.amount_cents, 0) / 100;
  const availableAmount = Math.max(0, baseAvailableAmount - processingPayoutsAmount);
  const totalPaidPayouts = userPayouts.filter((p) => p.status === "paid").reduce((acc, p) => acc + p.amount_cents, 0) / 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="shrink-0 border-b border-border/40 pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Histórico de Afiliado: {userName || "Usuário"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Email: <span className="font-semibold text-foreground">{userEmail}</span> | ID: <span className="font-mono text-xs">{userId}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 shrink-0">
          <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
              <Gift className="h-3.5 w-3.5 text-primary" />
              Total Gerado
            </div>
            <p className="text-xl font-bold text-foreground">{formatBRL(totalEarned)}</p>
          </div>

          <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
              <Wallet className="h-3.5 w-3.5 text-success" />
              Saldo Disponível
            </div>
            <p className="text-xl font-bold text-success">{formatBRL(availableAmount)}</p>
          </div>

          <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              Pendente
            </div>
            <p className="text-xl font-bold text-blue-500">{formatBRL(pendingAmount)}</p>
          </div>

          <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
              <DollarSign className="h-3.5 w-3.5 text-orange-500" />
              Total Pago
            </div>
            <p className="text-xl font-bold text-foreground">{formatBRL(totalPaidPayouts)}</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border/50 mb-4 shrink-0">
          <button
            onClick={() => setActiveTab("referrals")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "referrals"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            Indicados ({userReferrals.length})
          </button>
          <button
            onClick={() => setActiveTab("commissions")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "commissions"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Gift className="h-4 w-4" />
            Comissões Geradas ({userCommissions.length})
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "payouts"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Histórico de Saques ({userPayouts.length})
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === "referrals" && (
            <div className="space-y-4">
              {userReferrals.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-12">Nenhuma indicação registrada.</p>
              ) : (
                <div className="border border-border/50 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-xs text-muted-foreground uppercase border-b border-border">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Indicado</th>
                        <th className="px-6 py-3 font-semibold">Data do Cadastro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {userReferrals.map((ref) => (
                        <tr key={ref.id} className="hover:bg-muted/20">
                          <td className="px-6 py-4">
                            <span className="font-medium text-foreground">{ref.referred_name || "Usuário"}</span>
                            <br />
                            <span className="text-xs text-muted-foreground">{ref.referred_email}</span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {format(new Date(ref.created_at), "dd/MM/yyyy HH:mm")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "commissions" && (
            <div className="space-y-4">
              {userCommissions.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-12">Nenhuma comissão gerada ainda.</p>
              ) : (
                <div className="border border-border/50 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-xs text-muted-foreground uppercase border-b border-border">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Data</th>
                        <th className="px-6 py-3 font-semibold">Indicado</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 font-semibold text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {userCommissions.map((c) => (
                        <tr key={c.id} className="hover:bg-muted/20">
                          <td className="px-6 py-4 text-muted-foreground">
                            {format(new Date(c.created_at), "dd/MM/yyyy")}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-foreground">
                              {c.referred?.raw_user_meta_data?.name || "Usuário"}
                            </span>
                            <br />
                            <span className="text-xs text-muted-foreground">{c.referred?.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                c.status === "available"
                                  ? "bg-success/20 text-success"
                                  : c.status === "pending"
                                  ? "bg-blue-500/20 text-blue-500"
                                  : c.status === "withdrawn"
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-destructive/20 text-destructive"
                              }`}
                            >
                              {c.status === "available"
                                ? "Disponível"
                                : c.status === "pending"
                                ? "Pendente"
                                : c.status === "withdrawn"
                                ? "Pago/Sacado"
                                : "Cancelado"}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-right text-success">
                            +{formatBRL(c.amount_cents / 100)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "payouts" && (
            <div className="space-y-4">
              {userPayouts.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-12">Nenhum saque solicitado ainda.</p>
              ) : (
                <div className="border border-border/50 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-xs text-muted-foreground uppercase border-b border-border">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Data</th>
                        <th className="px-6 py-3 font-semibold">Dados Pix</th>
                        <th className="px-6 py-3 font-semibold text-center">Status</th>
                        <th className="px-6 py-3 font-semibold text-right">Valor</th>
                        <th className="px-6 py-3 font-semibold text-right">Comprovante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {userPayouts.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/20">
                          <td className="px-6 py-4 text-muted-foreground">
                            {format(new Date(p.created_at), "dd/MM/yyyy")}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-foreground">{p.pix_name || "Não informado"}</span>
                            <br />
                            <span className="font-mono text-xs select-all bg-muted/65 px-1 py-0.5 rounded">{p.pix_key}</span>
                            <br />
                            <span className="text-[10px] text-muted-foreground uppercase">{p.pix_type}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                p.status === "paid"
                                  ? "bg-success/20 text-success"
                                  : p.status === "requested"
                                  ? "bg-blue-500/20 text-blue-500"
                                  : "bg-destructive/20 text-destructive"
                              }`}
                            >
                              {p.status === "paid" ? "Pago" : p.status === "requested" ? "Pendente" : "Rejeitado"}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-right text-foreground">
                            {formatBRL(p.amount_cents / 100)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {p.status === "paid" && p.receipt_url ? (
                              <a
                                href={p.receipt_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline text-xs inline-flex items-center gap-1 font-semibold"
                              >
                                Ver Comprovante <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : p.status === "rejected" ? (
                              <span className="text-xs text-muted-foreground italic">Rejeitado</span>
                            ) : (
                              <span className="text-xs text-blue-500 font-medium">Aguardando</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
