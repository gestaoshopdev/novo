import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useCategories, useProducts, useCreateCategory, useUpdateCategory, useDeleteCategory, useRestoreDefaultCategories } from "@/hooks/useQueries";
import { 
  Tag, Pencil, Trash2, Plus, Watch, Sparkles, Footprints, Home, Laptop, Trophy, 
  Shirt, ShoppingBag, Package, Gift, Smartphone, Utensils, Baby, Activity, 
  Heart, Camera, Music, Book, Coffee, Gamepad2, Scissors, Dumbbell, Flower2, 
  Gem, Glasses, Headphones, Monitor, Speaker, Tablet, Briefcase, Key, LucideIcon, RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { CategoryInfo } from "@/lib/api";

export const Route = createFileRoute("/app/categories")({
  head: () => ({ meta: [{ title: "Categorias · Nimbus" }] }),
  component: CategoriesPage,
});

const PREDEFINED_ICONS = [
  { name: "Tag", icon: Tag },
  { name: "Shirt", icon: Shirt },
  { name: "Watch", icon: Watch },
  { name: "Footprints", icon: Footprints },
  { name: "Sparkles", icon: Sparkles },
  { name: "Home", icon: Home },
  { name: "Laptop", icon: Laptop },
  { name: "Smartphone", icon: Smartphone },
  { name: "Monitor", icon: Monitor },
  { name: "Headphones", icon: Headphones },
  { name: "Trophy", icon: Trophy },
  { name: "Dumbbell", icon: Dumbbell },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Package", icon: Package },
  { name: "Gift", icon: Gift },
  { name: "Utensils", icon: Utensils },
  { name: "Coffee", icon: Coffee },
  { name: "Baby", icon: Baby },
  { name: "Heart", icon: Heart },
  { name: "Activity", icon: Activity },
  { name: "Camera", icon: Camera },
  { name: "Music", icon: Music },
  { name: "Book", icon: Book },
  { name: "Gamepad2", icon: Gamepad2 },
  { name: "Scissors", icon: Scissors },
  { name: "Flower2", icon: Flower2 },
  { name: "Gem", icon: Gem },
  { name: "Glasses", icon: Glasses },
  { name: "Briefcase", icon: Briefcase },
  { name: "Key", icon: Key },
];

const DEFAULT_MAPPING: Record<string, string> = {
  "Acessórios": "Watch",
  "Beleza": "Sparkles",
  "Calçados": "Footprints",
  "Casa & Decoração": "Home",
  "Eletrônicos": "Laptop",
  "Esportes": "Trophy",
  "Roupas": "Shirt",
  "Vestuário": "Shirt",
  "Alimentos": "Utensils",
  "Bebidas": "Coffee",
  "Saúde": "Activity",
  "Infantil": "Baby",
  "Tecnologia": "Smartphone",
  "Gamer": "Gamepad2",
  "Papelaria": "Book",
  "Joias": "Gem",
};

function getIconByName(name?: string): LucideIcon {
  if (!name) return Tag;
  const found = PREDEFINED_ICONS.find(i => i.name === name);
  return found ? found.icon : Tag;
}

function CategoriesPage() {
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const { data: products = [], isLoading: loadingProducts } = useProducts();

  const { mutate: createCategory } = useCreateCategory();
  const { mutate: updateCategory } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();
  const { mutate: restoreDefaults, isPending: isRestoring } = useRestoreDefaultCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryInfo | null>(null);
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Tag");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<CategoryInfo | null>(null);

  const [restoreOpen, setRestoreOpen] = useState(false);

  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const openModal = (cat?: CategoryInfo) => {
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setSelectedIcon(cat.icon || "Tag");
    } else {
      setEditingCategory(null);
      setName("");
      setSelectedIcon("Tag");
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return toast.error("O nome da categoria é obrigatório.");

    if (editingCategory) {
      updateCategory(
        { id: editingCategory.id, updates: { name: trimmed, icon: selectedIcon } },
        {
          onSuccess: () => {
            toast.success("Categoria atualizada!");
            setModalOpen(false);
          },
          onError: (err: any) => toast.error(`Erro: ${err.message}`),
        }
      );
    } else {
      createCategory(
        { name: trimmed, icon: selectedIcon },
        {
          onSuccess: () => {
            toast.success("Categoria criada!");
            setModalOpen(false);
          },
          onError: (err: any) => toast.error(`Erro: ${err.message}`),
        }
      );
    }
  };

  const handleDelete = () => {
    if (!deletingCategory) return;
    deleteCategory(deletingCategory.id, {
      onSuccess: () => {
        toast.success("Categoria excluída.");
        setDeleteOpen(false);
      },
      onError: (err: any) => toast.error(`Erro: ${err.message}`),
    });
  };

  const handleRestore = () => {
    restoreDefaults(undefined, {
      onSuccess: () => {
        toast.success("Categorias restauradas com sucesso!");
        setRestoreOpen(false);
      },
      onError: (err: any) => toast.error(`Erro ao restaurar: ${err.message}`),
    });
  };

  const isLoading = loadingCategories || loadingProducts;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        subtitle="Organize seus produtos por categorias"
        icon={Tag}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setRestoreOpen(true)}
              disabled={isRestoring}
              className="border-border hover:bg-background text-muted-foreground hover:text-foreground font-semibold"
            >
              <RotateCcw className={cn("h-4 w-4 mr-1.5", isRestoring && "animate-spin")} /> 
              Restaurar padrões
            </Button>
            <Button
              onClick={() => openModal()}
              className="bg-success hover:bg-success/90 text-success-foreground font-semibold shadow-lg shadow-success/20"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Nova Categoria
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="py-24 flex items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Carregando categorias...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group relative rounded-xl border border-border bg-card/40 backdrop-blur-md p-4 flex items-center justify-between hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                  {(() => {
                    let IconComp = getIconByName(cat.icon);
                    if (!cat.icon) {
                       for (const [key, val] of Object.entries(DEFAULT_MAPPING)) {
                        if (cat.name.toLowerCase().includes(key.toLowerCase())) {
                          IconComp = getIconByName(val);
                          break;
                        }
                      }
                    }
                    return <IconComp className="h-6 w-6" />;
                  })()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {productCounts[cat.name] || 0} produto(s)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(cat)}
                  className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-background/80 hover:text-foreground transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setDeletingCategory(cat);
                    setDeleteOpen(true);
                  }}
                  className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
              Nenhuma categoria encontrada.
            </div>
          )}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-1.5">
              <Label>Nome da Categoria</Label>
              <Input
                placeholder="Ex: Eletrônicos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Escolha um Ícone</Label>
              <div className="grid grid-cols-6 gap-2 p-3 rounded-xl border border-border bg-background/30 max-h-[200px] overflow-y-auto custom-scrollbar">
                {PREDEFINED_ICONS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedIcon(item.name)}
                    className={cn(
                      "flex items-center justify-center p-2 rounded-lg transition-all hover:scale-110",
                      selectedIcon === item.name
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                        : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                    )}
                    title={item.name}
                  >
                    <item.icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              {editingCategory ? "Salvar Alterações" : "Criar Categoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso não excluirá os produtos, mas eles ficarão sem categoria associada se o nome não coincidir com outra existente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold">
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar categorias padrão?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso excluirá **todas** as suas categorias atuais e criará as categorias padrão do sistema. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRestore} 
              disabled={isRestoring}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isRestoring ? "Restaurando..." : "Sim, Restaurar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
