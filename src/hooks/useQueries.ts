import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// ==========================================
// CANAIS DE VENDA
// ==========================================
export const useChannels = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["channels", user?.id],
    queryFn: api.getChannels,
    enabled: !!user,
  });
};

export const useCreateChannel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });
};

export const useUpdateChannel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => api.updateChannel(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      // Update sales since channel name might be used
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
};

export const useDeleteChannel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
};

// ==========================================
// CATEGORIAS
// ==========================================
export const useCategories = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["categories", user?.id],
    queryFn: api.getCategories,
    enabled: !!user,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => api.updateCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      // Update products since category name might be used
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useRestoreDefaultCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.restoreDefaultCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// ==========================================
// PRODUTOS
// ==========================================
export const useProducts = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["products", user?.id],
    queryFn: api.getProducts,
    enabled: !!user,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ product, history }: { product: any; history?: any }) => api.createProduct(product, history),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sku, updates, history }: { sku: string; updates: any; history?: any }) =>
      api.updateProduct(sku, updates, history),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// ==========================================
// VENDAS
// ==========================================
export const useSales = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["sales", user?.id],
    queryFn: api.getSales,
    enabled: !!user,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      // Registar venda afeta o estoque, então invalidamos os produtos
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => api.updateSale(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      // Se devolvermos a venda, o estoque volta, então invalidar produtos
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
};
// ==========================================
// PAGAMENTOS
// ==========================================
export const usePaymentMethods = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["payment_methods", user?.id],
    queryFn: api.getPaymentMethods,
    enabled: !!user,
  });
};

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_methods"] });
    },
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => api.updatePaymentMethod(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_methods"] });
    },
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_methods"] });
    },
  });
};
// ==========================================
// GASTOS
// ==========================================
export const useExpenseCategories = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["expense_categories", user?.id],
    queryFn: api.getExpenseCategories,
    enabled: !!user,
  });
};

export const useCreateExpenseCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createExpenseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense_categories"] });
    },
  });
};

export const useUpdateExpenseCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => api.updateExpenseCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense_categories"] });
    },
  });
};

export const useDeleteExpenseCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteExpenseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense_categories"] });
    },
  });
};

export const useExpenses = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["expenses", user?.id],
    queryFn: api.getExpenses,
    enabled: !!user,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => api.updateExpense(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

// ==========================================
// CONTATOS (CRM)
// ==========================================
export const useContacts = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: api.getContacts,
    enabled: !!user,
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => api.updateContact(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};
