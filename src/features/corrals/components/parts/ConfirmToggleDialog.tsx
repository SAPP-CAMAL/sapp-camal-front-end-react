"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "abrir" | "cerrar";
  name: string;
  onConfirm: () => void;
}

export function ConfirmToggleDialog({ open, onOpenChange, action, name, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{action === "cerrar" ? "Cerrar Corral" : "Abrir Corral"}</DialogTitle>
          <DialogDescription>
            {action === "cerrar"
              ? `¿Está seguro que desea cerrar el corral ${name}? Esto impedirá que ingresen más animales al corral.`
              : `¿Está seguro que desea abrir el corral ${name}? Esto permitirá que ingresen nuevos animales al corral.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={onConfirm}
            className={action === "cerrar" ? "ml-2 bg-red-600 hover:bg-red-700 text-white" : "ml-2 bg-green-600 hover:bg-green-700 text-white"}
          >
            {action === "cerrar" ? "Cerrar Corral" : "Abrir Corral"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
