import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Check, ChevronsUpDown, Search, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn, generateId } from "@/lib/utils";
import { toast } from "sonner";
import { NumberInput } from "@/components/ui/number-input";
import {
  type SaleRow,
  type SaleItem,
  type SaleChannel,
  type PaymentMethod,
  type ReceiptType,
  paymentLabels,
  paymentFeeRates,
  formatBRL,
  type ChannelInfo,
} from "./types";
import { useChannels, usePaymentMethods, useContacts, useSales } from "@/hooks/useQueries";
import type { ProductRow } from "@/components/products/types";

type DraftItem = {
  id: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
};

const newDraftItem = (): DraftItem => ({
  id: generateId(),
  productSku: "",
  productName: "",
  quantity: 1,
  unitPrice: 0,
  costPrice: 0,
});

export function RegisterSaleModal({
  open,
  onOpenChange,
  products,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  products: ProductRow[];
  onSubmit: (sale: SaleRow, onDone?: () => void) => void;
}) {
  const [items, setItems] = useState<DraftItem[]>([newDraftItem()]);
  const [channel, setChannel] = useState<SaleChannel | "">("");
  const [payment, setPayment] = useState<PaymentMethod | "">("");
  const [receiptType, setReceiptType] = useState<ReceiptType>("a_vista");
  const [buyerLinked, setBuyerLinked] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: channels = [] } = useChannels();
  const { data: paymentMethods = [] } = usePaymentMethods();
  const { data: dbContacts = [] } = useContacts();
  const { data: sales = [] } = useSales();

  const [buyerSearchOpen, setBuyerSearchOpen] = useState(false);

  const uniqueContacts = useMemo(() => {
    const customerMap = new Map();

    // 1. Adicionar contatos reais do banco de dados (ignorando fornecedores)
    dbContacts
      .filter((c) => c.type !== "supplier")
      .forEach((c) => {
        const key = `${c.name}|${c.phone || ""}`.toLowerCase();
        customerMap.set(key, {
          id: c.id,
          name: c.name,
          phone: c.phone || "Sem telefone",
          type: "CRM",
        });
      });

    // 2. Adicionar clientes "virtuais" das vendas (Frequentes)
    sales.forEach((sale) => {
      if (!sale.buyerName) return;
      const key = `${sale.buyerName}|(11) 99999-9999`.toLowerCase(); // Telefone padrão usado no CRM para vendas avulsas
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: sale.id,
          name: sale.buyerName,
          phone: "(11) 99999-9999",
          type: "Venda",
        });
      }
    });

    return Array.from(customerMap.values());
  }, [dbContacts, sales]);

  useEffect(() => {
    if (open) {
      setItems([newDraftItem()]);
      setChannel("");
      setPayment("");
      setReceiptType("a_vista");
      setBuyerLinked(false);
      setBuyerName("");
      setDate(new Date());
      setDiscount(0);
    }
  }, [open]);

  const subtotal = useMemo(
    () => items.reduce((s, it) => s + it.quantity * it.unitPrice, 0),
    [items],
  );
  const total = Math.max(0, subtotal - discount);
  const cost = useMemo(
    () => items.reduce((s, it) => s + it.quantity * it.costPrice, 0),
    [items],
  );
  const fees = useMemo(() => {
    if (!payment) return 0;
    const method = paymentMethods.find((m) => m.id === payment);
    if (!method) return 0;
    if (method.fee_type === "fixed") return method.fee_value;
    return (total * method.fee_value) / 100;
  }, [payment, total, paymentMethods]);

  const profit = total - cost - fees;

  const updateItem = (id: string, patch: Partial<DraftItem>) =>
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const removeItem = (id: string) =>
    setItems((arr) => (arr.length === 1 ? arr : arr.filter((it) => it.id !== id)));

  const handleSelectProduct = (id: string, p: ProductRow) =>
    updateItem(id, {
      productSku: p.sku,
      productName: p.name,
      unitPrice: p.price,
      costPrice: p.costPrice ?? 0,
    });

  const handleSubmit = () => {
    const validItems = items.filter((it) => it.productSku && it.quantity > 0);
    if (!validItems.length) return toast.error("Adicione ao menos 1 produto à venda.");
    if (!channel) return toast.error("Selecione o canal de venda.");
    if (!payment) return toast.error("Selecione a forma de pagamento.");

    // Verificar estoque
    for (const it of validItems) {
      const product = products.find((p) => p.sku === it.productSku);
      if (!product) return toast.error(`Produto ${it.productSku} não encontrado.`);
      if (product.stock < it.quantity)
        return toast.error(`Estoque insuficiente para ${product.name} (disp.: ${product.stock}).`);
    }

    const saleItems: SaleItem[] = validItems.map((it) => ({
      id: it.id,
      sku: it.productSku,
      productName: it.productName,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      costPrice: it.costPrice,
    }));

    const sale: SaleRow = {
      id: generateId(),
      code: `VND-${Date.now().toString().slice(-6)}`,
      date: (date || new Date()).toISOString(),
      items: saleItems,
      channel: channel as SaleChannel,
      payment: payment as PaymentMethod,
      receiptType,
      buyerLinked,
      buyerName: buyerName.trim() || undefined,
      discount,
      fees,
      subtotal,
      total,
      cost,
      profit,
      category: products.find((p) => p.sku === saleItems[0].sku)?.category,
      status: "concluida",
    };

    setIsSubmitting(true);
    onSubmit(sale, () => setIsSubmitting(false));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto p-0 gap-0 bg-card border-border">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl font-semibold">Registrar Venda</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          {/* Itens */}
          <div className="space-y-3">
            {items.map((it, idx) => (
              <ItemBlock
                key={it.id}
                index={idx + 1}
                item={it}
                products={products}
                onChange={(patch) => updateItem(it.id, patch)}
                onSelectProduct={(p) => handleSelectProduct(it.id, p)}
                onRemove={items.length > 1 ? () => removeItem(it.id) : undefined}
              />
            ))}
            <button
              type="button"
              onClick={() => setItems((arr) => [...arr, newDraftItem()])}
              className="w-full rounded-lg border border-dashed border-border bg-background/40 hover:bg-background/70 hover:border-primary/40 transition-colors py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" /> Adicionar outro item
            </button>
          </div>

          {/* Canal + Pagamento */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Canal de Venda</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as SaleChannel)}>
                <SelectTrigger className="bg-background/60"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {channels.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Forma de Pagamento</Label>
              <Select value={payment} onValueChange={(v) => setPayment(v as PaymentMethod)}>
                <SelectTrigger className="bg-background/60"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tipo de recebimento */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Tipo de recebimento</Label>
            <Select value={receiptType} onValueChange={(v) => setReceiptType(v as ReceiptType)}>
              <SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="a_vista">À vista</SelectItem>
                <SelectItem value="a_prazo">A prazo</SelectItem>
                <SelectItem value="parcelado">Parcelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comprador */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Comprador</Label>
            <Select value={buyerLinked ? "vinculado" : "nao"} onValueChange={(v) => setBuyerLinked(v === "vinculado")}>
              <SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nao">Não vinculado</SelectItem>
                <SelectItem value="vinculado">Vinculado ao CRM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Nome do comprador</Label>
            {buyerLinked ? (
              <div className="flex gap-2">
                <Popover open={buyerSearchOpen} onOpenChange={setBuyerSearchOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex-1 flex items-center justify-between rounded-md border border-input bg-background/60 px-3 py-2 text-sm hover:bg-background/80 transition-colors"
                    >
                      <span className={cn("truncate", !buyerName && "text-muted-foreground")}>
                        {buyerName || "Buscar cliente no CRM..."}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar por nome..." />
                      <CommandList>
                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                        <CommandGroup>
                          {uniqueContacts.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.name}
                              onSelect={() => {
                                setBuyerName(c.name);
                                setBuyerSearchOpen(false);
                              }}
                              className="flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Check
                                  className={cn(
                                    "h-4 w-4",
                                    buyerName === c.name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="min-w-0">
                                  <div className="text-sm truncate">{c.name}</div>
                                  {c.phone && (
                                    <div className="text-[11px] text-muted-foreground">
                                      {c.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {buyerName && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setBuyerName("")}
                    className="shrink-0 bg-background/60 border-input hover:bg-background/80"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ) : (
              <Input
                placeholder="Opcional"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="bg-background/60"
              />
            )}
          </div>

          {/* Data + Desconto */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background/60 border-input hover:bg-background/80",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-border bg-card shadow-2xl" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={ptBR}
                    className="p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Desconto (R$)</Label>
              <NumberInput
                prefix="R$"
                min={0}
                step={0.01}
                value={discount}
                onChange={(v) => setDiscount(v)}
                placeholder="0,00"
                className="bg-background/60"
              />
            </div>
          </div>

          {/* Resumo */}
          <div className="rounded-lg bg-background/40 border border-border/60 p-4 space-y-2 text-sm">
            <Row label="Subtotal:" value={formatBRL(subtotal)} />
            <Row label="Total da Venda:" value={formatBRL(total)} bold />
            <Row label="Custo:" value={`- ${formatBRL(cost)}`} negative />
            <Row label="Taxas:" value={`- ${formatBRL(fees)}`} negative />
            <div className="h-px bg-border/60 my-2" />
            <div className="flex items-center justify-between">
              <span className="font-semibold text-base">Lucro Líquido:</span>
              <span className={cn("font-bold text-base", profit >= 0 ? "text-success" : "text-destructive")}>
                {formatBRL(profit)}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-background/30">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="gradient-primary text-white font-semibold glow-primary border-transparent hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "Registrando..." : "Registrar Venda"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, bold, negative }: { label: string; value: string; bold?: boolean; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(bold && "font-semibold text-foreground", negative && "text-destructive")}>{value}</span>
    </div>
  );
}

function ItemBlock({
  index,
  item,
  products,
  onChange,
  onSelectProduct,
  onRemove,
}: {
  index: number;
  item: DraftItem;
  products: ProductRow[];
  onChange: (patch: Partial<DraftItem>) => void;
  onSelectProduct: (p: ProductRow) => void;
  onRemove?: () => void;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Item {index}</span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Remover item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Produto</Label>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between rounded-md border border-input bg-background/60 px-3 py-2 text-sm hover:bg-background/80 transition-colors"
            >
              <span className={cn("truncate", !item.productName && "text-muted-foreground")}>
                {item.productName || "Buscar produto..."}
              </span>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
            <Command>
              <CommandInput placeholder="Buscar por nome ou SKU..." />
              <CommandList>
                <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                <CommandGroup>
                  {products.map((p) => (
                    <CommandItem
                      key={p.sku}
                      value={`${p.sku} ${p.name} ${p.category}`}
                      onSelect={() => {
                        onSelectProduct(p);
                        setPopoverOpen(false);
                      }}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Check className={cn("h-4 w-4", item.productSku === p.sku ? "opacity-100" : "opacity-0")} />
                        <div className="min-w-0">
                          <div className="text-sm truncate">{p.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {p.sku} · Estoque {p.stock}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{formatBRL(p.price)}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Qtd</Label>
          <NumberInput
            min={1}
            value={item.quantity}
            onChange={(v) => onChange({ quantity: Math.max(1, v) })}
            className="bg-background/60"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Preço unit. (R$)</Label>
          <NumberInput
            prefix="R$"
            min={0}
            step={0.01}
            value={item.unitPrice}
            onChange={(v) => onChange({ unitPrice: v })}
            placeholder="0,00"
            className="bg-background/60"
          />
        </div>
      </div>
    </div>
  );
}
