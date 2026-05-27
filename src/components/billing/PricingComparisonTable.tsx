import React from "react";
import { Check, X, Sparkles } from "lucide-react";

interface PricingComparisonTableProps {
  className?: string;
}

export function PricingComparisonTable({ className }: PricingComparisonTableProps) {
  const categories = [
    {
      title: "Limites e Estrutura",
      features: [
        { name: "Catálogos Digitais Ativos", starter: "1 catálogo", pro: "Até 5 catálogos", elite: "Até 10 catálogos" },
        { name: "Produtos por Catálogo", starter: "Até 10 produtos", pro: "Até 60 produtos", elite: "Até 500 produtos" },
        { name: "Fotos por Produto no catálogo", starter: "1 foto", pro: "Até 5 fotos", elite: "Até 10 fotos" },
      ],
    },
    {
      title: "Personalização e Marca",
      features: [
        { name: "Personalização de Cores do Catálogo", starter: false, pro: true, elite: true },
        { name: "Capa Personalizada no Catálogo", starter: false, pro: false, elite: true },
        { name: "Remoção da marca GestãoShop", starter: false, pro: false, elite: true },
      ],
    },
    {
      title: "Programa de Indicações (Afiliados)",
      features: [
        { name: "Painel de Indicações", starter: false, pro: true, elite: true },
        { name: "Comissão por Assinatura Indicada", starter: false, pro: "15% recorrente", elite: "20% recorrente" },
        { name: "Carência para Solicitar Saques", starter: false, pro: "15 dias", elite: "5 dias" },
      ],
    },
  ];

  const renderValue = (val: string | boolean, highlight: boolean = false) => {
    if (typeof val === "boolean") {
      return val ? (
        <div className="flex justify-center">
          <Check className="h-5 w-5 text-emerald-500 bg-emerald-500/10 p-0.5 rounded-full" />
        </div>
      ) : (
        <div className="flex justify-center">
          <X className="h-5 w-5 text-rose-500 bg-rose-500/10 p-0.5 rounded-full" />
        </div>
      );
    }
    return (
      <span className={highlight ? "font-semibold text-primary" : "text-foreground/90 font-medium"}>
        {val}
      </span>
    );
  };

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          Comparação Completa dos Planos
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Compare detalhadamente todos os recursos de cada plano
        </p>
      </div>

      {/* Container de rolagem horizontal responsivo */}
      <div className="w-full overflow-x-auto rounded-2xl border border-border bg-card/45 backdrop-blur-sm shadow-sm">
        <table className="w-full min-w-[640px] text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-muted/30">
              <th className="p-4 font-bold text-foreground w-[40%]">Recurso</th>
              <th className="p-4 font-bold text-foreground text-center w-[20%]">Starter</th>
              <th className="p-4 font-bold text-primary text-center w-[20%] relative">
                Pro
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-primary/10 text-[8px] font-semibold text-primary border border-primary/20 uppercase tracking-widest">
                  Popular
                </span>
              </th>
              <th className="p-4 font-bold text-foreground text-center w-[20%]">Elite</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {categories.map((category) => (
              <React.Fragment key={category.title}>
                <tr className="bg-muted/15 font-semibold text-foreground/70 text-[10px] uppercase tracking-wider">
                  <td colSpan={4} className="p-3 pl-4">
                    {category.title}
                  </td>
                </tr>
                {category.features.map((f, i) => (
                  <tr key={f.name} className="hover:bg-muted/10 transition-colors">
                    <td className="p-3 pl-4 font-medium text-foreground/80">{f.name}</td>
                    <td className="p-3 text-center text-[12px]">{renderValue(f.starter)}</td>
                    <td className="p-3 text-center text-[12px] bg-primary/[0.01]">{renderValue(f.pro, true)}</td>
                    <td className="p-3 text-center text-[12px]">{renderValue(f.elite)}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
