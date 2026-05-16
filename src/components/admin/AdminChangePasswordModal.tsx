import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function AdminChangePasswordModal({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error("Senha muito curta", { description: "A senha deve ter no mínimo 6 caracteres." });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Senhas não coincidem", { description: "Certifique-se de digitar a mesma senha nos dois campos." });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast.error("Erro ao alterar senha", { description: error.message });
      } else {
        toast.success("Senha atualizada", { description: "Sua senha administrativa foi alterada com sucesso." });
        onOpenChange(false);
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error("Erro inesperado", { description: "Ocorreu um erro ao tentar atualizar a credencial." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-xl shadow-black/20 duration-200 sm:rounded-2xl animate-in zoom-in-95 fade-in-0">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-2">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Lock className="h-4 w-4" />
                   </div>
                   <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">Alterar Senha</Dialog.Title>
                </div>
                <Dialog.Close asChild>
                   <button className="rounded-full p-1.5 hover:bg-muted transition-colors"><X className="h-4 w-4 text-muted-foreground" /></button>
                </Dialog.Close>
             </div>
             <Dialog.Description className="text-sm text-muted-foreground mt-2">
                Redefina a sua senha de acesso administrativo. Isso não afetará os demais usuários.
             </Dialog.Description>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-2">
                <label className="text-[13px] font-medium">Nova Senha</label>
                <input 
                   type="password" 
                   required
                   value={newPassword}
                   onChange={e => setNewPassword(e.target.value)}
                   className="w-full h-10 px-3 rounded-md border border-border bg-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                   placeholder="Mínimo 6 caracteres"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[13px] font-medium">Confirmar Nova Senha</label>
                <input 
                   type="password" 
                   required
                   value={confirmPassword}
                   onChange={e => setConfirmPassword(e.target.value)}
                   className="w-full h-10 px-3 rounded-md border border-border bg-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                   placeholder="Confirme a senha"
                />
             </div>
             
             <div className="pt-2 flex gap-3">
                <Dialog.Close asChild>
                   <button type="button" className="flex-1 h-10 rounded-lg border border-border bg-surface text-sm font-medium hover:bg-muted transition-colors">
                      Cancelar
                   </button>
                </Dialog.Close>
                <button type="submit" disabled={loading} className="flex-1 h-10 rounded-lg gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center">
                   {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Senha"}
                </button>
             </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
