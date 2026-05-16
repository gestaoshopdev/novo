import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberInputProps {
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  className?: string;
  step?: number;
  clickStep?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  autoFocus?: boolean;
}

export function NumberInput({ 
  value, 
  onChange, 
  prefix, 
  suffix, 
  className,
  step = 1,
  clickStep = 1,
  min,
  max,
  placeholder,
  autoFocus
}: NumberInputProps) {
  const handleIncrement = () => {
    const newValue = (value || 0) + clickStep;
    if (max !== undefined && newValue > max) return;
    onChange(Number(newValue.toFixed(2)));
  };

  const handleDecrement = () => {
    const newValue = (value || 0) - clickStep;
    if (min !== undefined && newValue < min) return;
    onChange(Number(newValue.toFixed(2)));
  };

  return (
    <div className={cn("flex items-center rounded-lg border border-border bg-background/50 overflow-hidden h-11 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40", className)}>
      {prefix && (
        <span className="pl-2 text-[11px] font-bold text-muted-foreground shrink-0 select-none">
          {prefix}
        </span>
      )}
      <input 
        type="number"
        value={value === 0 ? "0" : value || ""}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        autoFocus={autoFocus}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          onChange(isNaN(v) ? 0 : v);
        }}
        className="w-full bg-transparent border-none text-right px-2 text-sm font-bold focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-white h-full min-w-0"
      />
      {suffix && (
        <span className="pr-2 text-[11px] font-bold text-muted-foreground shrink-0 select-none">
          {suffix}
        </span>
      )}
      <div className="flex flex-col border-l border-border h-full shrink-0 w-7">
        <button 
          type="button"
          onClick={handleIncrement}
          className="flex-1 hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors border-b border-border flex items-center justify-center group"
        >
          <ChevronUp className="h-3 w-3 group-active:scale-90 transition-transform" />
        </button>
        <button 
          type="button"
          onClick={handleDecrement}
          className="flex-1 hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center group"
        >
          <ChevronDown className="h-3 w-3 group-active:scale-90 transition-transform" />
        </button>
      </div>
    </div>
  );
}
