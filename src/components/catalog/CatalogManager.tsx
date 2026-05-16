import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type CatalogSettings, DEFAULT_CATALOG_SETTINGS } from "./types";
import { createCatalog, updateCatalog } from "@/lib/api";
import { CatalogForm } from "./CatalogForm";
import { CatalogPreview } from "./CatalogPreview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

interface CatalogManagerProps {
  initialCatalog?: CatalogSettings;
  onCancel: () => void;
}

export function CatalogManager({ initialCatalog, onCancel }: CatalogManagerProps) {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<CatalogSettings>(
    initialCatalog || DEFAULT_CATALOG_SETTINGS
  );
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const saveMutation = useMutation({
    mutationFn: async (data: CatalogSettings) => {
      if (data.id) {
        return updateCatalog(data.id, data);
      } else {
        return createCatalog(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
      toast.success("Catálogo salvo com sucesso!");
      onCancel();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Erro ao salvar catálogo.");
    },
  });

  const handleSave = () => {
    if (!settings.name.trim()) return toast.error("O nome da loja é obrigatório.");
    if (!settings.slug.trim()) return toast.error("O link (slug) do catálogo é obrigatório.");
    if (!settings.whatsapp.trim()) return toast.error("O WhatsApp é obrigatório para que os clientes possam fazer pedidos.");
    
    saveMutation.mutate(settings);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {initialCatalog ? "Editar Catálogo" : "Novo Catálogo"}
            </h2>
            <p className="text-sm text-muted-foreground">Configure seu catálogo online público</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onCancel} className="border-border text-foreground">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saveMutation.isPending}
            className="gradient-primary text-white shadow-sm glow-primary"
          >
            <Save className="mr-2 h-4 w-4" /> 
            {saveMutation.isPending ? "Salvando..." : (initialCatalog ? "Salvar Alterações" : "Criar Catálogo")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_400px] items-start">
        <CatalogForm 
          settings={settings} 
          onChange={setSettings} 
          onSave={handleSave}
          isSaving={saveMutation.isPending}
        />
        <CatalogPreview settings={settings} mode={previewMode} onModeChange={setPreviewMode} />
      </div>
    </div>
  );
}
