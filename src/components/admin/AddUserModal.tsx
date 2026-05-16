import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, UserPlus, Loader2, Mail, Lock, Shield } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

// Instância secundária para criar usuários sem deslogar o admin
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ylsdljylqbnuajjyipwy.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry";

const authAdminClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export function AddUserModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  console.log("[AddUserModal] Rendering, open:", open);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState("trial");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Criar o usuário no Auth
      const { data: authData, error: authError } = await authAdminClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            plan_type: plan,
          },
        },
      });

      if (authError) throw authError;

      toast.success("Usuário criado com sucesso!", {
        description: `O acesso para ${email} foi registrado no banco de dados.`,
      });
      
      onOpenChange(false);
      setName("");
      setEmail("");
      setPassword("");
      setPlan("trial");
    } catch (err: any) {
      console.error("Erro ao criar usuário:", err);
      toast.error("Erro ao criar usuário", {
        description: err.message || "Ocorreu um erro inesperado.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-xl duration-200 sm:rounded-2xl animate-in zoom-in-95 fade-in-0">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <UserPlus className="h-5 w-5" />
                </div>
                <Dialog.Title className="text-xl font-semibold leading-none tracking-tight">Novo Usuário</Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button className="rounded-full p-1.5 hover:bg-muted transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="text-sm text-muted-foreground mt-2">
              Cadastre um novo usuário diretamente no banco de dados.
            </Dialog.Description>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome Completo</label>
              <div className="relative">
                <InputIcon icon={UserPlus} />
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-surface text-sm focus:border-primary outline-none transition-all"
                  placeholder="Nome do cliente"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <div className="relative">
                <InputIcon icon={Mail} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-surface text-sm focus:border-primary outline-none transition-all"
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Senha Inicial</label>
              <div className="relative">
                <InputIcon icon={Lock} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-surface text-sm focus:border-primary outline-none transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Plano Inicial</label>
              <div className="relative">
                <InputIcon icon={Shield} />
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-surface text-sm focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="trial">Trial (7 dias)</option>
                  <option value="basic">Básico</option>
                  <option value="pro">Profissional (Pro)</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 h-11 rounded-xl border border-border bg-surface text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Usuário"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function InputIcon({ icon: Icon }: { icon: any }) {
  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
      <Icon className="h-4 w-4" />
    </div>
  );
}
