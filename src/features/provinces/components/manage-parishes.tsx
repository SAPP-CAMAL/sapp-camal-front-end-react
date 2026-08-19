"use client";

import { useState } from "react";
import { LandPlotIcon } from "lucide-react";
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
import { ParishesManagement } from "@/features/provinces/parishes-management";
import { Canton } from "../domain/locations-admin.domain";

export function ManageParishes({ canton }: { canton: Canton }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="outline">
              <LandPlotIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
          Gestionar parroquias
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto overflow-x-hidden w-[95vw] sm:max-w-[90vw] lg:max-w-[75vw]">
        <DialogHeader>
          <DialogTitle>Parroquias de {canton.name}</DialogTitle>
          <DialogDescription>Crea y edita las parroquias de este cantón.</DialogDescription>
        </DialogHeader>
        {open && (
          <div className="min-w-0 w-full">
            <ParishesManagement fixedCantonId={canton.id} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
