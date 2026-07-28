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
import { SpeciesDiseaseManagement } from "@/features/species-disease/species-disease-management";
import { ProductDisease } from "../domain/product-disease.domain";

export function ManageSpeciesDisease({
  productDisease,
}: {
  productDisease: ProductDisease;
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
      <DialogContent className="max-h-screen overflow-y-auto overflow-x-hidden w-[95vw] sm:max-w-[90vw] lg:max-w-[75vw]">
        <DialogHeader>
          <DialogTitle>
            Especies de la Regla: {productDisease.product?.description} -{" "}
            {productDisease.disease?.names}
          </DialogTitle>
          <DialogDescription>
            Administra en qué especies aplica esta regla producto-enfermedad.
          </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 w-full">
          <SpeciesDiseaseManagement idProductDisease={productDisease.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
