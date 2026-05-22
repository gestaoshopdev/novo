import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCatalogBySlug, getPublicCatalogProducts, getPublicProfile } from "@/lib/api";
import { PLANS } from "@/lib/abacatepay";
import { Store, Package, X, ChevronLeft, ChevronRight, Instagram, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/ct/$slug")({
  component: PublicCatalogPage,
  head: ({ params }) => ({
    meta: [
      { title: `Catálogo | ${params.slug}` }
    ]
  })
});

function PublicCatalogPage() {
  const { slug } = Route.useParams();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: catalog, isLoading: isCatalogLoading } = useQuery({
    queryKey: ["publicCatalog", slug],
    queryFn: () => getCatalogBySlug(slug),
  });

  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["publicProducts", catalog?.id],
    queryFn: () => getPublicCatalogProducts(catalog!.id!),
    enabled: !!catalog?.id,
  });

  const { data: profile } = useQuery({
    queryKey: ["publicProfile", catalog?.user_id],
    queryFn: () => getPublicProfile(catalog!.user_id!),
    enabled: !!catalog?.user_id,
  });

  const categories = useMemo(() => {
    if (!products) return [];
    const cats = new Set<string>();
    products.forEach((p: any) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p: any) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  if (isCatalogLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200">
        <Store className="w-16 h-16 text-slate-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Catálogo não encontrado</h1>
        <p className="text-slate-400">Este catálogo não existe ou foi desativado.</p>
      </div>
    );
  }

  const planId = (profile?.plan_type || "starter").toLowerCase() as keyof typeof PLANS;
  const currentPlanId = (planId as string) === 'básico' ? 'starter' : planId;
  const limits = PLANS[currentPlanId]?.limits || PLANS.starter.limits;

  const { colors, layout, show_brand, name, banner_text, profile_photo, whatsapp, instagram } = catalog;
  const forceBrand = !limits.removeWatermark;
  const finalShowBrand = forceBrand || show_brand;

  const handleWhatsApp = (productName?: string) => {
    if (!whatsapp) return;
    const number = whatsapp.replace(/\D/g, '');
    const message = productName 
      ? `Olá! Tenho interesse no produto: ${productName}`
      : `Olá! Vim pelo seu catálogo online.`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleInstagram = () => {
    if (!instagram) return;
    const handle = instagram.replace('@', '');
    window.open(`https://instagram.com/${handle}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div 
        className="pt-12 pb-8 px-6 flex flex-col items-center text-center shadow-md relative overflow-hidden" 
        style={{ 
          backgroundColor: colors.primary,
          backgroundImage: catalog.banner_image ? `url(${catalog.banner_image})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {catalog.banner_image && <div className="absolute inset-0 bg-black/40 z-0"></div>}
        
        <div className="relative z-10 flex flex-col items-center w-full">
          {profile_photo ? (
            <img src={profile_photo} alt="Profile" className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-white/20 shadow-xl" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-4 shadow-xl backdrop-blur-sm">
              <Store className="w-10 h-10 text-white" />
            </div>
          )}
          
          <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-md">
            {name}
          </h1>
          
          {catalog.description && (
            <p className="text-white/90 text-sm font-medium drop-shadow-md">{catalog.description}</p>
          )}
        </div>
      </div>

      {banner_text && (
        <div className="max-w-3xl mx-auto w-full px-4 mt-[-16px] relative z-10">
          <div className="bg-white/10 backdrop-blur-sm py-3 px-4 rounded-xl text-center shadow-lg" style={{ backgroundColor: `${colors.primary}ee` }}>
            <p className="text-sm font-medium text-white">{banner_text}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 mt-4">
        {isProductsLoading ? (
          <div className="flex justify-center p-12">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" style={{ borderColor: colors.primary, borderTopColor: 'transparent' }}></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-12 rounded-xl" style={{ backgroundColor: colors.card }}>
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: colors.text }} />
            <h2 className="text-lg font-medium mb-2" style={{ color: colors.text }}>Nenhum produto</h2>
            <p className="opacity-70" style={{ color: colors.text }}>Este catálogo ainda não tem produtos disponíveis.</p>
          </div>
        ) : (
          <div>
            <h2 className="font-bold text-lg tracking-wider mb-6 opacity-90 text-center" style={{ color: colors.primary }}>
              MEUS PRODUTOS
            </h2>

            {/* Filtros e Busca */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full md:w-auto flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar produtos..." 
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white/50 focus:outline-none focus:ring-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderColor: `${colors.primary}40`, color: colors.text }}
                />
              </div>
              {categories.length > 0 && (
                <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors`}
                      style={{ 
                        backgroundColor: selectedCategory === "all" ? colors.primary : 'transparent',
                        color: selectedCategory === "all" ? '#fff' : colors.text,
                        border: `1px solid ${colors.primary}`
                      }}
                    >
                      Todos
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors`}
                        style={{ 
                          backgroundColor: selectedCategory === cat ? colors.primary : 'transparent',
                          color: selectedCategory === cat ? '#fff' : colors.text,
                          border: `1px solid ${colors.primary}`
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center p-12 rounded-xl" style={{ backgroundColor: colors.card }}>
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: colors.text }} />
                <h2 className="text-lg font-medium mb-2" style={{ color: colors.text }}>Nenhum produto encontrado</h2>
                <p className="opacity-70" style={{ color: colors.text }}>Tente buscar com outros termos ou mude a categoria.</p>
              </div>
            ) : (
              <div className={`grid gap-4 md:gap-6 ${layout === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2"}`}>
                {filteredProducts.map((product: any, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedProduct(product)}
                    className={`cursor-pointer rounded-xl overflow-hidden shadow-sm border border-slate-200/10 flex ${layout === "list" ? "flex-row items-center h-32" : "flex-col h-full"} transition-transform hover:-translate-y-1 hover:shadow-md`}
                    style={{ backgroundColor: colors.card }}
                  >
                    <div className={`${layout === "list" ? "w-32 h-full flex-shrink-0" : "w-full aspect-square flex-shrink-0"} bg-slate-100 flex items-center justify-center relative overflow-hidden`}>
                      {product.photo ? (
                        <img src={product.photo} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <Package className="w-10 h-10 text-slate-300" />
                      )}
                      {layout === "grid" && product.isNew && (
                        <span className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">Novo</span>
                      )}
                      {layout === "grid" && product.isPromo && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">Promo</span>
                      )}
                    </div>
                    
                    <div className={`p-4 flex flex-col ${layout === "list" ? "flex-1 h-full justify-between" : "flex-1"}`}>
                      <div>
                        <h3 className="text-sm md:text-base font-medium mb-1 line-clamp-2" style={{ color: colors.text }}>
                          {product.name}
                        </h3>
                        {product.category && layout === "list" && (
                           <p className="text-xs opacity-60 mb-2" style={{ color: colors.text }}>{product.category}</p>
                        )}
                      </div>
                      <div className={`${layout === "grid" ? "mt-auto pt-3" : "mt-auto"} flex items-center justify-between`}>
                        <p className="font-bold text-base md:text-lg" style={{ color: colors.price }}>
                          R$ {Number(product.price).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      {whatsapp && (
                         <Button 
                           className="w-full mt-3"
                           size="sm"
                           onClick={(e) => {
                             e.stopPropagation();
                             handleWhatsApp(product.name);
                           }}
                           style={{ backgroundColor: colors.button, color: '#fff' }}
                         >
                           Pedir no WhatsApp
                         </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-[440px] p-0 gap-0 bg-card border-border overflow-hidden rounded-3xl" style={{ backgroundColor: colors.card }}>
           {selectedProduct && (
             <div className="flex flex-col h-full max-h-[90vh]">
               {/* Image Section */}
               <div className="relative aspect-square w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                 <ProductCarousel photos={(selectedProduct.photos?.length > 0 ? selectedProduct.photos : [selectedProduct.photo]).slice(0, limits.maxPhotosPerProduct)} />
                 <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition z-10"
                 >
                   <X className="h-4 w-4" />
                 </button>
               </div>

               {/* Info Section */}
               <div className="p-6 overflow-y-auto">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold tracking-widest uppercase opacity-40" style={{ color: colors.text }}>{selectedProduct.category}</span>
                 </div>
                 <h2 className="text-xl font-bold mb-2 leading-tight" style={{ color: colors.text }}>{selectedProduct.name}</h2>
                 <p className="text-2xl font-bold mb-6" style={{ color: colors.price }}>
                   R$ {Number(selectedProduct.price).toFixed(2).replace('.', ',')}
                 </p>

                 <Button 
                   className="w-full h-12 text-base font-bold shadow-lg glow-primary"
                   onClick={() => handleWhatsApp(selectedProduct.name)}
                   style={{ backgroundColor: colors.button, color: '#fff' }}
                 >
                   Fazer Pedido Agora
                 </Button>

                 <p className="text-center text-[10px] mt-4 opacity-40" style={{ color: colors.text }}>
                    Você será redirecionado para o WhatsApp para finalizar o pedido.
                 </p>
               </div>
             </div>
           )}
        </DialogContent>
      </Dialog>

      {finalShowBrand && (
        <div className="py-8 text-center mt-auto">
          <p className="text-sm opacity-60" style={{ color: colors.text }}>
            Criado com <span className="font-bold">GestãoShop</span>
          </p>
        </div>
      )}

      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {instagram && (
          <button
            onClick={handleInstagram}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            title="Siga no Instagram"
          >
            <Instagram className="w-8 h-8" />
          </button>
        )}
        {whatsapp && (
          <button
            onClick={() => handleWhatsApp()}
            className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            title="Falar no WhatsApp"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function ProductCarousel({ photos }: { photos: string[] }) {
  const [index, setIndex] = useState(0);

  if (!photos || photos.length === 0) return <Package className="w-16 h-16 text-slate-300" />;

  return (
    <div className="relative w-full h-full group">
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={photos[index]}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full object-cover"
        />
      </AnimatePresence>

      {photos.length > 1 && (
        <>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIndex((prev) => (prev - 1 + photos.length) % photos.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition z-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIndex((prev) => (prev + 1) % photos.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition z-10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
