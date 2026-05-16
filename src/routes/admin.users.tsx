import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, MoreVertical, ShieldBan, ArrowUpCircle, UserPlus, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddUserModal } from "@/components/admin/AddUserModal";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Usuários · Admin" }] }),
  component: AdminUsers,
});

interface Profile {
  id: string;
  email: string;
  full_name: string;
  plan_type: string;
  status: string;
  created_at: string;
}

function AdminUsers() {
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [userToToggle, setUserToToggle] = useState<Profile | null>(null);
  const [toggling, setToggling] = useState(false);
  const [userToChangePlan, setUserToChangePlan] = useState<Profile | null>(null);
  const [changingPlan, setChangingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("Starter");

  const ADMIN_EMAILS = [
    "jonathancasales.c@gmail.com",
    "gustavo.2casales@gmail.com"
  ];

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const usersOnly = (data || []).filter(p => !ADMIN_EMAILS.includes(p.email));
      setProfiles(usersOnly);
    } catch (err: any) {
      console.error("Erro ao buscar perfis:", err);
      if (!err.message.includes("relation \"profiles\" does not exist")) {
        toast.error("Erro ao carregar usuários");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);

    try {
      // Chamada RPC para a função que criamos no SQL
      const { error } = await supabase.rpc("delete_user_by_admin", {
        target_user_id: userToDelete.id
      });

      if (error) throw error;

      toast.success("Usuário excluído", {
        description: `O acesso de ${userToDelete.email} foi removido permanentemente.`
      });
      
      // A lista se atualizará via Realtime ou manual
      fetchProfiles();
    } catch (err: any) {
      console.error("Erro ao excluir:", err);
      toast.error("Falha ao excluir usuário", {
        description: err.message
      });
    } finally {
      setDeleting(false);
      setUserToDelete(null);
    }
  };

  const confirmToggleBlockUser = async () => {
    if (!userToToggle) return;
    setToggling(true);
    const newStatus = userToToggle.status === 'blocked' ? 'active' : 'blocked';
    try {
      // Usamos uma chamada RPC para contornar a Row Level Security (RLS)
      const { error } = await supabase.rpc("update_user_status_by_admin", {
        target_user_id: userToToggle.id,
        new_status: newStatus
      });

      if (error) throw error;
      
      toast.success(newStatus === 'blocked' ? "Usuário bloqueado" : "Usuário desbloqueado", {
        description: `O acesso de ${userToToggle.email} foi ${newStatus === 'blocked' ? 'suspenso' : 'restabelecido'}.`
      });
      
      fetchProfiles();
    } catch (err: any) {
      toast.error("Erro ao atualizar status", {
        description: err.message
      });
    } finally {
      setToggling(false);
      setUserToToggle(null);
    }
  };

  const handleUpdatePlan = async () => {
    if (!userToChangePlan) return;
    setChangingPlan(true);
    
    try {
      const { error } = await supabase.rpc("update_user_plan_by_admin", {
        target_user_id: userToChangePlan.id,
        new_plan: selectedPlan
      });

      if (error) throw error;
      
      toast.success("Plano atualizado", {
        description: `O plano de ${userToChangePlan.email} foi alterado para ${selectedPlan}.`
      });
      
      fetchProfiles();
    } catch (err: any) {
      toast.error("Erro ao alterar plano", {
        description: err.message
      });
    } finally {
      setChangingPlan(false);
      setUserToChangePlan(null);
    }
  };


  useEffect(() => {
    fetchProfiles();

    const channel = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchProfiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredProfiles = profiles.filter((p) =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Controle de Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os acessos, planos e bloqueios.</p>
        </div>
      </motion.div>

      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
         <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por e-mail ou nome..." 
              className="pl-9 h-10" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         <button 
           onClick={() => setAddUserModalOpen(true)}
           className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
         >
            <UserPlus className="w-4 h-4" />
            Adicionar Usuário
         </button>
      </div>

      <AddUserModal 
        open={addUserModalOpen} 
        onOpenChange={setAddUserModalOpen} 
      />

      {/* Alerta de Confirmação de Exclusão */}
      <AlertDialog.Root open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]" />
          <AlertDialog.Content className="fixed left-[50%] top-[50%] z-[60] w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
            <div className="flex flex-col gap-2">
              <AlertDialog.Title className="text-lg font-semibold text-destructive flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Excluir Usuário?
              </AlertDialog.Title>
              <AlertDialog.Description className="text-sm text-muted-foreground">
                Tem certeza que deseja excluir <strong>{userToDelete?.email}</strong>? Esta ação é irreversível e removerá todo o acesso do usuário.
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
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="h-10 px-4 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity text-sm font-semibold flex items-center gap-2"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sim, Excluir Usuário"}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {/* Alerta de Confirmação de Bloqueio/Desbloqueio */}
      <AlertDialog.Root open={!!userToToggle} onOpenChange={(open) => !open && setUserToToggle(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]" />
          <AlertDialog.Content className="fixed left-[50%] top-[50%] z-[60] w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
            <div className="flex flex-col gap-2">
              <AlertDialog.Title className={`text-lg font-semibold flex items-center gap-2 ${userToToggle?.status === 'blocked' ? 'text-success' : 'text-destructive'}`}>
                <ShieldBan className="w-5 h-5" />
                {userToToggle?.status === 'blocked' ? "Desbloquear Usuário?" : "Bloquear Usuário?"}
              </AlertDialog.Title>
              <AlertDialog.Description className="text-sm text-muted-foreground">
                {userToToggle?.status === 'blocked' 
                  ? <>Tem certeza que deseja restabelecer o acesso de <strong>{userToToggle?.email}</strong>? O usuário poderá fazer login no sistema novamente.</>
                  : <>Tem certeza que deseja suspender o acesso de <strong>{userToToggle?.email}</strong>? O usuário será impedido de fazer login no sistema.</>
                }
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
                  onClick={confirmToggleBlockUser}
                  disabled={toggling}
                  className={`h-10 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm font-semibold flex items-center gap-2 ${userToToggle?.status === 'blocked' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}`}
                >
                  {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : (userToToggle?.status === 'blocked' ? "Sim, Desbloquear" : "Sim, Bloquear")}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {/* Modal de Alteração de Plano */}
      <Dialog open={!!userToChangePlan} onOpenChange={(open) => !open && setUserToChangePlan(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Alterar Plano de Usuário</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Selecione o novo plano para o usuário <strong>{userToChangePlan?.email}</strong>.
            </p>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Plano</label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Elite">Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToChangePlan(null)}>Cancelar</Button>
            <Button onClick={handleUpdatePlan} disabled={changingPlan}>
              {changingPlan ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
         <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
               <tr>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Plano</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Data Registro</th>
                  <th className="px-6 py-4 text-right">Ações</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
               {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Carregando usuários...</span>
                      </div>
                    </td>
                  </tr>
               ) : filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
               ) : (
                 filteredProfiles.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                       <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{user.full_name || "Sem Nome"}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                       </td>
                       <td className="px-6 py-4 font-medium capitalize">{user.plan_type}</td>
                       <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                             user.status === 'active' ? 'bg-success/15 text-success' :
                             user.status === 'trial' ? 'bg-warning/15 text-warning' :
                             'bg-destructive/15 text-destructive'
                          }`}>
                             {user.status}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-muted-foreground">
                          {format(new Date(user.created_at), "dd/MM/yyyy")}
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Fazer Upgrade">
                                <ArrowUpCircle className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={() => setUserToToggle(user)}
                               className={`p-1.5 transition-colors ${user.status === 'blocked' ? 'text-success hover:bg-success/10' : 'text-muted-foreground hover:text-destructive'}`} 
                               title={user.status === 'blocked' ? "Desbloquear Acesso" : "Bloquear Acesso"}
                             >
                                <ShieldBan className="w-4 h-4" />
                             </button>
                             
                             <DropdownMenu.Root>
                               <DropdownMenu.Trigger asChild>
                                 <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors outline-none">
                                   <MoreVertical className="w-4 h-4" />
                                 </button>
                               </DropdownMenu.Trigger>
                               <DropdownMenu.Portal>
                                 <DropdownMenu.Content className="z-[50] min-w-[160px] bg-card border border-border p-1.5 rounded-xl shadow-xl animate-in fade-in-0 zoom-in-95" align="end">
                                   <DropdownMenu.Item 
                                      onClick={() => {
                                        setSelectedPlan(user.plan_type === 'básico' ? 'Starter' : user.plan_type || 'Starter');
                                        setUserToChangePlan(user);
                                      }}
                                      className="flex items-center gap-2 px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground outline-none cursor-pointer rounded-lg hover:bg-muted transition-colors"
                                   >
                                      <ArrowUpCircle className="w-4 h-4" />
                                      Alterar Plano
                                   </DropdownMenu.Item>
                                   <DropdownMenu.Item 
                                      onClick={() => setUserToToggle(user)}
                                      className={`flex items-center gap-2 px-2.5 py-2 text-sm outline-none cursor-pointer rounded-lg transition-colors ${user.status === 'blocked' ? 'text-success hover:bg-success/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                                   >
                                      <ShieldBan className="w-4 h-4" />
                                      {user.status === 'blocked' ? "Desbloquear Usuário" : "Bloquear Usuário"}
                                   </DropdownMenu.Item>
                                   <DropdownMenu.Separator className="h-px bg-border my-1" />
                                   <DropdownMenu.Item 
                                      onClick={() => setUserToDelete(user)}
                                      className="flex items-center gap-2 px-2.5 py-2 text-sm text-destructive hover:bg-destructive/10 outline-none cursor-pointer rounded-lg transition-colors"
                                   >
                                      <Trash2 className="w-4 h-4" />
                                      Excluir Usuário
                                   </DropdownMenu.Item>
                                 </DropdownMenu.Content>
                               </DropdownMenu.Portal>
                             </DropdownMenu.Root>
                          </div>
                       </td>
                    </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
