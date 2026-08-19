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
import { MenusManagement } from "@/features/menus/menus-management";
import { Module } from "../domain/module.domain";

export function ManageModuleMenus({ module }: { module: Module }) {
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
          Gestionar menús
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto overflow-x-hidden w-[95vw] sm:max-w-[90vw] lg:max-w-[75vw]">
        <DialogHeader>
          <DialogTitle>Menús de {module.name}</DialogTitle>
          <DialogDescription>
            Crea y edita los ítems de menú de este módulo.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <div className="min-w-0 w-full">
            <MenusManagement fixedModuleId={module.id} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
