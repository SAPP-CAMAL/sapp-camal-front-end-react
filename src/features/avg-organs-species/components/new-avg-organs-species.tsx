"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AvgOrgansSpeciesFormFields } from "./avg-organs-species-form-fields";
import { createAvgOrgansSpeciesService } from "../server/db/avg-organs-species.service";
import { useEffect, useState } from "react";
import { AVG_ORGANS_SPECIES_TAG } from "../constants/avg-organs-species.constants";

export type NewAvgOrgansSpeciesForm = {
  idSpecie: number;
  idProduct: number;
  avgWeight?: number;
  status: string;
};

const defaultValues: NewAvgOrgansSpeciesForm = {
  idSpecie: undefined as unknown as number,
  idProduct: undefined as unknown as number,
  avgWeight: undefined,
  status: "true",
};

export function NewAvgOrgansSpecies() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewAvgOrgansSpeciesForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createAvgOrgansSpeciesService({
        idSpecie: data.idSpecie,
        idProduct: data.idProduct,
        avgWeight: data.avgWeight,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [AVG_ORGANS_SPECIES_TAG],
      });

      toast.success("Peso promedio creado exitosamente");
      setOpen(false);
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Crear peso promedio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Nuevo Peso Promedio de Órgano</DialogTitle>
          <DialogDescription>
            Define el peso de referencia esperado para un producto/órgano en
            una especie.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <AvgOrgansSpeciesFormFields />
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
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
