"use client";

import { useState } from "react";
import { ListTreeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CatalogueValuesManagement } from "@/features/catalogues/catalogue-values-management";
import { CatalogueType } from "../domain/catalogue-management.domain";

export function ManageCatalogueValues({ catalogueType }: { catalogueType: CatalogueType }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="outline">
              <ListTreeIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
          Gestionar catálogo
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto overflow-x-hidden w-[95vw] sm:max-w-[90vw] lg:max-w-[75vw]">
        <DialogHeader>
          <DialogTitle>Catálogo de {catalogueType.description}</DialogTitle>
          <DialogDescription>
            Crea y edita los valores de este tipo de catálogo.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <div className="min-w-0 w-full">
            <CatalogueValuesManagement fixedCatalogueTypeId={catalogueType.id} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
