"use client";

import { PawPrintIcon } from "lucide-react";
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
import { ClinicalSignsSpeciesManagement } from "@/features/clinical-signs-species/clinical-signs-species-management";
import { ClinicalSign } from "../domain/clinical-signs.domain";

export function ManageClinicalSignsSpecies({
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
              <PawPrintIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
          Gestionar Especies
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[90vw] lg:max-w-[75vw]">
        <DialogHeader>
          <DialogTitle>
            Especies del Signo Clínico: {clinicalSign.description}
          </DialogTitle>
          <DialogDescription>
            Administra las especies en las que aplica este signo clínico.
          </DialogDescription>
        </DialogHeader>
        <ClinicalSignsSpeciesManagement idClinicalSigns={clinicalSign.id} />
      </DialogContent>
    </Dialog>
  );
}
