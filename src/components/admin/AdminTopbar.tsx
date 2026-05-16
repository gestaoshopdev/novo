import { Bell, Search, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AdminTopbar() {
  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-sm hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar usuários, faturas..." 
            className="pl-9 bg-muted/50 border-transparent focus-visible:border-primary h-9 rounded-full text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-[11px] font-bold uppercase tracking-wider">
           <ShieldAlert className="w-3.5 h-3.5" />
           <span>Modo Admin</span>
        </div>

        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
        </button>
      </div>
    </header>
  );
}
