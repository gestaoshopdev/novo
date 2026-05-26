import { useState } from "react";
import { type CatalogSettings } from "./types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Store, User, Palette, Image as ImageIcon, Info, Copy, Check, ExternalLink, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { CatalogProductsManager } from "./CatalogProductsManager";
import { ImageCropModal } from "@/components/ui/image-crop-modal";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getCatalogProducts } from "@/lib/api";
import { useProfile } from "@/contexts/ProfileContext";
import { PLANS } from "@/lib/abacatepay";

interface CatalogFormProps {
  settings: CatalogSettings;
  onChange: (settings: CatalogSettings) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function CatalogForm({ settings, onChange, onSave, isSaving }: CatalogFormProps) {
  const [activeTab, setActiveTab] = useState("appearance");
  const [copied, setCopied] = useState(false);
  const { plan } = useProfile();

  const currentPlanId = (plan.toLowerCase() === 'básico' ? 'starter' : plan.toLowerCase()) as keyof typeof PLANS;
  const limits = PLANS[currentPlanId]?.limits || PLANS.starter.limits;

  const { data: allProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });
  const { data: catalogProducts = [] } = useQuery({
    queryKey: ["catalogProducts", settings.id],
    queryFn: () => getCatalogProducts(settings.id!),
    enabled: !!settings.id,
  });
  
  const catalogProductsCount = catalogProducts.length;

  const updateField = (field: keyof CatalogSettings, value: any) => {
    onChange({ ...settings, [field]: value });
  };

  const updateColor = (key: keyof CatalogSettings["colors"], value: string) => {
    onChange({
      ...settings,
      colors: {
        ...settings.colors,
        [key]: value,
      },
    });
  };

  const catalogUrl = `${window.location.origin}/ct/${settings.slug || 'nome-da-loja'}`;

  const copyToClipboard = () => {
    if (!settings.slug) {
      toast.error("Defina um slug primeiro!");
      return;
    }
    navigator.clipboard.writeText(catalogUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const openCatalog = () => {
    if (!settings.slug) {
      toast.error("Defina um slug primeiro!");
      return;
    }
    window.open(catalogUrl, '_blank');
  };

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");

  const handleProfilePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Formato não suportado");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCropImageSrc(event.target.result as string);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const [bannerCropModalOpen, setBannerCropModalOpen] = useState(false);
  const [bannerCropImageSrc, setBannerCropImageSrc] = useState<string>("");

  const handleBannerImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Formato não suportado");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setBannerCropImageSrc(event.target.result as string);
        setBannerCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-card border border-border p-1 mb-6 rounded-lg h-12">
          <TabsTrigger 
            value="appearance" 
            className="flex-1 data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground"
          >
            <Palette className="w-4 h-4 mr-2" />
            Aparência
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            className="flex-1 data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground"
          >
            <Store className="w-4 h-4 mr-2" />
            Produtos
            <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
              {catalogProductsCount}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6 mt-0 pb-10">
          {/* Sessão 1: Dados da Loja */}
          {/* ... existing card ... */}
          {/* Sessão 2: Perfil */}
          {/* ... existing card ... */}
          {/* Sessão 3: Cores e visual */}
          {/* ... existing card ... */}
          {/* Sessão 1: Dados da Loja */}
          <Card className="p-6 bg-card border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/20 text-primary font-bold">1</div>
              <div>
                <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary" /> Dados da sua loja
                </h3>
                <p className="text-sm text-muted-foreground">Nome, link e como os clientes entram em contato.</p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store_name" className="text-muted-foreground">Nome da Loja <span className="text-red-400">*</span></Label>
                  <Input 
                    id="store_name" 
                    placeholder="Ex: Loja do João" 
                    value={settings.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-muted-foreground">Slug (URL) <span className="text-red-400">*</span></Label>
                  <Input 
                    id="slug" 
                    placeholder="loja-do-joao" 
                    value={settings.slug}
                    onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
                  />
                  <div className="flex items-center gap-2 mt-1.5 p-2 bg-muted/30 rounded border border-border/50 group">
                    <Info className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                    <p className="text-[11px] text-muted-foreground truncate flex-1 font-mono">
                      {catalogUrl}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={copyToClipboard}
                        className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-primary"
                        title="Copiar link"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={openCatalog}
                        className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-primary"
                        title="Abrir catálogo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-muted-foreground">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descrição do catálogo..." 
                  value={settings.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 min-h-[100px] focus-visible:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-muted-foreground">WhatsApp <span className="text-red-400">*</span></Label>
                  <Input 
                    id="whatsapp" 
                    placeholder="5511999999999" 
                    value={settings.whatsapp}
                    onChange={(e) => updateField("whatsapp", e.target.value)}
                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-muted-foreground">Instagram</Label>
                  <Input 
                    id="instagram" 
                    placeholder="@loja_joao" 
                    value={settings.instagram}
                    onChange={(e) => updateField("instagram", e.target.value)}
                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50 mt-2">
                <div>
                  <Label htmlFor="is_active" className="text-foreground font-medium cursor-pointer">Catálogo ativo</Label>
                  <p className="text-sm text-muted-foreground">O catálogo ficará visível publicamente</p>
                </div>
                <Switch 
                  id="is_active" 
                  checked={settings.is_active}
                  onCheckedChange={(checked) => updateField("is_active", checked)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </Card>

          {/* Sessão 2: Perfil */}
          <Card className="p-6 bg-card border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/20 text-primary font-bold">2</div>
              <div>
                <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Seu perfil no catálogo
                </h3>
                <p className="text-sm text-muted-foreground">Foto e texto que aparecem no topo para seus clientes.</p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="space-y-3">
                <Label className="text-muted-foreground">Foto de Perfil</Label>
                <div className="flex items-center gap-4">
                  {settings.profile_photo ? (
                    <img src={settings.profile_photo} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-border shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted border-2 border-border flex items-center justify-center shrink-0">
                      <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleProfilePhoto}
                        className="hidden"
                        id="profile-photo-upload"
                      />
                      <label htmlFor="profile-photo-upload">
                        <Button type="button" variant="outline" className="cursor-pointer" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Fazer Upload
                          </span>
                        </Button>
                      </label>
                      {settings.profile_photo && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => updateField("profile_photo", "")}
                        >
                          Remover
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground/60">Envie uma imagem para o seu perfil (PNG, JPG ou WEBP).</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-muted-foreground">Imagem de Capa / Banner (opcional)</Label>
                {limits.customCoverPhoto ? (
                  <div className="flex items-center gap-4">
                    {settings.banner_image ? (
                      <img src={settings.banner_image} alt="Banner" className="w-32 h-16 rounded object-cover border-2 border-border shrink-0" />
                    ) : (
                      <div className="w-32 h-16 rounded bg-muted border-2 border-border flex items-center justify-center shrink-0">
                        <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleBannerImage}
                          className="hidden"
                          id="banner-image-upload"
                        />
                        <label htmlFor="banner-image-upload">
                          <Button type="button" variant="outline" className="cursor-pointer" asChild>
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              Fazer Upload
                            </span>
                          </Button>
                        </label>
                        {settings.banner_image && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => updateField("banner_image", "")}
                          >
                            Remover
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground/60">Envie uma imagem para a capa do catálogo (proporção sugerida 3:1).</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 p-4 bg-muted/30 rounded-lg border border-border items-center justify-center text-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                    <p className="text-sm font-medium text-foreground">Imagem de Capa bloqueada</p>
                    <p className="text-xs text-muted-foreground">Disponível a partir do plano Elite. Faça o upgrade para adicionar capa.</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner_text" className="text-muted-foreground">Banner Promocional (opcional)</Label>
                <Input 
                  id="banner_text" 
                  placeholder="Ex: Frete grátis para todo Brasil!" 
                  value={settings.banner_text}
                  onChange={(e) => updateField("banner_text", e.target.value)}
                  className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
                />
                <p className="text-xs text-muted-foreground/60">Mensagem exibida entre seu perfil e a lista de produtos</p>
              </div>
            </div>
          </Card>

          {/* Sessão 3: Cores e visual */}
          <Card className="p-6 bg-card border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/20 text-primary font-bold">3</div>
              <div>
                <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" /> Cores e visual
                </h3>
                <p className="text-sm text-muted-foreground">Aparência do catálogo e dos cards de produto. Veja ao lado como fica.</p>
              </div>
            </div>

            <div className="relative">
              {!limits.customColors && (
                <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-[1px] rounded-lg flex flex-col items-center justify-center border border-border">
                  <Palette className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Personalização de cores bloqueada</p>
                  <p className="text-xs text-muted-foreground text-center px-4 mt-1">
                    Seu plano ({plan}) usa as cores padrão. Faça upgrade para Pro ou Elite para personalizar.
                  </p>
                </div>
              )}
              <div className="grid gap-6">
                <div className="space-y-3">
                  <Label className="text-muted-foreground">Fundo da página</Label>
                <div className="flex items-center gap-3">
                  {/* Presets */}
                  <button 
                    onClick={() => updateColor("background", "#0F172A")}
                    className={`w-10 h-10 rounded-full bg-slate-900 border-2 flex items-center justify-center transition-all ${settings.colors.background === "#0F172A" ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
                  />
                  <button 
                    onClick={() => updateColor("background", "#FFFFFF")}
                    className={`w-10 h-10 rounded-full bg-white border-2 flex items-center justify-center transition-all ${settings.colors.background === "#FFFFFF" ? 'border-primary ring-2 ring-primary/20' : 'border-slate-300'}`}
                  />
                  <button 
                    onClick={() => updateColor("background", "#18181b")}
                    className={`w-10 h-10 rounded-full bg-zinc-900 border-2 flex items-center justify-center transition-all ${settings.colors.background === "#18181b" ? 'border-primary ring-2 ring-primary/20' : 'border-slate-700'}`}
                  />
                  <div className="h-8 w-px bg-border mx-2"></div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="w-8 h-8 rounded shadow-inner" style={{ backgroundColor: settings.colors.background }}>
                      <input 
                        type="color" 
                        value={settings.colors.background} 
                        onChange={(e) => updateColor("background", e.target.value)}
                        className="opacity-0 w-full h-full cursor-pointer"
                      />
                    </div>
                    <Input 
                      value={settings.colors.background} 
                      onChange={(e) => updateColor("background", e.target.value)}
                      className="bg-muted/50 border-border text-muted-foreground w-28 uppercase focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Cor primária (Destaques)</Label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded shadow-inner flex-shrink-0" style={{ backgroundColor: settings.colors.primary }}>
                    <input 
                      type="color" 
                      value={settings.colors.primary} 
                      onChange={(e) => updateColor("primary", e.target.value)}
                      className="opacity-0 w-full h-full cursor-pointer"
                    />
                  </div>
                  <Input 
                    value={settings.colors.primary} 
                    onChange={(e) => updateColor("primary", e.target.value)}
                    className="bg-muted/50 border-border text-muted-foreground flex-1 uppercase focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Layout dos produtos</Label>
                <Select value={settings.layout} onValueChange={(val: "grid"|"list") => updateField("layout", val)}>
                  <SelectTrigger className="bg-muted/50 border-border text-foreground focus:ring-primary">
                    <SelectValue placeholder="Selecione o layout" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="grid">Grade (quadrados)</SelectItem>
                    <SelectItem value="list">Lista (uma linha por produto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                 <div>
                   <Label className="text-foreground font-medium">Marca d'água GestãoShop no rodapé</Label>
                   <p className="text-sm text-muted-foreground">
                     {!limits.removeWatermark ? "Seu plano (Starter/Pro) exibe a marca no rodapé." : "Seu plano (Elite) removeu a marca d'água do rodapé."}
                   </p>
                 </div>
                 <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                   !limits.removeWatermark ? 'bg-orange-500/15 text-orange-500' : 'bg-emerald-500/15 text-emerald-500'
                 }`}>
                   {!limits.removeWatermark ? 'Ativa' : 'Removida'}
                 </span>
               </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Cores dos cards de produto</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground/60">Fundo do card</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded shadow-inner flex-shrink-0" style={{ backgroundColor: settings.colors.card }}>
                        <input type="color" value={settings.colors.card} onChange={(e) => updateColor("card", e.target.value)} className="opacity-0 w-full h-full cursor-pointer"/>
                      </div>
                      <Input value={settings.colors.card} onChange={(e) => updateColor("card", e.target.value)} className="bg-muted/50 border-border text-muted-foreground h-9 uppercase"/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground/60">Cor do Texto</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded shadow-inner flex-shrink-0" style={{ backgroundColor: settings.colors.text }}>
                        <input type="color" value={settings.colors.text} onChange={(e) => updateColor("text", e.target.value)} className="opacity-0 w-full h-full cursor-pointer"/>
                      </div>
                      <Input value={settings.colors.text} onChange={(e) => updateColor("text", e.target.value)} className="bg-muted/50 border-border text-muted-foreground h-9 uppercase"/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground/60">Cor do Preço</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded shadow-inner flex-shrink-0" style={{ backgroundColor: settings.colors.price }}>
                        <input type="color" value={settings.colors.price} onChange={(e) => updateColor("price", e.target.value)} className="opacity-0 w-full h-full cursor-pointer"/>
                      </div>
                      <Input value={settings.colors.price} onChange={(e) => updateColor("price", e.target.value)} className="bg-muted/50 border-border text-muted-foreground h-9 uppercase"/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground/60">Cor do Botão</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded shadow-inner flex-shrink-0" style={{ backgroundColor: settings.colors.button }}>
                        <input type="color" value={settings.colors.button} onChange={(e) => updateColor("button", e.target.value)} className="opacity-0 w-full h-full cursor-pointer"/>
                      </div>
                      <Input value={settings.colors.button} onChange={(e) => updateColor("button", e.target.value)} className="bg-muted/50 border-border text-muted-foreground h-9 uppercase"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </Card>

          {/* Sessão 4: Salvar (Novo Botão solicitado pelo usuário) */}
          <div className="flex justify-center pt-6">
            <Button 
              onClick={onSave}
              disabled={isSaving}
              className="gradient-primary text-white w-full md:w-auto md:min-w-[200px] h-12 text-lg glow-primary"
            >
              <Save className="mr-2 h-5 w-5" />
              {isSaving ? "Salvando..." : (settings.id ? "Salvar Alterações" : "Criar Catálogo")}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-0">
          <CatalogProductsManager catalogId={settings.id} />
        </TabsContent>
      </Tabs>
      <ImageCropModal
        open={cropModalOpen}
        onOpenChange={setCropModalOpen}
        imageSrc={cropImageSrc}
        aspect={1}
        title="Ajustar Foto de Perfil"
        description="Arraste e redimensione para centralizar sua foto."
        onCropComplete={(croppedBase64) => {
          updateField("profile_photo", croppedBase64);
        }}
      />
      <ImageCropModal
        open={bannerCropModalOpen}
        onOpenChange={setBannerCropModalOpen}
        imageSrc={bannerCropImageSrc}
        aspect={3/1}
        title="Ajustar Banner"
        description="Arraste e redimensione para ajustar a capa do seu catálogo."
        onCropComplete={(croppedBase64) => {
          updateField("banner_image", croppedBase64);
        }}
      />
    </div>
  );
}
