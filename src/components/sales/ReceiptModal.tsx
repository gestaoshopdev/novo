import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, Calendar as CalendarIcon } from "lucide-react";
import { type SaleRow, paymentLabels, formatBRL } from "./types";
import { useState, useEffect } from "react";
import * as html2canvasLib from "html2canvas";
import * as jsPDFLib from "jspdf";

const html2canvas: any = (html2canvasLib as any).default || html2canvasLib;
const jsPDF: any = (jsPDFLib as any).jsPDF || (jsPDFLib as any).default || jsPDFLib;
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ReceiptModal({
  open,
  onOpenChange,
  sale,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sale: SaleRow | null;
}) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientDoc, setClientDoc] = useState("");
  const [clientObs, setClientObs] = useState("");
  const [receiptDate, setReceiptDate] = useState<Date>(new Date());

  // Load company data from localStorage
  const companyName = typeof window !== "undefined" ? localStorage.getItem("company_name") || "GestãoShop" : "GestãoShop";
  const companyPhone = typeof window !== "undefined" ? localStorage.getItem("company_phone") : "";
  const companyCNPJ = typeof window !== "undefined" ? localStorage.getItem("company_cnpj") : "";
  const companyLogo = typeof window !== "undefined" ? localStorage.getItem("company_logo") : "";
  
  const companyAddress = typeof window !== "undefined" ? [
    localStorage.getItem("company_address"),
    localStorage.getItem("company_bairro"),
    localStorage.getItem("company_cidade"),
    localStorage.getItem("company_uf") ? `- ${localStorage.getItem("company_uf")}` : "",
    localStorage.getItem("company_cep") ? `CEP: ${localStorage.getItem("company_cep")}` : ""
  ].filter(Boolean).join(" ") : "";

  // Reset fields when a new sale is opened
  useEffect(() => {
    if (open && sale) {
      setClientName(sale.buyerName || "");
      setClientPhone("");
      setClientAddress("");
      setClientDoc("");
      setClientObs("");
      setReceiptDate(new Date(sale.date));
    }
  }, [open, sale]);

  if (!sale) return null;

  const formattedDate = format(receiptDate, "dd/MM/yyyy", { locale: ptBR });
  const saleTime = new Date(sale.date).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

  const handlePrint = async () => {
    const el = document.getElementById("receipt-preview");
    if (!el) return;
    
    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900');
    if (windowPrint) {
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(s => s.outerHTML)
        .join('\n');
        
      windowPrint.document.write(`
        <html>
          <head>
            <title>Imprimir Recibo</title>
            ${styles}
            <style>
              body { margin: 0; padding: 20px; background: white; display: flex; justify-content: center; }
              @media print {
                body { padding: 0; }
                #receipt-preview { border: none !important; box-shadow: none !important; margin: 0 !important; }
              }
            </style>
          </head>
          <body>
            ${el.outerHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 300);
              }
            </script>
          </body>
        </html>
      `);
      windowPrint.document.close();
    } else {
      toast.error("O bloqueador de pop-ups impediu a impressão.");
    }
  };

  const handleDownloadPDF = () => {
    const toastId = toast.loading("Gerando PDF...");
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      let y = 15;

      // Add Logo
      if (companyLogo) {
        try {
          const imgProps = pdf.getImageProperties(companyLogo);
          const width = 25;
          const height = (imgProps.height * width) / imgProps.width;
          pdf.addImage(companyLogo, imgProps.fileType, 105 - (width / 2), y, width, height);
          y += height + 5;
        } catch (e) {
          console.warn("Could not add logo to PDF", e);
        }
      } else {
        y += 10;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(companyName, 105, y, { align: 'center' });
      y += 5;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      if (companyPhone) { pdf.text(companyPhone, 105, y, { align: 'center' }); y += 4; }
      if (companyCNPJ) { pdf.text(companyCNPJ, 105, y, { align: 'center' }); y += 4; }
      if (companyAddress) { 
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(companyAddress, 105, y, { align: 'center' }); 
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        y += 6; 
      }

      y += 2;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, y, 190, y);
      y += 6;

      pdf.setFont('helvetica', 'bold');
      pdf.text(`RECIBO DE VENDA #${sale.code}`, 20, y);
      y += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`${formattedDate} — ${saleTime}`, 20, y);
      pdf.setTextColor(0, 0, 0);
      y += 6;

      pdf.line(20, y, 190, y);
      y += 6;

      pdf.setFont('helvetica', 'bold');
      pdf.text('Cliente', 20, y);
      y += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.text(clientName || "—", 20, y);
      y += 5;
      if (clientPhone) { pdf.text(clientPhone, 20, y); y += 5; }
      if (clientDoc) { pdf.text(clientDoc, 20, y); y += 5; }
      if (clientAddress) { pdf.text(clientAddress, 20, y); y += 5; }
      if (clientObs) { 
        pdf.setTextColor(100, 100, 100);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Obs: ${clientObs}`, 20, y); 
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        y += 5; 
      }

      y += 4;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Descrição', 20, y);
      y += 3;
      pdf.line(20, y, 190, y);
      y += 5;

      pdf.text('Produto', 20, y);
      pdf.text('Qtd', 120, y, { align: 'center' });
      pdf.text('Unit.', 150, y, { align: 'right' });
      pdf.text('Total', 190, y, { align: 'right' });
      y += 2;
      pdf.line(20, y, 190, y);
      y += 5;

      pdf.setFont('helvetica', 'normal');
      sale.items.forEach(it => {
        pdf.text(it.productName, 20, y);
        pdf.text(it.quantity.toString(), 120, y, { align: 'center' });
        pdf.text(formatBRL(it.unitPrice), 150, y, { align: 'right' });
        pdf.text(formatBRL(it.quantity * it.unitPrice), 190, y, { align: 'right' });
        y += 6;
      });

      y -= 2;
      pdf.line(20, y, 190, y);
      y += 5;

      pdf.setTextColor(100, 100, 100);
      pdf.text(`Valor produtos: ${formatBRL(sale.subtotal)}`, 190, y, { align: 'right' });
      y += 5;
      if (sale.discount > 0) {
        pdf.text(`Desconto: -${formatBRL(sale.discount)}`, 190, y, { align: 'right' });
        y += 5;
      }
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Valor total: ${formatBRL(sale.total)}`, 190, y, { align: 'right' });
      y += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Forma de pagamento: ${paymentLabels[sale.payment]}`, 190, y, { align: 'right' });

      y += 25;
      pdf.setFontSize(8);
      pdf.text(`Data do recibo: ${formattedDate}`, 105, y, { align: 'center' });
      y += 4;
      pdf.text(`Documento gerado pelo GestãoShop. Impressão em 1 via.`, 105, y, { align: 'center' });
      y += 15;
      pdf.line(75, y, 135, y);
      y += 4;
      pdf.text('Visto', 105, y, { align: 'center' });

      pdf.save(`Recibo_${sale.code}.pdf`);
      toast.success("PDF gerado com sucesso!", { id: toastId });
    } catch (e: any) {
      console.error("Erro ao gerar PDF:", e);
      toast.error(`Erro ao gerar PDF: ${e.message || 'Desconhecido'}`, { id: toastId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 border-border overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="text-xl font-semibold">Recibo de Venda</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/50">
          {/* Formulário de dados do cliente */}
          <div className="space-y-3">
             <Label className="font-semibold text-[13px]">Cliente / Observações (opcional)</Label>
             <div className="space-y-2">
               <Input placeholder="Nome do cliente" value={clientName} onChange={(e) => setClientName(e.target.value)} className="bg-background h-10" />
               <Input placeholder="(00) 00000-0000" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="bg-background h-10" />
               <Input placeholder="Endereço (Rua ABC, 123, Bairro - Cidade)" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="bg-background h-10" />
               <Input placeholder="CPF/CNPJ" value={clientDoc} onChange={(e) => setClientDoc(e.target.value)} className="bg-background h-10" />
               <Input placeholder="Observações" value={clientObs} onChange={(e) => setClientObs(e.target.value)} className="bg-background h-10" />
             </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-[13px]">Data do recibo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background h-10 border-input",
                    !receiptDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {receiptDate ? format(receiptDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={receiptDate}
                  onSelect={(date) => date && setReceiptDate(date)}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Preview do Recibo (A4 Style) */}
          <div 
            id="receipt-preview" 
            className="bg-[#ffffff] text-[#000000] p-8 rounded-xl shadow-sm border border-[#e5e7eb] font-sans mx-auto"
            style={{ width: "100%", maxWidth: "450px" }}
          >
             <div className="text-center space-y-1 mb-6">
               {companyLogo && <img src={companyLogo} alt="Logo" className="h-12 w-auto mx-auto mb-3 object-contain" />}
               <div className="font-bold text-sm uppercase">{companyName}</div>
               {companyPhone && <div className="text-[12px]">{companyPhone}</div>}
               {companyCNPJ && <div className="text-[12px]">{companyCNPJ}</div>}
               {companyAddress && <div className="text-[11px] text-[#6b7280] mt-1">{companyAddress}</div>}
             </div>
             
             <div className="border-t border-b border-[#d1d5db] py-3 mb-5 space-y-1">
               <div className="font-bold uppercase text-[12px]">RECIBO DE VENDA #{sale.code}</div>
               <div className="text-[12px] text-[#4b5563]">{formattedDate} — {saleTime}</div>
             </div>

             <div className="mb-6 space-y-1 text-[12px] leading-relaxed">
               <div className="font-bold">Cliente</div>
               <div>{clientName || "—"}</div>
               {clientPhone && <div>{clientPhone}</div>}
               {clientDoc && <div>{clientDoc}</div>}
               {clientAddress && <div>{clientAddress}</div>}
               {clientObs && <div className="mt-2 italic text-[#4b5563] border-l-2 border-[#e5e7eb] pl-2">Obs: {clientObs}</div>}
             </div>

             <div className="mb-6 text-[12px]">
               <div className="font-bold mb-2 text-[13px]">Descrição</div>
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-[#d1d5db]">
                     <th className="pb-1 font-semibold">Produto</th>
                     <th className="pb-1 font-semibold text-center">Qtd</th>
                     <th className="pb-1 font-semibold text-right">Unit.</th>
                     <th className="pb-1 font-semibold text-right">Total</th>
                   </tr>
                 </thead>
                 <tbody>
                   {sale.items.map(it => (
                     <tr key={it.id} className="border-b border-[#f3f4f6]">
                       <td className="py-2 pr-2">{it.productName}</td>
                       <td className="py-2 text-center">{it.quantity}</td>
                       <td className="py-2 text-right">{formatBRL(it.unitPrice)}</td>
                       <td className="py-2 text-right font-medium">{formatBRL(it.quantity * it.unitPrice)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>

             <div className="space-y-1.5 text-right mb-10 text-[12px]">
               <div className="text-[#4b5563]">Valor produtos: {formatBRL(sale.subtotal)}</div>
               {sale.discount > 0 && <div className="text-[#4b5563]">Desconto: -{formatBRL(sale.discount)}</div>}
               <div className="font-bold text-[13px] mt-1">Valor total: {formatBRL(sale.total)}</div>
               <div className="text-[#4b5563] mt-1">Forma de pagamento: {paymentLabels[sale.payment]}</div>
             </div>

             <div className="text-center text-[10px] text-[#6b7280] space-y-4 pt-6 border-t border-[#e5e7eb]">
               <div>Data do recibo: {formattedDate}</div>
               <div>Documento gerado pelo GestãoShop. Impressão em 1 via.</div>
               <div className="pt-8 flex flex-col items-center">
                 <span className="inline-block border-t border-[#9ca3af] pt-1 w-48">Visto</span>
               </div>
             </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-end gap-3 bg-card shrink-0">
           <div className="flex items-center gap-3 w-full sm:w-auto">
             <Button variant="outline" onClick={handlePrint} className="flex-1 sm:flex-none">
               <Printer className="h-4 w-4 mr-2" /> Imprimir
             </Button>
             <Button onClick={handleDownloadPDF} className="flex-1 sm:flex-none">
               <Download className="h-4 w-4 mr-2" /> Baixar PDF
             </Button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
