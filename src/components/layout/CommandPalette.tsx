import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty } from "@/components/ui/command";
import { useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Package, ShoppingCart, Wallet, BarChart3, Plus,
  Users, Settings, Sparkles, Zap,
} from "lucide-react";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const go = (to: string) => { onOpenChange(false); navigate({ to }); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xl gap-0 glass-strong border-border-strong overflow-hidden">
        <Command className="bg-transparent">
          <CommandInput placeholder="Digite um comando ou pesquise…" className="h-12 text-[14px]" />
          <CommandList className="max-h-96">
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup heading="Ações rápidas">
              <CommandItem onSelect={() => go("/app/sales")}><Plus className="h-4 w-4 text-primary"/>Criar nova venda</CommandItem>
              <CommandItem onSelect={() => go("/app/products")}><Package className="h-4 w-4 text-primary"/>Cadastrar produto</CommandItem>
              <CommandItem onSelect={() => go("/app/cashflow")}><Wallet className="h-4 w-4 text-primary"/>Lançar movimento</CommandItem>
              <CommandItem onSelect={() => go("/app/analytics")}><Sparkles className="h-4 w-4 text-primary"/>Perguntar à IA</CommandItem>
            </CommandGroup>
            <CommandGroup heading="Navegação">
              <CommandItem onSelect={() => go("/app")}><LayoutDashboard className="h-4 w-4"/>Dashboard</CommandItem>
              <CommandItem onSelect={() => go("/app/sales")}><ShoppingCart className="h-4 w-4"/>Vendas</CommandItem>
              <CommandItem onSelect={() => go("/app/products")}><Package className="h-4 w-4"/>Produtos</CommandItem>
              <CommandItem onSelect={() => go("/app/cashflow")}><Wallet className="h-4 w-4"/>Fluxo de caixa</CommandItem>
              <CommandItem onSelect={() => go("/app/analytics")}><BarChart3 className="h-4 w-4"/>Analytics</CommandItem>
              <CommandItem onSelect={() => go("/app/crm")}><Users className="h-4 w-4"/>CRM</CommandItem>
              <CommandItem onSelect={() => go("/app/automations")}><Zap className="h-4 w-4"/>Automações</CommandItem>
              <CommandItem onSelect={() => go("/app/settings")}><Settings className="h-4 w-4"/>Configurações</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
