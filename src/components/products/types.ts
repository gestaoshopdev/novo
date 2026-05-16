export type ProductStatus = "ativo" | "baixo" | "esgotado";

export type StockMovement = {
  id: string;
  date: string; // ISO
  type: "entrada" | "saida" | "ajuste" | "criacao" | "edicao";
  quantity: number; // positivo entrada, negativo saída
  note?: string;
  user?: string;
};

export type ProductRow = {
  sku: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  costPrice?: number;
  wholesalePrice?: number | null;
  supplier?: string;
  purchaseDate?: string;
  margin: number;
  status: ProductStatus;
  photo?: string;
  photos?: string[];
  inCatalog?: boolean;
  history?: StockMovement[];
  createdAt?: string;
};

export function statusFromStock(stock: number): ProductStatus {
  if (stock <= 0) return "esgotado";
  if (stock < 10) return "baixo";
  return "ativo";
}

export function calcMargin(cost: number, retail: number): number {
  if (!retail || retail <= 0) return 0;
  return Math.round(((retail - cost) / retail) * 100);
}
