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
import { ProductiveStageFormFields } from "./productive-stage-form-fields";
import { updateProductiveStageService } from "../server/db/productive-stage.service";
import { NewProductiveStageForm } from "./new-productive-stage";
import { ProductiveStage } from "../domain";
import { PRODUCTIVE_LIST_TAG } from "../constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateProductiveStage({
  productiveStage,
}: {
  productiveStage: ProductiveStage;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewProductiveStageForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        name: productiveStage.name,
        code: productiveStage.code,
        idSpecies: productiveStage.idSpecies,
        idAnimalSex: productiveStage.idAnimalSex,
      });
    }
  }, [open, form, productiveStage]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateProductiveStageService(productiveStage.id, {
        ...(form.formState.dirtyFields.name && {
          name: data.name,
        }),
        ...(form.formState.dirtyFields.code && {
          code: data.code,
        }),
        ...(form.formState.dirtyFields.idSpecies && {
          idSpecies: data.idSpecies,
        }),
        ...(form.formState.dirtyFields.idAnimalSex && {
          idAnimalSex: data.idAnimalSex,
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [PRODUCTIVE_LIST_TAG],
      });

      toast.success("Etapa productiva actualizada exitosamente");
      setOpen(false);
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
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
        <TooltipContent
          side="top"
          align="center"
          sideOffset={5}
          avoidCollisions
        >
          Editar Etapa Productiva
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Etapa Productiva</DialogTitle>
          <DialogDescription>
            Modifica la información de la etapa productiva seleccionada.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <ProductiveStageFormFields />
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
