import { supabase } from "./supabase";
import { type ProductRow, type StockMovement as ProductHistory } from "@/components/products/types";
import { type ChannelInfo, type SaleRow, type SaleItem, DEFAULT_CHANNELS } from "@/components/sales/types";
import { type CatalogSettings } from "@/components/catalog/types";

export type CategoryInfo = {
  id: string;
  name: string;
  icon?: string;
  created_at: string;
};

// Auxiliares para lidar com ícones embutidos no nome (fallback se a coluna 'icon' não existir)
function formatCategoryName(name: string, icon?: string) {
  if (!icon || icon === "Tag") return name;
  return `[icon:${icon}] ${name}`;
}

function parseCategoryName(fullName: string): { name: string; icon?: string } {
  const match = fullName.match(/^\[icon:([^\]]+)\]\s*(.*)$/);
  if (match) {
    return { icon: match[1], name: match[2] };
  }
  return { name: fullName };
}

export const DEFAULT_CATEGORIES = [
  { name: "Acessórios", icon: "Watch" },
  { name: "Alimentos", icon: "Utensils" },
  { name: "Beleza", icon: "Sparkles" },
  { name: "Calçados", icon: "Footprints" },
  { name: "Casa & Decoração", icon: "Home" },
  { name: "Eletrônicos", icon: "Laptop" },
  { name: "Esportes", icon: "Trophy" },
  { name: "Infantil", icon: "Baby" },
  { name: "Papelaria", icon: "Book" },
  { name: "Roupas", icon: "Shirt" },
  { name: "Saúde", icon: "Activity" },
  { name: "Tecnologia", icon: "Smartphone" },
];

// Helper to get current user ID
async function getUserId() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) throw new Error("Usuário não autenticado");
  return session.user.id;
}

export async function getPublicProfile(userId: string) {
  try {
    const { data, error } = await supabase.rpc("get_public_profile", { p_user_id: userId });
    if (error) {
      console.warn("RPC get_public_profile failed, falling back to direct select:", error);
      const { data: fallbackData } = await supabase.from("profiles").select("plan_type").eq("id", userId).maybeSingle();
      return fallbackData;
    }
    return data;
  } catch (err) {
    console.error("Error fetching public profile:", err);
    return null;
  }
}

// Helper para fazer upload de strings Base64 para o Supabase Storage
export async function uploadBase64Image(base64Str: string, bucket: string = 'produtos'): Promise<string> {
  if (!base64Str) return base64Str;
  
  // Se já for uma URL (ex: do storage), apenas retorna
  if (base64Str.startsWith('http://') || base64Str.startsWith('https://')) {
    return base64Str;
  }

  const matches = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return base64Str; // Retorna original se não for base64 válido

  const contentType = matches[1];
  const b64Data = matches[2];
  
  // Converter base64 para Blob
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, { type: contentType });
  
  // Extrair extensão correta
  const ext = contentType.split('/')[1] || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, blob, {
      contentType,
      upsert: true
    });
    
  if (error) {
    console.error("Erro no upload da imagem:", error);
    throw new Error(`Falha ao salvar imagem: ${error.message}`);
  }
  
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
    
  return urlData.publicUrl;
}

// ==========================================
// CANAIS DE VENDA
// ==========================================
export async function getChannels(): Promise<ChannelInfo[]> {
  let userId: string | null = null;
  try {
    userId = await getUserId();
  } catch (e) {
    return DEFAULT_CHANNELS;
  }

  let userChannels: ChannelInfo[] = [];

  try {
    // 1. Busca o que já existe no banco
    const { data } = await supabase
      .from("channels")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    
    if (data) userChannels = data as ChannelInfo[];

    // 2. Identifica o que falta e tenta inserir
    const missingDefaults = DEFAULT_CHANNELS.filter(def => 
      !userChannels.some(c => c.name.toLowerCase() === def.name.toLowerCase())
    );

    if (missingDefaults.length > 0) {
      const toInsert = missingDefaults.map(c => ({
        id: `${c.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: c.name,
        icon: c.icon || "ShoppingBag",
        type: c.type || "Online", // Fornece o tipo obrigatório
        user_id: userId
      }));
      const { data: inserted } = await supabase.from("channels").insert(toInsert).select();
      if (inserted) {
        userChannels = [...userChannels, ...(inserted as ChannelInfo[])];
      }
    }
  } catch (err) {
    console.error("Erro silencioso em getChannels:", err);
  }

  // Se o banco retornou algo, usamos. Se não, mesclamos com os virtuais para garantir.
  const result = [...userChannels];
  for (const def of DEFAULT_CHANNELS) {
    if (!result.some(c => c.name.toLowerCase() === def.name.toLowerCase())) {
      result.push(def);
    }
  }
  
  return result;
}

export async function createChannel(channel: Omit<ChannelInfo, "created_at">) {
  const userId = await getUserId();
  const { data, error } = await supabase.from("channels").insert([{ ...channel, user_id: userId }]).select().single();
  if (error) throw error;
  return data as ChannelInfo;
}

export async function updateChannel(id: string, updates: Partial<ChannelInfo>) {
  const userId = await getUserId();
  const { data, error } = await supabase.from("channels").update(updates).eq("id", id).eq("user_id", userId).select().single();
  if (error) throw error;
  return data as ChannelInfo;
}

export async function deleteChannel(id: string) {
  const userId = await getUserId();
  const { error } = await supabase.from("channels").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

// ==========================================
// CATEGORIAS
// ==========================================
export async function getCategories(): Promise<CategoryInfo[]> {
  const userId = await getUserId();
  
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });
      
    if (error) throw error;
    
    // Se houver dados no banco, retorna eles processados
    if (data && data.length > 0) {
      return data.map(cat => {
        const parsed = parseCategoryName(cat.name);
        return { ...cat, ...parsed };
      }) as CategoryInfo[];
    }

    // Se estiver vazio, tentamos criar os padrões com ícones embutidos
    const toInsert = DEFAULT_CATEGORIES.map(cat => ({
      name: formatCategoryName(cat.name, cat.icon),
      user_id: userId
    }));
    
    // Tenta inserir com a constraint correta por usuário
    await supabase.from("categories").upsert(toInsert, { onConflict: 'name, user_id' });
      
    // Independente do resultado, buscamos novamente
    const { data: retryData, error: retryError } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });
      
    if (!retryError && retryData && retryData.length > 0) {
      return retryData.map(cat => {
        const parsed = parseCategoryName(cat.name);
        return { ...cat, ...parsed };
      }) as CategoryInfo[];
    }

    // Fallback: Se o banco continuar vazio, retorna os padrões de forma virtual
    return DEFAULT_CATEGORIES.map((cat, i) => ({
      id: `v-${i}`,
      ...cat,
      created_at: new Date().toISOString()
    })) as CategoryInfo[];

  } catch (err) {
    console.error("Erro ao buscar categorias:", err);
    return DEFAULT_CATEGORIES.map((cat, i) => ({
      id: `v-${i}`,
      ...cat,
      created_at: new Date().toISOString()
    })) as CategoryInfo[];
  }
}

export async function createCategory(category: { name: string; icon?: string }) {
  const userId = await getUserId();
  const fullName = formatCategoryName(category.name, category.icon);
  const { data, error } = await supabase
    .from("categories")
    .insert([{ name: fullName, user_id: userId }])
    .select();
    
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Erro ao criar categoria");
  
  const parsed = parseCategoryName(data[0].name);
  return { ...data[0], ...parsed } as CategoryInfo;
}

export async function updateCategory(id: string, updates: Partial<CategoryInfo>) {
  const userId = await getUserId();
  const fullName = formatCategoryName(updates.name || "", updates.icon);
  
  // 1. Se for um ID virtual (v-...), fazemos um upsert pelo nome
  if (id.startsWith("v-")) {
    const { data, error } = await supabase
      .from("categories")
      .upsert({ name: fullName, user_id: userId }, { onConflict: "name, user_id" })
      .select();
    if (error) throw error;
    const parsed = parseCategoryName(data![0].name);
    return { ...data![0], ...parsed } as CategoryInfo;
  }

  // 2. Tenta o update tradicional pelo ID
  const { data, error } = await supabase
    .from("categories")
    .update({ name: fullName })
    .eq("id", id)
    .eq("user_id", userId)
    .select();

  // Se funcionou, retornamos
  if (!error && data && data.length > 0) {
    const parsed = parseCategoryName(data[0].name);
    return { ...data[0], ...parsed } as CategoryInfo;
  }

  // 3. Se falhou (ID não existe ou conflito), fazemos um upsert pelo nome para garantir
  const { data: upsertData, error: upsertError } = await supabase
    .from("categories")
    .upsert({ name: fullName, user_id: userId }, { onConflict: "name, user_id" })
    .select();
    
  if (upsertError) throw upsertError;
  const parsed = parseCategoryName(upsertData![0].name);
  return { ...upsertData![0], ...parsed } as CategoryInfo;
}

export async function deleteCategory(id: string) {
  const userId = await getUserId();
  
  // IDs virtuais não precisam ser deletados do banco
  if (id.startsWith("v-")) {
    return;
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function restoreDefaultCategories() {
  const userId = await getUserId();
  
  // 1. Buscar todas as categorias atuais para garantir que temos os IDs
  const { data: currentCategories } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", userId);

  if (currentCategories && currentCategories.length > 0) {
    // 2. Deletar as categorias atuais pelos IDs (mais garantido que deletar por user_id em alguns casos de RLS)
    const ids = currentCategories.map(c => c.id);
    await supabase
      .from("categories")
      .delete()
      .in("id", ids)
      .eq("user_id", userId);
  } else {
    // Fallback: tenta deletar por user_id se não encontrou IDs
    await supabase
      .from("categories")
      .delete()
      .eq("user_id", userId);
  }
  
  // 3. Inserir os padrões usando UPSERT
  const toInsert = DEFAULT_CATEGORIES.map(cat => ({
    name: formatCategoryName(cat.name, cat.icon),
    user_id: userId
  }));
  
  const { error: insertError } = await supabase
    .from("categories")
    .upsert(toInsert, { onConflict: "name, user_id" });
    
  if (insertError) throw insertError;
}

// ==========================================
// PRODUTOS
// ==========================================
export async function getProducts(): Promise<ProductRow[]> {
  const userId = await getUserId();
  // Buscar os produtos e seus históricos associados
  const { data: productsData, error } = await supabase
    .from("products")
    .select(`
      *,
      history:product_history(*),
      catalog_products(catalog_id)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Mapear o banco para o formato esperado pelo frontend
  return productsData.map((p) => ({
    sku: p.sku,
    name: p.name,
    category: p.category,
    stock: p.stock,
    price: p.price,
    costPrice: p.cost_price,
    wholesalePrice: p.wholesale_price,
    supplier: p.supplier,
    purchaseDate: p.purchase_date,
    margin: p.margin,
    status: p.status,
    photo: p.photo,
    photos: p.photos || [],
    inCatalog: p.in_catalog,
    catalogIds: p.catalog_products ? p.catalog_products.map((cp: any) => cp.catalog_id) : [],
    createdAt: p.created_at,
    history: (p.history || []).map((h: any) => ({
      id: h.id,
      date: h.date,
      type: h.type,
      quantity: h.quantity,
      note: h.note,
      created_at: h.created_at,
    })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  }));
}

export async function createProduct(product: Omit<ProductRow, "history">, initialHistory?: Omit<ProductHistory, "id">) {
  const userId = await getUserId();
  
  // Faz o upload de todas as fotos para o Storage (se forem base64)
  const processedPhotos = await Promise.all(
    (product.photos || []).map(p => uploadBase64Image(p, 'produtos'))
  );
  const processedMainPhoto = processedPhotos.length > 0 ? processedPhotos[0] : (product.photo || null);

  const { error: pError } = await supabase.from("products").insert([{
    sku: product.sku,
    name: product.name,
    category: product.category,
    stock: product.stock,
    price: product.price,
    cost_price: product.costPrice || 0,
    wholesale_price: product.wholesalePrice || null,
    supplier: product.supplier || null,
    purchase_date: product.purchaseDate || null,
    margin: product.margin || 0,
    status: product.status,
    photo: processedMainPhoto,
    photos: processedPhotos,
    in_catalog: product.catalogIds ? product.catalogIds.length > 0 : (product.inCatalog || false),
    created_at: product.createdAt || new Date().toISOString(),
    user_id: userId,
  }]);

  if (pError) throw pError;

  if (initialHistory) {
    const { error: hError } = await supabase.from("product_history").insert([{
      product_sku: product.sku,
      date: initialHistory.date,
      type: initialHistory.type,
      quantity: initialHistory.quantity,
      note: initialHistory.note || null,
    }]);
    if (hError) throw hError;
  }

  if (product.catalogIds && product.catalogIds.length > 0) {
    const catalogEntries = product.catalogIds.map(catId => ({
      catalog_id: catId,
      product_sku: product.sku,
      user_id: userId
    }));
    const { error: cError } = await supabase.from("catalog_products").insert(catalogEntries);
    if (cError) throw cError;
  }
}

export async function updateProduct(sku: string, updates: Partial<ProductRow>, newHistory?: Omit<ProductHistory, "id">) {
  const userId = await getUserId();
  const dbUpdates: any = {};
  
  if (updates.photos !== undefined) {
    const processedPhotos = await Promise.all(
      updates.photos.map(p => uploadBase64Image(p, 'produtos'))
    );
    dbUpdates.photos = processedPhotos;
    if (processedPhotos.length > 0) {
      dbUpdates.photo = processedPhotos[0];
    } else {
      dbUpdates.photo = null;
    }
  } else if (updates.photo !== undefined) {
    dbUpdates.photo = await uploadBase64Image(updates.photo || "", 'produtos');
  }

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.costPrice !== undefined) dbUpdates.cost_price = updates.costPrice || 0;
  if (updates.wholesalePrice !== undefined) dbUpdates.wholesale_price = updates.wholesalePrice || null;
  if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier || null;
  if (updates.purchaseDate !== undefined) dbUpdates.purchase_date = updates.purchaseDate || null;
  if (updates.margin !== undefined) dbUpdates.margin = updates.margin || 0;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  
  if (updates.catalogIds !== undefined) {
    dbUpdates.in_catalog = updates.catalogIds.length > 0;
  } else if (updates.inCatalog !== undefined) {
    dbUpdates.in_catalog = updates.inCatalog;
  }

  const { error } = await supabase.from("products").update(dbUpdates).eq("sku", sku).eq("user_id", userId);
  if (error) throw error;

  if (newHistory) {
    const { error: hError } = await supabase.from("product_history").insert([{
      product_sku: sku,
      date: newHistory.date,
      type: newHistory.type,
      quantity: newHistory.quantity,
      note: newHistory.note || null,
    }]);
    if (hError) throw hError;
  }

  if (updates.catalogIds !== undefined) {
    await supabase.from("catalog_products").delete().eq("product_sku", sku).eq("user_id", userId);
    if (updates.catalogIds.length > 0) {
      const catalogEntries = updates.catalogIds.map(catId => ({
        catalog_id: catId,
        product_sku: sku,
        user_id: userId
      }));
      const { error: cError } = await supabase.from("catalog_products").insert(catalogEntries);
      if (cError) throw cError;
    }
  }
}

export async function deleteProduct(sku: string) {
  const userId = await getUserId();
  const { error } = await supabase.from("products").delete().eq("sku", sku).eq("user_id", userId);
  if (error) throw error;
}

// ==========================================
// VENDAS
// ==========================================
export async function getSales(): Promise<SaleRow[]> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("sales")
    .select(`
      *,
      items:sale_items(*),
      channel:channels(name)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((s: any) => {
    // Remove unused mapping logic


    return {
      id: s.id,
      code: s.code,
      date: s.date,
      channel: s.channel_id || "—",
      payment: s.payment,
      receiptType: s.receipt_type,
      buyerName: s.buyer_name,
      buyerLinked: s.buyer_linked,
      discount: s.discount,
      fees: s.fees,
      subtotal: s.subtotal,
      total: s.total,
      cost: s.cost,
      profit: s.profit,
      category: s.category,
      status: s.status,
      notes: s.notes,
      items: (s.items || []).map((i: any) => ({
        id: i.id,
        sku: i.sku,
        productName: i.product_name,
        quantity: i.quantity,
        unitPrice: i.unit_price,
        costPrice: i.cost_price,
      })),
      created_at: s.created_at
    };
  });
}

export async function createSale(sale: SaleRow) {
  const userId = await getUserId();
  
  // Tenta resolver o ID do canal se for um ID virtual (ex: "facebook")
  let finalChannelId = sale.channel;
  
  // Se for um ID curto (virtual), tentamos achar o ID real no banco pelo nome
  if (sale.channel && sale.channel.length < 30) {
    const channelDef = DEFAULT_CHANNELS.find(d => d.id === sale.channel);
    const searchName = channelDef ? channelDef.name : sale.channel;

    const { data: realChannel } = await supabase
      .from("channels")
      .select("id")
      .eq("user_id", userId)
      .ilike("name", searchName)
      .limit(1)
      .maybeSingle();
      
    if (realChannel) {
      finalChannelId = realChannel.id;
    } else if (channelDef) {
      // Create the missing channel on the fly to avoid FK constraint error
      const { data: newChannel, error: insertError } = await supabase.from("channels").insert([{
        id: `${channelDef.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: channelDef.name,
        icon: channelDef.icon || "ShoppingBag",
        type: channelDef.type || "Online",
        user_id: userId
      }]).select().single();
      
      if (!insertError && newChannel) {
        finalChannelId = newChannel.id;
      } else if (insertError) {
        throw new Error(`Erro ao recriar canal de venda: ${insertError.message}`);
      }
    }
  }

  const { error: sError } = await supabase.from("sales").insert([{
    id: sale.id,
    code: sale.code,
    date: sale.date,
    channel_id: finalChannelId,
    payment: sale.payment,
    receipt_type: sale.receiptType,
    buyer_name: sale.buyerName,
    buyer_linked: sale.buyerLinked,
    discount: sale.discount,
    fees: sale.fees,
    subtotal: sale.subtotal,
    total: sale.total,
    cost: sale.cost,
    profit: sale.profit,
    category: sale.category,
    status: sale.status,
    notes: sale.notes,
    created_at: new Date().toISOString(),
    user_id: userId,
  }]);

  if (sError) throw sError;

  const itemsToInsert = sale.items.map((i) => ({
    id: i.id,
    sale_id: sale.id,
    sku: i.sku,
    product_name: i.productName,
    quantity: i.quantity,
    unit_price: i.unitPrice,
    cost_price: i.costPrice,
  }));

  const { error: iError } = await supabase.from("sale_items").insert(itemsToInsert);
  if (iError) throw iError;
}

export async function updateSale(id: string, updates: Partial<SaleRow>) {
  const userId = await getUserId();
  const dbUpdates: any = {};
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.channel !== undefined) dbUpdates.channel_id = updates.channel;
  if (updates.payment !== undefined) dbUpdates.payment = updates.payment;
  // TODO: Add more fields if full editing is supported

  const { error } = await supabase.from("sales").update(dbUpdates).eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function deleteSale(id: string) {
  const userId = await getUserId();
  const { error } = await supabase.from("sales").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}
// ==========================================
// PAGAMENTOS
// ==========================================
import { type PaymentMethodInfo, DEFAULT_PAYMENT_METHODS } from "@/components/sales/types";

export async function getPaymentMethods(): Promise<PaymentMethodInfo[]> {
  const userId = await getUserId();
  const { data, error } = await supabase.from("payment_methods").select("*").eq("user_id", userId).order("created_at", { ascending: true });
  if (error) throw error;
  
  const userMethods = data as PaymentMethodInfo[];
  
  // Merge defaults with user methods, avoiding duplicates by name or ID
  const result = [...userMethods];
  for (const def of DEFAULT_PAYMENT_METHODS) {
    const exists = result.some(
      m => m.id === def.id || m.name.toLowerCase() === def.name.toLowerCase()
    );
    if (!exists) {
      result.push(def);
    }
  }
  
  return result;
}

export async function createPaymentMethod(method: Omit<PaymentMethodInfo, "id">) {
  const userId = await getUserId();
  const baseId = method.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
  const id = `${baseId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const { data, error } = await supabase.from("payment_methods").insert([{ ...method, id, user_id: userId }]).select().single();
  if (error) throw error;
  return data as PaymentMethodInfo;
}

export async function updatePaymentMethod(id: string, updates: Partial<PaymentMethodInfo>) {
  const userId = await getUserId();
  const isDefaultId = DEFAULT_PAYMENT_METHODS.some(m => m.id === id);
  const targetId = isDefaultId ? `${id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` : id;

  // Use upsert to handle virtual default methods being edited for the first time
  const { data, error } = await supabase
    .from("payment_methods")
    .upsert({ ...updates, id: targetId, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as PaymentMethodInfo;
}

export async function deletePaymentMethod(id: string) {
  const userId = await getUserId();
  const { error } = await supabase.from("payment_methods").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}
// ==========================================
// GASTOS
// ==========================================
export type ExpenseCategory = {
  id: string;
  name: string;
  icon?: string;
  created_at: string;
};

export type Expense = {
  id: string;
  date: string;
  category_id: string;
  description: string;
  value: number;
  notes?: string;
  created_at: string;
};

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const userId = await getUserId();
  const { data, error } = await supabase.from("expense_categories").select("*").eq("user_id", userId).order("name", { ascending: true });
  if (error) throw error;
  if (data && data.length > 0) {
    const unique: ExpenseCategory[] = [];
    const seen = new Set<string>();
    for (const cat of data) {
      const lowerName = cat.name.toLowerCase();
      if (!seen.has(lowerName)) {
        seen.add(lowerName);
        unique.push(cat);
      }
    }
    
    // Se a tabela já tinha dados mas faltavam alguns defaults, inserimos os que faltam
    const defaults = ["Tráfego Pago", "Transporte", "Outros", "Funcionários", "Fornecimento"];
    const missingDefaults = defaults.filter(d => !seen.has(d.toLowerCase()));
    
    if (missingDefaults.length > 0) {
      const toInsert = missingDefaults.map(name => ({
        name,
        user_id: userId
      }));
      const { data: inserted } = await supabase.from("expense_categories").insert(toInsert).select();
      if (inserted) {
        return [...unique, ...(inserted as ExpenseCategory[])];
      }
    }

    return unique;
  }

  const defaults = ["Tráfego Pago", "Transporte", "Outros", "Funcionários", "Fornecimento"];
  const toInsert = defaults.map(name => ({
    name,
    user_id: userId
  }));

  const { data: inserted } = await supabase.from("expense_categories").insert(toInsert).select();
  if (inserted) {
    return inserted as ExpenseCategory[];
  }
  
  return [];
}

export async function createExpenseCategory(category: { name: string; icon?: string }) {
  const userId = await getUserId();
  const { data, error } = await supabase.from("expense_categories").insert([{ ...category, user_id: userId }]).select().single();
  if (error) throw error;
  return data as ExpenseCategory;
}

export async function updateExpenseCategory(id: string, updates: Partial<ExpenseCategory>) {
  const userId = await getUserId();
  const { data, error } = await supabase.from("expense_categories").update(updates).eq("id", id).eq("user_id", userId).select().single();
  if (error) throw error;
  return data as ExpenseCategory;
}

export async function deleteExpenseCategory(id: string) {
  const userId = await getUserId();
  const { error } = await supabase.from("expense_categories").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function getExpenses(): Promise<Expense[]> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
    
  if (error) throw error;
  return data as Expense[];
}

export async function createExpense(expense: Omit<Expense, "id" | "created_at">) {
  const userId = await getUserId();
  const { data, error } = await supabase.from("expenses").insert([{ ...expense, user_id: userId }]).select().single();
  if (error) throw error;
  return data as Expense;
}

export async function updateExpense(id: string, updates: Partial<Expense>) {
  const userId = await getUserId();
  const { data, error } = await supabase.from("expenses").update(updates).eq("id", id).eq("user_id", userId).select().single();
  if (error) throw error;
  return data as Expense;
}

export async function deleteExpense(id: string) {
  const userId = await getUserId();
  const { error } = await supabase.from("expenses").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

// ==========================================
// CONTATOS (CRM)
// ==========================================
export type Contact = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  type: "customer" | "supplier";
  notes?: string;
  created_at: string;
};

export async function getContacts(): Promise<Contact[]> {
  const userId = await getUserId();
  const { data, error } = await supabase.from("contacts").select("*").eq("user_id", userId).order("name", { ascending: true });
  if (error) throw error;
  return data as Contact[];
}

export async function createContact(contact: Omit<Contact, "id" | "created_at">) {
  const userId = await getUserId();
  const { data, error } = await supabase.from("contacts").insert([{ ...contact, user_id: userId }]).select().single();
  if (error) throw error;
  return data as Contact;
}

export async function updateContact(id: string, updates: Partial<Contact>) {
  const userId = await getUserId();
  const { data, error } = await supabase.from("contacts").update(updates).eq("id", id).eq("user_id", userId).select().single();
  if (error) throw error;
  return data as Contact;
}

export async function deleteContact(id: string) {
  const userId = await getUserId();
  const { error } = await supabase.from("contacts").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

// ==========================================
// CATÁLOGO
// ==========================================
export async function getCatalogs(): Promise<CatalogSettings[]> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("catalogs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map(item => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    whatsapp: item.whatsapp,
    instagram: item.instagram,
    is_active: item.is_active,
    profile_photo: item.profile_photo,
    username: item.username,
    profession: item.profession,
    banner_text: item.banner_text,
    banner_image: item.colors?.banner_image,
    colors: item.colors ? {
      background: item.colors.background,
      primary: item.colors.primary,
      card: item.colors.card,
      text: item.colors.text,
      price: item.colors.price,
      button: item.colors.button,
    } : {
      background: "#0F172A",
      primary: "#10B981",
      card: "#FFFFFF",
      text: "#111827",
      price: "#10B981",
      button: "#10B981",
    },
    layout: item.layout || "grid",
    show_brand: item.show_brand !== false,
    created_at: item.created_at,
  }));
}

export async function getCatalog(): Promise<CatalogSettings | null> {
  const catalogs = await getCatalogs();
  return catalogs.length > 0 ? catalogs[0] : null;
}

export async function getCatalogBySlug(slug: string): Promise<any | null> {
  const { data, error } = await supabase
    .from("catalogs")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  
  if (data) {
    data.banner_image = data.colors?.banner_image;
    data.colors = data.colors || {
      background: "#0F172A",
      primary: "#10B981",
      card: "#FFFFFF",
      text: "#111827",
      price: "#10B981",
      button: "#10B981",
    };
    data.layout = data.layout || "grid";
    data.show_brand = data.show_brand !== false;
  }
  
  return data;
}

export async function createCatalog(catalog: Omit<CatalogSettings, "id" | "created_at">) {
  const userId = await getUserId();
  const dbCatalog: any = { ...catalog };
  
  if (catalog.profile_photo) {
    dbCatalog.profile_photo = await uploadBase64Image(catalog.profile_photo, 'produtos');
  }
  
  if (catalog.banner_image) {
    const uploadedBanner = await uploadBase64Image(catalog.banner_image, 'produtos');
    dbCatalog.colors = { ...dbCatalog.colors, banner_image: uploadedBanner };
  }
  delete dbCatalog.banner_image;

  const { data, error } = await supabase.from("catalogs").insert([{ ...dbCatalog, user_id: userId }]).select().single();
  if (error) throw error;
  return data;
}

export async function updateCatalog(id: string, updates: Partial<CatalogSettings>) {
  const userId = await getUserId();
  
  // Buscar o plano do usuário para validar os limites de cores/banner
  let plan = "Starter";
  try {
    const { data: profile } = await supabase.from("profiles").select("plan_type").eq("id", userId).maybeSingle();
    if (profile?.plan_type) {
      plan = profile.plan_type;
    }
  } catch (err) {
    console.error("Erro ao buscar plano do usuário para verificar limites do catálogo:", err);
  }
  
  const planLower = plan.toLowerCase();
  const isElite = planLower === "elite";
  const isStarter = planLower === "starter" || planLower === "básico";

  const dbUpdates: any = { ...updates };
  
  if (updates.profile_photo) {
    dbUpdates.profile_photo = await uploadBase64Image(updates.profile_photo, 'produtos');
  }
  
  if (updates.banner_image !== undefined) {
    let bannerUrl = updates.banner_image;
    if (updates.banner_image && isElite) {
      bannerUrl = await uploadBase64Image(updates.banner_image, 'produtos');
    } else {
      // Se não for Elite, removemos a imagem do banner
      bannerUrl = null;
    }
    dbUpdates.colors = { ...(dbUpdates.colors || {}), banner_image: bannerUrl };
    delete dbUpdates.banner_image;
  }

  // Se o plano não for Elite e houver alteração de cores, garantir que não salve banner_image
  if (!isElite && dbUpdates.colors) {
    dbUpdates.colors = { ...dbUpdates.colors };
    delete dbUpdates.colors.banner_image;
  }

  // Se o plano for Starter/Básico, forçar cores padrão
  if (isStarter) {
    dbUpdates.colors = {
      background: "#0F172A",
      primary: "#10B981",
      card: "#FFFFFF",
      text: "#111827",
      price: "#10B981",
      button: "#10B981",
    };
  }

  const { data, error } = await supabase.from("catalogs").update(dbUpdates).eq("id", id).eq("user_id", userId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCatalog(id: string) {
  const userId = await getUserId();
  const { error } = await supabase.from("catalogs").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function getCatalogProducts(catalogId: string) {
  const { data, error } = await supabase
    .from("catalog_products")
    .select("product_sku")
    .eq("catalog_id", catalogId);
  if (error) throw error;
  return data.map(d => d.product_sku);
}

export async function addProductToCatalog(catalogId: string, sku: string) {
  const userId = await getUserId();
  const { error } = await supabase.from("catalog_products").insert([{
    catalog_id: catalogId,
    product_sku: sku,
    user_id: userId
  }]);
  if (error) throw error;
}

export async function removeProductFromCatalog(catalogId: string, sku: string) {
  const userId = await getUserId();
  const { error } = await supabase
    .from("catalog_products")
    .delete()
    .eq("catalog_id", catalogId)
    .eq("product_sku", sku)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function getPublicCatalogProducts(catalogId: string) {
  // 1. Get SKUs for this catalog
  const { data: relations, error: relError } = await supabase
    .from("catalog_products")
    .select("product_sku")
    .eq("catalog_id", catalogId);
  
  if (relError) throw relError;
  const skus = relations.map(r => r.product_sku);
  
  if (skus.length === 0) return [];

  // 2. Get products for these SKUs
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("sku", skus)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map((p) => ({
    sku: p.sku,
    name: p.name,
    category: p.category,
    price: p.price,
    photo: p.photo,
    photos: p.photos || [],
    isNew: false,
    isPromo: p.price < (p.cost_price * 1.2),
  }));
}
