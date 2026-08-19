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
import { AvgOrgansSpeciesFormFields } from "./avg-organs-species-form-fields";
import { updateAvgOrgansSpeciesService } from "../server/db/avg-organs-species.service";
import { NewAvgOrgansSpeciesForm } from "./new-avg-organs-species";
import { AvgOrgansSpecies } from "../domain/avg-organs-species.domain";
import { AVG_ORGANS_SPECIES_TAG } from "../constants/avg-organs-species.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateAvgOrgansSpecies({
  avgOrgansSpecies,
}: {
  avgOrgansSpecies: AvgOrgansSpecies;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewAvgOrgansSpeciesForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        idSpecie: avgOrgansSpecies.specie?.id,
        idProduct: avgOrgansSpecies.product?.id,
        avgWeight: avgOrgansSpecies.avgWeight ?? undefined,
        status: String(avgOrgansSpecies.status),
      });
    }
  }, [open, form, avgOrgansSpecies]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateAvgOrgansSpeciesService(avgOrgansSpecies.id, {
        ...(form.formState.dirtyFields.idSpecie && {
          idSpecie: data.idSpecie,
        }),
        ...(form.formState.dirtyFields.idProduct && {
          idProduct: data.idProduct,
        }),
        ...(form.formState.dirtyFields.avgWeight && {
          avgWeight: data.avgWeight,
        }),
        ...(form.formState.dirtyFields.status && {
          status: data.status === "true",
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [AVG_ORGANS_SPECIES_TAG],
      });

      toast.success("Peso promedio actualizado exitosamente");
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
          Editar Peso Promedio
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Peso Promedio de Órgano</DialogTitle>
          <DialogDescription>
            Modifica el peso promedio seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <AvgOrgansSpeciesFormFields showStatus />
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
