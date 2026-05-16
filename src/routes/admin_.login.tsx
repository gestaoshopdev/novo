import { createFileRoute, redirect, useRouter } from "@tanstack/react-router"; 
import { useState } from "react";
import { ShieldAlert, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Logo from "@/assets/logo.png";
import { toast } from "sonner";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({ meta: [{ title: "Login Administrativo · Atlas Suite" }] }),
  component: AdminLogin,
});

const ALLOWED_EMAILS = [
  "jonathancasales.c@gmail.com",
  "gustavo.2casales@gmail.com"
];

function AdminLogin() {
  const router = useRouter();
  const [view, setView] = useState<"login" | "forgot-password" | "verify-code" | "set-new-password">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ALLOWED_EMAILS.includes(email)) {
       toast.error("Acesso Negado", {
          description: "Este e-mail não possui permissões administrativas.",
       });
       return;
    }

    setLoading(true);
    try {
      if (view === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setView("verify-code");
        toast.success("Código enviado para o e-mail administrativo!");
      } else if (view === "verify-code") {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: otpCode,
          type: "recovery",
        });
        if (error) throw error;
        toast.success("Código validado! Escolha a nova senha.");
        setView("set-new-password");
      } else if (view === "set-new-password") {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) throw error;
        toast.success("Senha administrativa alterada com sucesso!");
        setView("login");
        setPassword(newPassword);
      } else if (view === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
           console.error("Login Admin Error:", error.message);
           toast.error("Falha na autenticação", {
              description: "Credenciais inválidas. Verifique seu e-mail e senha.",
           });
           return;
        }

        if (data.session && ALLOWED_EMAILS.includes(data.session.user.email || "")) {
           toast.success("Acesso Liberado", {
              description: "Bem-vindo ao painel administrativo.",
           });
           router.navigate({ to: "/admin" });
        } else {
           await supabase.auth.signOut();
           toast.error("Acesso Negado", {
              description: "Permissões insuficientes.",
           });
        }
      }
    } catch (err: any) {
       toast.error("Erro no sistema", {
          description: err.message || "Não foi possível conectar ao servidor.",
       });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
           <img src={Logo} alt="GestãoShop Admin" className="h-12 w-auto opacity-80 filter grayscale mb-4" />
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-[11px] font-bold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Acesso Restrito</span>
           </div>
           <h1 className="text-2xl font-bold tracking-tight text-center">
             {view === "login" ? "Painel Administrativo" : view === "forgot-password" ? "Recuperar Acesso" : view === "verify-code" ? "Validar Código" : "Nova Senha"}
           </h1>
           <p className="text-sm text-muted-foreground mt-1 text-center">Apenas pessoal autorizado.</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {(view === "login" || view === "forgot-password") && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">E-mail Administrativo</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@dominio.com"
                  className="w-full h-11 px-3 rounded-lg bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
              </div>
            )}
            
            {view === "login" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Senha</label>
                  <button
                    type="button"
                    onClick={() => setView("forgot-password")}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3 rounded-lg bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
              </div>
            )}

            {view === "verify-code" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Código de Verificação</label>
                <input
                  type="text"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="000000"
                  className="w-full h-11 px-3 rounded-lg bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-center tracking-[0.5em] text-lg font-bold"
                />
                <p className="text-[11px] text-muted-foreground text-center mt-2">
                  Enviamos um código para {email}
                </p>
              </div>
            )}

            {view === "set-new-password" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nova Senha</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3 rounded-lg bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 rounded-xl gradient-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : view === "login" ? (
                <>
                  Entrar no Painel <ArrowRight className="w-4 h-4" />
                </>
              ) : view === "forgot-password" ? (
                "Enviar Código"
              ) : view === "verify-code" ? (
                "Validar Código"
              ) : (
                "Redefinir Senha"
              )}
            </button>
          </form>

          {view !== "login" && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setView("login")}
                className="text-[12px] text-muted-foreground hover:text-foreground hover:underline transition-colors"
              >
                Voltar para o login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

