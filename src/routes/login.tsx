import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Toaster, toast } from "sonner";
import { Lock, Mail, Loader2, ArrowRight, ArrowLeft, Users, Eye, EyeOff, Gift } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Logo from "@/assets/logo.png";
import { useQueryClient } from "@tanstack/react-query";

import { z } from "zod";

const loginSearchSchema = z.object({
  mode: z.enum(["login", "signup"]).optional().catch("login"),
  blocked: z.boolean().optional().catch(false),
  ref: z.string().optional()
});

export const Route = createFileRoute("/login")({
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: LoginPage,
});

function LoginPage() {
  const { mode, blocked, ref } = Route.useSearch();
  const [view, setView] = useState<"login" | "signup" | "forgot-password" | "verify-code" | "set-new-password">(
    (mode === "signup" || ref) ? "signup" : "login"
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [referralCode, setReferralCode] = useState(ref || "");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Handle session expiration, data auto-fill, and blocked redirect
  useEffect(() => {
    if (blocked) {
      toast.error("Acesso Suspenso", { description: "Sua conta foi bloqueada pelo administrador." });
      navigate({ to: "/login", replace: true });
    }

    const storedEmail = localStorage.getItem("gestaoshop_remembered_email");
    const storedPass = localStorage.getItem("gestaoshop_remembered_pass");
    const expiresAt = localStorage.getItem("gestaoshop_session_expires");

    if (storedEmail && expiresAt) {
      if (new Date() < new Date(expiresAt)) {
        setEmail(storedEmail);
        if (storedPass) {
          try {
            setPassword(atob(storedPass));
          } catch (e) {
            console.error("Erro ao decodificar senha lembrada");
          }
        }
        setRememberMe(true);
      } else {
        // Expired
        localStorage.removeItem("nimbus_remembered_email");
        localStorage.removeItem("nimbus_remembered_pass");
        localStorage.removeItem("nimbus_session_expires");
      }
    }

    const checkExpiration = async () => {
      if (expiresAt && new Date() > new Date(expiresAt)) {
        await supabase.auth.signOut();
        toast.info("Sua sessão de 30 dias expirou. Por favor, entre novamente.");
      }
    };
    checkExpiration();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setView("verify-code");
        toast.success("Código enviado para o seu e-mail!");
      } else if (view === "verify-code") {
        // Passo 1: Validar o código
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: otpCode,
          type: "recovery",
        });
        if (error) throw error;
        
        toast.success("Código validado! Agora escolha sua nova senha.");
        setView("set-new-password");
      } else if (view === "set-new-password") {
        // Passo 2: Definir nova senha
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) throw error;

        toast.success("Senha alterada com sucesso! Entre com sua nova senha.");
        setView("login");
        setPassword(newPassword);
      } else if (view === "login") {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("O servidor demorou demais para responder. Verifique sua conexão.")), 10000)
        );

        const { data, error } = await Promise.race([
          supabase.auth.signInWithPassword({ email, password }),
          timeoutPromise
        ]) as any;

        if (error) throw error;

        // Verifica se o usuário está bloqueado via metadata ou profiles
        if (data?.user) {
          const isBlockedInMetadata = data.user.user_metadata?.status === "blocked";
          
          let isBlockedInProfile = false;
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("status")
              .eq("id", data.user.id)
              .single();
            isBlockedInProfile = profile?.status === "blocked";
          } catch (e) {
            // Ignora erro de RLS se houver
          }

          if (isBlockedInMetadata || isBlockedInProfile) {
            await supabase.auth.signOut();
            throw new Error("Usuário bloqueado");
          }
        }

        if (rememberMe) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);
          localStorage.setItem("gestaoshop_session_expires", expiresAt.toISOString());
          localStorage.setItem("gestaoshop_remembered_email", email);
          localStorage.setItem("gestaoshop_remembered_pass", btoa(password));
        } else {
          localStorage.removeItem("gestaoshop_session_expires");
          localStorage.removeItem("gestaoshop_remembered_email");
          localStorage.removeItem("gestaoshop_remembered_pass");
        }

        queryClient.clear();
        navigate({ to: "/app" });
      } else {
        if (!fullName.trim()) throw new Error("Por favor, informe seu nome completo.");
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("O servidor demorou demais para responder.")), 15000)
        );

        const { data: signUpData, error } = await Promise.race([
          supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName.trim()
              }
            }
          }),
          timeoutPromise
        ]) as any;

        if (error) throw error;
        
        toast.success("Conta criada com sucesso!");

        const { error: signErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        // Lógica de Referência (Afiliados) - Usamos RPC para contornar qualquer bloqueio de RLS
        if (referralCode.trim() && signUpData.user) {
          try {
            const { error: rpcError } = await supabase.rpc('register_referral', {
              p_code: referralCode.trim(),
              p_referred_id: signUpData.user.id
            });
            
            if (rpcError) {
              console.error("Erro interno ao registrar indicação no RPC:", rpcError);
            } else {
              console.log("Indicação registrada com sucesso via RPC!");
            }
          } catch (e) {
            console.error("Erro ao chamar RPC de indicação", e);
          }
        }
        
        if (!signErr && signUpData.user) {
          // Salvar o nome no perfil local imediatamente
          localStorage.setItem(`profile_name_${signUpData.user.id}`, fullName.trim());
          queryClient.clear();
          navigate({ to: "/app" });
        }
      }
    } catch (err: any) {
      let message = err.message || "Erro na operação.";
      if (message === "Invalid login credentials") {
        message = "Conta inexistente ou senha incorreta.";
      } else if (message === "User already registered") {
        message = "Este e-mail já está em uso.";
      } else if (message === "Email not confirmed") {
        message = "Por favor, confirme seu e-mail antes de entrar.";
      } else if (message === "Usuário bloqueado") {
        message = "Sua conta foi suspensa pelo administrador.";
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Toaster richColors position="top-right" />

      {/* Back Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 lg:top-10 lg:left-10 flex items-center gap-3 text-muted-foreground hover:text-foreground transition-all group z-20"
      >
        <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-2xl bg-card/40 backdrop-blur-md border border-border/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/40 transition-all shadow-sm">
          <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6 transition-transform group-hover:-translate-x-1" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-50">Voltar</span>
          <span className="text-sm font-bold tracking-tight">Página Inicial</span>
        </div>
      </Link>
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-card/60 backdrop-blur-xl border border-border/60 shadow-2xl rounded-3xl p-8 relative z-10">
        <div className="text-center mb-8">
          <img src={Logo} alt="GestãoShop" className="mx-auto h-32 w-auto mb-6 drop-shadow-[0_0_20px_rgba(var(--primary),0.25)]" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {view === "login" 
              ? "Bem-vindo de volta" 
              : view === "signup" 
              ? "Crie sua conta" 
              : view === "forgot-password"
              ? "Recuperar senha"
              : view === "verify-code"
              ? "Validar Código"
              : "Nova Senha"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {view === "login"
              ? "Entre para gerenciar suas vendas e produtos."
              : view === "signup"
              ? "Cadastre-se para começar a usar o sistema."
              : view === "forgot-password"
              ? "Enviaremos um código para seu e-mail."
              : view === "verify-code"
              ? `Enviamos o código para ${email}`
              : "Defina sua nova senha de acesso."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Completo (Only for Signup) */}
          {view === "signup" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                  placeholder="Seu nome completo"
                  autoFocus={view === "signup"}
                />
              </div>
            </div>
          )}

          {/* Código de Convite (Readonly - Only for Signup with referral) */}
          {view === "signup" && ref && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Código de Convite</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={referralCode}
                  readOnly
                  className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border rounded-xl text-sm focus:outline-none transition-all text-muted-foreground cursor-not-allowed uppercase"
                />
              </div>
            </div>
          )}

          {/* E-mail (Visible in initial recovery step) */}
          {(view === "login" || view === "signup" || view === "forgot-password") && (
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
          )}

          {/* Login / Signup Password */}
          {(view === "login" || view === "signup") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Senha</label>
                {view === "login" && (
                  <button
                    type="button"
                    onClick={() => setView("forgot-password")}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Verification Code */}
          {view === "verify-code" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Código de Verificação</label>
                <input
                  type="text"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/20"
                  placeholder="000000"
                />
                <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                  Digite o código numérico de 6 dígitos que enviamos para seu e-mail.
                </p>
              </div>
            </div>
          )}

          {/* Set New Password */}
          {view === "set-new-password" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Nova Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                  placeholder="Defina sua nova senha"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {view === "login" && (
            <div className="flex items-center gap-2 py-1">
              <Checkbox 
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
              />
              <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
                Lembrar dados por 30 dias
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : view === "login" ? (
              <>
                Entrar <ArrowRight className="w-4 h-4" />
              </>
            ) : view === "signup" ? (
              "Criar Conta"
            ) : view === "forgot-password" ? (
              "Enviar Código"
            ) : view === "verify-code" ? (
              "Validar Código"
            ) : (
              "Alterar Senha"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            {view === "login" 
              ? "Não tem uma conta? " 
              : view === "signup" 
              ? "Já possui uma conta? " 
              : "Voltar para o "}
          </span>
          <button
            type="button"
            onClick={() => setView(view === "login" ? "signup" : "login")}
            className="text-primary font-semibold hover:underline"
          >
            {view === "login" ? "Cadastre-se" : "Início"}
          </button>
        </div>
      </div>
    </div>
  );
}
