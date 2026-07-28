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
import { RequiredMark } from "@/components/ui/required-mark";
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
import { createCleaningAreaStructureService } from "../server/db/cleaning-area.service";
import { getCleaningCatalogService } from "@/features/cleaning-catalog/server/db/cleaning-catalog.service";
import { CLEANING_AREA_BY_LINE_TAG } from "../constants/cleaning-area.constants";
import { CleaningAreaStructureItem } from "../domain/cleaning-area.domain";

type NewCleaningAreaStructureForm = {
  idCatalog: string;
  orderIndex: number;
};

export function NewCleaningAreaStructure({
  idArea,
  idLine,
  existingStructures,
}: {
  idArea: number;
  idLine: number;
  existingStructures: CleaningAreaStructureItem[];
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const catalogQuery = useQuery({
    queryKey: ["cleaning-catalog"],
    queryFn: getCleaningCatalogService,
  });

  const defaultValues: NewCleaningAreaStructureForm = {
    idCatalog: "",
    orderIndex: undefined as unknown as number,
  };

  const form = useForm<NewCleaningAreaStructureForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form]);

  const existingIds = new Set(existingStructures.map((s) => s.idCatalog));
  const availableItems = (catalogQuery.data?.data ?? []).filter(
    (item) => item.status && !existingIds.has(item.id)
  );

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createCleaningAreaStructureService({
        idArea,
        idCatalog: Number(data.idCatalog),
        orderIndex:
          data.orderIndex === undefined || Number.isNaN(data.orderIndex)
            ? null
            : data.orderIndex,
      });

      await queryClient.invalidateQueries({
        queryKey: [CLEANING_AREA_BY_LINE_TAG, idLine],
      });

      toast.success("Estructura agregada al área exitosamente");
      setOpen(false);
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="h-4 w-4" />
          Agregar estructura
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Agregar Estructura/Material</DialogTitle>
          <DialogDescription>
            Selecciona una estructura, equipo, utensilio o material del
            catálogo para asignarlo a esta área.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <FormField
              control={form.control}
              name="idCatalog"
              rules={{ required: { value: true, message: "La estructura es requerida" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estructura/Material <RequiredMark /></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione un ítem" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableItems.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          No hay ítems disponibles
                        </div>
                      ) : (
                        availableItems.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.name}
                            {item.type ? ` (${item.type})` : ""}
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
                disabled={form.formState.isSubmitting || availableItems.length === 0}
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
