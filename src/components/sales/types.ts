export type SaleChannel = string;

export type ChannelInfo = {
  id: string;
  name: string;
  type: "Online" | "Físico";
  icon?: string;
};

export const DEFAULT_CHANNELS: ChannelInfo[] = [
  { id: "loja_fisica", name: "Loja Física", type: "Físico" },
  { id: "shopee", name: "Shopee", type: "Online" },
  { id: "mercado_livre", name: "Mercado Livre", type: "Online" },
  { id: "instagram", name: "Instagram", type: "Online" },
  { id: "facebook", name: "Facebook", type: "Online" },
  { id: "whatsapp", name: "WhatsApp", type: "Online" },
  { id: "site", name: "Site Próprio", type: "Online" },
  { id: "outros", name: "Outros", type: "Físico" },
];


export type PaymentMethod = string;

export type PaymentMethodInfo = {
  id: string;
  name: string;
  fee_type: "percent" | "fixed";
  fee_value: number;
  installment_fees?: Record<number, number>; // { 2: 4.5, 3: 5.2, ... }
  icon?: string;
  color?: string;
};

export const DEFAULT_PAYMENT_METHODS: PaymentMethodInfo[] = [
  { id: "dinheiro", name: "Dinheiro", fee_type: "percent", fee_value: 0, icon: "Banknote", color: "green" },
  { id: "pix", name: "PIX", fee_type: "percent", fee_value: 0, icon: "Zap", color: "green" },
  { id: "debito", name: "Cartão de Débito", fee_type: "percent", fee_value: 1.5, icon: "CreditCard", color: "red" },
  { id: "credito", name: "Cartão de Crédito", fee_type: "percent", fee_value: 3.5, icon: "CreditCard", color: "red" },
  { id: "boleto", name: "Boleto", fee_type: "fixed", fee_value: 2.0, icon: "FileText", color: "red" },
];

export type ReceiptType = "a_vista" | "a_prazo" | "parcelado";

export type SaleItem = {
  id: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
};

export type SaleRow = {
  id: string;
  code: string;
  date: string; // ISO
  items: SaleItem[];
  channel: SaleChannel;
  payment: PaymentMethod;
  receiptType: ReceiptType;
  buyerName?: string;
  buyerLinked?: boolean;
  discount: number;
  fees: number;
  subtotal: number;
  total: number;
  cost: number;
  profit: number;
  category?: string;
  notes?: string;
  status?: "concluida" | "devolvida";
};



export const paymentLabels: Record<PaymentMethod, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  debito: "Cartão de Débito",
  credito: "Cartão de Crédito",
  boleto: "Boleto",
  transferencia: "Transferência",
};

// Taxas estimadas por meio de pagamento (%)
export const paymentFeeRates: Record<PaymentMethod, number> = {
  dinheiro: 0,
  pix: 0,
  debito: 1.5,
  credito: 3.5,
  boleto: 2.0,
  transferencia: 0,
};

export const receiptTypeLabels: Record<ReceiptType, string> = {
  a_vista: "À vista",
  a_prazo: "A prazo",
  parcelado: "Parcelado",
};

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
