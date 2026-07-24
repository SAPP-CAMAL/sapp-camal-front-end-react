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
import { NewCollectionValueFields } from "./collection-value-form-fields";
import { updateCollectionValueService } from "../server/db/collection-value-admin.service";
import { NewCollectionValueForm } from "./new-collection-value";
import { CollectionValueAdmin } from "../domain/collection-value.domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateCollectionValue({ collectionValue }: { collectionValue: CollectionValueAdmin }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewCollectionValueForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        idSpecie: collectionValue.idSpecie,
        name: collectionValue.name,
        code: collectionValue.code,
        price: collectionValue.price,
        status: String(collectionValue.status),
      });
    }
  }, [open, form, collectionValue]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateCollectionValueService(collectionValue.id, {
        ...(form.formState.dirtyFields.idSpecie && { idSpecie: data.idSpecie }),
        ...(form.formState.dirtyFields.name && { name: data.name }),
        ...(form.formState.dirtyFields.code && { code: data.code }),
        ...(form.formState.dirtyFields.price && { price: data.price }),
        ...(form.formState.dirtyFields.status && { status: data.status === "true" }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({ queryKey: ["collection-values-admin"] });

      toast.success("Tarifa actualizada exitosamente");
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
        <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
          Editar Tarifa
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Tarifa por Especie</DialogTitle>
          <DialogDescription>Modifica la información de la tarifa seleccionada.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <NewCollectionValueFields showStatus />
            <div className="flex justify-end col-span-2 gap-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={form.formState.isSubmitting}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting || form.formState.isLoading}>
                {form.formState.isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
