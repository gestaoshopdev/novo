import * as React from "react";
import { 
  Search, Bell, Command, Plus, HelpCircle, Settings, Moon, Sun, 
  ShoppingBag, Package, TrendingUp, CheckCircle2, AlertTriangle, 
  Clock, Trash2 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CommandPalette } from "./CommandPalette";
import { useLocation, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { useProfile } from "@/contexts/ProfileContext";
import { useNotifications } from "@/contexts/NotificationContext";

export function Topbar() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLight, setIsLight] = React.useState(false);
  const { user, signOut } = useAuth();
  const { photo, name } = useProfile();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsLight(true);
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggleTheme = () => {
    const newStatus = !isLight;
    setIsLight(newStatus);
    if (newStatus) {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  };

  const handleNovaVenda = () => {
    sessionStorage.setItem('openNovaVenda', 'true');
    if (location.pathname.includes('/app/sales')) {
      window.dispatchEvent(new CustomEvent('open-nova-venda'));
    } else {
      navigate({ to: '/app/sales' });
    }
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { notifications, addNotification, clearAll, markAllAsRead, unreadCount } = useNotifications();

  const [modalOpen, setModalOpen] = React.useState(false);

  const handleClear = () => {
    clearAll();
  };

  const handleViewAll = () => {
    setModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-border/60 glass-strong px-4 lg:px-6 flex items-center gap-3">
        {/* Search */}
        <button
          onClick={() => setOpen(true)}
          className="flex-1 max-w-md flex items-center gap-2.5 px-3 h-9 rounded-lg bg-surface/60 border border-border hover:border-border-strong transition-colors text-left group"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-[13px] text-muted-foreground flex-1">Pesquisar produtos, clientes, transações…</span>
          <kbd className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground bg-surface-elevated border border-border px-1.5 py-0.5 rounded">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <button 
            onClick={handleNovaVenda}
            className="hidden md:flex items-center gap-1.5 h-9 px-3 rounded-lg gradient-primary text-white text-[13px] font-semibold hover:opacity-90 transition-opacity glow-primary"
          >
            <Plus className="h-4 w-4" />
            Nova venda
          </button>
          <Link to="/app/settings" search={{ tab: "ajuda" }}>
            <IconBtn><HelpCircle className="h-4 w-4" /></IconBtn>
          </Link>
          <IconBtn onClick={toggleTheme}>
            {isLight ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </IconBtn>
          
          <Popover>
            <PopoverTrigger asChild>
              <IconBtn>
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full gradient-danger animate-pulse" />
                )}
              </IconBtn>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 bg-card border-border shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-background/40">
                <span className="text-sm font-bold">Notificações</span>
                <div className="flex items-center gap-3">
                   <button 
                    onClick={handleClear}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition disabled:opacity-50"
                    disabled={notifications.length === 0}
                   >
                    Limpar
                   </button>
                   <button 
                    onClick={handleViewAll}
                    className="text-[11px] text-primary hover:opacity-80 transition"
                   >
                    Ver todas
                   </button>
                </div>
              </div>
              <div className="max-h-[360px] overflow-y-auto py-1">
                {notifications.length > 0 ? (
                  notifications.map((n) => {
                    const Icon = n.type === "warning" ? Package : n.type === "success" ? ShoppingBag : TrendingUp;
                    return (
                      <NotificationItem 
                        key={n.id}
                        icon={Icon} 
                        title={n.title} 
                        desc={n.desc} 
                        createdAt={n.createdAt}
                        type={n.type}
                      />
                    );
                  })
                ) : (
                  <div className="py-12 px-4 text-center">
                    <Bell className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-[13px] font-medium text-muted-foreground">Tudo limpo por aqui!</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">Você não tem novas notificações.</p>
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-border/60 bg-background/20">
                <button 
                  onClick={() => navigate({ to: "/app/settings", search: { tab: "notificacoes" } } as any)}
                  className="w-full py-1.5 text-center text-[12px] text-muted-foreground hover:text-foreground transition"
                >
                   Configurações de notificação
                </button>
              </div>
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center text-[11px] font-bold text-black ring-2 ring-background uppercase overflow-hidden">
                {photo ? (
                  <img src={photo} alt="User" className="h-full w-full object-cover" />
                ) : (
                  (name?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase()
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Minha Conta</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })} className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={async () => {
                queryClient.clear();
                await signOut();
                navigate({ to: "/login" });
              }} className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <CommandPalette open={open} onOpenChange={setOpen} />
      <NotificationsModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        notifications={notifications}
        onClear={clearAll}
        onMarkRead={markAllAsRead}
      />
    </>
  );
}

function NotificationsModal({ 
  open, 
  onOpenChange, 
  notifications, 
  onClear,
  onMarkRead 
}: { 
  open: boolean; 
  onOpenChange: (o: boolean) => void;
  notifications: any[];
  onClear: () => void;
  onMarkRead: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-card border-border shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl font-bold tracking-tight">Todas as Notificações</DialogTitle>
          </div>
          <div className="flex items-center gap-2 pr-6">
            <button 
              onClick={onMarkRead}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition px-2 py-1 rounded-md hover:bg-surface"
            >
              Marcar como lidas
            </button>
            <button 
              onClick={onClear}
              className="text-xs font-medium text-destructive hover:bg-destructive/10 transition px-2 py-1 rounded-md"
            >
              Limpar tudo
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[400px]">
          {notifications.length > 0 ? (
            notifications.map((n) => {
              const Icon = n.type === "warning" ? Package : n.type === "success" ? ShoppingBag : TrendingUp;
              return (
                <div 
                  key={n.id}
                  className={cn(
                    "group relative p-4 rounded-xl border transition-all duration-200",
                    n.read ? "bg-background/40 border-border/60" : "bg-card border-primary/20 shadow-sm ring-1 ring-primary/10"
                  )}
                >
                  {!n.read && (
                    <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                  )}
                  <div className="flex gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                      n.type === "warning" ? "bg-warning/10 text-warning" : 
                      n.type === "success" ? "bg-success/10 text-success" : 
                      "bg-info/10 text-info"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-bold text-[15px]">{n.title}</h3>
                        <div className="flex items-center text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {typeof n.createdAt === 'number' && !isNaN(n.createdAt) 
                            ? formatDistanceToNow(n.createdAt, { addSuffix: true, locale: ptBR })
                            : "agora"}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                        {n.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-20 w-20 rounded-full bg-surface flex items-center justify-center mb-4">
                <Bell className="h-10 w-10 text-muted-foreground/20" />
              </div>
              <h3 className="text-lg font-bold">Nenhuma notificação</h3>
              <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
                Você está em dia! Avisaremos assim que algo novo acontecer.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-background/20 flex items-center justify-center">
           <p className="text-[11px] text-muted-foreground">
              Mostrando {notifications.length} notificações recentes
           </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NotificationItem({ icon: Icon, title, desc, createdAt, type }: { icon: any; title: string; desc: string; createdAt: number; type: 'warning' | 'success' | 'info' }) {
  const colors = {
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
    info: "bg-info/10 text-info"
  };

  return (
    <div className="px-4 py-3 hover:bg-background/60 transition-colors cursor-pointer group">
      <div className="flex gap-3">
        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", colors[type])}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-bold truncate">{title}</span>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {typeof createdAt === 'number' && !isNaN(createdAt)
                ? formatDistanceToNow(createdAt, { addSuffix: true, locale: ptBR })
                : "agora"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mt-0.5">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}

const IconBtn = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconBtn.displayName = "IconBtn";
