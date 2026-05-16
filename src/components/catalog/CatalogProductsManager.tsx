import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, getCatalogProducts, addProductToCatalog, removeProductFromCatalog } from "@/lib/api";
import { useProfile } from "@/contexts/ProfileContext";
import { PLANS } from "@/lib/abacatepay";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Store, Search, Plus, Package, X, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CatalogProductsManagerProps {
  catalogId?: string;
}

export function CatalogProductsManager({ catalogId }: CatalogProductsManagerProps) {
  const queryClient = useQueryClient();
  const { plan } = useProfile();
  const [search, setSearch] = useState("");
  const [modalSearch, setModalSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentPlanId = (plan.toLowerCase() === 'básico' ? 'starter' : plan.toLowerCase()) as keyof typeof PLANS;
  const maxProducts = PLANS[currentPlanId]?.limits?.maxProductsPerCatalog || 10;

  const { data: allProducts = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const { data: selectedSkus = [], isLoading: isSelectedLoading } = useQuery({
    queryKey: ["catalogProducts", catalogId],
    queryFn: () => getCatalogProducts(catalogId!),
    enabled: !!catalogId,
  });

  const addMutation = useMutation({
    mutationFn: (sku: string) => addProductToCatalog(catalogId!, sku),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogProducts", catalogId] });
      toast.success("Produto adicionado ao catálogo!");
    },
    onError: () => {
      toast.error("Erro ao adicionar produto.");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (sku: string) => removeProductFromCatalog(catalogId!, sku),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogProducts", catalogId] });
      toast.success("Produto removido do catálogo!");
    },
    onError: () => {
      toast.error("Erro ao remover produto.");
    },
  });

  const catalogProducts = useMemo(() => {
    return allProducts.filter((p) => selectedSkus.includes(p.sku));
  }, [allProducts, selectedSkus]);

  const filteredCatalogProducts = useMemo(() => {
    return catalogProducts.filter((p) => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase())
    );
  }, [catalogProducts, search]);

  const availableProducts = useMemo(() => {
    return allProducts.filter((p) => !selectedSkus.includes(p.sku));
  }, [allProducts, selectedSkus]);
  
  const filteredAvailableProducts = useMemo(() => {
    return availableProducts.filter((p) => 
      p.name.toLowerCase().includes(modalSearch.toLowerCase()) || 
      p.sku.toLowerCase().includes(modalSearch.toLowerCase())
    );
  }, [availableProducts, modalSearch]);

  const isLoading = isProductsLoading || isSelectedLoading;

  if (!catalogId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-card rounded-lg border border-border shadow-sm">
        <Store className="w-12 h-12 text-muted-foreground/40 mb-4" />
        <p className="text-foreground font-medium mb-1">Salve o catálogo primeiro</p>
        <p className="text-sm text-muted-foreground">É necessário criar o catálogo antes de adicionar produtos a ele.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Gerenciar Produtos do Catálogo</h2>
          <p className="text-muted-foreground text-sm">
            {catalogProducts.length} produtos neste catálogo
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="gradient-primary text-white shadow-sm glow-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produtos
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input 
            placeholder="Buscar produtos no catálogo..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
          />
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <button 
            className="w-full p-8 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-foreground font-semibold">Adicionar produtos ao catálogo</p>
              <p className="text-sm text-muted-foreground mt-1">Selecione produtos da sua lista geral para exibir neste catálogo.</p>
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl bg-card border-border shadow-2xl p-0 overflow-hidden flex flex-col max-h-[85vh]">
          <DialogHeader className="p-6 pb-4 border-b border-border/60">
            <DialogTitle className="text-xl font-bold">Selecionar Produtos</DialogTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input 
                id="add-product-search"
                placeholder="Buscar produtos disponíveis..." 
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="pl-9 bg-surface border-border focus-visible:ring-primary"
              />
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredAvailableProducts.length > 0 ? (
              filteredAvailableProducts.map((p) => (
                <div 
                  key={p.sku} 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-surface transition-colors group/item"
                >
                  <div className="flex items-center gap-3">
                    {p.photo ? (
                      <img src={p.photo} alt={p.name} className="w-10 h-10 rounded-md object-cover border border-border/50" />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center border border-border/50">
                        <Package className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-foreground">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">SKU: {p.sku} · R$ {p.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      if (selectedSkus.length >= maxProducts) {
                        toast.error(`Limite atingido! Seu plano permite até ${maxProducts} produtos.`);
                        return;
                      }
                      addMutation.mutate(p.sku);
                    }}
                    disabled={addMutation.isPending}
                    className="gradient-primary text-white text-[12px] h-8 px-3 glow-primary"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Adicionar
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <Package className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum produto disponível</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Todos os produtos já estão no catálogo ou não foram encontrados.</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-border/60 bg-surface/30 text-center">
            <p className="text-[11px] text-muted-foreground">Mostrando {filteredAvailableProducts.length} produtos disponíveis</p>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="bg-card border-border min-h-[300px] shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : catalogProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <Package className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-foreground font-medium mb-1">Nenhum produto no catálogo</p>
            <p className="text-sm text-muted-foreground">Use "Adicionar Produtos" acima</p>
          </div>
        ) : filteredCatalogProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <Search className="w-10 h-10 text-muted-foreground/30 mb-4" />
            <p className="text-foreground font-medium mb-1">Nenhum produto encontrado</p>
            <p className="text-sm text-muted-foreground">Altere sua busca para encontrar os produtos</p>
          </div>
        ) : (
          <div className="p-2">
            {filteredCatalogProducts.map((p) => (
              <div key={p.sku} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b border-border last:border-0 hover:bg-muted transition-colors rounded-lg gap-4">
                <div className="flex items-center gap-4">
                  {p.photo ? (
                    <img src={p.photo} alt={p.name} className="w-12 h-12 rounded-lg object-cover shadow-sm border border-border" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border border-border">
                      <Package className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-foreground line-clamp-1">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">SKU: {p.sku}</span>
                      <span className="text-xs font-medium text-primary">R$ {p.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => removeMutation.mutate(p.sku)}
                  disabled={removeMutation.isPending}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 self-start sm:self-auto"
                >
                  <X className="w-4 h-4 mr-2" /> Remover
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
