import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { PlayCircle, GraduationCap, Lightbulb, ShoppingBag, DollarSign, Users, ArrowLeft, CheckCircle2, ChevronRight, Settings, Image as ImageIcon, CreditCard, Tags, Truck, ShieldCheck, FileText, PieChart, Star, Mail, Zap, Activity, Baby, Book, Wrench, Footprints, Home, Monitor, Shirt, Smartphone, Sparkles, Trophy, Utensils, FileDigit, Store, Search, Pencil, Receipt, Printer, Download, Undo2, ArrowRightLeft, MoreHorizontal, Filter, Plus, TrendingDown, Trash2, Hourglass, AlertCircle, Calendar, BarChart2, Wallet, Target, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/app/tutorials")({
  component: TutorialsPage,
});

const MockupSettings = () => (
  <div className="bg-background rounded-xl border border-border p-4 w-full mt-4 flex flex-col md:flex-row gap-4 text-left select-none relative overflow-y-auto h-[350px] shadow-lg [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
    <div className="flex-1 space-y-4">
      <div className="bg-card rounded-lg p-3 border border-border shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-[11px] font-bold text-foreground"><Users className="h-3.5 w-3.5 text-primary" /> Informações Pessoais</div>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[8px] text-muted-foreground uppercase font-bold">NOME</label>
            <div className="h-7 w-full bg-background border border-border rounded text-[10px] px-2 flex items-center text-foreground">Gestão Shop</div>
            <p className="text-[7px] text-muted-foreground mt-1">Seu nome será exibido no perfil e na sidebar</p>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] text-muted-foreground uppercase font-bold">FOTO DE PERFIL</label>
            <div className="flex gap-3 items-center mt-1">
              <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center p-1 overflow-hidden"><Users className="text-primary h-5 w-5" /></div>
              <div className="flex items-center gap-1 border border-border rounded px-2 py-1 bg-background text-[8px] font-bold text-foreground">Adicionar Foto</div>
              <p className="text-[7px] text-muted-foreground">Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB</p>
            </div>
          </div>
          <div className="mt-3 bg-success text-white text-[9px] font-bold px-3 py-1.5 rounded w-fit flex items-center gap-1">
            Salvar Alterações
          </div>
        </div>
      </div>
      <div className="bg-card rounded-lg p-3 border border-border shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-bold text-foreground"><Settings className="h-3.5 w-3.5 text-primary" /> Dados da Empresa</div>
        <p className="text-[7px] text-muted-foreground mb-3 mt-1">Usados em recibos de venda. Todos os campos são opcionais. Para gerar recibos, preencha pelo menos o nome da empresa e um contato.</p>
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-[8px] text-muted-foreground uppercase font-bold">NOME DA EMPRESA</label>
            <div className="h-7 w-full bg-background border border-border rounded text-[10px] px-2 flex items-center text-muted-foreground">Ex: Centro Automotivo Gama</div>
          </div>
          <div className="flex gap-2">
            <div className="space-y-1 flex-1">
              <label className="text-[8px] text-muted-foreground uppercase font-bold">TELEFONE</label>
              <div className="h-7 w-full bg-background border border-border rounded text-[10px] px-2 flex items-center text-foreground">(17) 99999-8888</div>
            </div>
            <div className="space-y-1 flex-1">
              <label className="text-[8px] text-muted-foreground uppercase font-bold">E-MAIL</label>
              <div className="h-7 w-full bg-background border border-border rounded text-[10px] px-2 flex items-center text-foreground">contato@empresa.com</div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] text-muted-foreground uppercase font-bold">ENDEREÇO DA EMPRESA</label>
            <div className="h-16 w-full bg-background border border-border rounded text-[10px] p-2 text-muted-foreground">Rua, número, complemento, referência...</div>
          </div>
          <div className="flex gap-2">
            <div className="space-y-1 flex-1">
              <div className="h-7 w-full bg-background border border-border rounded text-[10px] px-2 flex items-center text-muted-foreground">Bairro</div>
            </div>
            <div className="space-y-1 flex-1">
              <div className="h-7 w-full bg-background border border-border rounded text-[10px] px-2 flex items-center text-muted-foreground">Cidade</div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="space-y-1 flex-1">
              <div className="h-7 w-full bg-background border border-border rounded text-[10px] px-2 flex items-center text-muted-foreground">UF</div>
            </div>
            <div className="space-y-1 flex-1">
              <div className="h-7 w-full bg-background border border-border rounded text-[10px] px-2 flex items-center text-muted-foreground">CEP</div>
            </div>
          </div>
          <div className="space-y-1 w-1/2">
            <label className="text-[8px] text-muted-foreground uppercase font-bold">CPF / CNPJ</label>
            <div className="h-7 w-full bg-background border border-border rounded text-[10px] px-2 flex items-center text-muted-foreground">CPF ou CNPJ</div>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] text-muted-foreground uppercase font-bold">LOGO DA EMPRESA (OPCIONAL)</label>
            <p className="text-[7px] text-muted-foreground">Aparece no cabeçalho do recibo de venda. JPG, PNG ou GIF, máx. 2MB.</p>
            <div className="flex items-center gap-1 border border-border rounded px-2 py-1 bg-background w-fit text-[8px] font-bold text-foreground mt-1">Enviar logo</div>
          </div>
          <div className="mt-3 bg-primary/10 text-foreground text-[9px] font-bold px-3 py-1.5 rounded w-fit flex items-center gap-1 border border-primary/20">
            Salvar Dados da Empresa
          </div>
        </div>
      </div>
    </div>
    <div className="w-full md:w-1/3">
      <div className="bg-card rounded-lg p-3 border border-border shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-[11px] font-bold text-foreground"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Segurança</div>
        <div className="space-y-1 mb-3">
          <label className="text-[8px] text-muted-foreground uppercase font-bold">EMAIL DA CONTA</label>
          <div className="h-7 w-full bg-background border border-border rounded text-[10px] px-2 flex items-center text-foreground">suporte@gestaoshop.com</div>
          <p className="text-[7px] text-muted-foreground mt-1">O email não pode ser alterado. Entre em contato com o suporte se necessário.</p>
        </div>
        <div className="border border-border rounded-lg p-2 bg-background mb-2">
          <div className="text-[10px] font-bold mb-1 text-foreground flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Senha</div>
          <p className="text-[7px] text-muted-foreground mb-2">Mantenha sua conta segura com uma senha forte</p>
          <div className="h-6 w-full border border-border rounded text-[9px] flex items-center justify-center font-bold text-foreground">Alterar Senha</div>
        </div>
        <div className="h-7 w-full border border-border rounded text-[9px] flex items-center justify-center font-bold text-foreground mt-2">
          Sair da Conta
        </div>
      </div>
    </div>
  </div>
);

const MockupPayments = () => (
  <div className="bg-background rounded-xl border border-border p-4 w-full mt-4 text-left select-none relative shadow-lg flex flex-col">
    <div className="flex justify-between items-end mb-4 shrink-0">
      <div>
        <div className="font-bold text-sm text-foreground">Formas de Pagamento</div>
        <div className="text-[9px] text-muted-foreground">Configure as taxas de cada método</div>
      </div>
      <div className="bg-success text-white px-2 py-1 rounded text-[9px] font-bold flex items-center gap-1"><span className="text-lg leading-none mt-[-2px]">+</span> Novo Método</div>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <div className="bg-card rounded-lg border border-border p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded bg-success/20 flex items-center justify-center"><DollarSign className="h-3.5 w-3.5 text-success" /></div>
          <div className="flex-1">
            <div className="text-[11px] font-bold flex items-center gap-2">Dinheiro <span className="text-[7px] bg-background border border-border px-1 rounded text-muted-foreground">PADRÃO</span></div>
            <div className="text-[9px] text-success font-medium">Sem taxas</div>
          </div>
        </div>
        <div className="space-y-1.5 mt-4 pt-2 border-t border-border/50">
          <div className="flex justify-between text-[9px]"><span className="text-muted-foreground">Vendas</span><span className="font-bold">0</span></div>
          <div className="flex justify-between text-[9px]"><span className="text-muted-foreground">Total Recebido</span><span className="font-bold">R$ 0,00</span></div>
          <div className="flex justify-between text-[9px]"><span className="text-muted-foreground">Total em Taxas</span><span className="font-bold text-destructive">- R$ 0,00</span></div>
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center"><Zap className="h-3.5 w-3.5 text-primary" /></div>
          <div className="flex-1">
            <div className="text-[11px] font-bold flex items-center gap-2">PIX <span className="text-[7px] bg-background border border-border px-1 rounded text-muted-foreground">PADRÃO</span></div>
            <div className="text-[9px] text-success font-medium">Sem taxas</div>
          </div>
        </div>
        <div className="space-y-1.5 mt-4 pt-2 border-t border-border/50">
          <div className="flex justify-between text-[9px]"><span className="text-muted-foreground">Vendas</span><span className="font-bold">1</span></div>
          <div className="flex justify-between text-[9px]"><span className="text-muted-foreground">Total Recebido</span><span className="font-bold">R$ 90,00</span></div>
          <div className="flex justify-between text-[9px]"><span className="text-muted-foreground">Total em Taxas</span><span className="font-bold text-destructive">- R$ 0,00</span></div>
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded bg-destructive/20 flex items-center justify-center"><CreditCard className="h-3.5 w-3.5 text-destructive" /></div>
          <div className="flex-1">
            <div className="text-[11px] font-bold flex items-center gap-2 truncate">Cartão de Débito <span className="text-[7px] bg-background border border-border px-1 rounded text-muted-foreground">PADRÃO</span></div>
            <div className="text-[9px] text-destructive font-medium">1.5%</div>
          </div>
        </div>
        <div className="space-y-1.5 mt-4 pt-2 border-t border-border/50">
          <div className="flex justify-between text-[9px]"><span className="text-muted-foreground">Vendas</span><span className="font-bold">0</span></div>
          <div className="flex justify-between text-[9px]"><span className="text-muted-foreground">Total Recebido</span><span className="font-bold">R$ 0,00</span></div>
          <div className="flex justify-between text-[9px]"><span className="text-muted-foreground">Total em Taxas</span><span className="font-bold text-destructive">- R$ 0,00</span></div>
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded bg-destructive/20 flex items-center justify-center"><CreditCard className="h-3.5 w-3.5 text-destructive" /></div>
          <div className="flex-1">
            <div className="text-[11px] font-bold flex items-center gap-2 truncate">Cartão de Crédito <span className="text-[7px] bg-background border border-border px-1 rounded text-muted-foreground">PADRÃO</span></div>
            <div className="text-[9px] text-destructive font-medium">3.5%</div>
          </div>
        </div>
        <div className="space-y-1.5 mt-4 pt-2 border-t border-border/50">
          <div className="flex justify-between text-[9px]"><span className="text-muted-foreground">Vendas</span><span className="font-bold">0</span></div>
          <div className="flex justify-between text-[9px]"><span className="text-muted-foreground">Total Recebido</span><span className="font-bold">R$ 0,00</span></div>
          <div className="flex justify-between text-[9px]"><span className="text-muted-foreground">Total em Taxas</span><span className="font-bold text-destructive">- R$ 0,00</span></div>
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded bg-destructive/20 flex items-center justify-center"><FileDigit className="h-3.5 w-3.5 text-destructive" /></div>
          <div className="flex-1">
            <div className="text-[11px] font-bold flex items-center gap-2">Boleto <span className="text-[7px] bg-background border border-border px-1 rounded text-muted-foreground">PADRÃO</span></div>
            <div className="text-[9px] text-destructive font-medium">R$ 2,00</div>
          </div>
        </div>
        <div className="space-y-1.5 mt-4 pt-2 border-t border-border/50">
          <div className="flex justify-between text-[9px]"><span className="text-muted-foreground">Vendas</span><span className="font-bold">0</span></div>
          <div className="flex justify-between text-[9px]"><span className="text-muted-foreground">Total Recebido</span><span className="font-bold">R$ 0,00</span></div>
          <div className="flex justify-between text-[9px]"><span className="text-muted-foreground">Total em Taxas</span><span className="font-bold text-destructive">- R$ 0,00</span></div>
        </div>
      </div>
    </div>
  </div>
);

const MockupCategories = () => (
  <div className="bg-background rounded-xl border border-border p-4 w-full mt-4 text-left select-none relative overflow-y-auto h-[350px] shadow-lg flex flex-col [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
    <div className="flex justify-between items-end mb-4 shrink-0">
      <div className="flex gap-3 items-center">
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center"><Tags className="h-4 w-4 text-primary" /></div>
        <div>
          <div className="font-bold text-sm text-foreground">Categorias</div>
          <div className="text-[9px] text-muted-foreground">Organize seus produtos por categorias</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="border border-border text-foreground px-2 py-1.5 rounded text-[9px] font-bold flex items-center gap-1">Restaurar padrões</div>
        <div className="bg-success text-white px-2 py-1.5 rounded text-[9px] font-bold flex items-center gap-1">+ Nova Categoria</div>
      </div>
    </div>
    <div className="grid grid-cols-4 gap-2">
      {[
        { t: "Saúde", p: 0, c: "bg-info/10 text-info", icon: <Activity className="h-3 w-3" /> },
        { t: "Infantil", p: 0, c: "bg-primary/10 text-primary", icon: <Baby className="h-3 w-3" /> },
        { t: "Papelaria", p: 0, c: "bg-warning/10 text-warning", icon: <Book className="h-3 w-3" /> },
        { t: "Ferramentas", p: 1, c: "bg-destructive/10 text-destructive", icon: <Wrench className="h-3 w-3" /> },
        { t: "Calçados", p: 0, c: "bg-success/10 text-success", icon: <Footprints className="h-3 w-3" /> },
        { t: "Casa & Decoração", p: 0, c: "bg-primary/10 text-primary", icon: <Home className="h-3 w-3" /> },
        { t: "Eletrônicos", p: 2, c: "bg-info/10 text-info", icon: <Monitor className="h-3 w-3" /> },
        { t: "Roupas", p: 0, c: "bg-primary/10 text-primary", icon: <Shirt className="h-3 w-3" /> },
        { t: "Tecnologia", p: 0, c: "bg-info/10 text-info", icon: <Smartphone className="h-3 w-3" /> },
        { t: "Beleza", p: 0, c: "bg-primary/10 text-primary", icon: <Sparkles className="h-3 w-3" /> },
        { t: "Esportes", p: 0, c: "bg-info/10 text-info", icon: <Trophy className="h-3 w-3" /> },
        { t: "Alimentos", p: 0, c: "bg-success/10 text-success", icon: <Utensils className="h-3 w-3" /> },
      ].map(c => (
        <div key={c.t} className="bg-card rounded-lg border border-border p-2.5 flex items-center gap-2 shadow-sm">
          <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${c.c}`}>
            {c.icon}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-[10px] font-bold truncate text-foreground">{c.t}</div>
            <div className="text-[8px] text-muted-foreground">{c.p} produto(s)</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MockupNewProduct = () => (
  <div className="bg-background/80 rounded-xl border border-border w-full mt-4 text-left select-none relative shadow-lg flex items-center justify-center p-4">
    <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-sm flex flex-col z-10">
      <div className="p-3 border-b border-border flex justify-between items-center shrink-0">
        <span className="font-bold text-sm text-foreground">Novo Produto</span>
        <span className="text-muted-foreground font-bold">×</span>
      </div>
      <div className="p-3 flex-1 space-y-4">
        <div>
          <div className="text-[10px] font-bold mb-1">Fotos do Produto</div>
          <div className="h-20 w-full border border-dashed border-border rounded-lg bg-background flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-bold">Clique ou arraste para adicionar fotos</span>
          </div>
          <p className="text-[7px] text-center mt-1 text-muted-foreground">PNG, JPG ou WEBP (até 40MB cada; otimizamos para ~2MB ao enviar, até 5 fotos)</p>
        </div>
        <div>
          <div className="text-[10px] font-bold mb-1">Nome do Produto</div>
          <div className="h-7 w-full border border-border rounded bg-background flex items-center px-2 text-[10px] text-muted-foreground">Ex: Smartwatch Pro X</div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="text-[10px] font-bold mb-1">Categoria</div>
            <div className="h-7 w-full border border-border rounded bg-background flex items-center justify-between px-2 text-[10px] text-muted-foreground">Selecione <ChevronRight className="h-3 w-3 rotate-90" /></div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold mb-1">Estoque</div>
            <div className="h-7 w-full border border-border rounded bg-background flex items-center justify-end px-2 text-[10px] font-bold text-foreground">0</div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="text-[10px] font-bold mb-1">Preço de Custo (R$)</div>
            <div className="h-7 w-full border border-border rounded bg-background flex items-center justify-between px-2 text-[10px] font-bold text-foreground"><span className="text-muted-foreground">R$</span> <span>0</span></div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold mb-1">Preço varejo (R$)</div>
            <div className="h-7 w-full border border-border rounded bg-background flex items-center justify-between px-2 text-[10px] font-bold text-foreground"><span className="text-muted-foreground">R$</span> <span>0</span></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="text-[10px] font-bold mb-1">Preço atacado (R$)</div>
            <div className="h-7 w-full border border-border rounded bg-background flex items-center justify-between px-2 text-[10px] font-bold text-foreground"><span className="text-muted-foreground">R$</span> <span>0</span></div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold mb-1">Fornecedor</div>
            <div className="h-7 w-full border border-border rounded bg-background flex items-center px-2 text-[10px] text-muted-foreground">Opcional</div>
          </div>
        </div>
        <p className="text-[7px] text-muted-foreground mt-0">Na venda, aparece o botão Varejo/Atacado quando este campo estiver preenchido.</p>
        <div>
          <div className="text-[10px] font-bold mb-1">Data da Compra</div>
          <div className="h-7 w-full border border-border rounded bg-background flex items-center px-2 text-[10px] font-bold text-foreground">06/05/2026</div>
        </div>
        <div className="flex items-center gap-2 mt-4 bg-background/50 border border-border p-3 rounded-lg">
          <div className="h-4 w-4 rounded-full border border-border bg-background"></div>
          <Store className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-bold text-foreground">Adicionar ao catálogo</span>
        </div>
      </div>
      <div className="p-3 border-t border-border flex justify-end gap-2 bg-background/50 shrink-0">
        <div className="px-3 py-1.5 rounded border border-border text-[10px] font-bold">Cancelar</div>
        <div className="px-3 py-1.5 rounded bg-success text-white text-[10px] font-bold">Cadastrar</div>
      </div>
    </div>
  </div>
);

const MockupNewSale = () => (
  <div className="bg-[#0f172a] rounded-xl border border-border p-4 w-full mt-4 text-left select-none shadow-lg flex flex-col max-w-sm mx-auto h-[450px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
    <div className="flex justify-between items-center mb-6">
      <div className="font-bold text-base text-white">Registrar Venda</div>
      <button className="text-muted-foreground hover:text-white transition-colors">✕</button>
    </div>

    <div className="space-y-4">
      {/* Item 1 */}
      <div className="bg-[#1e293b]/50 border border-border/50 rounded-lg p-3 space-y-3">
        <div className="text-[11px] font-bold text-white">Item 1</div>
        <div>
          <div className="text-[10px] font-bold mb-1 text-white">Produto</div>
          <div className="h-9 w-full border border-border rounded-lg bg-[#0f172a] flex items-center justify-between px-3 text-[11px] text-muted-foreground">Buscar produto... <ChevronRight className="h-3 w-3 rotate-90" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] font-bold mb-1 text-white">Qtd</div>
            <div className="h-9 w-full border border-border rounded-lg bg-[#0f172a] flex items-center justify-between px-3 text-[11px] text-white font-bold">
              1
              <div className="flex flex-col"><ChevronRight className="h-2 w-2 -rotate-90" /><ChevronRight className="h-2 w-2 rotate-90" /></div>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold mb-1 text-white">Preço unit. (R$)</div>
            <div className="h-9 w-full border border-border rounded-lg bg-[#0f172a] flex items-center justify-between px-3 text-[11px] text-white font-bold">
              <span className="text-muted-foreground">R$</span> 0
              <div className="flex flex-col"><ChevronRight className="h-2 w-2 -rotate-90" /><ChevronRight className="h-2 w-2 rotate-90" /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-9 w-full border border-dashed border-border rounded-lg bg-transparent flex items-center justify-center text-[11px] text-muted-foreground hover:text-white transition-colors cursor-pointer gap-2">
        + Adicionar outro item
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-bold mb-1 text-white">Canal de Venda</div>
          <div className="h-9 w-full border border-border rounded-lg bg-transparent flex items-center justify-between px-3 text-[11px] text-muted-foreground">
            Selecione <ChevronRight className="h-3 w-3 rotate-90" />
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold mb-1 text-white">Forma de Pagamento</div>
          <div className="h-9 w-full border border-border rounded-lg bg-transparent flex items-center justify-between px-3 text-[11px] text-muted-foreground">
            Selecione <ChevronRight className="h-3 w-3 rotate-90" />
          </div>
        </div>
      </div>

      <div>
        <div className="text-[10px] font-bold mb-1 text-white">Tipo de recebimento</div>
        <div className="h-9 w-full border border-border rounded-lg bg-transparent flex items-center justify-between px-3 text-[11px] text-white font-bold">
          À vista <ChevronRight className="h-3 w-3 rotate-90 text-muted-foreground" />
        </div>
      </div>

      <div>
        <div className="text-[10px] font-bold mb-1 text-white">Comprador</div>
        <div className="h-9 w-full border border-border rounded-lg bg-transparent flex items-center justify-between px-3 text-[11px] text-white font-bold">
          Não vinculado <ChevronRight className="h-3 w-3 rotate-90 text-muted-foreground" />
        </div>
      </div>

      <div>
        <div className="text-[10px] font-bold mb-1 text-white">Nome do comprador</div>
        <div className="h-9 w-full border border-border rounded-lg bg-transparent flex items-center px-3 text-[11px] text-muted-foreground">
          Opcional
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-bold mb-1 text-white">Data</div>
          <div className="h-9 w-full border border-border rounded-lg bg-transparent flex items-center gap-2 px-3 text-[11px] text-white font-bold">
            <span className="text-muted-foreground">📅</span> 06/05/2026
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold mb-1 text-white">Desconto (R$)</div>
          <div className="h-9 w-full border border-border rounded-lg bg-transparent flex items-center justify-between px-3 text-[11px] text-white font-bold">
            <span className="text-muted-foreground">R$</span> 0
            <div className="flex flex-col text-muted-foreground"><ChevronRight className="h-2 w-2 -rotate-90" /><ChevronRight className="h-2 w-2 rotate-90" /></div>
          </div>
        </div>
      </div>

      <div className="bg-transparent rounded-lg p-3 border border-border/50 space-y-2 mt-2">
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-bold text-white">R$ 0,00</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Total da Venda:</span>
          <span className="font-bold text-white">R$ 0,00</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Custo:</span>
          <span className="font-bold text-destructive">- R$ 0,00</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Taxas:</span>
          <span className="font-bold text-destructive">- R$ 0,00</span>
        </div>
        <div className="flex justify-between text-[13px] pt-2 border-t border-border/50 mt-2 font-bold">
          <span className="text-white">Lucro Líquido:</span>
          <span className="text-[#10b981]">R$ 0,00</span>
        </div>
      </div>
    </div>

    <div className="mt-6 pt-4 flex justify-end gap-3 border-t border-border/50">
      <div className="px-4 py-2 text-[12px] font-bold text-white cursor-pointer hover:bg-white/5 rounded-lg transition-colors">Cancelar</div>
      <div className="px-4 py-2 rounded-lg bg-[#10b981] text-[#022c22] text-[12px] font-bold cursor-pointer hover:bg-[#10b981]/90 transition-colors">
        Registrar Venda
      </div>
    </div>
  </div>
);

const MockupSalesPanel = () => (
  <div className="bg-[#0f172a] rounded-xl border border-border p-5 w-full mt-4 text-left select-none shadow-lg flex flex-col overflow-x-auto">
    <div className="flex justify-between items-center mb-6 min-w-[800px]">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-[#818cf8] flex items-center justify-center">
          <ShoppingBag className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-lg text-white">Vendas</div>
          <div className="text-[11px] text-muted-foreground">Registre e acompanhe suas vendas</div>
        </div>
      </div>
      <div className="px-4 py-2 rounded-lg bg-[#10b981] text-[#022c22] text-[12px] font-bold flex items-center gap-2 cursor-pointer">
        <span>+</span> Nova Venda
      </div>
    </div>

    <div className="flex justify-between gap-4 mb-4 min-w-[800px]">
      <div className="flex-1 h-9 border border-border rounded-lg bg-transparent flex items-center px-3 text-[12px] text-muted-foreground gap-2 max-w-sm">
        <Search className="h-4 w-4" /> Buscar vendas...
      </div>
      <div className="flex gap-2">
        {['Todo período', 'Canal', 'Pagamento', 'Categoria'].map(filter => (
          <div key={filter} className="h-9 px-3 border border-border rounded-lg bg-transparent flex items-center text-[11px] text-white font-medium hover:bg-white/5 cursor-pointer">
            {filter}
          </div>
        ))}
        <div className="h-9 px-3 border border-border rounded-lg bg-transparent flex items-center text-[11px] text-white font-medium gap-2 hover:bg-white/5 cursor-pointer ml-2">
          <Activity className="h-3 w-3" /> Colunas
        </div>
      </div>
    </div>

    <div className="border border-border rounded-xl overflow-hidden min-w-[800px]">
      <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 p-3 border-b border-border bg-transparent text-[10px] font-bold uppercase text-muted-foreground items-center">
        <div className="w-4 h-4 rounded-full border border-muted-foreground/50 ml-1"></div>
        <span>PRODUTO</span>
        <span>QTD</span>
        <span>LUCRO</span>
        <span className="flex items-center gap-1">DATA <ChevronRight className="h-3 w-3 rotate-90" /></span>
        <span>CLIENTE</span>
        <span>PAGAMENTO</span>
        <span>CANAL</span>
        <span>TOTAL</span>
        <span className="text-right">AÇÕES</span>
      </div>

      <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 p-3 items-center text-[12px] hover:bg-white/5 transition-colors border-b border-border/50">
        <div className="w-4 h-4 rounded-full border border-muted-foreground/50 ml-1"></div>
        <div>
          <div className="font-bold text-white">Controle de PS4 e PC</div>
          <div className="text-[10px] text-muted-foreground">VND-155115</div>
        </div>
        <div className="text-white font-medium">1</div>
        <div className="text-[#10b981] font-bold">R$ 41,40</div>
        <div className="text-muted-foreground">04/05/2026</div>
        <div className="text-muted-foreground">—</div>
        <div><span className="px-2 py-0.5 rounded-full border border-border text-[9px] text-muted-foreground font-medium">PIX</span></div>
        <div className="text-muted-foreground">Facebook</div>
        <div className="font-bold text-white">R$ 90,00</div>
        <div className="flex gap-2 text-muted-foreground justify-end pr-2 items-center">
          <Receipt className="h-4 w-4 hover:text-white cursor-pointer" />
          <Pencil className="h-4 w-4 hover:text-white cursor-pointer" />
          <Undo2 className="h-4 w-4 hover:text-white cursor-pointer" />
          <div className="h-4 w-4 hover:text-white cursor-pointer opacity-50 flex items-center justify-center">🗑</div>
        </div>
      </div>
    </div>
  </div>
);

const MockupEditSale = () => (
  <div className="bg-[#0f172a] rounded-xl border border-border p-5 w-full mt-4 text-left select-none shadow-lg flex flex-col max-w-sm mx-auto">
    <div className="flex justify-between items-center mb-6">
      <div className="font-bold text-base text-white">Editar Venda · VND-155115</div>
      <button className="text-muted-foreground hover:text-white transition-colors">✕</button>
    </div>

    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-bold mb-1 text-white">Canal</div>
          <div className="h-9 w-full border border-[#818cf8] rounded-lg bg-transparent flex items-center justify-between px-3 text-[12px] font-medium text-white shadow-[0_0_0_1px_rgba(129,140,248,0.2)]">
            Facebook <ChevronRight className="h-3 w-3 rotate-90 text-muted-foreground" />
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold mb-1 text-white">Pagamento</div>
          <div className="h-9 w-full border border-border rounded-lg bg-transparent flex items-center justify-between px-3 text-[12px] font-medium text-white">
            PIX <ChevronRight className="h-3 w-3 rotate-90 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-bold mb-1 text-white">Data</div>
          <div className="h-9 w-full border border-border rounded-lg bg-transparent flex items-center gap-2 px-3 text-[12px] font-medium text-white">
            <span className="text-muted-foreground">📅</span> 04/05/2026
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold mb-1 text-white">Desconto (R$)</div>
          <div className="h-9 w-full border border-border rounded-lg bg-transparent flex items-center justify-between px-3 text-[12px] font-medium text-white">
            <span className="text-muted-foreground">R$</span> 0
            <div className="flex flex-col text-muted-foreground"><ChevronRight className="h-2 w-2 -rotate-90" /><ChevronRight className="h-2 w-2 rotate-90" /></div>
          </div>
        </div>
      </div>

      <div>
        <div className="text-[10px] font-bold mb-1 text-white">Comprador</div>
        <div className="h-9 w-full border border-border rounded-lg bg-transparent flex items-center px-3 text-[12px] text-muted-foreground">
          Opcional
        </div>
      </div>

      <div className="bg-transparent rounded-lg p-3 border border-border/50 space-y-2 mt-2">
        <div className="flex justify-between text-[12px]">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-bold text-white">R$ 90,00</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-muted-foreground">Taxas:</span>
          <span className="font-bold text-muted-foreground">- R$ 0,00</span>
        </div>
        <div className="flex justify-between text-[13px] pt-1 mt-1 font-bold">
          <span className="text-white">Lucro:</span>
          <span className="text-[#10b981]">R$ 41,40</span>
        </div>
      </div>
    </div>

    <div className="mt-6 pt-4 flex justify-end gap-3 border-t border-border/50">
      <div className="px-4 py-2 text-[12px] font-bold text-white cursor-pointer hover:bg-white/5 rounded-lg transition-colors">Cancelar</div>
      <div className="px-4 py-2 rounded-lg bg-[#818cf8] text-white text-[12px] font-bold cursor-pointer hover:bg-[#818cf8]/90 transition-colors">
        Salvar alterações
      </div>
    </div>
  </div>
);

const MockupReceipt = () => (
  <div className="bg-[#0f172a] rounded-xl border border-border w-full mt-4 text-left select-none shadow-lg flex flex-col overflow-y-auto max-w-sm mx-auto h-[450px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
    <div className="p-5 border-b border-border flex justify-between items-center sticky top-0 bg-[#0f172a] z-10">
      <div className="font-bold text-base text-white">Recibo de Venda</div>
      <button className="text-muted-foreground hover:text-white transition-colors">✕</button>
    </div>

    <div className="p-5 space-y-5">
      <div>
        <div className="text-[11px] font-bold mb-2 text-white">Cliente / Observações (opcional)</div>
        <div className="space-y-2">
          <div className="h-9 w-full border border-[#818cf8] rounded-lg bg-transparent flex items-center px-3 text-[12px] text-muted-foreground">Nome do cliente</div>
          <div className="h-9 w-full border border-border rounded-lg bg-transparent flex items-center px-3 text-[12px] text-muted-foreground">(00) 00000-0000</div>
          <div className="h-9 w-full border border-border rounded-lg bg-transparent flex items-center px-3 text-[12px] text-muted-foreground">Endereço (Rua ABC, 123, Bairro - Cidade)</div>
          <div className="h-9 w-full border border-border rounded-lg bg-transparent flex items-center px-3 text-[12px] text-muted-foreground">CPF/CNPJ</div>
          <div className="h-9 w-full border border-border rounded-lg bg-transparent flex items-center px-3 text-[12px] text-muted-foreground">Observações</div>
        </div>
      </div>

      <div>
        <div className="text-[11px] font-bold mb-2 text-white">Data do recibo</div>
        <div className="h-9 w-full border border-border rounded-lg bg-transparent flex items-center gap-2 px-3 text-[12px] font-medium text-white">
          <span className="text-muted-foreground">📅</span> 4 de maio de 2026
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 text-black shadow-sm mt-4">
        <div className="text-center font-bold text-sm mb-4">GESTÃOSHOP</div>
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-[10px] font-bold">RECIBO DE VENDA #VND-155115</div>
          <div className="text-[10px] text-gray-500">04/05/2026 — 20:09</div>
        </div>
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-[10px] font-bold mb-1">Cliente</div>
          <div className="text-[10px]">—</div>
        </div>
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="text-[10px] font-bold mb-2">Descrição</div>
          <div className="flex justify-between text-[9px] font-bold border-b border-gray-200 pb-1 mb-2">
            <span className="flex-1">Produto</span><span className="w-8 text-center">Qtd</span><span className="w-16 text-right">Unit.</span><span className="w-16 text-right">Total</span>
          </div>
          <div className="flex justify-between text-[9px] mb-4">
            <span className="flex-1 truncate">Controle de PS4 e PC</span><span className="w-8 text-center">1</span><span className="w-16 text-right font-bold">R$ 90,00</span><span className="w-16 text-right font-bold">R$ 90,00</span>
          </div>
          <div className="space-y-1 text-right">
            <div className="text-[9px] text-gray-500">Valor produtos: R$ 90,00</div>
            <div className="text-[10px] font-bold">Valor total: R$ 90,00</div>
            <div className="text-[9px] text-gray-500">Forma de pagamento: PIX</div>
          </div>
        </div>
        <div className="mt-8 text-center space-y-4">
          <div className="text-[8px] text-gray-400">Data do recibo: 04/05/2026<br />Documento gerado pelo GestãoShop. Impressão em 1 via.</div>
          <div className="border-t border-gray-300 w-32 mx-auto pt-1 mt-6 text-[8px] text-gray-500">Visto</div>
        </div>
      </div>
    </div>

    <div className="sticky bottom-0 bg-[#0f172a] p-4 border-t border-border flex justify-end gap-3 z-10 mt-4">
      <div className="px-4 py-2 rounded-lg border border-border text-[12px] font-bold text-white flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
        <Printer className="h-4 w-4" /> Imprimir
      </div>
      <div className="px-4 py-2 rounded-lg bg-[#818cf8] text-white text-[12px] font-bold flex items-center gap-2 cursor-pointer hover:bg-[#818cf8]/90 transition-colors">
        <Download className="h-4 w-4" /> Baixar PDF
      </div>
    </div>
  </div>
);

const MockupReturnStock = () => (
  <div className="bg-[#0f172a] rounded-xl border border-border p-6 w-full mt-4 text-center select-none shadow-lg flex flex-col items-center">
    <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center mb-4">
      <Undo2 className="h-6 w-6 text-warning" />
    </div>
    <h3 className="font-bold text-lg mb-2 text-white">Devolver ao Estoque?</h3>
    <p className="text-[11px] text-muted-foreground mb-6 max-w-[250px]">
      Você tem certeza que deseja cancelar esta venda e devolver <strong>1x Controle de PS4 e PC</strong> para o estoque? Esta ação não pode ser desfeita.
    </p>
    <div className="flex gap-3 w-full justify-center">
      <div className="px-4 py-2 rounded-lg border border-border text-[11px] font-bold transition-colors w-full max-w-[120px] text-white hover:bg-white/5">
        Cancelar
      </div>
      <div className="px-4 py-2 rounded-lg bg-warning text-warning-foreground text-[11px] font-bold transition-colors w-full max-w-[120px]">
        Sim, devolver
      </div>
    </div>
  </div>
);

const MockupCashFlow = () => (
  <div className="bg-[#0f172a] rounded-xl border border-border p-5 w-full mt-4 text-left select-none shadow-lg flex flex-col overflow-x-auto">
    <div className="flex justify-between items-center mb-6 min-w-[900px]">
      <div>
        <div className="font-bold text-xl text-white">Fluxo de Caixa</div>
        <div className="text-[11px] text-muted-foreground mt-1">Tudo interligado: vendas, estoque, despesas, recebimentos e ajustes.</div>
      </div>
      <div className="flex gap-3">
        <div className="h-9 px-3 border border-border rounded-lg bg-transparent flex items-center text-[11px] text-white font-medium gap-2 cursor-pointer hover:bg-white/5 transition-colors">
          Últimos 30 dias <ChevronRight className="h-3 w-3 rotate-90" />
        </div>
        <div className="h-9 px-3 border border-border rounded-lg bg-transparent flex items-center text-[11px] text-white font-medium gap-2 cursor-pointer hover:bg-white/5 transition-colors">
          <span className="text-muted-foreground">📅</span> 06/04/26 - 06/05/26
        </div>
        <div className="px-4 py-2 rounded-lg bg-[#10b981] text-[#022c22] text-[12px] font-bold flex items-center gap-2 cursor-pointer hover:bg-[#10b981]/90 transition-colors">
          <span>+</span> Novo Lançamento Manual
        </div>
      </div>
    </div>

    <div className="flex gap-3 mb-6 min-w-[900px] overflow-x-auto pb-2">
      <div className="flex-1 min-w-[140px] bg-[#1e293b]/50 border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase mb-2">
          <Activity className="h-3 w-3" /> Saldo no período ⓘ
        </div>
        <div className="text-lg font-bold text-[#ef4444]">-R$ 204,47</div>
      </div>
      <div className="flex-1 min-w-[140px] bg-[#1e293b]/50 border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase mb-2">
          <Activity className="h-3 w-3" /> Saldo acumulado ⓘ
        </div>
        <div className="text-lg font-bold text-[#ef4444]">-R$ 204,47</div>
      </div>
      <div className="flex-1 min-w-[140px] bg-[#1e293b]/50 border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 text-[9px] font-bold text-[#10b981] uppercase mb-2">
          <Activity className="h-3 w-3" /> Entradas de caixa ⓘ
        </div>
        <div className="text-lg font-bold text-[#10b981]">R$ 90,00</div>
      </div>
      <div className="flex-1 min-w-[140px] bg-[#1e293b]/50 border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 text-[9px] font-bold text-[#ef4444] uppercase mb-2">
          <Activity className="h-3 w-3" /> Saídas de caixa ⓘ
        </div>
        <div className="text-lg font-bold text-[#ef4444]">R$ 294,47</div>
      </div>
      <div className="flex-1 min-w-[140px] bg-[#1e293b]/50 border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase mb-2">
          <Activity className="h-3 w-3" /> Resultado de caixa ⓘ
        </div>
        <div className="text-lg font-bold text-[#ef4444]">-R$ 204,47</div>
      </div>
      <div className="flex-1 min-w-[140px] bg-[#1e293b]/50 border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 text-[9px] font-bold text-[#10b981] uppercase mb-2">
          <Activity className="h-3 w-3" /> Impacto no lucro ⓘ
        </div>
        <div className="text-lg font-bold text-[#10b981]">R$ 41,40</div>
      </div>
    </div>

    <div className="bg-[#1e293b]/30 border border-border rounded-xl p-4 min-w-[900px]">
      <div className="h-10 w-full border border-border rounded-lg bg-[#0f172a] flex items-center px-4 text-[12px] text-muted-foreground gap-3 mb-4">
        <Search className="h-4 w-4" /> Pesquisar por descrição, categoria, observações, origem ou valor...
      </div>
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 mb-2">
        <div>
          <div className="text-[9px] font-bold text-muted-foreground uppercase mb-1">TIPO</div>
          <div className="h-9 w-full border border-border rounded-lg bg-[#0f172a] flex items-center justify-between px-3 text-[11px] text-white">Todos <ChevronRight className="h-3 w-3 rotate-90 text-muted-foreground" /></div>
        </div>
        <div>
          <div className="text-[9px] font-bold text-muted-foreground uppercase mb-1">ORIGEM</div>
          <div className="h-9 w-full border border-border rounded-lg bg-[#0f172a] flex items-center justify-between px-3 text-[11px] text-white">Todas <ChevronRight className="h-3 w-3 rotate-90 text-muted-foreground" /></div>
        </div>
        <div>
          <div className="text-[9px] font-bold text-muted-foreground uppercase mb-1">CATEGORIA</div>
          <div className="h-9 w-full border border-border rounded-lg bg-[#0f172a] flex items-center justify-between px-3 text-[11px] text-white">Todas <ChevronRight className="h-3 w-3 rotate-90 text-muted-foreground" /></div>
        </div>
        <div className="flex items-end">
          <div className="h-9 px-6 border border-border rounded-lg bg-transparent flex items-center text-[11px] text-white font-bold cursor-pointer hover:bg-white/5">Limpar filtros</div>
        </div>
      </div>
      <div className="text-[9px] text-muted-foreground italic mb-4">Os resumos acima usam só o período de datas. A lista abaixo aplica também pesquisa e filtros.</div>

      <div className="border border-border rounded-xl overflow-hidden bg-[#0f172a]">
        <div className="grid grid-cols-[auto_auto_3fr_1fr_auto_auto_auto_auto_auto] gap-4 p-4 border-b border-border bg-transparent text-[9px] font-bold uppercase text-muted-foreground items-center">
          <span className="w-20">DATA</span>
          <span className="w-16">TIPO</span>
          <span>DESCRIÇÃO</span>
          <span>CATEGORIA</span>
          <span className="w-12 text-center">LUCRO</span>
          <span className="w-12 text-center">CAIXA</span>
          <span className="w-24 text-right">VALOR</span>
          <span className="w-16 text-center">ORIGEM</span>
          <span className="w-10 text-right">AÇÕES</span>
        </div>

        <div className="divide-y divide-border/50">
          {[
            { date: "06/05/2026", type: "Saída", typeColor: "text-[#ef4444]", desc: "Pagamento Fornecedor XYZ", cat: "Fornecimento", lucro: "Não", caixa: "Sim", valor: "- R$ 450,00", valorColor: "text-[#ef4444]", origem: "COMPRA" },
            { date: "04/05/2026", type: "Entrada", typeColor: "text-[#10b981]", desc: "Venda Balcão #1024", cat: "Vendas", lucro: "Sim", caixa: "Sim", valor: "R$ 320,00", valorColor: "text-[#10b981]", origem: "VENDA" },
            { date: "04/05/2026", type: "Saída", typeColor: "text-[#ef4444]", desc: "Material de Limpeza", cat: "Despesas", lucro: "Não", caixa: "Sim", valor: "- R$ 85,50", valorColor: "text-[#ef4444]", origem: "DESPESA" },
            { date: "02/05/2026", type: "Saída", typeColor: "text-[#ef4444]", desc: "Conta de Energia", cat: "Custos Fixos", lucro: "Não", caixa: "Sim", valor: "- R$ 180,00", valorColor: "text-[#ef4444]", origem: "DESPESA" },
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-[auto_auto_3fr_1fr_auto_auto_auto_auto_auto] gap-4 p-4 items-center text-[11px] hover:bg-white/5 transition-colors">
              <span className="w-20 text-muted-foreground">{row.date}</span>
              <span className={`w-16 ${row.typeColor}`}>{row.type}</span>
              <span className="font-bold text-white truncate">{row.desc}</span>
              <span className="text-muted-foreground">{row.cat}</span>
              <span className="w-12 text-center text-muted-foreground">{row.lucro}</span>
              <span className="w-12 text-center text-muted-foreground">{row.caixa}</span>
              <span className={`w-24 text-right font-bold ${row.valorColor}`}>{row.valor}</span>
              <span className="w-16 text-center"><span className="px-2 py-0.5 rounded border border-border text-[8px] font-bold text-white bg-white/5">{row.origem}</span></span>
              <span className="w-10 text-right flex justify-end text-muted-foreground"><div className="opacity-50 hover:opacity-100 hover:text-white cursor-pointer">🗑</div></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const MockupReceivablesTutorial = () => (
  <div className="bg-[#0f172a] rounded-xl border border-border p-4 w-full mt-4 text-left select-none shadow-lg flex flex-col h-[450px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[#818cf8] flex items-center justify-center">
          <Receipt className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-lg text-white">Contas a Receber</div>
          <div className="text-[11px] text-muted-foreground">Gerencie pagamentos pendentes e recebimentos.</div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-9 px-3 border border-border rounded-lg bg-[#1e293b]/50 flex items-center text-[11px] text-muted-foreground gap-2"><Search className="h-3.5 w-3.5" /> Buscar cliente ou document</div>
        <div className="h-9 px-3 border border-border rounded-lg bg-transparent flex items-center text-[11px] text-white font-medium gap-2"><Activity className="h-3.5 w-3.5" /> Histórico por cliente</div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total Pendente</div>
          <Hourglass className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold text-[#10b981]">R$ 400,00</div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Recebido Hoje</div>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold text-white">R$ 0,00</div>
        <div className="text-[9px] text-muted-foreground mt-1">0 transação(ões) liquidada(s)</div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Atrasados</div>
          <AlertCircle className="h-4 w-4 text-[#ef4444]" />
        </div>
        <div className="text-2xl font-bold text-[#ef4444]">R$ 150,00</div>
        <div className="text-[9px] text-muted-foreground mt-1">1 título(s) vencido(s)</div>
      </div>
    </div>
    <div className="bg-[#1e293b]/30 border border-border rounded-xl flex flex-col flex-1 min-w-[700px] overflow-hidden">
      <div className="p-3 border-b border-border flex justify-end gap-2 bg-white/[0.02]">
        <div className="h-8 px-3 border border-border rounded bg-background flex items-center text-[10px] text-white font-bold gap-2"><Filter className="h-3 w-3" /> Filtrar</div>
      </div>
      <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_auto] gap-4 p-3 border-b border-border bg-transparent text-[9px] font-bold uppercase text-muted-foreground items-center tracking-widest">
        <span>VENCIMENTO</span>
        <span>CLIENTE</span>
        <span>DOCUMENTO</span>
        <span className="text-right">VALOR</span>
        <span>STATUS</span>
        <span className="w-8 text-right">AÇÕES</span>
      </div>
      <div className="divide-y divide-border/50">
        {[
          { date: "05/06/2026", client: "João Carlos", doc: "DOC-9812", valor: "R$ 150,00", status: "Atrasado", statusColor: "bg-destructive/10 text-destructive" },
          { date: "15/06/2026", client: "Maria Fernanda", doc: "DOC-9813", valor: "R$ 320,00", status: "Pendente", statusColor: "bg-warning/10 text-warning" },
          { date: "20/06/2026", client: "Carlos Silva", doc: "DOC-9814", valor: "R$ 80,00", status: "Pendente", statusColor: "bg-warning/10 text-warning" },
        ].map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_auto] gap-4 p-4 items-center text-[11px] hover:bg-white/5 transition-colors">
            <span className="font-medium text-muted-foreground">{r.date}</span>
            <span className="font-bold text-white truncate">{r.client}</span>
            <span className="text-muted-foreground font-mono text-[10px]">{r.doc}</span>
            <span className="text-right font-bold text-white">{r.valor}</span>
            <span><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${r.statusColor}`}>{r.status}</span></span>
            <span className="w-8 text-right flex justify-end text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MockupExpensesTutorial = () => (
  <div className="bg-[#0f172a] rounded-xl border border-border p-4 w-full mt-4 text-left select-none shadow-lg flex flex-col h-[450px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[#818cf8] flex items-center justify-center">
          <TrendingDown className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-lg text-white">Gastos Operacionais</div>
          <div className="text-[11px] text-muted-foreground">Gerencie seus custos e despesas</div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-9 px-3 border border-border rounded-lg bg-transparent flex items-center text-[11px] text-white font-medium gap-2"><Plus className="h-3.5 w-3.5" /> Nova Categoria</div>
        <div className="h-9 px-3 bg-[#10b981] rounded text-[#022c22] font-bold text-[11px] flex items-center gap-2"><Plus className="h-3 w-3" /> Novo Gasto</div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-4 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-lg bg-[#ef4444]/10 flex items-center justify-center"><Wallet className="h-4 w-4 text-[#ef4444]" /></div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total de Gastos</div>
        </div>
        <div className="text-3xl font-bold text-[#ef4444]">R$ 3.650,00</div>
        <div className="h-1.5 w-full bg-border/50 rounded-full overflow-hidden mt-3">
          <div className="h-full bg-[#ef4444] w-[65%]" />
        </div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-4 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-bold text-white mb-1 flex items-center gap-2"><TrendingDown className="h-3.5 w-3.5 text-[#818cf8]" /> Evolução dos Gastos</div>
          <div className="text-[9px] text-muted-foreground">Histórico mensal</div>
        </div>
        <div className="h-16 flex items-end gap-1 opacity-50 mt-4">
          <div className="w-full bg-[#818cf8]/40 h-[30%] rounded-t-sm" />
          <div className="w-full bg-[#818cf8]/60 h-[50%] rounded-t-sm" />
          <div className="w-full bg-[#818cf8]/80 h-[80%] rounded-t-sm" />
          <div className="w-full bg-[#818cf8] h-[60%] rounded-t-sm" />
          <div className="w-full bg-[#818cf8]/50 h-[40%] rounded-t-sm" />
        </div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-4 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-bold text-white mb-1 flex items-center gap-2"><BarChart2 className="h-3.5 w-3.5 text-[#10b981]" /> Gastos por Categoria</div>
          <div className="text-[9px] text-muted-foreground">Distribuição de despesas</div>
        </div>
        <div className="h-16 flex items-end gap-1 opacity-50 mt-4">
          <div className="w-full bg-[#10b981]/40 h-[60%] rounded-t-sm" />
          <div className="w-full bg-[#10b981]/60 h-[30%] rounded-t-sm" />
          <div className="w-full bg-[#10b981]/80 h-[80%] rounded-t-sm" />
        </div>
      </div>
    </div>

    <div className="mb-4">
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Categorias de Gastos</div>
      <div className="flex gap-2">
        {[
          { name: "Fornecimento", icon: Tags },
          { name: "Funcionários", icon: Users },
          { name: "Outros", icon: Tags },
          { name: "Tráfego Pago", icon: Activity },
          { name: "Transporte", icon: Truck }
        ].map((c) => (
          <div key={c.name} className="bg-[#1e293b]/50 border border-border rounded-xl px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
            <c.icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-[11px] font-bold text-white">{c.name}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-[#1e293b]/30 border border-border rounded-xl flex flex-col flex-1 min-w-[700px] overflow-hidden">
      <div className="p-3 border-b border-border flex justify-between items-center bg-white/[0.02]">
        <div className="text-[11px] font-bold text-white ml-2">Últimos Lançamentos</div>
        <div className="flex gap-2">
          <div className="h-8 px-3 border border-border rounded bg-transparent flex items-center text-[10px] text-white gap-2"><Calendar className="h-3 w-3" /> Este Mês <ChevronRight className="h-3 w-3 rotate-90 text-muted-foreground" /></div>
          <div className="h-8 px-3 border border-border rounded bg-transparent flex items-center text-white"><Filter className="h-3 w-3" /></div>
        </div>
      </div>
      <div className="grid grid-cols-[auto_1fr_2fr_2fr_1fr_auto] gap-4 p-3 border-b border-border bg-white/[0.02] text-[9px] font-bold uppercase text-muted-foreground items-center tracking-widest">
        <span className="w-16">DATA</span>
        <span>CATEGORIA</span>
        <span>DESCRIÇÃO</span>
        <span>OBSERVAÇÕES</span>
        <span className="text-right">VALOR</span>
        <span className="w-12 text-right">AÇÕES</span>
      </div>
      <div className="divide-y divide-border/50">
        {[
          { date: "05/05/2026", cat: "Tráfego Pago", desc: "Anúncios Facebook", obs: "Campanha dia das mães", valor: "R$ 1.500,00" },
          { date: "02/05/2026", cat: "Fornecimento", desc: "Compra de embalagens", obs: "Caixas e fitas", valor: "R$ 350,00" },
          { date: "01/05/2026", cat: "Funcionários", desc: "Salário atendente", obs: "-", valor: "R$ 1.800,00" },
        ].map((r, i) => (
          <div key={i} className="grid grid-cols-[auto_1fr_2fr_2fr_1fr_auto] gap-4 p-4 items-center text-[11px] hover:bg-white/5 transition-colors">
            <span className="w-16 text-muted-foreground font-medium">{r.date}</span>
            <span className="font-bold text-white"><span className="px-2 py-1 rounded bg-background border border-border text-[9px]">{r.cat}</span></span>
            <span className="font-bold text-white truncate">{r.desc}</span>
            <span className="text-muted-foreground italic truncate">{r.obs}</span>
            <span className="text-right font-bold text-destructive">{r.valor}</span>
            <span className="w-12 text-right flex justify-end gap-1 text-muted-foreground"><Pencil className="h-3.5 w-3.5" /><Trash2 className="h-3.5 w-3.5" /></span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MockupReportsTutorial = () => (
  <div className="bg-[#0f172a] rounded-xl border border-border p-4 w-full mt-4 text-left select-none shadow-lg flex flex-col h-[450px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[#818cf8] flex items-center justify-center">
          <BarChart2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-lg text-white">Relatórios</div>
          <div className="text-[11px] text-muted-foreground">Análise detalhada do seu negócio</div>
        </div>
      </div>
      <div className="h-8 px-3 border border-border rounded bg-transparent flex items-center text-[10px] text-white font-bold gap-2">Mês Atual <ChevronRight className="h-3 w-3 rotate-90" /></div>
    </div>

    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-3 flex flex-col justify-between">
        <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-center">Total em Vendas <Wallet className="h-3 w-3" /></div>
        <div className="text-xl font-bold text-white mt-1">R$ 90,00</div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-3 flex flex-col justify-between">
        <div className="text-[8px] font-bold text-[#10b981] uppercase tracking-widest flex justify-between items-center">Lucro Líquido <TrendingDown className="h-3 w-3 rotate-180" /></div>
        <div className="text-xl font-bold text-[#10b981] mt-1">R$ 41,40</div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-3 flex flex-col justify-between">
        <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-center">Itens Vendidos <ShoppingBag className="h-3 w-3" /></div>
        <div className="text-xl font-bold text-white mt-1">1</div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-3 flex flex-col justify-between">
        <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-center">Lançamentos <FileText className="h-3 w-3" /></div>
        <div className="text-xl font-bold text-white mt-1">1</div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-3 flex flex-col justify-between">
        <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-center">Ticket Médio <Activity className="h-3 w-3" /></div>
        <div className="text-xl font-bold text-white mt-1">R$ 90,00</div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-3 flex flex-col justify-between">
        <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-center">Margem S/ Faturamento <span className="text-[10px]">%</span></div>
        <div className="text-xl font-bold text-white mt-1">46.0%</div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-4 min-h-[160px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[11px] font-bold text-white flex items-center gap-2"><BarChart2 className="h-3.5 w-3.5 text-[#10b981]" /> Este mês vs. mês passado</div>
          <div className="flex gap-2 text-[8px] font-bold"><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div>MAIO</span><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>ABRIL</span></div>
        </div>
        <div className="flex-1 flex items-end justify-center gap-8 border-b border-border pb-2 opacity-80">
          <div className="w-6 h-24 bg-[#3b82f6] rounded-t-sm"></div>
          <div className="w-6 h-12 bg-[#3b82f6]/80 rounded-t-sm"></div>
        </div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-4 min-h-[160px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[11px] font-bold text-white flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-[#10b981]" /> Vendas por dia</div>
          <div className="flex gap-2 text-[8px] font-bold text-muted-foreground">Ver todos &gt;</div>
        </div>
        <div className="flex-1 flex items-end justify-center gap-1 opacity-50 relative">
          <div className="absolute w-full h-full flex items-end justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M0,40 L30,40 L40,10 L50,40 L100,40" fill="none" stroke="#3b82f6" strokeWidth="1" />
              <path d="M0,40 L30,40 L40,25 L50,40 L100,40" fill="none" stroke="#10b981" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-4">
        <div className="text-[11px] font-bold text-white flex justify-between mb-4"><span className="flex items-center gap-2"><ShoppingBag className="h-3.5 w-3.5 text-[#818cf8]" /> Top produtos</span><span className="text-[8px] text-muted-foreground font-normal">Ver todos &gt;</span></div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[9px] mb-1"><span className="text-muted-foreground truncate">Controle de PS4 e PC</span><span className="font-bold">1 itens</span></div>
            <div className="w-full bg-border rounded-full h-1"><div className="bg-[#10b981] h-1 rounded-full w-[100%]"></div></div>
          </div>
        </div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-4">
        <div className="text-[11px] font-bold text-white flex justify-between mb-4"><span className="flex items-center gap-2"><Tags className="h-3.5 w-3.5 text-[#818cf8]" /> Lucro por categoria</span><span className="text-[8px] text-muted-foreground font-normal">Ver todos &gt;</span></div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[9px] mb-1"><span className="text-muted-foreground truncate">Eletrônicos</span><span className="font-bold">R$ 41,40</span></div>
            <div className="w-full bg-border rounded-full h-1"><div className="bg-[#10b981] h-1 rounded-full w-[100%]"></div></div>
          </div>
        </div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-4">
        <div className="text-[11px] font-bold text-white flex justify-between mb-4"><span className="flex items-center gap-2"><Share2 className="h-3.5 w-3.5 text-[#818cf8]" /> Vendas por canal</span><span className="text-[8px] text-muted-foreground font-normal">Ver todos &gt;</span></div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[9px] mb-1"><span className="text-muted-foreground truncate">Facebook</span><span className="font-bold">R$ 90,00</span></div>
            <div className="w-full bg-border rounded-full h-1 flex"><div className="bg-[#10b981] h-1 rounded-l-full w-[60%]"></div><div className="bg-[#f59e0b] h-1 rounded-r-full w-[40%]"></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MockupAnalyticsTutorial = () => (
  <div className="bg-[#0f172a] rounded-xl border border-border p-4 w-full mt-4 text-left select-none shadow-lg flex flex-col h-[450px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[#818cf8] flex items-center justify-center">
          <PieChart className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-lg text-white">Analytics</div>
          <div className="text-[11px] text-muted-foreground">Inteligência de dados, tendências de comportamento e previsões.</div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 px-3 border border-border rounded bg-transparent flex items-center text-[10px] text-white font-bold gap-2">Últimos 6 meses <ChevronRight className="h-3 w-3 rotate-90" /></div>
        <div className="h-8 px-3 border border-[#818cf8]/50 rounded bg-[#818cf8]/10 flex items-center text-[10px] text-[#818cf8] font-bold gap-2"><Sparkles className="h-3 w-3" /> Insights IA</div>
      </div>
    </div>

    <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] border border-border rounded-xl p-4 mb-4 flex items-center justify-between">
      <div>
        <div className="font-bold text-[13px] text-white mb-1 flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-[#818cf8]" /> Análise Preditiva de Outubro</div>
        <div className="text-[10px] text-muted-foreground max-w-xl leading-relaxed">
          Baseado no histórico de 6 meses, a projeção é de um crescimento de <span className="text-[#10b981] font-bold">+12%</span> em faturamento. Sua <span className="text-[#818cf8] font-bold underline">Taxa de Recompra (0.0%)</span> está acima da média do setor. Dica: Clientes que compram no <span className="font-bold text-white">Instagram</span> tendem a ter um LTV 0.0x maior.
        </div>
      </div>
      <div className="opacity-10"><Zap className="h-16 w-16 text-[#818cf8]" /></div>
    </div>

    <div className="grid grid-cols-4 gap-3 mb-4">
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-3 flex flex-col justify-between relative">
        <div className="absolute top-3 right-3 px-1.5 py-0.5 rounded bg-[#3b82f6]/20 text-[#3b82f6] text-[7px] font-bold flex items-center gap-0.5"><TrendingDown className="h-2 w-2 rotate-180" /> +5.4%</div>
        <div className="h-6 w-6 rounded-full bg-[#1e293b] border border-border flex items-center justify-center mb-3"><Users className="h-3 w-3 text-[#3b82f6]" /></div>
        <div className="text-lg font-bold text-white">R$ 0,00</div>
        <div className="text-[8px] font-bold text-muted-foreground mt-1">LTV (LIFE TIME VALUE)</div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-3 flex flex-col justify-between relative">
        <div className="absolute top-3 right-3 px-1.5 py-0.5 rounded bg-[#3b82f6]/20 text-[#3b82f6] text-[7px] font-bold flex items-center gap-0.5"><TrendingDown className="h-2 w-2 rotate-180" /> +2.1%</div>
        <div className="h-6 w-6 rounded-full bg-[#1e293b] border border-border flex items-center justify-center mb-3"><Activity className="h-3 w-3 text-[#3b82f6]" /></div>
        <div className="text-lg font-bold text-white">0.0%</div>
        <div className="text-[8px] font-bold text-muted-foreground mt-1">TAXA DE RECOMPRA</div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-3 flex flex-col justify-between relative">
        <div className="absolute top-3 right-3 px-1.5 py-0.5 rounded bg-[#ef4444]/20 text-[#ef4444] text-[7px] font-bold flex items-center gap-0.5"><TrendingDown className="h-2 w-2" /> -1.2%</div>
        <div className="h-6 w-6 rounded-full bg-[#1e293b] border border-border flex items-center justify-center mb-3"><ShoppingBag className="h-3 w-3 text-[#ef4444]" /></div>
        <div className="text-lg font-bold text-white">R$ 90,00</div>
        <div className="text-[8px] font-bold text-muted-foreground mt-1">TICKET MÉDIO</div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-3 flex flex-col justify-between relative">
        <div className="absolute top-3 right-3 px-1.5 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] text-[7px] font-bold flex items-center gap-0.5"><TrendingDown className="h-2 w-2 rotate-180" /> -8.5%</div>
        <div className="h-6 w-6 rounded-full bg-[#1e293b] border border-border flex items-center justify-center mb-3"><Target className="h-3 w-3 text-[#10b981]" /></div>
        <div className="text-lg font-bold text-white">R$ 14,20</div>
        <div className="text-[8px] font-bold text-muted-foreground mt-1">CAC ESTIMADO</div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="col-span-2 bg-[#1e293b]/50 border border-border rounded-xl p-4 min-h-[180px] flex flex-col relative overflow-hidden">
        <div className="absolute top-4 right-4 h-6 w-6 rounded bg-[#1e293b] border border-border flex items-center justify-center z-10"><Activity className="h-3 w-3 text-[#818cf8]" /></div>
        <div className="text-[11px] font-bold text-white mb-1 z-10">Evolução de Receita</div>
        <div className="text-[9px] text-muted-foreground mb-4 z-10">Comparativo mensal de faturamento</div>
        <div className="flex-1 border-b border-l border-border/50 relative z-0">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
            <path d="M0,38 L60,38 L80,25 L100,5" fill="none" stroke="#818cf8" strokeWidth="1.5" />
            <path d="M0,38 L60,38 L80,25 L100,5 L100,40 L0,40 Z" fill="url(#grad)" opacity="0.2" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-4 min-h-[180px] flex flex-col relative">
        <div className="absolute top-4 right-4 h-6 w-6 rounded bg-[#1e293b] border border-border flex items-center justify-center"><PieChart className="h-3 w-3 text-[#10b981]" /></div>
        <div className="text-[11px] font-bold text-white mb-1">Share por Canal</div>
        <div className="text-[9px] text-muted-foreground mb-4">Volume de pedidos por origem</div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-[8px] border-[#818cf8]"></div>
        </div>
        <div className="flex justify-between items-center text-[8px] font-bold text-muted-foreground mt-2">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#818cf8]"></div> Facebook</span>
          <span className="text-white">1 pedidos</span>
        </div>
      </div>
    </div>
  </div>
);

const MockupCRMPanel = () => (
  <div className="bg-[#0f172a] rounded-xl border border-border p-4 w-full mt-4 text-left select-none shadow-lg flex flex-col h-[450px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[#818cf8] flex items-center justify-center">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-lg text-white">CRM & Relacionamentos</div>
          <div className="text-[11px] text-muted-foreground">Gerencie sua base de clientes e rede de fornecedores em um só lugar.</div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 px-3 border border-border rounded bg-transparent flex items-center text-[10px] text-white font-bold gap-2 hover:bg-white/5"><Download className="h-3 w-3 rotate-180" /> Importar</div>
        <div className="h-8 px-3 border border-border rounded bg-transparent flex items-center text-[10px] text-white font-bold gap-2 hover:bg-white/5"><Download className="h-3 w-3" /> Exportar Tudo</div>
        <div className="h-8 px-3 border border-[#818cf8]/50 rounded bg-[#818cf8]/10 flex items-center text-[10px] text-[#818cf8] font-bold gap-2"><Plus className="h-3 w-3" /> Novo Contato</div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-4 flex flex-col justify-between relative">
         <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-[#1e293b] border border-border flex items-center justify-center"><Star className="h-3 w-3 text-muted-foreground" /></div>
         <div className="h-8 w-8 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center mb-4"><Users className="h-4 w-4 text-[#3b82f6]" /></div>
         <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total de Clientes</div>
         <div className="text-2xl font-bold text-white mt-1">1</div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-4 flex flex-col justify-between relative">
         <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-[#1e293b] border border-border flex items-center justify-center"><Star className="h-3 w-3 text-muted-foreground" /></div>
         <div className="h-8 w-8 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center mb-4"><Truck className="h-4 w-4 text-[#0ea5e9]" /></div>
         <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Fornecedores</div>
         <div className="text-2xl font-bold text-white mt-1 flex items-baseline gap-2">0 <span className="text-[10px] text-muted-foreground font-normal normal-case tracking-normal">Ativos na rede</span></div>
      </div>
    </div>

    <div className="bg-[#1e293b]/30 border border-border rounded-xl flex flex-col flex-1 min-w-[700px] overflow-hidden">
      <div className="p-2 border-b border-border flex justify-between items-center bg-white/[0.02]">
         <div className="flex gap-2">
            <div className="px-4 py-1.5 rounded-full bg-[#818cf8] text-white text-[11px] font-bold">Clientes</div>
            <div className="px-4 py-1.5 rounded-full bg-transparent text-muted-foreground text-[11px] font-bold">Fornecedores</div>
         </div>
         <div className="flex gap-2">
           <div className="h-8 px-3 border border-border rounded-full bg-background flex items-center text-[10px] text-muted-foreground gap-2 w-48"><Search className="h-3 w-3" /> Buscar clientes...</div>
           <div className="h-8 w-8 border border-border rounded-full bg-background flex items-center justify-center text-muted-foreground"><Filter className="h-3 w-3" /></div>
         </div>
      </div>
      <div className="grid grid-cols-[auto_2fr_2fr_1fr_1fr_1fr_auto] gap-4 p-3 border-b border-border bg-white/[0.02] text-[9px] font-bold uppercase text-muted-foreground items-center tracking-widest">
        <div className="w-4 h-4 rounded-full border border-muted-foreground/50 ml-1"></div>
        <span>CLIENTE</span>
        <span>CONTATO</span>
        <span className="text-center">PEDIDOS</span>
        <span>TOTAL GASTO</span>
        <span>ÚLTIMA COMPRA</span>
        <span className="w-12 text-right">AÇÕES</span>
      </div>
      <div className="divide-y divide-border/50">
        <div className="grid grid-cols-[auto_2fr_2fr_1fr_1fr_1fr_auto] gap-4 p-4 items-center text-[11px] hover:bg-white/5 transition-colors">
            <div className="w-4 h-4 rounded-full border border-[#818cf8] ml-1"></div>
            <div className="flex items-center gap-2">
               <div className="h-7 w-7 rounded-full bg-[#1e293b] flex items-center justify-center text-[9px] font-bold text-[#818cf8]">OT</div>
               <div>
                 <div className="font-bold text-white">Otavio</div>
                 <div className="text-[7px] bg-[#0ea5e9]/20 text-[#0ea5e9] px-1 rounded inline-block mt-0.5 font-bold uppercase">Manual</div>
               </div>
            </div>
            <div>
               <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><Mail className="h-3 w-3" /> Sem e-mail</div>
               <div className="flex items-center gap-1 text-muted-foreground"><Smartphone className="h-3 w-3" /> 48988297259</div>
            </div>
            <div className="text-center font-bold text-white">0</div>
            <div className="font-bold text-[#10b981]">R$ 0,00</div>
            <div className="text-muted-foreground">05/05/2026</div>
            <div className="w-12 text-right flex justify-end gap-2 text-muted-foreground"><Pencil className="h-3.5 w-3.5 hover:text-white" /><Trash2 className="h-3.5 w-3.5 hover:text-white" /></div>
        </div>
      </div>
    </div>
  </div>
);

const MockupCRMNewContact = () => (
  <div className="flex gap-4 w-full justify-center text-left select-none overflow-x-auto pb-4 mt-4">
    {/* Novo Cliente Modal */}
    <div className="bg-[#0f172a] border border-border rounded-xl shadow-2xl w-[320px] flex flex-col shrink-0">
       <div className="p-4 border-b border-border/50 relative">
          <div className="absolute top-4 right-4 text-muted-foreground hover:text-white">✕</div>
          <div className="font-bold text-[15px] text-white">Novo cliente</div>
          <div className="text-[10px] text-muted-foreground mt-1">Cadastre um novo cliente manualmente na sua base.</div>
       </div>
       <div className="p-4 space-y-4">
          <div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Tipo de Contato</div>
            <div className="flex bg-[#1e293b]/50 p-1 rounded-lg border border-border">
               <div className="flex-1 bg-[#818cf8] text-white text-[11px] font-bold rounded flex items-center justify-center gap-2 py-1.5"><Users className="h-3.5 w-3.5" /> Cliente</div>
               <div className="flex-1 text-muted-foreground text-[11px] font-bold rounded flex items-center justify-center gap-2 py-1.5"><Truck className="h-3.5 w-3.5" /> Fornecedor</div>
            </div>
          </div>
          <div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Nome <span className="text-[#818cf8]">*</span></div>
            <div className="h-8 w-full border border-border rounded-lg bg-[#1e293b]/30 flex items-center px-3 text-[11px] text-muted-foreground">Nome completo</div>
          </div>
          <div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">E-mail</div>
            <div className="h-8 w-full border border-border rounded-lg bg-[#1e293b]/30 flex items-center px-3 text-[11px] text-muted-foreground">cliente@exemplo.com</div>
          </div>
          <div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Telefone <span className="text-[#818cf8]">*</span></div>
            <div className="h-8 w-full border border-border rounded-lg bg-[#1e293b]/30 flex items-center px-3 text-[11px] text-white">(11) 99999-9999</div>
            <div className="text-[7px] text-muted-foreground mt-1">DDD + número com 9 na frente para contato via WhatsApp.</div>
          </div>
          <div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">CPF</div>
            <div className="h-8 w-full border border-border rounded-lg bg-[#1e293b]/30 flex items-center px-3 text-[11px] text-muted-foreground">000.000.000-00</div>
          </div>
          <div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Observações</div>
            <div className="h-8 w-full border border-border rounded-lg bg-[#1e293b]/30 flex items-center px-3 text-[11px] text-muted-foreground">Opcional</div>
          </div>
       </div>
       <div className="p-4 border-t border-border/50 flex justify-end gap-2">
          <div className="px-4 py-2 border border-border rounded-lg text-white font-bold text-[11px]">Cancelar</div>
          <div className="px-4 py-2 bg-[#10b981] rounded-lg text-white font-bold text-[11px]">Cadastrar</div>
       </div>
    </div>

    {/* Novo Fornecedor Modal */}
    <div className="bg-[#0f172a] border border-border rounded-xl shadow-2xl w-[320px] flex flex-col shrink-0">
       <div className="p-4 border-b border-border/50 relative">
          <div className="absolute top-4 right-4 text-muted-foreground hover:text-white">✕</div>
          <div className="font-bold text-[15px] text-white">Novo fornecedor</div>
          <div className="text-[10px] text-muted-foreground mt-1">Cadastre um novo fornecedor manualmente na sua base.</div>
       </div>
       <div className="p-4 space-y-4">
          <div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Tipo de Contato</div>
            <div className="flex bg-[#1e293b]/50 p-1 rounded-lg border border-border">
               <div className="flex-1 text-muted-foreground text-[11px] font-bold rounded flex items-center justify-center gap-2 py-1.5"><Users className="h-3.5 w-3.5" /> Cliente</div>
               <div className="flex-1 bg-[#818cf8] text-white text-[11px] font-bold rounded flex items-center justify-center gap-2 py-1.5"><Truck className="h-3.5 w-3.5" /> Fornecedor</div>
            </div>
          </div>
          <div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Nome <span className="text-[#818cf8]">*</span></div>
            <div className="h-8 w-full border border-border rounded-lg bg-[#1e293b]/30 flex items-center px-3 text-[11px] text-muted-foreground">Nome completo</div>
          </div>
          <div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">E-mail</div>
            <div className="h-8 w-full border border-border rounded-lg bg-[#1e293b]/30 flex items-center px-3 text-[11px] text-muted-foreground">cliente@exemplo.com</div>
          </div>
          <div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Telefone <span className="text-[#818cf8]">*</span></div>
            <div className="h-8 w-full border border-border rounded-lg bg-[#1e293b]/30 flex items-center px-3 text-[11px] text-white">(11) 99999-9999</div>
            <div className="text-[7px] text-muted-foreground mt-1">DDD + número com 9 na frente para contato via WhatsApp.</div>
          </div>
          <div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">CNPJ / Razão Social</div>
            <div className="h-8 w-full border border-border rounded-lg bg-[#1e293b]/30 flex items-center px-3 text-[11px] text-muted-foreground">00.000.000/0001-00</div>
          </div>
          <div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Observações</div>
            <div className="h-8 w-full border border-border rounded-lg bg-[#1e293b]/30 flex items-center px-3 text-[11px] text-muted-foreground">Opcional</div>
          </div>
       </div>
       <div className="p-4 border-t border-border/50 flex justify-end gap-2">
          <div className="px-4 py-2 border border-border rounded-lg text-white font-bold text-[11px]">Cancelar</div>
          <div className="px-4 py-2 bg-[#818cf8] rounded-lg text-white font-bold text-[11px]">Cadastrar</div>
       </div>
    </div>
  </div>
);

const MockupCRMImportExport = () => (
  <div className="bg-[#0f172a] rounded-xl border border-border p-4 w-full mt-4 text-left select-none shadow-lg flex flex-col h-[450px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[#818cf8] flex items-center justify-center">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-lg text-white">CRM & Relacionamentos</div>
          <div className="text-[11px] text-muted-foreground">Gerencie sua base de clientes e rede de fornecedores em um só lugar.</div>
        </div>
      </div>
      <div className="flex gap-2 relative">
        <div className="absolute -left-12 top-6 animate-pulse">
           <svg width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M5 25 Q 15 15 30 5" stroke="#ef4444" strokeWidth="2" fill="none" />
             <polygon points="30,5 22,3 27,12" fill="#ef4444" />
           </svg>
        </div>
        <div className="absolute left-8 top-8 animate-pulse delay-75">
           <svg width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M5 25 Q 15 15 30 5" stroke="#ef4444" strokeWidth="2" fill="none" />
             <polygon points="30,5 22,3 27,12" fill="#ef4444" />
           </svg>
        </div>
        <div className="h-8 px-3 border border-[#ef4444] rounded bg-[#ef4444]/10 flex items-center text-[10px] text-white font-bold gap-2 relative z-10"><Download className="h-3 w-3 rotate-180 text-[#ef4444]" /> Importar</div>
        <div className="h-8 px-3 border border-[#ef4444] rounded bg-[#ef4444]/10 flex items-center text-[10px] text-white font-bold gap-2 relative z-10"><Download className="h-3 w-3 text-[#ef4444]" /> Exportar Tudo</div>
        <div className="h-8 px-3 border border-[#818cf8]/50 rounded bg-[#818cf8]/10 flex items-center text-[10px] text-[#818cf8] font-bold gap-2 opacity-50"><Plus className="h-3 w-3" /> Novo Contato</div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-4 flex flex-col justify-between relative opacity-50 pointer-events-none">
         <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-[#1e293b] border border-border flex items-center justify-center"><Star className="h-3 w-3 text-muted-foreground" /></div>
         <div className="h-8 w-8 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center mb-4"><Users className="h-4 w-4 text-[#3b82f6]" /></div>
         <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total de Clientes</div>
         <div className="text-2xl font-bold text-white mt-1">1</div>
      </div>
      <div className="bg-[#1e293b]/50 border border-border rounded-xl p-4 flex flex-col justify-between relative opacity-50 pointer-events-none">
         <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-[#1e293b] border border-border flex items-center justify-center"><Star className="h-3 w-3 text-muted-foreground" /></div>
         <div className="h-8 w-8 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center mb-4"><Truck className="h-4 w-4 text-[#0ea5e9]" /></div>
         <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Fornecedores</div>
         <div className="text-2xl font-bold text-white mt-1 flex items-baseline gap-2">0 <span className="text-[10px] text-muted-foreground font-normal normal-case tracking-normal">Ativos na rede</span></div>
      </div>
    </div>

    <div className="bg-[#1e293b]/30 border border-border rounded-xl flex flex-col flex-1 min-w-[700px] overflow-hidden opacity-50 pointer-events-none">
      <div className="p-2 border-b border-border flex justify-between items-center bg-white/[0.02]">
         <div className="flex gap-2">
            <div className="px-4 py-1.5 rounded-full bg-[#818cf8] text-white text-[11px] font-bold">Clientes</div>
            <div className="px-4 py-1.5 rounded-full bg-transparent text-muted-foreground text-[11px] font-bold">Fornecedores</div>
         </div>
         <div className="flex gap-2">
           <div className="h-8 px-3 border border-border rounded-full bg-background flex items-center text-[10px] text-muted-foreground gap-2 w-48"><Search className="h-3 w-3" /> Buscar clientes...</div>
           <div className="h-8 w-8 border border-border rounded-full bg-background flex items-center justify-center text-muted-foreground"><Filter className="h-3 w-3" /></div>
         </div>
      </div>
      <div className="grid grid-cols-[auto_2fr_2fr_1fr_1fr_1fr_auto] gap-4 p-3 border-b border-border bg-white/[0.02] text-[9px] font-bold uppercase text-muted-foreground items-center tracking-widest">
        <div className="w-4 h-4 rounded-full border border-muted-foreground/50 ml-1"></div>
        <span>CLIENTE</span>
        <span>CONTATO</span>
        <span className="text-center">PEDIDOS</span>
        <span>TOTAL GASTO</span>
        <span>ÚLTIMA COMPRA</span>
        <span className="w-12 text-right">AÇÕES</span>
      </div>
      <div className="divide-y divide-border/50">
        <div className="grid grid-cols-[auto_2fr_2fr_1fr_1fr_1fr_auto] gap-4 p-4 items-center text-[11px]">
            <div className="w-4 h-4 rounded-full border border-[#818cf8] ml-1"></div>
            <div className="flex items-center gap-2">
               <div className="h-7 w-7 rounded-full bg-[#1e293b] flex items-center justify-center text-[9px] font-bold text-[#818cf8]">OT</div>
               <div>
                 <div className="font-bold text-white">Otavio</div>
                 <div className="text-[7px] bg-[#0ea5e9]/20 text-[#0ea5e9] px-1 rounded inline-block mt-0.5 font-bold uppercase">Manual</div>
               </div>
            </div>
            <div>
               <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><Mail className="h-3 w-3" /> Sem e-mail</div>
               <div className="flex items-center gap-1 text-muted-foreground"><Smartphone className="h-3 w-3" /> 48988297259</div>
            </div>
            <div className="text-center font-bold text-white">0</div>
            <div className="font-bold text-[#10b981]">R$ 0,00</div>
            <div className="text-muted-foreground">05/05/2026</div>
            <div className="w-12 text-right flex justify-end gap-2 text-muted-foreground"><Pencil className="h-3.5 w-3.5 hover:text-white" /><Trash2 className="h-3.5 w-3.5 hover:text-white" /></div>
        </div>
      </div>
    </div>
  </div>
);

const tutorialsData = {
  "Primeiros Passos": {
    title: "Primeiros Passos",
    desc: "Aprenda a configurar sua loja e cadastrar seus primeiros produtos passo a passo.",
    icon: PlayCircle,
    color: "bg-primary/10 text-primary",
    duration: "5 min",
    steps: [
      {
        title: "1. Acesse as Configurações da Loja",
        content: "Para começar, clique no ícone de engrenagem no menu lateral para acessar a página de 'Configurações'. É aqui que você vai definir a identidade da sua loja. Preencha o nome da loja, insira o seu CNPJ ou CPF e certifique-se de que o e-mail de contato esteja correto para que seus clientes possam falar com você.",
        visual: <MockupSettings />
      },
      {
        title: "2. Configure os Meios de Pagamento",
        content: "Na página \"Pagamentos\" você pode configurar seus métodos de pagamentos e também as taxas.",
        visual: <MockupPayments />
      },
      {
        title: "3. Crie Categorias para seus Produtos",
        content: "Antes de cadastrar produtos, organize sua loja. Vá ao menu 'Categorias' aonde você já vai ter categorias pré definidas mas também poderá criar suas próprias categorias.",
        visual: <MockupCategories />
      },
      {
        title: "4. Cadastre seu Primeiro Produto",
        content: "Agora vá em 'Produtos' e clique no botão 'Novo Produto'. Preencha os dados do produto, insira uma descrição detalhada que convença o cliente, adicione quantidade de estoque, o preço de custo e de venda, faça o upload de suas imagens com boa qualidade.",
        visual: <MockupNewProduct />
      }
    ]
  },
  "Gestão de Vendas": {
    title: "Gestão de Vendas",
    desc: "Aprenda a registrar e editar vendas com múltiplos itens, escolha canal de venda, categoria e forma de pagamento, gere recibos e acompanhe parcelas.",
    icon: ShoppingBag,
    color: "bg-success/10 text-success",
    duration: "5 min",
    steps: [
      {
        title: "1. Registre sua primeira venda",
        content: "Para registrar sua primeira venda, na aba 'Vendas' clique no botão 'Nova Venda' aonde vai abrir um menu para você preencher todas as informações da sua Venda.",
        visual: <MockupNewSale />
      },
      {
        title: "2. Acompanhe suas vendas",
        content: "Você poderá acompanhar todas suas vendas e selecionar por filtros para melhor organização.",
        visual: <MockupSalesPanel />
      },
      {
        title: "3. Edite e revise sua venda",
        content: "Ao clicar no icone de 'Lápis' na venda que deseja editar, você irá conseguir editar e revisar sua venda.",
        visual: <MockupEditSale />
      },
      {
        title: "4. Gere recibos da sua venda",
        content: "Ao clicar no icone de 'Cifrão' você irá conseguir gerar o recibo de sua venda, deverá preencher os dados do Cliente. (Seus dados serão preenchidos com as informações da sua Empresa)",
        visual: <MockupReceipt />
      },
      {
        title: "5. Devolva o item ao estoque",
        content: "Ao clicar na opção de 'Seta' você poderá devolver o item vendido para seu estoque.",
        visual: <MockupReturnStock />
      }
    ]
  },
  "Controle Financeiro": {
    title: "Controle Financeiro",
    desc: "Mantenha a saúde financeira do seu negócio registrando entradas e saídas.",
    icon: DollarSign,
    color: "bg-info/10 text-info",
    duration: "3 min",
    steps: [
      {
        title: "1. Fluxo de Caixa",
        content: "Acesse a aba \"Fluxo de Caixa\" para ver um resumo do seu caixa. Acompanhe valores de entradas e saidas, sejam elas de Estoque, Vendas ou Despesas.",
        visual: <MockupCashFlow />
      },
      {
        title: "2. Contas a Receber",
        content: "Nesta aba de \"Contas a Receber\" você irá gerenciar pagamentos pendentes e recebimentos.",
        visual: <MockupReceivablesTutorial />
      },
      {
        title: "3. Gastos Operacionais",
        content: "Nesta aba de \"Gastos\" você irá registrar seus gastos de forma manual, como por exemplo gastos com Tráfego Pago, Fornecedor, Funcionários, entre outros. Todos os gastos registrados aqui vão ser atualizados automaticamente na aba 'Fluxo de Caixa'",
        visual: <MockupExpensesTutorial />
      },
      {
        title: "4. Relatórios Detalhados",
        content: "Nesta aba de \"Relatórios\" você tera acesso a gráficos detalhados com todas as informações necessárias para ter um controle financeiro de sua operação.",
        visual: <MockupReportsTutorial />
      },
      {
        title: "5. Analytics IA",
        content: "Aqui você reúne inteligência de dados, análise de tendências de comportamento e modelos preditivos em um só lugar. Através de algoritmos avançados, transforma dados brutos em insights claros e acionáveis, permitindo identificar padrões, antecipar demandas e tomar decisões mais estratégicas. Com foco em precisão e agilidade, a ferramenta ajuda a otimizar resultados, reduzir riscos e impulsionar o crescimento com base em previsões confiáveis.",
        visual: <MockupAnalyticsTutorial />
      }
    ]
  },
  "Gestão de CRM": {
    title: "Gestão de CRM",
    desc: "Aprenda a gerenciar clientes, fornecedores, leads e negociações em um só lugar.",
    icon: Users,
    color: "bg-warning/10 text-warning",
    duration: "5 min",
    steps: [
      {
        title: "1. Conheça o painel de CRM",
        content: "O módulo de Gestão de CRM centraliza clientes, leads, fornecedores e negociações em um só lugar. Facilita o acompanhamento do funil, melhora o relacionamento e aumenta as conversões com dados organizados e automações simples.",
        visual: <MockupCRMPanel />
      },
      {
        title: "2. Adicione Cliente ou Fornecedor",
        content: "Clicando no botão \"Novo Contato\" você abre um menu aonde você pode adicionar informações de seu cliente ou fornecedor.",
        visual: <MockupCRMNewContact />
      },
      {
        title: "3. Importe ou Exporte seus contatos",
        content: "Clicando no botão \"Importar\" você poderá importar sua lista de contatos de clientes e fornecedores. Agora clicando em \"Exportar\" você exporta sua lista de clientes e fornecedores em um arquivo no formato .CSV",
        visual: <MockupCRMImportExport />
      }
    ]
  }
};

const tutorialsList = Object.values(tutorialsData);

const expertTips = [
  {
    title: "Gestão de Clientes e Fornecedores",
    content: "No CRM, você cadastra tanto seus clientes quanto seus fornecedores. Mantenha os dados atualizados para criar um histórico sólido de vendas e facilitar o contato na hora de repor estoque."
  },
  {
    title: "Lançamento Automático",
    content: "Ao realizar uma venda na aba 'Nova Venda', o valor é registrado automaticamente no Controle Financeiro (Caixa). Você não precisa fazer lançamentos manuais das suas receitas!"
  },
  {
    title: "Controle de Custo e Margem",
    content: "Ao cadastrar seus produtos, sempre preencha o 'Preço de Custo' e os valores de Varejo/Atacado. Assim, o painel de Dashboard calculará exatamente a sua margem de lucro real."
  },
  {
    title: "Análise Financeira Rápida",
    content: "Utilize os filtros no Controle Financeiro para visualizar todas as despesas e receitas de um período específico. Fica muito mais fácil fechar o balanço do mês."
  },
  {
    title: "Personalização Profissional",
    content: "Na página de Configurações, preencha os 'Dados da Empresa' com seu logotipo, CNPJ e endereço. Essas informações são usadas para gerar recibos de venda mais profissionais para seus clientes."
  }
];

function TutorialsPage() {
  const [activeTutorialId, setActiveTutorialId] = useState<string | null>(null);
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  useEffect(() => {
    if (activeTutorialId) return;
    const interval = setInterval(() => {
      setActiveTipIndex((prev) => (prev + 1) % expertTips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [activeTutorialId, activeTipIndex]);

  const activeTutorial = activeTutorialId ? tutorialsData[activeTutorialId as keyof typeof tutorialsData] : null;
  const currentTutorialIndex = tutorialsList.findIndex(t => t.title === activeTutorialId);
  const nextTutorial = currentTutorialIndex !== -1 && currentTutorialIndex < tutorialsList.length - 1
    ? tutorialsList[currentTutorialIndex + 1]
    : null;

  return (
    <div className="flex flex-col gap-8 p-8">
      <AnimatePresence mode="wait">
        {!activeTutorial ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-8"
          >
            <PageHeader
              title="Tutoriais"
              subtitle="Aprenda a extrair o máximo potencial do Gestão Shop."
              icon={Book}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tutorialsList.map((t, i) => (
                <motion.div
                  key={t.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveTutorialId(t.title)}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6 hover:bg-card/60 transition-all cursor-pointer flex flex-col"
                >
                  <div className={`h-12 w-12 rounded-xl ${t.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <t.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{t.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">{t.desc}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-surface border border-border">
                      {t.duration}
                    </span>
                    <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Aprender agora <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Lightbulb className="h-32 w-32 text-primary" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <GraduationCap className="h-7 w-7 text-primary" />
                  Dica do Especialista: {expertTips[activeTipIndex].title}
                </h2>
                <div className="h-20 flex items-start">
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    {expertTips[activeTipIndex].content}
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  {expertTips.map((tip, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTipIndex(idx);
                      }}
                      className={`relative h-3 rounded-full overflow-hidden transition-all duration-300 ${activeTipIndex === idx ? "w-20 bg-primary/20" : "w-3 bg-primary/20 hover:bg-primary/40 cursor-pointer"
                        }`}
                      aria-label={`Ir para dica ${idx + 1}`}
                    >
                      {activeTipIndex === idx && (
                        <motion.div
                          key={`progress-${idx}`}
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 8, ease: "linear" }}
                          className="absolute left-0 top-0 bottom-0 bg-primary rounded-full"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-6 max-w-4xl mx-auto w-full"
          >
            <button
              onClick={() => setActiveTutorialId(null)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para tutoriais
            </button>

            <div className={`p-8 rounded-3xl border border-border bg-card/40 backdrop-blur-sm flex flex-col md:flex-row gap-6 items-start md:items-center`}>
              <div className={`h-20 w-20 shrink-0 rounded-2xl ${activeTutorial.color} flex items-center justify-center`}>
                <activeTutorial.icon className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{activeTutorial.title}</h1>
                <p className="text-muted-foreground text-lg">{activeTutorial.desc}</p>
              </div>
            </div>

            <div className="flex flex-col gap-8 mt-4 relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-4 bottom-4 w-px bg-border hidden md:block"></div>

              {activeTutorial.steps.map((step, index) => (
                <div key={index} className="flex gap-6 relative z-10">
                  <div className="hidden md:flex h-16 w-16 shrink-0 rounded-full bg-background border-2 border-border items-center justify-center shadow-sm">
                    <span className="text-xl font-bold text-muted-foreground">{index + 1}</span>
                  </div>
                  <div className="flex-1 bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">{step.content}</p>
                    {step.visual}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => setActiveTutorialId(null)}
                className={`px-8 py-3 rounded-xl font-bold transition-opacity flex items-center gap-2 shadow-lg ${nextTutorial ? 'bg-card border border-border text-foreground hover:bg-card/80 shadow-sm' : 'bg-primary text-primary-foreground hover:opacity-90 shadow-primary/20'}`}
              >
                <CheckCircle2 className="h-5 w-5" />
                Concluir Tutorial
              </button>
              {nextTutorial && (
                <button
                  onClick={() => {
                    setActiveTutorialId(nextTutorial.title);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  Próximo Tutorial <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

