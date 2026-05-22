import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useCategories } from "@/hooks/useQueries";
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  ArrowDownToLine,
  History,
  Pencil,
  Trash2,
  Check,
  Upload,
  LayoutGrid,
  List,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { NewProductModal, type NewProduct } from "@/components/products/NewProductModal";
import { ProductDetailsModal } from "@/components/products/ProductDetailsModal";
import { EditProductModal } from "@/components/products/EditProductModal";
import { StockEntryModal } from "@/components/products/StockEntryModal";
import { ProductHistoryModal } from "@/components/products/ProductHistoryModal";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  type ProductRow,
  type ProductStatus,
  calcMargin,
  statusFromStock,
} from "@/components/products/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/products")({
  head: () => ({ meta: [{ title: "Produtos · Nimbus" }] }),
  component: ProductsPage,
});

const initialProducts: ProductRow[] = [];

const statusStyle: Record<string, string> = {
  ativo: "bg-success/15 text-success",
  baixo: "bg-warning/15 text-warning",
  esgotado: "bg-destructive/15 text-destructive",
};

type StockFilter = "todos" | "disponivel" | "baixo" | "esgotado";



function ProductsPage() {
  const { data: products = [], isLoading } = useProducts();
  const { mutate: createProduct } = useCreateProduct();
  const { mutate: updateProduct } = useUpdateProduct();
  const { mutate: deleteProduct } = useDeleteProduct();
  const { data: categoryData = [] } = useCategories();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filtros
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [stockFilter, setStockFilter] = useState<StockFilter>("todos");
  const [statusFilters, setStatusFilters] = useState<ProductStatus[]>([]);

  // Modais por linha
  const [selected, setSelected] = useState<ProductRow | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "gallery">("list");

  const allCategories = useMemo(
    () => categoryData.map(c => c.name).sort(),
    [categoryData],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !(`${p.sku} ${p.name} ${p.category}`.toLowerCase().includes(q))) return false;
      if (categoryFilters.length && !categoryFilters.includes(p.category)) return false;
      if (statusFilters.length && !statusFilters.includes(p.status)) return false;
      if (stockFilter === "disponivel" && p.stock < 10) return false;
      if (stockFilter === "baixo" && (p.stock <= 0 || p.stock >= 10)) return false;
      if (stockFilter === "esgotado" && p.stock > 0) return false;
      return true;
    });
  }, [products, search, categoryFilters, statusFilters, stockFilter]);

  const activeFiltersCount =
    categoryFilters.length + statusFilters.length + (stockFilter !== "todos" ? 1 : 0);

  const clearFilters = () => {
    setCategoryFilters([]);
    setStatusFilters([]);
    setStockFilter("todos");
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(p => p.sku)));
    }
  };

  const toggleOne = (sku: string) => {
    const next = new Set(selectedIds);
    if (next.has(sku)) next.delete(sku);
    else next.add(sku);
    setSelectedIds(next);
  };

  const handleCreate = (data: NewProduct) => {
    // Gera um SKU único baseado no timestamp para evitar conflitos de duplicidade
    const timestamp = Date.now().toString().slice(-6);
    const sku = `NMB-${timestamp}`;
    const margin = calcMargin(data.costPrice, data.retailPrice);
    const row: ProductRow = {
      sku,
      name: data.name,
      category: data.category,
      stock: data.stock,
      price: data.retailPrice,
      costPrice: data.costPrice,
      wholesalePrice: data.wholesalePrice,
      supplier: data.supplier,
      purchaseDate: data.purchaseDate,
      margin,
      status: statusFromStock(data.stock),
      photo: data.photos[0],
      photos: data.photos,
      inCatalog: data.inCatalog,
      catalogIds: data.catalogIds,
      createdAt: new Date().toISOString(),
      history: [],
    };
    const historyEntry = {
      date: new Date().toISOString(),
      type: "criacao" as const,
      quantity: data.stock,
      note: `Produto cadastrado com ${data.stock} unidades`,
    };
    createProduct(
      { product: row, history: historyEntry },
      {
        onSuccess: () => {
          toast.success("Produto criado com sucesso!");
          setOpen(false);
        },
        onError: (err: any) => toast.error(`Erro ao criar produto: ${err.message}`)
      }
    );
  };

  const handleUpdate = (updated: ProductRow, explicitMovement?: any) => {
    const firstHistory = updated.history?.[0];
    const isNewHistory = firstHistory && typeof firstHistory.id === "string" && firstHistory.id.includes("-");
    const historyToSave = explicitMovement || (isNewHistory ? firstHistory : undefined);
    
    updateProduct(
      { sku: updated.sku, updates: updated, history: historyToSave },
      {
        onSuccess: () => {
          toast.success("Produto atualizado com sucesso!");
          setEditOpen(false);
          setStockOpen(false);
        },
        onError: (err: any) => toast.error(`Erro ao atualizar produto: ${err.message}`)
      }
    );
  };

  const handleDelete = () => {
    if (!selected) return;
    deleteProduct(selected.sku);
    toast.success(`${selected.name} excluído`);
    setDeleteOpen(false);
    setSelected(null);
  };

  const handleBulkDelete = () => {
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = () => {
    selectedIds.forEach(sku => deleteProduct(sku));
    toast.success("Produtos excluídos");
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split("\n");
      const dataRows = lines.slice(1).filter(line => line.trim() !== "");

      let successCount = 0;
      let errorCount = 0;

      toast.loading(`Importando ${dataRows.length} produtos...`, { id: "import-toast" });

      for (const row of dataRows) {
        const values: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        values.push(current.trim());

        const sku = values[0];
        const name = values[1];
        const category = values[2] || "Geral";
        const stock = parseInt(values[3]) || 0;
        const costPrice = parseFloat(values[4]) || 0;
        const retailPrice = parseFloat(values[5]) || 0;
        const wholesalePrice = parseFloat(values[6]) || null;
        const supplier = values[9] || "";
        const photo = values[10] || "";

        if (!name || !sku) {
          errorCount++;
          continue;
        }

        try {
          const margin = calcMargin(costPrice, retailPrice);
          const productRow: ProductRow = {
            sku,
            name,
            category,
            stock,
            price: retailPrice,
            costPrice,
            wholesalePrice,
            supplier,
            purchaseDate: new Date().toISOString().split('T')[0],
            margin,
            status: statusFromStock(stock),
            photo: photo,
            photos: photo ? [photo] : [],
            inCatalog: true,
            createdAt: new Date().toISOString(),
            history: [],
          };
          
          const historyEntry = {
            date: new Date().toISOString(),
            type: "criacao" as const,
            quantity: stock,
            note: `Importado via CSV`,
          };

          await createProduct({ product: productRow, history: historyEntry });
          successCount++;
        } catch (err) {
          console.error("Erro ao importar produto:", row, err);
          errorCount++;
        }
      }

      toast.dismiss("import-toast");
      if (successCount > 0) {
        toast.success(`${successCount} produtos importados com sucesso!`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} produtos falharam. Verifique SKU e Nome.`);
      }
      
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const exportCsv = () => {
    const dataToExport = selectedIds.size > 0 
      ? filtered.filter(p => selectedIds.has(p.sku))
      : filtered;

    if (!dataToExport.length) {
      toast.error("Nenhum produto para exportar");
      return;
    }
    const headers = [
      "SKU",
      "Nome",
      "Categoria",
      "Estoque",
      "Custo",
      "Preço Varejo",
      "Preço Atacado",
      "Margem (%)",
      "Status",
      "Fornecedor",
      "Imagem",
    ];
    const rows = dataToExport.map((p) => [
      p.sku,
      p.name,
      p.category,
      p.stock,
      p.costPrice ?? "",
      p.price.toFixed(2),
      p.wholesalePrice ?? "",
      p.margin,
      p.status,
      p.supplier ?? "",
      p.photo || "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `produtos-nimbus-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${dataToExport.length} produto(s) exportado(s)`);
  };

  const openModal = (p: ProductRow, modal: "details" | "edit" | "stock" | "history" | "delete") => {
    setSelected(p);
    if (modal === "details") setDetailsOpen(true);
    if (modal === "edit") setEditOpen(true);
    if (modal === "stock") setStockOpen(true);
    if (modal === "history") setHistoryOpen(true);
    if (modal === "delete") setDeleteOpen(true);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div>
        <PageHeader
          title="Produtos"
          subtitle="Gerencie catálogo, estoque, variações e fornecedores."
          icon={Package}
          actions={
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="h-9 px-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-[12px] font-medium hover:bg-destructive/20 inline-flex items-center gap-1.5 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remover ({selectedIds.size})
                </button>
              )}
              <div className="relative">
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  id="import-products-csv" 
                  onChange={handleImport}
                />
                <button
                  onClick={() => document.getElementById("import-products-csv")?.click()}
                  className="h-9 px-3 rounded-lg bg-card border border-border text-[12px] font-medium hover:border-border-strong inline-flex items-center gap-1.5 transition"
                >
                  <Upload className="h-3.5 w-3.5" /> Importar
                </button>
              </div>
              <button
                onClick={exportCsv}
                className="h-9 px-3 rounded-lg bg-card border border-border text-[12px] font-medium hover:border-border-strong inline-flex items-center gap-1.5 transition"
              >
                <Download className="h-3.5 w-3.5" /> {selectedIds.size > 0 ? "Exportar Seleção" : "Exportar Tudo"}
              </button>
              <button
                onClick={() => setOpen(true)}
                className="h-9 px-3 rounded-lg gradient-primary text-white text-[12px] font-semibold inline-flex items-center gap-1.5 glow-primary"
              >
                <Plus className="h-3.5 w-3.5" /> Novo produto
              </button>
            </div>
          }
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-64 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por SKU, nome ou categoria…"
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-card border border-border text-[13px] focus:outline-none focus:border-primary/60 transition"
            />
          </div>

          {/* Categoria */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`h-9 px-3 rounded-lg bg-card border text-[12px] font-medium hover:border-border-strong inline-flex items-center gap-1.5 transition ${
                  categoryFilters.length ? "border-primary/60 text-primary" : "border-border"
                }`}
              >
                <Filter className="h-3.5 w-3.5" /> Categoria
                {categoryFilters.length > 0 && (
                  <span className="ml-1 h-4 min-w-4 px-1 rounded-full bg-primary/20 text-primary text-[10px] font-semibold inline-flex items-center justify-center">
                    {categoryFilters.length}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Filtrar por categoria</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allCategories.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c}
                  checked={categoryFilters.includes(c)}
                  onCheckedChange={(v) =>
                    setCategoryFilters((prev) =>
                      v ? [...prev, c] : prev.filter((x) => x !== c),
                    )
                  }
                >
                  {c}
                </DropdownMenuCheckboxItem>
              ))}
              {categoryFilters.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCategoryFilters([])}>
                    Limpar seleção
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Estoque */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`h-9 px-3 rounded-lg bg-card border text-[12px] font-medium hover:border-border-strong transition ${
                  stockFilter !== "todos" ? "border-primary/60 text-primary" : "border-border"
                }`}
              >
                Estoque
                {stockFilter !== "todos" && (
                  <span className="ml-1.5 text-[10px] capitalize">· {stockFilter}</span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Nível de estoque</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(
                [
                  { v: "todos", label: "Todos" },
                  { v: "disponivel", label: "Disponível (≥10)" },
                  { v: "baixo", label: "Baixo (<10)" },
                  { v: "esgotado", label: "Esgotado" },
                ] as const
              ).map((opt) => (
                <DropdownMenuItem
                  key={opt.v}
                  onClick={() => setStockFilter(opt.v as StockFilter)}
                  className="justify-between"
                >
                  {opt.label}
                  {stockFilter === opt.v && <Check className="h-3.5 w-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`h-9 px-3 rounded-lg bg-card border text-[12px] font-medium hover:border-border-strong transition ${
                  statusFilters.length ? "border-primary/60 text-primary" : "border-border"
                }`}
              >
                Status
                {statusFilters.length > 0 && (
                  <span className="ml-1 h-4 min-w-4 px-1 rounded-full bg-primary/20 text-primary text-[10px] font-semibold inline-flex items-center justify-center">
                    {statusFilters.length}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel>Status do produto</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["ativo", "baixo", "esgotado"] as ProductStatus[]).map((s) => (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={statusFilters.includes(s)}
                  onCheckedChange={(v) =>
                    setStatusFilters((prev) =>
                      v ? [...prev, s] : prev.filter((x) => x !== s),
                    )
                  }
                  className="capitalize"
                >
                  {s}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="h-9 px-3 rounded-lg text-[12px] font-medium text-muted-foreground hover:text-foreground transition"
            >
              Limpar filtros
            </button>
          )}

          <div className="flex items-center bg-card border border-border rounded-lg p-1 ml-2">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "h-7 w-8 rounded-md flex items-center justify-center transition",
                viewMode === "list" ? "bg-surface text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("gallery")}
              className={cn(
                "h-7 w-8 rounded-md flex items-center justify-center transition",
                viewMode === "gallery" ? "bg-surface text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <span className="ml-auto text-[12px] text-muted-foreground">
            {filtered.length} de {products.length}
          </span>
        </div>

        {/* Display */}
        {isLoading ? (
          <div className="py-24 flex items-center justify-center text-muted-foreground">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Carregando produtos...</p>
            </div>
          </div>
        ) : viewMode === "list" ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card border border-border shadow-card overflow-hidden"
          >
            <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-surface/40 text-[11px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <Th className="w-10">
                    <Checkbox 
                      checked={filtered.length > 0 && selectedIds.size === filtered.length}
                      onCheckedChange={toggleAll}
                    />
                  </Th>
                  <Th>SKU</Th>
                  <Th>Produto</Th>
                  <Th>Categoria</Th>
                  <Th align="right">Estoque</Th>
                  <Th align="right">Preço</Th>
                  <Th align="right">Margem</Th>
                  <Th>Status</Th>
                  <Th align="right">Ações</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <AnimatePresence initial={false}>
                  {filtered.map((p, i) => (
                    <motion.tr
                      key={p.sku}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.2) }}
                      className={cn(
                        "hover:bg-surface/40 transition-colors group",
                        selectedIds.has(p.sku) && "bg-primary/5"
                      )}
                    >
                      <Td className="w-10">
                        <Checkbox 
                          checked={selectedIds.has(p.sku)}
                          onCheckedChange={() => toggleOne(p.sku)}
                        />
                      </Td>
                      <Td className="font-mono-tabular text-muted-foreground">{p.sku}</Td>
                      <Td className="font-medium">
                        <div className="flex items-center gap-2.5">
                          {p.photo ? (
                            <img
                              src={p.photo}
                              alt=""
                              className="h-8 w-8 rounded-md object-cover border border-border"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-md bg-surface border border-border" />
                          )}
                          <span>{p.name}</span>
                        </div>
                      </Td>
                      <Td className="text-muted-foreground">{p.category}</Td>
                      <Td align="right" className="font-mono-tabular">
                        {p.stock}
                      </Td>
                      <Td align="right" className="font-mono-tabular">
                        R$ {p.price.toFixed(2)}
                      </Td>
                      <Td align="right" className="font-mono-tabular text-success">
                        {p.margin}%
                      </Td>
                      <Td>
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${statusStyle[p.status]}`}
                        >
                          {p.status}
                        </span>
                      </Td>
                      <Td align="right">
                        <div className="inline-flex items-center gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                          <RowAction
                            label="Ver detalhes"
                            onClick={() => openModal(p, "details")}
                            icon={<Eye className="h-3.5 w-3.5" />}
                          />
                          <RowAction
                            label="Entrada de estoque"
                            onClick={() => openModal(p, "stock")}
                            icon={<ArrowDownToLine className="h-3.5 w-3.5" />}
                          />
                          <RowAction
                            label="Histórico"
                            onClick={() => openModal(p, "history")}
                            icon={<History className="h-3.5 w-3.5" />}
                          />
                          <RowAction
                            label="Editar"
                            onClick={() => openModal(p, "edit")}
                            icon={<Pencil className="h-3.5 w-3.5" />}
                          />
                          <RowAction
                            label="Excluir"
                            onClick={() => openModal(p, "delete")}
                            icon={<Trash2 className="h-3.5 w-3.5" />}
                            danger
                          />
                        </div>
                      </Td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-12 text-center text-muted-foreground text-[13px]"
                    >
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence initial={false}>
              {filtered.map((p, i) => (
                <motion.div
                  key={p.sku}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(i * 0.02, 0.2) }}
                  className={cn(
                    "bg-card border border-border rounded-xl overflow-hidden shadow-sm group hover:shadow-md hover:border-primary/30 transition-all",
                    selectedIds.has(p.sku) && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                >
                  {/* Card Header/Image */}
                  <div className="relative aspect-square bg-surface/50 overflow-hidden">
                    {p.photo ? (
                      <img src={p.photo} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                    
                    {/* Checkbox overlay */}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Checkbox 
                        checked={selectedIds.has(p.sku)}
                        onCheckedChange={() => toggleOne(p.sku)}
                        className="bg-background shadow-md border-border"
                      />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm ${statusStyle[p.status]}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-[14px] font-semibold text-foreground line-clamp-1 mb-0.5">{p.name}</h3>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-mono uppercase tracking-wider">
                        {p.sku} <span className="h-1 w-1 rounded-full bg-border" /> {p.category}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase font-medium">Preço</p>
                        <p className="text-[14px] font-bold text-foreground">R$ {p.price.toFixed(2)}</p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase font-medium">Estoque</p>
                        <p className={cn(
                          "text-[14px] font-bold tabular-nums",
                          p.stock <= 5 ? "text-warning" : p.stock === 0 ? "text-destructive" : "text-foreground"
                        )}>{p.stock}</p>
                      </div>
                    </div>

                    {/* Actions Overlay/Menu */}
                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        <RowAction
                          label="Ver"
                          onClick={() => openModal(p, "details")}
                          icon={<Eye className="h-3.5 w-3.5" />}
                        />
                        <RowAction
                          label="Estoque"
                          onClick={() => openModal(p, "stock")}
                          icon={<ArrowDownToLine className="h-3.5 w-3.5" />}
                        />
                      </div>
                      <div className="flex items-center gap-0.5">
                        <RowAction
                          label="Editar"
                          onClick={() => openModal(p, "edit")}
                          icon={<Pencil className="h-3.5 w-3.5" />}
                        />
                        <RowAction
                          label="Excluir"
                          onClick={() => openModal(p, "delete")}
                          icon={<Trash2 className="h-3.5 w-3.5" />}
                          danger
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="col-span-full py-24 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Nenhum produto encontrado.</p>
              </div>
            )}
          </div>
        )}

        {/* Modais */}
        <NewProductModal open={open} onOpenChange={setOpen} onCreate={handleCreate} />
        <ProductDetailsModal
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          product={selected}
        />
        <EditProductModal
          open={editOpen}
          onOpenChange={setEditOpen}
          product={selected}
          onSave={handleUpdate}
        />
        <StockEntryModal
          open={stockOpen}
          onOpenChange={setStockOpen}
          product={selected}
          onApply={(updated, movement) => handleUpdate(updated, movement)}
        />
        <ProductHistoryModal
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          product={selected}
        />
        <DeleteProductDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          product={selected}
          onConfirm={handleDelete}
        />
        <DeleteConfirmationDialog 
          open={bulkDeleteOpen}
          onOpenChange={setBulkDeleteOpen}
          title={`Excluir ${selectedIds.size} produtos?`}
          description="Você está prestes a remover permanentemente múltiplos produtos do catálogo. Esta ação não pode ser desfeita."
          onConfirm={confirmBulkDelete}
        />
      </div>
    </TooltipProvider>
  );
}

function RowAction({
  label,
  onClick,
  icon,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`h-7 w-7 rounded-md inline-flex items-center justify-center transition ${
            danger
              ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              : "text-muted-foreground hover:text-foreground hover:bg-surface"
          }`}
          aria-label={label}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-[11px]">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function Th({ children, align = "left", className = "" }: { children: React.ReactNode; align?: "left" | "right"; className?: string }) {
  return <th className={`px-4 py-3 text-${align} font-semibold ${className}`}>{children}</th>;
}
function Td({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return <td className={`px-4 py-3 text-${align} ${className}`}>{children}</td>;
}
