"use client";

import { useEffect, useState } from "react";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createCleaningAreaService } from "../server/db/cleaning-area.service";
import { getCleaningAreaCatalogService } from "@/features/cleaning-area-catalog/server/db/cleaning-area-catalog.service";
import { CLEANING_AREA_BY_LINE_TAG } from "../constants/cleaning-area.constants";
import { CleaningAreaGrouped } from "../domain/cleaning-area.domain";

type NewCleaningAreaForm = {
  idAreaCatalog: string;
  orderIndex: number;
};

export function NewCleaningArea({
  idLine,
  existingAreas,
}: {
  idLine: number;
  existingAreas: CleaningAreaGrouped[];
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const catalogQuery = useQuery({
    queryKey: ["cleaning-area-catalog"],
    queryFn: getCleaningAreaCatalogService,
  });

  const defaultValues: NewCleaningAreaForm = {
    idAreaCatalog: "",
    orderIndex: undefined as unknown as number,
  };

  const form = useForm<NewCleaningAreaForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form]);

  const existingIds = new Set(existingAreas.map((a) => a.idAreaCatalog));
  const availableAreas = (catalogQuery.data?.data ?? []).filter(
    (area) => area.status && !existingIds.has(area.id)
  );

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createCleaningAreaService({
        idLine,
        idAreaCatalog: Number(data.idAreaCatalog),
        orderIndex:
          data.orderIndex === undefined || Number.isNaN(data.orderIndex)
            ? null
            : data.orderIndex,
      });

      await queryClient.invalidateQueries({
        queryKey: [CLEANING_AREA_BY_LINE_TAG, idLine],
      });

      toast.success("Área agregada a la línea exitosamente");
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
          Agregar área
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Agregar Área a la Línea</DialogTitle>
          <DialogDescription>
            Selecciona un área del catálogo para asignarla a esta línea de
            producción.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <FormField
              control={form.control}
              name="idAreaCatalog"
              rules={{ required: { value: true, message: "El área es requerida" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione un área" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableAreas.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          No hay áreas disponibles
                        </div>
                      ) : (
                        availableAreas.map((area) => (
                          <SelectItem key={area.id} value={String(area.id)}>
                            {area.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orderIndex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      value={Number.isNaN(field.value) ? "" : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-x-2">
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
                disabled={form.formState.isSubmitting || availableAreas.length === 0}
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
