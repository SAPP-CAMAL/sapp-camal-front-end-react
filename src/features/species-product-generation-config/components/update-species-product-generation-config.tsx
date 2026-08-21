"use client";

import { useEffect, useState } from "react";
import { SquarePenIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getApiErrorMessage } from "@/lib/error-handler";

import { SpeciesProductGenerationConfigFormFields } from "./species-product-generation-config-form-fields";
import { SPECIES_PRODUCT_GENERATION_CONFIG_LIST_TAG } from "../constants";
import { updateSpeciesProductGenerationConfigService } from "../server/db/species-product-generation-config.service";
import { SpeciesProductGenerationConfig } from "../domain";

export type UpdateSpeciesProductGenerationConfigForm = {
  generateProducts: string;
  generateSubproducts: string;
  status: string;
};

export function UpdateSpeciesProductGenerationConfig({
  config,
}: {
  config: SpeciesProductGenerationConfig;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<UpdateSpeciesProductGenerationConfigForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        generateProducts: String(config.generateProducts),
        generateSubproducts: String(config.generateSubproducts),
        status: String(config.status),
      });
    }
  }, [open, form, config]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateSpeciesProductGenerationConfigService(config.id, {
        ...(form.formState.dirtyFields.generateProducts && {
          generateProducts: data.generateProducts === "true",
        }),
        ...(form.formState.dirtyFields.generateSubproducts && {
          generateSubproducts: data.generateSubproducts === "true",
        }),
        ...(form.formState.dirtyFields.status && {
          status: data.status === "true",
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [SPECIES_PRODUCT_GENERATION_CONFIG_LIST_TAG],
      });

      toast.success("Configuración actualizada exitosamente");
      setOpen(false);
    } catch (error) {
      const message = await getApiErrorMessage(error);
      toast.error(message ?? "Error al actualizar la configuración");
    }
  });

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant={"outline"}>
              <SquarePenIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
          Editar Configuración
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>
            Editar Configuración — {config.species?.name}
          </DialogTitle>
          <DialogDescription>
            Modifica si esta especie genera productos y/o subproductos.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <SpeciesProductGenerationConfigFormFields />
            <div className="flex justify-end col-span-2 gap-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={form.formState.isSubmitting}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || form.formState.isLoading
                }
              >
                {form.formState.isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
