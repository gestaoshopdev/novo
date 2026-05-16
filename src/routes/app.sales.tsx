import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useSales, useProducts, useChannels, useCreateSale, useUpdateSale, useDeleteSale, useUpdateProduct } from "@/hooks/useQueries";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  ShoppingCart,
  Plus,
  Search,
  Receipt,
  Pencil,
  Undo2,
  Trash2,
  Columns3,
  ArrowDown,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
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
import { RegisterSaleModal } from "@/components/sales/RegisterSaleModal";
import { ReceiptModal } from "@/components/sales/ReceiptModal";
import { EditSaleModal } from "@/components/sales/EditSaleModal";
import {
  type SaleRow,
  type SaleChannel,
  type PaymentMethod,
  paymentLabels,
  formatBRL,
  loadChannels,
  type ChannelInfo,
  CHANNELS_KEY,
  DEFAULT_CHANNELS,
} from "@/components/sales/types";
import type { ProductRow, StockMovement } from "@/components/products/types";
import { statusFromStock } from "@/components/products/types";

export const Route = createFileRoute("/app/sales")({
  head: () => ({ meta: [{ title: "Vendas · Nimbus" }] }),
  component: SalesPage,
});



type PeriodFilter = "todos" | "hoje" | "7d" | "30d" | "90d";

const periodLabels: Record<PeriodFilter, string> = {
  todos: "Todo período",
  hoje: "Hoje",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
};

const COLUMNS = [
  { key: "produto", label: "Produto" },
  { key: "qtd", label: "Qtd" },
  { key: "lucro", label: "Lucro" },
  { key: "data", label: "Data" },
  { key: "cliente", label: "Cliente" },
  { key: "pagamento", label: "Pagamento" },
  { key: "canal", label: "Canal" },
  { key: "total", label: "Total" },
] as const;

type ColKey = (typeof COLUMNS)[number]["key"];



function SalesPage() {
  const { data: sales = [], isLoading: loadingSales } = useSales();
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: channels = [], isLoading: loadingChannels } = useChannels();
  const { mutate: createSale } = useCreateSale();
  const { mutate: updateSale } = useUpdateSale();
  const { mutate: deleteSale } = useDeleteSale();
  const { mutate: updateProduct } = useUpdateProduct();
  const { addNotification } = useNotifications();

  const isLoading = loadingSales || loadingProducts || loadingChannels;
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("todos");
  const [channelFilters, setChannelFilters] = useState<SaleChannel[]>([]);
  const [paymentFilters, setPaymentFilters] = useState<PaymentMethod[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [visibleCols, setVisibleCols] = useState<ColKey[]>([
    "produto",
    "qtd",
    "lucro",
    "data",
    "cliente",
    "pagamento",
    "canal",
    "total",
  ]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // modais
  const [registerOpen, setRegisterOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [activeSale, setActiveSale] = useState<SaleRow | null>(null);

  useEffect(() => {
    const checkAndOpen = () => {
      if (sessionStorage.getItem('openNovaVenda') === 'true') {
        sessionStorage.removeItem('openNovaVenda');
        setRegisterOpen(true);
      }
    };

    checkAndOpen();

    const handleOpenNovaVenda = () => checkAndOpen();
    window.addEventListener('open-nova-venda', handleOpenNovaVenda);
    return () => window.removeEventListener('open-nova-venda', handleOpenNovaVenda);
  }, []);

  const allCategories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = Date.now();
    const periodMs: Record<PeriodFilter, number> = {
      todos: Infinity,
      hoje: 1000 * 60 * 60 * 24,
      "7d": 1000 * 60 * 60 * 24 * 7,
      "30d": 1000 * 60 * 60 * 24 * 30,
      "90d": 1000 * 60 * 60 * 24 * 90,
    };
    return sales
      .filter((s) => {
        if (q) {
          const hay = `${s.code} ${s.buyerName ?? ""} ${s.items.map((i) => `${i.sku} ${i.productName}`).join(" ")}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (period !== "todos") {
          const diff = now - new Date(s.date).getTime();
          if (diff > periodMs[period]) return false;
        }
        if (channelFilters.length && !channelFilters.includes(s.channel)) return false;
        if (paymentFilters.length && !paymentFilters.includes(s.payment)) return false;
        if (categoryFilters.length) {
          const cats = s.items
            .map((it) => products.find((p) => p.sku === it.sku)?.category)
            .filter(Boolean) as string[];
          if (!cats.some((c) => categoryFilters.includes(c))) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, search, period, channelFilters, paymentFilters, categoryFilters, products]);

  const allSelected = filtered.length > 0 && filtered.every((s) => selectedIds.has(s.id));
  const someSelected = selectedIds.size > 0;

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((s) => s.id)));
  };
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ações
  const handleRegister = (sale: SaleRow, onDone?: () => void) => {
    createSale(sale, {
      onSuccess: () => {
        // baixar estoque
        products.forEach((p) => {
          const item = sale.items.find((i) => i.sku === p.sku);
          if (!item) return;
          const newStock = Math.max(0, p.stock - item.quantity);
          const movement = {
            date: sale.date,
            type: "saida" as const,
            quantity: -item.quantity,
            note: `Venda ${sale.code}`,
          };
          updateProduct({
            sku: p.sku,
            updates: { stock: newStock, status: statusFromStock(newStock) },
            history: movement,
          });

          // Notificar estoque baixo se aplicável
          const savedPrefs = localStorage.getItem("atlas_notification_prefs");
          const threshold = savedPrefs ? JSON.parse(savedPrefs).estoqueMinimo ?? 5 : 5;
          
          if (newStock < threshold) {
            addNotification({
              title: "Estoque Baixo",
              desc: `O produto '${p.name}' atingiu ${newStock} unidades.`,
              type: "warning",
              category: "estoque"
            });
          }
        });

        // Notificar venda
        addNotification({
          title: "Nova Venda",
          desc: `Venda ${sale.code} de ${formatBRL(sale.total)} via ${channels.find(c => c.id === sale.channel)?.name || "—"}.`,
          type: "success",
          category: "vendas"
        });

        // Verificar metas (Baseado na meta configurada pelo usuário)
        const savedPrefsForMeta = localStorage.getItem("atlas_notification_prefs");
        const metaTarget = savedPrefsForMeta ? JSON.parse(savedPrefsForMeta).metaMensal ?? 5000 : 5000;

        const currentMonthSales = [...sales, sale].filter(s => {
          const sDate = new Date(s.date);
          const now = new Date();
          return sDate.getMonth() === now.getMonth() && sDate.getFullYear() === now.getFullYear();
        });
        const monthRevenue = currentMonthSales.reduce((acc, s) => acc + (s.total || 0), 0);
        const prevRevenue = monthRevenue - sale.total;
        
        const notifyMeta = (percent: number, emoji: string) => {
          addNotification({
            title: `Meta ${percent}% Atingida! ${emoji}`,
            desc: `Parabéns! Você atingiu ${percent}% da sua meta de ${formatBRL(metaTarget)} este mês.`,
            type: "info",
            category: "metas"
          });
        };

        if (monthRevenue >= metaTarget && prevRevenue < metaTarget) {
          notifyMeta(100, "🏆");
        } else if (monthRevenue >= metaTarget * 0.8 && prevRevenue < metaTarget * 0.8) {
          notifyMeta(80, "🚀");
        } else if (monthRevenue >= metaTarget * 0.5 && prevRevenue < metaTarget * 0.5) {
          notifyMeta(50, "📈");
        }

        toast.success("Venda registrada com sucesso!");
        setRegisterOpen(false);
        onDone?.();
      },
      onError: (err: any) => {
        toast.error(`Erro ao registrar venda: ${err.message}`);
        onDone?.();
      }
    });
  };

  const handleReturn = (sale: SaleRow) => {
    // devolve estoque
    products.forEach((p) => {
      const item = sale.items.find((i) => i.sku === p.sku);
      if (!item) return;
      const newStock = p.stock + item.quantity;
      const movement = {
        date: new Date().toISOString(),
        type: "entrada" as const,
        quantity: item.quantity,
        note: `Devolução da venda ${sale.code}`,
      };
      updateProduct({
        sku: p.sku,
        updates: { stock: newStock, status: statusFromStock(newStock) },
        history: movement,
      });
    });
    updateSale({ id: sale.id, updates: { status: "devolvida" } });
    toast.success(`Itens da venda ${sale.code} retornaram ao estoque.`);
  };

  const handleDelete = (sale: SaleRow) => {
    deleteSale(sale.id, {
      onSuccess: () => {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(sale.id);
          return next;
        });
        toast.success(`Venda ${sale.code} excluída.`);
        setDeleteOpen(false);
      },
      onError: (err: any) => {
        toast.error(`Erro ao excluir venda: ${err.message}`);
      }
    });
  };

  const handleSaveEdit = (s: SaleRow) => {
    updateSale({ id: s.id, updates: s }, {
      onSuccess: () => {
        toast.success("Venda atualizada com sucesso!");
        setEditOpen(false);
      },
      onError: (err: any) => {
        toast.error(`Erro ao atualizar venda: ${err.message}`);
      }
    });
  };

  // ações em massa
  const bulkSelected = sales.filter((s) => selectedIds.has(s.id));
  const handleBulkReceipt = () => {
    if (bulkSelected.length === 1) {
      setActiveSale(bulkSelected[0]);
      setReceiptOpen(true);
    } else toast.info("Selecione apenas 1 venda para gerar recibo.");
  };
  const handleBulkEdit = () => {
    if (bulkSelected.length === 1) {
      setActiveSale(bulkSelected[0]);
      setEditOpen(true);
    } else toast.info("Selecione apenas 1 venda para editar.");
  };
  const handleBulkReturn = () => {
    if (!bulkSelected.length) return;
    bulkSelected.filter((s) => s.status !== "devolvida").forEach(handleReturn);
    setSelectedIds(new Set());
  };
  const handleBulkDelete = () => {
    if (!bulkSelected.length) return;
    bulkSelected.forEach(handleDelete);
    setSelectedIds(new Set());
  };

  return (
    <div>
      <PageHeader
        title="Vendas"
        subtitle="Registre e acompanhe suas vendas"
        icon={ShoppingCart}
        actions={
          <Button
            onClick={() => setRegisterOpen(true)}
            className="bg-success hover:bg-success/90 text-success-foreground font-semibold shadow-lg shadow-success/20"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Nova Venda
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vendas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card/60 border-border"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* Período */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-card/60">
                {periodLabels[period]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
                {(Object.keys(periodLabels) as PeriodFilter[]).map((k) => (
                  <DropdownMenuRadioItem key={k} value={k}>{periodLabels[k]}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Canal */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-card/60">
                Canal{channelFilters.length > 0 && ` (${channelFilters.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Canal de venda</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {channels.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.id}
                  checked={channelFilters.includes(c.id)}
                  onCheckedChange={(v) =>
                    setChannelFilters((prev) => (v ? [...prev, c.id] : prev.filter((x) => x !== c.id)))
                  }
                >
                  {c.name}
                </DropdownMenuCheckboxItem>
              ))}
              {channelFilters.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setChannelFilters([])}>Limpar</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Pagamento */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-card/60">
                Pagamento{paymentFilters.length > 0 && ` (${paymentFilters.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Forma de pagamento</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(paymentLabels) as PaymentMethod[]).map((k) => (
                <DropdownMenuCheckboxItem
                  key={k}
                  checked={paymentFilters.includes(k)}
                  onCheckedChange={(v) =>
                    setPaymentFilters((prev) => (v ? [...prev, k] : prev.filter((x) => x !== k)))
                  }
                >
                  {paymentLabels[k]}
                </DropdownMenuCheckboxItem>
              ))}
              {paymentFilters.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setPaymentFilters([])}>Limpar</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Categoria */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-card/60">
                Categoria{categoryFilters.length > 0 && ` (${categoryFilters.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Categoria</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allCategories.length === 0 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">Nenhuma categoria</div>
              )}
              {allCategories.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c}
                  checked={categoryFilters.includes(c)}
                  onCheckedChange={(v) =>
                    setCategoryFilters((prev) => (v ? [...prev, c] : prev.filter((x) => x !== c)))
                  }
                >
                  {c}
                </DropdownMenuCheckboxItem>
              ))}
              {categoryFilters.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCategoryFilters([])}>Limpar</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Colunas */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-card/60">
                <Columns3 className="h-4 w-4 mr-1.5" /> Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mostrar colunas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {COLUMNS.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.key}
                  checked={visibleCols.includes(c.key)}
                  onCheckedChange={(v) =>
                    setVisibleCols((prev) =>
                      v ? [...prev, c.key] : prev.filter((x) => x !== c.key),
                    )
                  }
                >
                  {c.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabela */}
      {isLoading ? (
        <div className="py-24 flex items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Carregando vendas...</p>
          </div>
        </div>
      ) : (
      <div className="rounded-2xl border border-border bg-card/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background/40">
                <th className="w-10 px-4 py-3">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                </th>
                {visibleCols.includes("produto") && <Th>Produto</Th>}
                {visibleCols.includes("qtd") && <Th>Qtd</Th>}
                {visibleCols.includes("lucro") && <Th>Lucro</Th>}
                {visibleCols.includes("data") && (
                  <Th>
                    <span className="inline-flex items-center gap-1">
                      Data <ArrowDown className="h-3 w-3" />
                    </span>
                  </Th>
                )}
                {visibleCols.includes("cliente") && <Th>Cliente</Th>}
                {visibleCols.includes("pagamento") && <Th>Pagamento</Th>}
                {visibleCols.includes("canal") && <Th>Canal</Th>}
                {visibleCols.includes("total") && <Th>Total</Th>}
                <Th className="text-right pr-6">Ações</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={visibleCols.length + 2} className="px-6 py-16 text-center">
                    <div className="text-muted-foreground text-sm">
                      Nenhuma venda registrada ainda.
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 text-success"
                      onClick={() => setRegisterOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1.5" /> Registrar primeira venda
                    </Button>
                  </td>
                </tr>
              )}
              <AnimatePresence initial={false}>
                {filtered.map((s) => {
                  const totalQty = s.items ? s.items.reduce((a, b) => a + b.quantity, 0) : 0;
                  const isReturned = s.status === "devolvida";
                  const productLabel =
                    s.items && s.items.length > 0
                      ? s.items.length === 1
                        ? s.items[0].productName
                        : `${s.items[0].productName} +${s.items.length - 1}`
                      : "Venda sem itens";
                  return (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "border-b border-border/50 hover:bg-background/40 transition-colors",
                        isReturned && "opacity-60",
                      )}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedIds.has(s.id)}
                          onCheckedChange={() => toggleOne(s.id)}
                        />
                      </td>
                      {visibleCols.includes("produto") && (
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{productLabel}</span>
                            {isReturned && (
                              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-semibold">
                                Devolvida
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{s.code}</div>
                        </td>
                      )}
                      {visibleCols.includes("qtd") && <td className="px-2 py-3">{totalQty}</td>}
                      {visibleCols.includes("lucro") && (
                        <td className="px-2 py-3">
                          <span className={cn("font-semibold", s.profit >= 0 ? "text-success" : "text-destructive")}>
                            {formatBRL(s.profit)}
                          </span>
                        </td>
                      )}
                      {visibleCols.includes("data") && (
                        <td className="px-2 py-3 text-muted-foreground">
                          {new Date(s.date).toLocaleDateString("pt-BR")}
                        </td>
                      )}
                      {visibleCols.includes("cliente") && (
                        <td className="px-2 py-3 text-muted-foreground truncate max-w-[120px]">
                          {s.buyerName || "—"}
                        </td>
                      )}
                      {visibleCols.includes("pagamento") && (
                        <td className="px-2 py-3 text-muted-foreground">
                          <span className="px-2 py-0.5 rounded-full bg-surface border border-border text-[11px]">
                            {paymentLabels[s.payment]}
                          </span>
                        </td>
                      )}
                      {visibleCols.includes("canal") && (
                        <td className="px-2 py-3 text-muted-foreground">
                          {channels.find(c => c.id === s.channel)?.name || s.channel}
                        </td>
                      )}
                      {visibleCols.includes("total") && (
                        <td className="px-2 py-3 font-medium">{formatBRL(s.total)}</td>
                      )}
                      <td className="px-2 py-3 pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <RowAction
                            icon={Receipt}
                            label="Recibo"
                            onClick={() => {
                              setActiveSale(s);
                              setReceiptOpen(true);
                            }}
                          />
                          <RowAction
                            icon={Pencil}
                            label="Editar"
                            onClick={() => {
                              setActiveSale(s);
                              setEditOpen(true);
                            }}
                          />
                          {!isReturned && (
                            <RowAction
                              icon={Undo2}
                              label="Devolver ao estoque"
                              onClick={() => {
                                setActiveSale(s);
                                setReturnOpen(true);
                              }}
                            />
                          )}
                          <RowAction
                            icon={Trash2}
                            label="Excluir"
                            danger
                            onClick={() => {
                              setActiveSale(s);
                              setDeleteOpen(true);
                            }}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Bulk action bar */}
      <AnimatePresence>
        {someSelected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 rounded-2xl border border-border bg-card/60 backdrop-blur px-4 py-3 flex items-center gap-4"
          >
            <span className="text-sm text-muted-foreground">
              Ações: <span className="text-foreground font-medium">{selectedIds.size} selecionada(s)</span>
            </span>
            <div className="flex items-center gap-1">
              <BulkBtn icon={Receipt} label="Recibo" onClick={handleBulkReceipt} />
              <BulkBtn icon={Pencil} label="Editar" onClick={handleBulkEdit} />
              <BulkBtn icon={RotateCcw} label="Devolver ao Estoque" onClick={handleBulkReturn} />
              <BulkBtn icon={Trash2} label="Excluir" danger onClick={handleBulkDelete} />
            </div>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            >
              Limpar seleção
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modais */}
      <RegisterSaleModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        products={products}
        onSubmit={(sale) => handleRegister(sale)}
      />
      <ReceiptModal open={receiptOpen} onOpenChange={setReceiptOpen} sale={activeSale} />
      <EditSaleModal
        open={editOpen}
        onOpenChange={setEditOpen}
        sale={activeSale}
        onSave={handleSaveEdit}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir venda?</AlertDialogTitle>
            <AlertDialogDescription>
              A venda <span className="font-semibold text-foreground">{activeSale?.code}</span> será removida
              permanentemente. Essa ação não devolve itens ao estoque — para isso, use "Devolver ao estoque".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => activeSale && handleDelete(activeSale)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={returnOpen} onOpenChange={setReturnOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Devolver itens ao estoque?</AlertDialogTitle>
            <AlertDialogDescription>
              Os produtos da venda <span className="font-semibold text-foreground">{activeSale?.code}</span> retornarão
              ao estoque e a venda será marcada como devolvida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => activeSale && handleReturn(activeSale)}
              className="bg-success hover:bg-success/90"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Confirmar devolução
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground", className)}>
      {children}
    </th>
  );
}

function RowAction({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground transition-colors",
        danger && "hover:text-destructive",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function BulkBtn({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-background hover:text-foreground transition-colors",
        danger && "hover:text-destructive",
      )}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}
