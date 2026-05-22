import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useChannels, useSales, useCreateChannel, useUpdateChannel, useDeleteChannel } from "@/hooks/useQueries";
import { Globe, Pencil, Trash2, Plus, Store } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  type ChannelInfo,
  formatBRL,
  type SaleRow,
  DEFAULT_CHANNELS,
} from "@/components/sales/types";

export const Route = createFileRoute("/app/channels")({
  head: () => ({ meta: [{ title: "Canais de Venda · Nimbus" }] }),
  component: ChannelsPage,
});

const SALES_KEY = "nimbus.sales.v1";

type PeriodFilter = "hoje" | "semanal" | "mensal" | "todos";

const periodLabels: Record<PeriodFilter, string> = {
  hoje: "Hoje",
  semanal: "Semanal",
  mensal: "Mensal",
  todos: "Todo Período",
};

function ChannelsPage() {
  const { data: channels = [], isLoading: loadingChannels } = useChannels();
  const { data: sales = [], isLoading: loadingSales } = useSales();
  
  const { mutate: createChannel } = useCreateChannel();
  const { mutate: updateChannel } = useUpdateChannel();
  const { mutate: deleteChannel } = useDeleteChannel();

  const isLoading = loadingChannels || loadingSales;

  const [period, setPeriod] = useState<PeriodFilter>("todos");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<ChannelInfo | null>(null);
  
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingChannel, setDeletingChannel] = useState<ChannelInfo | null>(null);

  // form state
  const [name, setName] = useState("");
  const [type, setType] = useState<"Online" | "Físico">("Online");



  const openModal = (c?: ChannelInfo) => {
    if (c) {
      setEditingChannel(c);
      setName(c.name);
      setType(c.type);
    } else {
      setEditingChannel(null);
      setName("");
      setType("Online");
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return toast.error("O nome do canal é obrigatório.");

    if (editingChannel) {
      updateChannel(
        { id: editingChannel.id, updates: { name: trimmed, type } },
        {
          onSuccess: () => {
            toast.success("Canal atualizado com sucesso!");
            setModalOpen(false);
          },
          onError: (err: any) => {
            toast.error(`Erro ao atualizar canal: ${err.message}`);
          }
        }
      );
    } else {
      const newId = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now().toString().slice(-4);
      createChannel(
        { id: newId, name: trimmed, type },
        {
          onSuccess: () => {
            toast.success("Novo canal criado com sucesso!");
            setModalOpen(false);
          },
          onError: (err: any) => {
            toast.error(`Erro ao criar canal: ${err.message}`);
          }
        }
      );
    }
  };

  const handleDelete = () => {
    if (!deletingChannel) return;
    deleteChannel(deletingChannel.id);
    toast.success("Canal excluído.");
    setDeleteOpen(false);
  };

  const stats = useMemo(() => {
    const now = Date.now();
    const periodMs: Record<PeriodFilter, number> = {
      todos: Infinity,
      hoje: 1000 * 60 * 60 * 24,
      semanal: 1000 * 60 * 60 * 24 * 7,
      mensal: 1000 * 60 * 60 * 24 * 30,
    };

    const validSales = sales.filter((s) => {
      if (s.status === "devolvida") return false;
      const diff = now - new Date(s.date).getTime();
      return diff <= periodMs[period];
    });

    const map: Record<string, { count: number; total: number; profit: number }> = {};
    for (const c of channels) {
      map[c.id] = { count: 0, total: 0, profit: 0 };
    }

    for (const s of validSales) {
      if (map[s.channel]) {
        map[s.channel].count += 1;
        map[s.channel].total += s.total;
        map[s.channel].profit += s.profit;
      }
    }
    return map;
  }, [sales, channels, period]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Canais de Venda"
        subtitle="Gerencie onde você vende seus produtos"
        icon={Globe}
        actions={
          <Button
            onClick={() => openModal()}
            className="gradient-primary text-white font-semibold shadow-lg glow-primary border-transparent hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Novo Canal
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">Filtrar lucros:</span>
        {(Object.keys(periodLabels) as PeriodFilter[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
              period === p
                ? "bg-success text-success-foreground border-success"
                : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-card/50"
            )}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-24 flex items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Carregando canais...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {channels.map((c) => {
            const st = stats[c.id] || { count: 0, total: 0, profit: 0 };
            const isDefault = DEFAULT_CHANNELS.some(dc => dc.id === c.id || dc.name.toLowerCase() === c.name.toLowerCase());
            return (
              <div
                key={c.id}
                className="rounded-xl border border-border bg-card/40 backdrop-blur-md p-5 flex flex-col hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {c.type === "Online" ? <Globe className="h-5 w-5" /> : <Store className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{c.name}</h3>
                        {isDefault && (
                          <span className="text-[9px] font-bold uppercase tracking-widest bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border/50">
                            Padrão
                          </span>
                        )}
                      </div>
                      <div className="inline-flex mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase bg-primary/10 text-primary border border-primary/20">
                        {c.type}
                      </div>
                    </div>
                  </div>
                  {!isDefault && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openModal(c)}
                        className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-background/80 hover:text-foreground transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingChannel(c);
                          setDeleteOpen(true);
                        }}
                        className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Vendas</span>
                    <span className="font-medium text-foreground">{st.count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Vendido</span>
                    <span className="font-medium text-foreground">{formatBRL(st.total)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lucro</span>
                    <span className="font-semibold text-success">{formatBRL(st.profit)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingChannel ? "Editar Canal" : "Novo Canal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Nome do Canal</Label>
              <Input
                placeholder="Ex: Facebook Ads"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v: "Online" | "Físico") => setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Físico">Físico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {editingChannel ? "Salvar" : "Criar Canal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir canal?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir o canal <span className="font-semibold text-foreground">{deletingChannel?.name}</span>.
              As vendas atreladas a ele continuarão existindo com o ID original, mas o canal não estará mais disponível para novas vendas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
