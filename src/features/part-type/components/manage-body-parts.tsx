"use client";

import { LayoutGridIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BodyPartsManagement } from "@/features/body-parts/body-parts-management";
import { PartType } from "../domain/part-type.domain";

export function ManageBodyParts({ partType }: { partType: PartType }) {
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant={"outline"}>
              <LayoutGridIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
          Gestionar Partes del Cuerpo
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[90vw] lg:max-w-[75vw]">
        <DialogHeader>
          <DialogTitle>
            Partes del Cuerpo del Tipo: {partType.description}
          </DialogTitle>
          <DialogDescription>
            Administra las partes del cuerpo configuradas para este tipo de
            parte anatómica.
          </DialogDescription>
        </DialogHeader>
        <BodyPartsManagement idPartType={partType.id} />
      </DialogContent>
    </Dialog>
  );
}
