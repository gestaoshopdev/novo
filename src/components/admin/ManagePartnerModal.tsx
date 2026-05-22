import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  partnerToEdit?: any;
}

export function ManagePartnerModal({ open, onOpenChange, onSuccess, partnerToEdit }: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [commissionRate, setCommissionRate] = useState<string>("20");
  const [planType, setPlanType] = useState<string>("Elite");
  const [freeDuration, setFreeDuration] = useState<string>("vitalicio");
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (partnerToEdit) {
        setSelectedUserId(partnerToEdit.id);
        setCommissionRate(partnerToEdit.commission_rate?.toString() || "20");
        setPlanType(partnerToEdit.plan_type || "Elite");
        setFreeDuration("padrao"); // By default when editing, don't change duration benefit (keep as-is)
        setSearchEmail(partnerToEdit.email || "");
      } else {
        setSelectedUserId("");
        setCommissionRate("20");
        setPlanType("Elite");
        setFreeDuration("vitalicio");
        setSearchEmail("");
      }
      fetchUsers();
    }
  }, [open, partnerToEdit]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name");
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoadingUsers(false);
    }
  };

  const filteredUsers = searchEmail 
    ? users.filter(u => u.email?.toLowerCase().includes(searchEmail.toLowerCase()))
    : users.slice(0, 50); // Mostra os primeiros 50 se não houver busca

  const handleSave = async () => {
    if (!selectedUserId) {
      toast.error("Selecione um usuário");
      return;
    }
    const rate = parseInt(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 25) {
      toast.error("A comissão deve ser entre 0 e 25%");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.rpc("manage_partner", {
        p_target_user_id: selectedUserId,
        p_is_partner: true,
        p_commission_rate: rate,
        p_plan_type: planType,
        p_free_duration: freeDuration
      });

      if (error) throw error;
      
      toast.success(partnerToEdit ? "Parceiro atualizado com sucesso!" : "Parceiro configurado com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao salvar parceiro", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{partnerToEdit ? "Editar Parceiro Comercial" : "Adicionar Parceiro Comercial"}</DialogTitle>
          <DialogDescription>
            {partnerToEdit 
              ? "Ajuste as comissões ou plano do parceiro selecionado." 
              : "Defina um usuário como parceiro comercial com comissão customizada."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {partnerToEdit ? (
            <div className="grid gap-2">
              <Label>Usuário</Label>
              <Input 
                value={`${partnerToEdit.email} ${partnerToEdit.full_name ? `(${partnerToEdit.full_name})` : ""}`}
                disabled 
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <Label>Buscar Usuário (E-mail)</Label>
                <Input 
                  placeholder="Digite o e-mail..." 
                  value={searchEmail}
                  onChange={e => setSearchEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Selecione o Usuário</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingUsers ? "Carregando..." : "Selecione..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.email} {u.full_name ? `(${u.full_name})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label>Comissão (%) - Máx 25%</Label>
            <Input 
              type="number" 
              min="0" 
              max="25" 
              value={commissionRate}
              onChange={e => setCommissionRate(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Plano do Parceiro</Label>
            <Select value={planType} onValueChange={setPlanType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Starter">Starter</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
                <SelectItem value="Elite">Elite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Benefício de Acesso</Label>
            <Select value={freeDuration} onValueChange={setFreeDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="padrao">Padrão (Sem isenção)</SelectItem>
                <SelectItem value="mensal">Gratuito 1 Mês (+30 dias)</SelectItem>
                <SelectItem value="vitalicio">Gratuito Vitalício (+10 anos)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Parceiro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
