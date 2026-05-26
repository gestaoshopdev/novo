import { type CatalogSettings } from "./types";
import { Card } from "@/components/ui/card";
import { Store, Monitor, Smartphone, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getCatalogProducts } from "@/lib/api";
import { useProfile } from "@/contexts/ProfileContext";
import { PLANS } from "@/lib/abacatepay";

interface CatalogPreviewProps {
  settings: CatalogSettings;
  mode: "desktop" | "mobile";
  onModeChange: (mode: "desktop" | "mobile") => void;
}

export function CatalogPreview({ settings, mode, onModeChange }: CatalogPreviewProps) {
  const { plan } = useProfile();
  const currentPlanId = (plan.toLowerCase() === 'básico' ? 'starter' : plan.toLowerCase()) as keyof typeof PLANS;
  const limits = PLANS[currentPlanId]?.limits || PLANS.starter.limits;
  const finalShowBrand = !limits.removeWatermark;

  const { data: allProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const { data: selectedSkus = [] } = useQuery({
    queryKey: ["catalogProducts", settings.id],
    queryFn: () => getCatalogProducts(settings.id!),
    enabled: !!settings.id,
  });

  const catalogProducts = allProducts.filter(p => selectedSkus.includes(p.sku));
  
  // Dummy products se não houver nenhum para mostrar no preview
  const displayProducts = catalogProducts.length > 0 ? catalogProducts : [
    { name: "Smartphone Premium", price: 1299.90, isNew: true },
    { name: "Fone Bluetooth", price: 199.90, isPromo: true },
    { name: "Tablet 10\"", price: 899.90 },
    { name: "Smartwatch", price: 499.90, isPopular: true },
  ];

  return (
    <div className="sticky top-6 flex flex-col items-center">
      <div className="text-center mb-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center justify-center gap-2">
          <Store className="w-4 h-4" /> Preview
        </h3>
        <div className="flex bg-muted/50 rounded-lg p-1 border border-border">
          <button 
            onClick={() => onModeChange("desktop")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${mode === "desktop" ? "bg-primary/20 text-primary font-medium" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Monitor className="w-4 h-4" /> Desktop
          </button>
          <button 
            onClick={() => onModeChange("mobile")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${mode === "mobile" ? "bg-primary/20 text-primary font-medium" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Smartphone className="w-4 h-4" /> Mobile
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-2">Representação visual. O resultado final pode variar.</p>
      </div>

      <div className={`relative transition-all duration-500 ease-in-out ${mode === "desktop" ? "w-full max-w-[500px]" : "w-[300px]"}`}>
        {/* Mockup Frame */}
        <div className={`relative bg-border/40 p-1.5 shadow-2xl transition-all duration-500 ease-in-out ${mode === "desktop" ? "rounded-xl border-[6px] border-border shadow-primary/10" : "rounded-[3rem] border-[10px] border-border h-[600px] shadow-primary/5"}`}>
          
          {/* Mobile Notch */}
          {mode === "mobile" && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-border rounded-b-2xl z-20 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
              <div className="w-10 h-1.5 rounded-full bg-muted-foreground/20" />
            </div>
          )}

          <Card 
            className={`overflow-hidden h-full transition-all duration-300 border-none ${mode === "desktop" ? "aspect-[16/10] rounded-md" : "rounded-[2.2rem]"}`}
            style={{ backgroundColor: settings.colors.background }}
          >
        <div className="h-full overflow-y-auto no-scrollbar relative flex flex-col">
          {/* Header do Catálogo */}
          <div 
            className="pt-8 pb-6 px-6 shrink-0 flex flex-col items-center text-center relative overflow-hidden" 
            style={{ 
              backgroundColor: settings.colors.primary,
              backgroundImage: settings.banner_image ? `url(${settings.banner_image})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            {settings.banner_image && <div className="absolute inset-0 bg-black/40 z-0"></div>}
            
            <div className="relative z-10 flex flex-col items-center w-full">
              {settings.profile_photo ? (
                <img src={settings.profile_photo} alt="Profile" className="w-16 h-16 shrink-0 rounded-full object-cover mb-3 border-2 border-white/20 shadow-lg" />
              ) : (
                <div className="w-16 h-16 shrink-0 rounded-full bg-white/20 flex items-center justify-center mb-3 shadow-lg backdrop-blur-sm">
                  <Store className="w-8 h-8 text-white" />
                </div>
              )}
              
              <h1 className="text-xl font-bold text-white mb-1 drop-shadow-md">
                {settings.name || "Minha Loja"}
              </h1>
              
              {settings.description && (
                <p className="text-white/90 text-sm drop-shadow-md">{settings.description}</p>
              )}
            </div>
          </div>

          {settings.banner_text && (
            <div className="bg-white/10 shrink-0 backdrop-blur-sm mx-4 mt-[-12px] relative z-10 py-2 px-4 rounded-lg text-center shadow-sm" style={{ backgroundColor: `${settings.colors.primary}dd` }}>
              <p className="text-xs font-medium text-white">{settings.banner_text}</p>
            </div>
          )}

          <div className="p-4 flex-1">
            <h2 className="text-center font-bold text-sm tracking-wider mb-4 opacity-90" style={{ color: settings.colors.primary }}>
              MEUS PRODUTOS
            </h2>

            <div className={`grid gap-4 ${settings.layout === "grid" ? "grid-cols-2" : "grid-cols-1"}`}>
              {displayProducts.slice(0, 4).map((product: any, idx) => (
                <div 
                  key={idx} 
                  className={`rounded-xl overflow-hidden shadow-sm border border-slate-200/10 flex ${settings.layout === "list" ? "flex-row items-center h-24" : "flex-col"}`}
                  style={{ backgroundColor: settings.colors.card }}
                >
                  <div className={`${settings.layout === "list" ? "w-24 h-full" : "w-full aspect-square"} bg-slate-100 flex items-center justify-center relative`}>
                    {product.photo ? (
                      <img src={product.photo} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-300" />
                    )}
                    {settings.layout === "grid" && product.isNew && (
                      <span className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-medium">Novo</span>
                    )}
                    {settings.layout === "grid" && product.isPromo && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">Promo</span>
                    )}
                  </div>
                  
                  <div className={`p-3 flex flex-col ${settings.layout === "list" ? "flex-1" : "flex-1"}`}>
                    <h3 className="text-xs font-medium mb-1 line-clamp-2" style={{ color: settings.colors.text }}>
                      {product.name}
                    </h3>
                    <div className="mt-auto">
                      <p className="font-bold text-sm" style={{ color: settings.colors.price }}>
                        R$ {Number(product.price).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {finalShowBrand && (
            <div className="py-4 text-center border-t border-border/10 mt-4 opacity-50">
              <p className="text-[10px]" style={{ color: settings.colors.text }}>
                Criado com <span className="font-bold">GestãoShop</span>
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Mobile Home Indicator */}
      {mode === "mobile" && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-muted-foreground/20 rounded-full z-20" />
      )}
    </div>

    {/* Monitor Stand */}
    {mode === "desktop" && (
      <div className="flex flex-col items-center animate-in slide-in-from-top-2 duration-500">
        <div className="w-16 h-6 bg-border/60 rounded-b-sm" />
        <div className="w-32 h-2 bg-border/80 rounded-t-xl" />
      </div>
    )}
  </div>
</div>
);
}
