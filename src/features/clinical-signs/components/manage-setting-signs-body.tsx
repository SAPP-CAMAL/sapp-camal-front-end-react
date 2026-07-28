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
import { SettingSignsBodyManagement } from "@/features/setting-signs-body/setting-signs-body-management";
import { ClinicalSign } from "../domain/clinical-signs.domain";

export function ManageSettingSignsBody({
  clinicalSign,
}: {
  clinicalSign: ClinicalSign;
}) {
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
      <DialogContent className="max-h-screen overflow-y-auto overflow-x-hidden w-[95vw] sm:max-w-[90vw] lg:max-w-[75vw]">
        <DialogHeader>
          <DialogTitle>
            Partes del Cuerpo del Signo Clínico: {clinicalSign.description}
          </DialogTitle>
          <DialogDescription>
            Administra las partes del cuerpo en las que se detecta este signo
            clínico.
          </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 w-full">
          <SettingSignsBodyManagement idClinicalSigns={clinicalSign.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
