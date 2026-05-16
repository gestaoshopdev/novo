import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Check, ChevronsUpDown, Search, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { NumberInput } from "@/components/ui/number-input";
import {
  type SaleRow,
  type SaleChannel,
  type PaymentMethod,
  paymentLabels,
  paymentFeeRates,
  formatBRL,
  type ChannelInfo,
} from "./types";
import { useChannels } from "@/hooks/useQueries";

export function EditSaleModal({
  open,
  onOpenChange,
  sale,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sale: SaleRow | null;
  onSave: (sale: SaleRow) => void;
}) {
  const [channel, setChannel] = useState<SaleChannel>("loja_fisica");
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [discount, setDiscount] = useState(0);
  const [buyerName, setBuyerName] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { data: channels = [] } = useChannels();

  useEffect(() => {
    if (sale && open) {
      setChannel(sale.channel);
      setPayment(sale.payment);
      setDiscount(sale.discount);
      setBuyerName(sale.buyerName ?? "");
      setDate(new Date(sale.date));
    }
  }, [sale, open]);

  const subtotal = sale?.subtotal ?? 0;
  const total = Math.max(0, subtotal - discount);
  const fees = (total * paymentFeeRates[payment]) / 100;
  const cost = sale?.cost ?? 0;
  const profit = useMemo(() => total - cost - fees, [total, cost, fees]);

  if (!sale) return null;

  const handleSave = () => {
    onSave({
      ...sale,
      channel,
      payment,
      discount,
      buyerName: buyerName.trim() || undefined,
      date: (date || new Date()).toISOString(),
      total,
      fees,
      profit,
    });
    onOpenChange(false);
    toast.success("Venda atualizada.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Editar Venda · {sale.code}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Canal</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as SaleChannel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {channels.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Pagamento</Label>
              <Select value={payment} onValueChange={(v) => setPayment(v as PaymentMethod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(paymentLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background/60 border-input hover:bg-background/80 h-9 px-3",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
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
              <Label className="text-xs">Desconto (R$)</Label>
              <NumberInput
                prefix="R$"
                min={0}
                step={0.01}
                value={discount}
                onChange={(v) => setDiscount(v)}
                className="h-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Comprador</Label>
            <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Opcional" />
          </div>

          <div className="rounded-lg bg-background/40 border border-border/60 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Total:</span><span className="font-semibold">{formatBRL(total)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Taxas:</span><span>- {formatBRL(fees)}</span></div>
            <div className="flex justify-between"><span className="font-semibold">Lucro:</span><span className="font-bold text-success">{formatBRL(profit)}</span></div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar alterações</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
