import { Link, useRouterState, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, Wallet, Ticket, Handshake, ChevronRight, Settings, Lock, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/assets/logo.png";
import { useProfile } from "@/contexts/ProfileContext";
import { useState } from "react";
import { AdminChangePasswordModal } from "./AdminChangePasswordModal";
import { supabase } from "@/lib/supabase";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const items: Item[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Usuários", icon: Users },
  { to: "/admin/financial", label: "Financeiro", icon: Wallet },
  { to: "/admin/coupons", label: "Cupons", icon: Ticket },
  { to: "/admin/partners", label: "Parceiros", icon: Handshake },
];

export function AdminSidebar() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { name, photo } = useProfile();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Sessão encerrada");
      router.navigate({ to: "/" });
    } catch (err) {
      console.error("Erro ao sair:", err);
      router.navigate({ to: "/" });
    }
  };

  return (
    <>
    <aside className="hidden lg:flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar sticky top-0">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border bg-black/5">
        <img src={Logo} alt="GestãoShop Admin" className="h-10 w-auto opacity-80 filter grayscale" />
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Admin</span>
      </div>

      {/* Admin Profile */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="mx-3 mt-3 flex items-center justify-between px-3 py-2.5 rounded-lg bg-sidebar-accent/20 border border-sidebar-border/50 hover:bg-sidebar-accent/40 transition-colors outline-none cursor-pointer">
            <div className="flex items-center gap-2.5 text-left">
              <div className="h-7 w-7 rounded-md bg-zinc-800 flex items-center justify-center text-[11px] font-bold text-white shadow-sm overflow-hidden shrink-0">
                {photo ? (
                  <img src={photo} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  (name || "A").charAt(0)
                )}
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[13px] font-medium text-sidebar-foreground truncate max-w-[120px]">
                  {name || "Administrador"}
                </span>
                <span className="text-[10px] text-destructive font-bold uppercase">
                  Super Admin
                </span>
              </div>
            </div>
            <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="center" className="w-56 rounded-xl bg-card border border-border p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 z-50">
             <DropdownMenu.Item 
               className="flex items-center gap-2 px-2.5 py-2 text-sm outline-none rounded-lg hover:bg-muted cursor-pointer text-foreground"
               onSelect={() => setPasswordModalOpen(true)}
             >
                <Lock className="w-4 h-4 text-muted-foreground" />
                Alterar Senha
             </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
        {items.map((item) => {
          const active = pathname === item.to || (item.to !== "/admin" && pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              {active && (
                <motion.div
                  layoutId="admin-sidebar-active"
                  className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
         <button 
           onClick={handleLogout}
           className="flex items-center justify-center gap-2 w-full text-[12px] font-medium py-2.5 rounded-md bg-sidebar-accent/30 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all border border-transparent hover:border-destructive/20"
         >
            <LogOut className="w-3.5 h-3.5" />
            Sair do Painel
         </button>
      </div>
    </aside>

    <AdminChangePasswordModal 
      open={passwordModalOpen} 
      onOpenChange={setPasswordModalOpen} 
    />
    </>
  );
}
