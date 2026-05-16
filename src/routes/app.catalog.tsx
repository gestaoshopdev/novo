import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Copy, ExternalLink, Pencil, Plus, Store, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { getCatalogs, deleteCatalog } from "@/lib/api";
import { PLANS } from "@/lib/abacatepay";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CatalogManager } from "@/components/catalog/CatalogManager";
import { CatalogPreview } from "@/components/catalog/CatalogPreview";
import { type CatalogSettings } from "@/components/catalog/types";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/app/catalog")({
  head: () => ({ meta: [{ title: "Catálogos Online · GestãoShop" }] }),
  component: CatalogRoute,
});

function CatalogRoute() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<CatalogSettings | null>(null);
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogSettings | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const { user, isLoading: isAuthLoading } = useAuth();
  const { plan } = useProfile();
  const queryClient = useQueryClient();

  const currentPlanId = (plan.toLowerCase() === 'básico' ? 'starter' : plan.toLowerCase()) as keyof typeof PLANS;
  const maxCatalogs = PLANS[currentPlanId]?.limits?.maxCatalogs || 1;

  const handleNewCatalog = () => {
    if (catalogs.length >= maxCatalogs) {
      toast.error(`Limite atingido! Seu plano permite até ${maxCatalogs} catálogo(s). Faça o upgrade para expandir.`);
      return;
    }
    setIsCreating(true);
  };

  const { data: catalogs = [], isLoading: isCatalogLoading } = useQuery({
    queryKey: ["catalogs", user?.id],
    queryFn: getCatalogs,
    enabled: !!user,
  });
  
  useEffect(() => {
    if (catalogs.length > 0 && !selectedCatalog) {
      // Se houver apenas um, ou se nenhum estiver selecionado ainda, seleciona o primeiro
      setSelectedCatalog(catalogs[0]);
    }
  }, [catalogs, selectedCatalog]);

  const deleteMutation = useMutation({
    mutationFn: deleteCatalog,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["catalogs", user?.id] });

      const previousCatalogs = queryClient.getQueryData(["catalogs", user?.id]);

      queryClient.setQueryData(["catalogs", user?.id], (old: CatalogSettings[] | undefined) => 
        old ? old.filter((c) => c.id !== deletedId) : []
      );

      if (selectedCatalog?.id === deletedId) {
        setSelectedCatalog(null);
      }

      return { previousCatalogs };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousCatalogs) {
        queryClient.setQueryData(["catalogs", user?.id], context.previousCatalogs);
      }
      toast.error("Erro ao excluir catálogo.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
    },
    onSuccess: () => {
      toast.success("Catálogo excluído com sucesso!");
    },
  });

  const isLoading = isAuthLoading || isCatalogLoading;

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/ct/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };


  if (isCreating || editingCatalog) {
    return (
      <CatalogManager 
        initialCatalog={editingCatalog || undefined} 
        onCancel={() => {
          setIsCreating(false);
          setEditingCatalog(null);
        }} 
      />
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader 
        title="Catálogos Online" 
        subtitle="Crie e gerencie catálogos públicos para seus clientes" 
        icon={BookOpen} 
        actions={
          <Button onClick={handleNewCatalog} className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="mr-2 h-4 w-4" /> Novo Catálogo
          </Button>
        }
      />
      
      <div className="grid gap-6 md:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          {isLoading ? (
            <Card className="flex items-center justify-center p-12 min-h-[400px] bg-card border-border shadow-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </Card>
          ) : catalogs.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center min-h-[400px] bg-card border-border">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Store className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Nenhum catálogo criado</h3>
              <p className="mb-6 text-muted-foreground max-w-sm">
                Crie seu primeiro catálogo online para compartilhar com seus clientes
              </p>
              <Button onClick={handleNewCatalog} className="bg-emerald-500 hover:bg-emerald-600">
                <Plus className="mr-2 h-4 w-4" /> Criar Catálogo
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {catalogs.map((catalog) => (
                <Card 
                  key={catalog.id} 
                  className={`p-6 bg-card border-border transition-all shadow-sm cursor-pointer hover:border-primary/40 ${selectedCatalog?.id === catalog.id ? 'ring-2 ring-primary border-primary/50' : 'hover:shadow-md'}`}
                  onClick={() => setSelectedCatalog(catalog)}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-foreground">{catalog.name}</h3>
                        <p className="text-sm text-muted-foreground">{catalog.slug}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={catalog.is_active ? "default" : "secondary"} className={catalog.is_active ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : ""}>
                            {catalog.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded border border-border group relative">
                      <ExternalLink className="h-4 w-4 text-muted-foreground ml-1" />
                      <span className="text-xs text-muted-foreground truncate flex-1">
                        {window.location.host}/ct/{catalog.slug}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleCopyLink(catalog.slug)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-border text-foreground hover:bg-muted"
                        asChild
                      >
                        <a href={`/ct/${catalog.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" /> Ver Catálogo
                        </a>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-border text-foreground hover:bg-muted"
                        onClick={() => setEditingCatalog(catalog)}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="border-border text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-border text-foreground">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Catálogo?</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente o catálogo
                              <span className="font-semibold text-foreground"> "{catalog.name}" </span> 
                              e removerá todos os seus links públicos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-muted border-border text-foreground hover:bg-muted/80">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteMutation.mutate(catalog.id!)}
                              className="bg-rose-600 hover:bg-rose-700 text-white"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right side: Preview Sidebar */}
        <div className="space-y-6">
          {selectedCatalog ? (
            <CatalogPreview 
              settings={selectedCatalog} 
              mode={previewMode} 
              onModeChange={setPreviewMode} 
            />
          ) : (
            <Card className="flex flex-col items-center justify-center p-8 bg-card border-border sticky top-6 shadow-sm min-h-[500px]">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-foreground mb-2">Preview do Catálogo</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione um catálogo para visualizar o preview em tempo real
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Store className="h-8 w-8 text-muted-foreground/30" />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
