import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    // Como usamos o Supabase com localStorage (padrão), o servidor (SSR)
    // não tem acesso ao token. Pulamos o redirect no servidor.
    if (typeof window !== "undefined") {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("DB Timeout")), 5000)
        );
        
        const { data: { session } } = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]) as any;

        if (!session) {
          throw redirect({
            to: "/login",
          });
        }

        // Verifica se o usuário está bloqueado via metadata ou profiles
        const isBlockedInMetadata = session.user.user_metadata?.status === "blocked";
        
        let isBlockedInProfile = false;
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("status")
            .eq("id", session.user.id)
            .single();
          isBlockedInProfile = profile?.status === "blocked";
        } catch(e) {}

        if (isBlockedInMetadata || isBlockedInProfile) {
          await supabase.auth.signOut();
          throw redirect({
            to: "/login",
            search: { blocked: true },
          } as any); 
        }
      } catch (e) {
        if (e instanceof Error && e.message === "DB Timeout") {
          console.warn("[AppRoute] Supabase demorou demais para responder. Redirecionando para login por segurança.");
          throw redirect({ to: "/login" });
        }
        // Se for um redirect do TanStack, relançamos
        if ((e as any).status === 301 || (e as any).status === 302) throw e;
        
        console.error("[AppRoute] Erro ao carregar sessão:", e);
      }
    }
  },
  component: AppShell,
});
