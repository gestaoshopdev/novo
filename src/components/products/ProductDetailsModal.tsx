import { motion } from "framer-motion";
import { Eye, Package2, Tag, DollarSign, Truck, Calendar, Store } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProductRow } from "./types";

const statusStyle: Record<string, string> = {
  ativo: "bg-success/15 text-success",
  baixo: "bg-warning/15 text-warning",
  esgotado: "bg-destructive/15 text-destructive",
};

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  product: ProductRow | null;
}

export function ProductDetailsModal({ open, onOpenChange, product }: Props) {
  if (!product) return null;
  const photos = product.photos?.length ? product.photos : product.photo ? [product.photo] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] p-0 gap-0 bg-card border-border overflow-hidden max-h-[92vh]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Detalhes do Produto
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-5 space-y-5 max-h-[calc(92vh-100px)]">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4"
          >
            {photos[0] ? (
              <img
                src={photos[0]}
                alt={product.name}
                className="h-24 w-24 rounded-xl object-cover border border-border"
              />
            ) : (
              <div className="h-24 w-24 rounded-xl bg-surface border border-border flex items-center justify-center">
                <Package2 className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-mono-tabular text-[11px] text-muted-foreground">{product.sku}</p>
              <h3 className="text-[16px] font-semibold leading-tight mt-0.5">{product.name}</h3>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] px-2 py-0.5 rounded bg-surface border border-border text-muted-foreground">
                  {product.category}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${statusStyle[product.status]}`}
                >
                  {product.status}
                </span>
                {product.inCatalog && (
                  <span className="text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary">
                    <Store className="h-3 w-3" /> No catálogo
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Galeria */}
          {photos.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {photos.slice(1).map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="aspect-square rounded-lg object-cover border border-border"
                />
              ))}
            </div>
          )}

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3">
            <Stat
              icon={<DollarSign className="h-3.5 w-3.5" />}
              label="Preço de Custo"
              value={product.costPrice ? `R$ ${product.costPrice.toFixed(2)}` : "—"}
            />
            <Stat
              icon={<DollarSign className="h-3.5 w-3.5" />}
              label="Preço de Varejo"
              value={`R$ ${product.price.toFixed(2)}`}
              accent
            />
            <Stat
              icon={<Tag className="h-3.5 w-3.5" />}
              label="Preço de Atacado"
              value={product.wholesalePrice ? `R$ ${product.wholesalePrice.toFixed(2)}` : "—"}
            />
            <Stat
              icon={<Tag className="h-3.5 w-3.5" />}
              label="Margem"
              value={`${product.margin}%`}
              valueClass={product.margin >= 0 ? "text-success" : "text-destructive"}
            />
            <Stat
              icon={<Package2 className="h-3.5 w-3.5" />}
              label="Estoque"
              value={String(product.stock)}
              valueClass={
                product.stock <= 0
                  ? "text-destructive"
                  : product.stock < 10
                    ? "text-warning"
                    : "text-foreground"
              }
            />
            <Stat
              icon={<Truck className="h-3.5 w-3.5" />}
              label="Fornecedor"
              value={product.supplier || "—"}
            />
            <Stat
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Data da compra"
              value={product.purchaseDate || "—"}
            />
            <Stat
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Cadastrado em"
              value={
                product.createdAt
                  ? new Date(product.createdAt).toLocaleDateString("pt-BR")
                  : "—"
              }
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-card">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-lg bg-surface border border-border text-[13px] font-medium hover:border-border-strong transition"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  icon,
  label,
  value,
  valueClass = "",
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${accent ? "border-primary/30 bg-primary/5" : "border-border bg-surface/40"}`}
    >
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5">
        {icon} {label}
      </p>
      <p className={`mt-1 font-mono-tabular text-[14px] font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}
