"use client";

import { MapPinIcon } from "lucide-react";
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
import { ProductAnatomicalLocationManagement } from "@/features/product-anatomical-location/product-anatomical-location-management";
import { Product } from "../domain/product.domain";

export function ManageProductAnatomicalLocations({
  product,
}: {
  product: Product;
}) {
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant={"outline"}>
              <MapPinIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
          Gestionar Ubicaciones Anatómicas
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[90vw] lg:max-w-[75vw]">
        <DialogHeader>
          <DialogTitle>
            Ubicaciones Anatómicas del Producto: {product.description}
          </DialogTitle>
          <DialogDescription>
            Administra las ubicaciones anatómicas asociadas a este producto.
          </DialogDescription>
        </DialogHeader>
        <ProductAnatomicalLocationManagement idProduct={product.id} />
      </DialogContent>
    </Dialog>
  );
}
