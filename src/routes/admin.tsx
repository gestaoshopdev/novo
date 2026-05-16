import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/lib/supabase";

const ALLOWED_EMAILS = [
  "jonathancasales.c@gmail.com",
  "gustavo.2casales@gmail.com"
];

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
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
          throw redirect({ to: "/admin/login" });
        }

        const email = session.user?.email;
        if (!email || !ALLOWED_EMAILS.includes(email)) {
          // Usuário logado mas não é admin
          throw redirect({ to: "/admin/login" });
        }
      } catch (e) {
        if ((e as any).status === 301 || (e as any).status === 302) throw e;
        console.error("[AdminRoute] Erro na proteção de rota admin:", e);
        throw redirect({ to: "/admin/login" });
      }
    }
  },
  component: AdminShell,
});

