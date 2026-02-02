"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "abrir" | "cerrar";
  name: string;
  onConfirm: () => void;
  customTitle?: string;
  customMessage?: string;
  customConfirmText?: string;
}

export function ConfirmToggleDialog({ open, onOpenChange, action, name, onConfirm, customTitle, customMessage, customConfirmText }: Props) {
  const title = customTitle || (action === "cerrar" ? "Cerrar Corral" : "Abrir Corral");
  const message = customMessage || (action === "cerrar"
    ? `¿Está seguro que desea cerrar el corral ${name}? Esto impedirá que ingresen más animales al corral.`
    : `¿Está seguro que desea abrir el corral ${name}? Esto permitirá que ingresen nuevos animales al corral.`);
  const confirmText = customConfirmText || (action === "cerrar" ? "Cerrar Corral" : "Abrir Corral");
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Cancelar</Button>
          <Button
            onClick={onConfirm}
            className="w-full sm:w-auto sm:ml-2"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
