import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, Store, Calendar as CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NumberInput } from "@/components/ui/number-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCategories, useCatalogs } from "@/hooks/useQueries";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { useProfile } from "@/contexts/ProfileContext";
import { PLANS } from "@/lib/abacatepay";

export type NewProduct = {
  name: string;
  category: string;
  stock: number;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number | null;
  supplier: string;
  purchaseDate: string;
  inCatalog: boolean;
  catalogIds: string[];
  photos: string[];
};



interface NewProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (product: NewProduct) => void;
}


const MAX_SIZE_MB = 40;

export function NewProductModal({ open, onOpenChange, onCreate }: NewProductModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState<string>("0");
  const [costPrice, setCostPrice] = useState<string>("");
  const [retailPrice, setRetailPrice] = useState<string>("");
  const [wholesalePrice, setWholesalePrice] = useState<string>("");
  const [supplier, setSupplier] = useState("");
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(new Date());
  const [inCatalog, setInCatalog] = useState(false);
  const [selectedCatalogIds, setSelectedCatalogIds] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: categories = [] } = useCategories();
  const { data: catalogs = [] } = useCatalogs();
  const { plan } = useProfile();

  const currentPlanId = (plan.toLowerCase() === 'básico' ? 'starter' : plan.toLowerCase()) as keyof typeof PLANS;
  const MAX_PHOTOS = PLANS[currentPlanId]?.limits?.maxPhotosPerProduct || 1;

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setName("");
        setCategory("");
        setStock("0");
        setCostPrice("");
        setRetailPrice("");
        setWholesalePrice("");
        setSupplier("");
        setPurchaseDate(new Date());
        setInCatalog(false);
        setSelectedCatalogIds([]);
        setPhotos([]);
      }, 200);
    }
  }, [open]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    const valid = arr.filter((f) => {
      if (!["image/png", "image/jpeg", "image/webp"].includes(f.type)) {
        toast.error(`${f.name}: formato não suportado`);
        return false;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${f.name}: maior que ${MAX_SIZE_MB}MB`);
        return false;
      }
      return true;
    });
    const remaining = MAX_PHOTOS - photos.length;
    const toAdd = valid.slice(0, remaining);
    if (valid.length > remaining) {
      toast.warning(`Apenas ${remaining} foto(s) adicionada(s) — limite ${MAX_PHOTOS}.`);
    }
    const resizeImage = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round((width * MAX_HEIGHT) / height);
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to JPEG 70% quality
            } else {
              resolve(e.target?.result as string); // Fallback
            }
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    };

    Promise.all(
      toAdd.map((file) => resizeImage(file))
    ).then((urls) => setPhotos((prev) => [...prev, ...urls]));
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const markup =
    costPrice && retailPrice && Number(costPrice) > 0
      ? ((Number(retailPrice) - Number(costPrice)) / Number(costPrice)) * 100
      : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Informe o nome do produto");
    if (!category) return toast.error("Selecione uma categoria");
    if (!retailPrice || Number(retailPrice) <= 0)
      return toast.error("Informe o preço de varejo");

    const wp = wholesalePrice ? Number(wholesalePrice) : null;
    if (wp !== null && retailPrice && wp >= Number(retailPrice)) {
      return toast.error("Preço atacado deve ser menor que o varejo");
    }

    onCreate({
      name: name.trim(),
      category,
      stock: Number(stock) || 0,
      costPrice: Number(costPrice) || 0,
      retailPrice: Number(retailPrice),
      wholesalePrice: wp,
      supplier: supplier.trim(),
      purchaseDate: purchaseDate?.toISOString() || "",
      inCatalog: selectedCatalogIds.length > 0 ? true : inCatalog,
      catalogIds: selectedCatalogIds,
      photos,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] p-0 gap-0 bg-card border-border overflow-hidden max-h-[92vh]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Novo Produto
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={submit}
          className="overflow-y-auto px-6 py-5 space-y-5 max-h-[calc(92vh-140px)]"
        >
          {/* Photos */}
          <div>
            <label className="block text-[13px] font-semibold mb-2">Fotos do Produto</label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => fileRef.current?.click()}
              className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-surface/30"
              } px-6 py-8 text-center`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <div className="mx-auto h-10 w-10 rounded-full bg-surface flex items-center justify-center mb-3">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-[13px] font-medium">
                Clique ou arraste para adicionar fotos
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                PNG, JPG ou WEBP (até {MAX_SIZE_MB}MB cada; otimizamos para ~2MB ao enviar, até{" "}
                {MAX_PHOTOS} fotos)
              </p>
            </div>

            <AnimatePresence>
              {photos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-5 gap-2 mt-3"
                >
                  {photos.map((src, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-lg overflow-hidden border border-border group"
                    >
                      <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nome */}
          <Field label="Nome do Produto">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Smartwatch Pro X"
              className={inputCls}
            />
          </Field>

          {/* Categoria + Estoque */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoria">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10 bg-surface/60 border-border text-[13px]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      <div className="flex items-center gap-2">
                        <CategoryIcon iconName={cat.icon} categoryName={cat.name} className="h-4 w-4 text-muted-foreground" />
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Estoque">
              <NumberInput
                min={0}
                value={Number(stock)}
                onChange={(v) => setStock(v.toString())}
                className="h-10 bg-surface/60 border-border"
              />
            </Field>
          </div>

          {/* Preços custo + varejo */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preço de Custo (R$)">
              <NumberInput
                prefix="R$"
                step={0.01}
                min={0}
                value={Number(costPrice)}
                onChange={(v) => setCostPrice(v.toString())}
                placeholder="0.00"
                className="h-10 bg-surface/60 border-border"
              />
            </Field>
            <Field label="Preço varejo (R$)">
              <NumberInput
                prefix="R$"
                step={0.01}
                min={0}
                value={Number(retailPrice)}
                onChange={(v) => setRetailPrice(v.toString())}
                placeholder="0.00"
                className="h-10 bg-surface/60 border-border"
              />
            </Field>
          </div>

          {markup !== null && (
            <div className="-mt-2 text-[11px] text-muted-foreground">
              Markup automático:{" "}
              <span className={markup >= 0 ? "text-success font-medium" : "text-destructive font-medium"}>
                {markup.toFixed(1)}%
              </span>
            </div>
          )}

          {/* Atacado + Fornecedor */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preço atacado (R$)">
              <NumberInput
                prefix="R$"
                step={0.01}
                min={0}
                value={Number(wholesalePrice)}
                onChange={(v) => setWholesalePrice(v.toString())}
                placeholder="Opcional — menor que o varejo"
                className="h-10 bg-surface/60 border-border"
              />
            </Field>
            <Field label="Fornecedor">
              <input
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Opcional"
                className={inputCls}
              />
            </Field>
          </div>

          <p className="text-[11px] text-muted-foreground -mt-2 leading-relaxed">
            Na venda, aparece o botão Varejo/Atacado quando este campo estiver preenchido.
          </p>

          {/* Data */}
          <Field label="Data da Compra">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-surface/60 border-border hover:bg-surface/80 h-10 px-3",
                    !purchaseDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {purchaseDate ? format(purchaseDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-border bg-card shadow-2xl" align="start">
                <Calendar
                  mode="single"
                  selected={purchaseDate}
                  onSelect={setPurchaseDate}
                  initialFocus
                  locale={ptBR}
                  className="p-3"
                />
              </PopoverContent>
            </Popover>
          </Field>

          <div className="border-t border-border pt-4">
            {catalogs.length <= 1 ? (
              <button
                type="button"
                onClick={() => {
                  const newState = !inCatalog;
                  setInCatalog(newState);
                  if (newState && catalogs.length === 1) {
                    setSelectedCatalogIds([catalogs[0].id]);
                  } else {
                    setSelectedCatalogIds([]);
                  }
                }}
                className="flex items-center gap-3 group"
              >
                <span
                  className={`relative h-5 w-5 rounded-full border-2 transition-all flex items-center justify-center ${
                    inCatalog ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  {inCatalog && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
                  <Store className="h-3.5 w-3.5 text-muted-foreground" />
                  Adicionar ao catálogo
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-[13px] font-medium">
                  <Store className="h-3.5 w-3.5 text-muted-foreground" />
                  Adicionar aos catálogos:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {catalogs.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCatalogIds(prev => {
                          const next = prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id];
                          setInCatalog(next.length > 0);
                          return next;
                        });
                      }}
                      className="flex items-center gap-3 p-2 rounded-lg border border-border hover:border-primary/50 transition-all text-left bg-surface/30"
                    >
                      <span
                        className={`relative min-w-5 h-5 rounded border transition-all flex items-center justify-center ${
                          selectedCatalogIds.includes(cat.id) ? "border-primary bg-primary text-white" : "border-border"
                        }`}
                      >
                        {selectedCatalogIds.includes(cat.id) && <Check className="h-3 w-3" />}
                      </span>
                      <span className="text-[12px] font-medium line-clamp-1">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-card">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-lg bg-surface border border-border text-[13px] font-medium hover:border-border-strong transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={submit}
            className="h-9 px-5 rounded-lg gradient-primary text-white text-[13px] font-semibold hover:opacity-90 transition shadow-sm glow-primary border-transparent"
          >
            Cadastrar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const inputCls =
  "w-full h-10 px-3 rounded-lg bg-surface/60 border border-border text-[13px] focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition placeholder:text-muted-foreground/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold mb-1.5">{label}</label>
      {children}
    </div>
  );
}
