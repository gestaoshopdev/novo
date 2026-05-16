import { createFileRoute } from '@tanstack/react-router'
import { 
  Users, Search, Filter, Plus, Mail, Phone, 
  MapPin, Calendar, MoreHorizontal, Download, Upload,
  ShoppingBag, Truck, DollarSign, Star, Trash2, Edit2
} from "lucide-react";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";
import { useSales, useProducts, useContacts, useCreateContact, useUpdateContact, useDeleteContact } from "@/hooks/useQueries";
import { formatBRL } from "@/components/sales/types";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";

export const Route = createFileRoute("/app/crm")({
  head: () => ({ meta: [{ title: "CRM · Nimbus" }] }),
  component: CRMPage,
});

function CRMPage() {
  const { data: sales = [] } = useSales();
  const { data: products = [] } = useProducts();
  const { data: dbContacts = [] } = useContacts();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();
  
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("customers");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [contactType, setContactType] = useState<"customer" | "supplier">("customer");
  
  // Selection & Edit states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingContact, setEditingContact] = useState<any>(null);
  
  // Dialog states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", document: "", notes: "" });

  const handleExport = () => {
    let toExport: any[] = [];
    
    // Se houver seleção, exporta apenas o que está selecionado na aba atual
    if (selectedIds.length > 0) {
      const currentData = activeTab === "customers" ? customers : suppliers;
      toExport = currentData
        .filter(c => selectedIds.includes(c.id))
        .map(c => ({ ...c, exportType: activeTab === "customers" ? "cliente" : "fornecedor" }));
    } else {
      // Se não houver seleção, exporta TUDO (Clientes + Fornecedores)
      toExport = [
        ...customers.map(c => ({ ...c, exportType: "cliente" })),
        ...suppliers.map(s => ({ ...s, exportType: "fornecedor" }))
      ];
    }

    if (toExport.length === 0) {
      toast.error("Nenhum dado para exportar.");
      return;
    }

    const headers = ["Nome", "Email", "Telefone", "Documento", "Notas", "Tipo"];
    const rows = toExport.map(c => [
      c.name,
      c.email === "Sem e-mail" ? "" : c.email,
      c.phone === "Sem telefone" ? "" : c.phone,
      c.document || "",
      c.notes || "",
      c.exportType
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `base_contatos_nimbus_${new Date().toLocaleDateString().replace(/\//g, "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Base completa exportada com sucesso!");
  };


  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split("\n");
      const headers = lines[0].split(",");
      const dataRows = lines.slice(1).filter(line => line.trim() !== "");

      let customersCount = 0;
      let suppliersCount = 0;
      let errorCount = 0;

      toast.loading(`Importando ${dataRows.length} contatos...`, { id: "import-toast" });

      for (const row of dataRows) {
        // Parse CSV line handling quotes
        const values: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        values.push(current.trim());

        const name = values[0];
        const email = values[1];
        const phone = values[2];
        const document = values[3] || "";
        const notes = values[4] || "";
        const typeRaw = values[5]?.toLowerCase() || "";
        
        // Melhora a detecção do tipo
        let finalType: "customer" | "supplier" = activeTab === "customers" ? "customer" : "supplier";
        
        if (typeRaw) {
          const isSupplier = typeRaw.includes("fornec") || typeRaw.includes("suppl") || typeRaw.includes("vendedor");
          const isCustomer = typeRaw.includes("client") || typeRaw.includes("custo") || typeRaw.includes("comprador");
          
          if (isSupplier) finalType = "supplier";
          else if (isCustomer) finalType = "customer";
        }

        if (!name || !phone) {
          errorCount++;
          continue;
        }

        try {
          await createContact.mutateAsync({
            name,
            email,
            phone,
            document,
            type: finalType,
            notes
          });
          if (finalType === "customer") customersCount++;
          else suppliersCount++;
        } catch (err) {
          console.error("Erro ao importar linha:", row, err);
          errorCount++;
        }
      }

      toast.dismiss("import-toast");
      
      if (customersCount > 0 || suppliersCount > 0) {
        let msg = "Importação concluída: ";
        if (customersCount > 0) msg += `${customersCount} Clientes `;
        if (suppliersCount > 0) msg += `${suppliersCount} Fornecedores `;
        toast.success(msg.trim());
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} linhas falharam. Verifique o formato do arquivo.`);
      }
      
      // Reset input
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error("Preencha os campos obrigatórios (Nome e Telefone)");
      return;
    }

    try {
      if (editingContact && editingContact.type === "Manual") {
        await updateContact.mutateAsync({
          id: editingContact.id,
          updates: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            document: formData.document,
            type: contactType,
            notes: formData.notes
          }
        });
        toast.success("Contato atualizado com sucesso!");
      } else {
        await createContact.mutateAsync({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          document: formData.document,
          type: contactType,
          notes: formData.notes
        });
        toast.success(`${contactType === "customer" ? "Cliente" : "Fornecedor"} cadastrado com sucesso!`);
      }
      setIsAddOpen(false);
      setEditingContact(null);
      setFormData({ name: "", phone: "", email: "", document: "", notes: "" });
    } catch (error: any) {
      toast.error("Erro na operação: " + error.message);
    }
  };

  const handleDelete = async (contact: any) => {
    if (contact.type !== "Manual") {
      toast.error(contact.type === "Frequente" ? "Contatos gerados por vendas não podem ser excluídos." : "Fornecedores vinculados a produtos não podem ser excluídos.");
      return;
    }
    setContactToDelete(contact.id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;
    try {
      await deleteContact.mutateAsync(contactToDelete);
      toast.success("Contato removido com sucesso!");
      setSelectedIds(prev => prev.filter(i => i !== contactToDelete));
      setIsDeleteOpen(false);
      setContactToDelete(null);
    } catch (error: any) {
      toast.error("Erro ao remover: " + error.message);
    }
  };

  const handleBulkDelete = () => {
    const manualCount = [...customers, ...suppliers].filter(c => c.type === "Manual" && selectedIds.includes(c.id)).length;
    if (manualCount === 0) {
      toast.error("Nenhum contato selecionado pode ser excluído manualmente.");
      return;
    }
    if (manualCount < selectedIds.length) {
      toast.info(`${selectedIds.length - manualCount} contatos automáticos serão ignorados.`);
    }
    setIsBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const manualIds = [...customers, ...suppliers]
        .filter(c => c.type === "Manual" && selectedIds.includes(c.id))
        .map(c => c.id);

      for (const id of manualIds) {
        await deleteContact.mutateAsync(id);
      }
      toast.success(`${manualIds.length} contatos removidos com sucesso!`);
      setSelectedIds([]);
      setIsBulkDeleteOpen(false);
    } catch (error: any) {
      toast.error("Erro ao remover alguns contatos");
    }
  };

  const startEdit = (contact: any) => {
    setEditingContact(contact);
    setContactType(contact.type === "Manual" ? (activeTab === "customers" ? "customer" : "supplier") : "customer");
    setFormData({
      name: contact.name,
      email: contact.email === "Sem e-mail" ? "" : contact.email,
      phone: contact.phone === "Sem telefone" ? "" : contact.phone,
      document: contact.document || "",
      notes: contact.notes || ""
    });
    setIsAddOpen(true);
  };

  const toggleSelectAll = () => {
    const currentData = activeTab === "customers" ? customers : suppliers;
    if (selectedIds.length === currentData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentData.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };


  // Derive customers from sales + DB
  const customers = useMemo(() => {
    const customerMap = new Map();
    
    // Add DB contacts first
    dbContacts.filter(c => c.type === "customer").forEach(c => {
      customerMap.set(c.name, {
        id: c.id,
        name: c.name,
        email: c.email || "Sem e-mail",
        phone: c.phone || "Sem telefone",
        document: c.document || "",
        notes: c.notes || "",
        totalOrders: 0,
        totalSpent: 0,
        lastPurchase: c.created_at,
        status: "Ativo",
        type: "Manual"
      });
    });

    sales.forEach(sale => {
      if (!sale.buyerName) return;
      
      const existing = customerMap.get(sale.buyerName);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += Number(sale.total);
        if (new Date(sale.date) > new Date(existing.lastPurchase)) {
          existing.lastPurchase = sale.date;
        }
        if (existing.type !== "Manual") existing.type = "Frequente";
      } else {
        customerMap.set(sale.buyerName, {
          id: sale.id,
          name: sale.buyerName,
          email: "contato@cliente.com",
          phone: "(11) 99999-9999",
          totalOrders: 1,
          totalSpent: Number(sale.total),
          lastPurchase: sale.date,
          status: "Ativo",
          type: "Frequente"
        });
      }
    });

    return Array.from(customerMap.values())
      .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [sales, dbContacts, search]);

  // Derive suppliers from products + DB
  const suppliers = useMemo(() => {
    const supplierMap = new Map();
    
    // Add DB suppliers
    dbContacts.filter(c => c.type === "supplier").forEach(c => {
      supplierMap.set(c.name, {
        id: c.id,
        name: c.name,
        email: c.email || "Sem e-mail",
        phone: c.phone || "Sem telefone",
        document: c.document || "",
        notes: c.notes || "",
        category: "Geral",
        productsCount: 0,
        stockValue: 0,
        lastPurchase: c.created_at,
        status: "Ativo",
        type: "Manual"
      });
    });
    
    products.forEach(p => {
      if (!p.supplier) return;
      
      const existing = supplierMap.get(p.supplier);
      if (existing) {
        existing.productsCount += 1;
        existing.stockValue += Number(p.stock) * Number(p.costPrice);
      } else {
        supplierMap.set(p.supplier, {
          id: p.sku,
          name: p.supplier,
          category: p.category,
          productsCount: 1,
          stockValue: Number(p.stock) * Number(p.costPrice),
          lastPurchase: p.purchaseDate || p.createdAt,
          status: "Ativo",
          type: "Vínculo"
        });
      }
    });

    return Array.from(supplierMap.values())
      .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.stockValue - a.stockValue);
  }, [products, dbContacts, search]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="CRM & Relacionamentos" 
        subtitle="Gerencie sua base de clientes e rede de fornecedores em um só lugar."
        icon={Users}
        actions={
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" className="h-9 gap-2" onClick={handleBulkDelete}>
                <Trash2 className="h-3.5 w-3.5" /> Remover ({selectedIds.length})
              </Button>
            )}
            <div className="relative">
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                id="import-csv" 
                onChange={handleImport}
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 gap-2" 
                onClick={() => document.getElementById("import-csv")?.click()}
              >
                <Upload className="h-3.5 w-3.5" /> Importar
              </Button>
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-2" onClick={handleExport}>
              <Download className="h-3.5 w-3.5" /> {selectedIds.length > 0 ? "Exportar Seleção" : "Exportar Tudo"}
            </Button>
            
            <Dialog open={isAddOpen} onOpenChange={(open) => {
              setIsAddOpen(open);
              if (!open) {
                setEditingContact(null);
                setFormData({ name: "", phone: "", email: "", document: "", notes: "" });
              }
            }}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="h-9 gap-2 gradient-primary text-white border-none glow-primary"
                  onClick={() => {
                    setEditingContact(null);
                    setContactType(activeTab === "customers" ? "customer" : "supplier");
                    setFormData({ name: "", phone: "", email: "", document: "", notes: "" });
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> Novo Contato
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background/95 backdrop-blur-xl border-border max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    {editingContact ? "Editar contato" : (contactType === "customer" ? "Novo cliente" : "Novo fornecedor")}
                  </DialogTitle>
                  <DialogDescription>
                    {editingContact ? "Altere as informações do contato selecionado." : `Cadastre um novo ${contactType === "customer" ? "cliente" : "fornecedor"} manualmente na sua base.`}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateContact}>
                  {/* ... (form fields stay the same) ... */}
                  <div className="space-y-5 py-4">
                    {!editingContact && (
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Tipo de Contato</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-background/50 border border-border rounded-xl">
                          <button 
                            type="button"
                            onClick={() => setContactType("customer")}
                            className={cn(
                              "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                              contactType === "customer" 
                                ? "bg-primary text-white shadow-lg" 
                                : "text-muted-foreground hover:text-white"
                            )}
                          >
                            <Users className="h-4 w-4" /> Cliente
                          </button>
                          <button 
                            type="button"
                            onClick={() => setContactType("supplier")}
                            className={cn(
                              "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                              contactType === "supplier" 
                                ? "bg-primary text-white shadow-lg" 
                                : "text-muted-foreground hover:text-white"
                            )}
                          >
                            <Truck className="h-4 w-4" /> Fornecedor
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                          Nome <span className="text-primary">*</span>
                        </label>
                        <Input 
                          placeholder="Nome completo" 
                          className="bg-background/50 h-11" 
                          required 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">E-mail</label>
                        <Input 
                          placeholder="cliente@exemplo.com" 
                          className="bg-background/50 h-11" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                          Telefone <span className="text-primary">*</span>
                        </label>
                        <Input 
                          placeholder="(11) 99999-9999" 
                          className="bg-background/50 h-11" 
                          required 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                        <p className="text-[10px] text-muted-foreground/70">DDD + número com 9 na frente para contato via WhatsApp.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                          {contactType === "customer" ? "CPF" : "CNPJ / Razão Social"}
                        </label>
                        <Input 
                          placeholder={contactType === "customer" ? "000.000.000-00" : "00.000.000/0001-00"} 
                          className="bg-background/50 h-11" 
                          value={formData.document}
                          onChange={(e) => setFormData({...formData, document: e.target.value})}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Observações</label>
                        <Input 
                          placeholder="Opcional" 
                          className="bg-background/50 h-11" 
                          value={formData.notes}
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="h-11 px-8 rounded-xl font-bold">
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      className={cn(
                        "h-11 px-8 rounded-xl font-bold border-none",
                        contactType === "customer" ? "bg-success hover:bg-success/90" : "bg-primary hover:bg-primary/90"
                      )}
                    >
                      {editingContact ? "Salvar Alterações" : "Cadastrar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* ... Quick Stats remains the same ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CRMStat label="Total de Clientes" value={customers.length.toString()} icon={Users} variant="primary" />
        <CRMStat label="Fornecedores" value={suppliers.length.toString()} sub="Ativos na rede" icon={Truck} variant="info" />
      </div>

      <Tabs defaultValue="customers" className="w-full" onValueChange={(val) => { setActiveTab(val); setSelectedIds([]); }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/40 p-2 rounded-2xl border border-border/50">
          <TabsList className="bg-transparent border-none p-0 h-auto">
            <TabsTrigger value="customers" className="px-6 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">Clientes</TabsTrigger>
            <TabsTrigger value="suppliers" className="px-6 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">Fornecedores</TabsTrigger>
          </TabsList>
          {/* ... Search & Filter remains the same ... */}
          <div className="flex items-center gap-2 px-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={`Buscar ${activeTab === "customers" ? "clientes" : "fornecedores"}...`} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 bg-background/50 border-border rounded-xl text-sm" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl"><Filter className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl">
                <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>{filterStatus === "all" && "✓ "}Todos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("active")}>{filterStatus === "active" && "✓ "}Ativos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("inactive")}>{filterStatus === "inactive" && "✓ "}Inativos</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-6">
          <TabsContent value="customers" className="m-0 focus-visible:outline-none">
            <div className="glass border border-border/60 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-border/50">
                      <th className="px-6 py-4 w-10">
                        <Checkbox 
                          checked={customers.length > 0 && selectedIds.length === customers.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Cliente</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Contato</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground text-center">Pedidos</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Total Gasto</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Última Compra</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-sm">
                    {customers.map((c) => (
                      <tr key={c.id} className={cn("hover:bg-white/[0.02] transition-colors group", selectedIds.includes(c.id) && "bg-primary/5")}>
                        <td className="px-6 py-4">
                          <Checkbox 
                            checked={selectedIds.includes(c.id)}
                            onCheckedChange={() => toggleSelect(c.id)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                              {c.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-white group-hover:text-primary transition-colors">{c.name}</span>
                              <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.5 rounded w-fit", c.type === "Manual" ? "bg-info/10 text-info" : "bg-muted text-muted-foreground")}>
                                {c.type}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-[12px] text-muted-foreground">
                            <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {c.email}</div>
                            <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {c.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-background border border-border text-xs font-bold">{c.totalOrders}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-success">{formatBRL(c.totalSpent)}</span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(c.lastPurchase).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-info/10 hover:text-info" onClick={() => startEdit(c)}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(c)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suppliers" className="m-0 focus-visible:outline-none">
            <div className="glass border border-border/60 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-border/50">
                      <th className="px-6 py-4 w-10">
                        <Checkbox 
                          checked={suppliers.length > 0 && selectedIds.length === suppliers.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Fornecedor</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground text-center">SKUs</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Vlr. em Estoque</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Última Reposição</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-sm">
                    {suppliers.map((s) => (
                      <tr key={s.id} className={cn("hover:bg-white/[0.02] transition-colors group", selectedIds.includes(s.id) && "bg-primary/5")}>
                        <td className="px-6 py-4">
                          <Checkbox 
                            checked={selectedIds.includes(s.id)}
                            onCheckedChange={() => toggleSelect(s.id)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center text-info font-bold text-xs shrink-0">
                              <Truck className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-white group-hover:text-primary transition-colors">{s.name}</span>
                              <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.5 rounded w-fit", s.type === "Manual" ? "bg-info/10 text-info" : "bg-muted text-muted-foreground")}>
                                {s.type}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center"><span className="font-bold">{s.productsCount}</span></td>
                        <td className="px-6 py-4"><span className="font-bold text-primary">{formatBRL(s.stockValue)}</span></td>
                        <td className="px-6 py-4 text-muted-foreground">{new Date(s.lastPurchase).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-info/10 hover:text-info" onClick={() => startEdit(s)}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(s)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <DeleteConfirmationDialog 
        open={isDeleteOpen} 
        onOpenChange={setIsDeleteOpen}
        title="Excluir contato?"
        description="Esta ação removerá permanentemente o contato da sua base de CRM. Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
      />

      <DeleteConfirmationDialog 
        open={isBulkDeleteOpen} 
        onOpenChange={setIsBulkDeleteOpen}
        title={`Excluir ${selectedIds.length} contatos?`}
        description="Você está prestes a remover permanentemente múltiplos contatos selecionados. Esta ação não pode ser desfeita."
        onConfirm={confirmBulkDelete}
      />
    </div>
  );
}

function CRMStat({ label, value, sub, icon: Icon, variant = "primary" }: any) {
  const variants = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    info: "bg-info/10 text-info border-info/20",
    warning: "bg-warning/10 text-warning border-warning/20",
  };

  return (
    <div className="bg-card/40 border border-border/60 rounded-2xl p-5 hover:border-primary/40 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border", variants[variant as keyof typeof variants])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="h-8 w-8 rounded-full bg-white/[0.02] border border-border/50 flex items-center justify-center">
          <Star className="h-3.5 w-3.5 text-muted-foreground/30" />
        </div>
      </div>
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</h4>
        <div className="flex items-end gap-2 mt-1">
          <span className="text-2xl font-bold text-white leading-none">{value}</span>
          <span className="text-[10px] text-muted-foreground font-medium mb-0.5">{sub}</span>
        </div>
      </div>
    </div>
  );
}
