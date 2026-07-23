"use client";

import { useState } from "react";
import { MapPinIcon } from "lucide-react";
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
import { CantonsManagement } from "@/features/provinces/cantons-management";
import { Province } from "../domain/locations-admin.domain";

export function ManageCantons({ province }: { province: Province }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="outline">
              <MapPinIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
          Gestionar cantones
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto overflow-x-hidden w-[95vw] sm:max-w-[90vw] lg:max-w-[75vw]">
        <DialogHeader>
          <DialogTitle>Cantones de {province.name}</DialogTitle>
          <DialogDescription>Crea y edita los cantones de esta provincia.</DialogDescription>
        </DialogHeader>
        {open && (
          <div className="min-w-0 w-full">
            <CantonsManagement fixedProvinceId={province.id} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
