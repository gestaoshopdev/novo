import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ProductRow } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  product: ProductRow | null;
  onConfirm: () => void;
}

export function DeleteProductDialog({ open, onOpenChange, product, onConfirm }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-destructive/15 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </span>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Esta ação removerá <strong className="text-foreground">{product?.name}</strong> (
            <span className="font-mono-tabular">{product?.sku}</span>) do catálogo. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
