"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SquarePenIcon, TriangleAlertIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RequiredMark } from "@/components/ui/required-mark";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { updateCleaningAreaService } from "../server/db/cleaning-area.service";
import { getCleaningAreaCatalogService } from "@/features/cleaning-area-catalog/server/db/cleaning-area-catalog.service";
import { getActiveLinesService } from "@/features/postmortem/server/db/line.service";
import { CLEANING_AREA_BY_LINE_TAG } from "../constants/cleaning-area.constants";
import { CleaningAreaGrouped } from "../domain/cleaning-area.domain";

type UpdateCleaningAreaForm = {
  idLine: string;
  idAreaCatalog: string;
  orderIndex: number;
  status: string;
};

export function UpdateCleaningArea({
  area,
  idLine,
  existingAreas,
}: {
  area: CleaningAreaGrouped;
  idLine: number;
  existingAreas: CleaningAreaGrouped[];
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const linesQuery = useQuery({
    queryKey: ["active-lines"],
    queryFn: getActiveLinesService,
  });

  const catalogQuery = useQuery({
    queryKey: ["cleaning-area-catalog"],
    queryFn: getCleaningAreaCatalogService,
  });

  const form = useForm<UpdateCleaningAreaForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        idLine: String(idLine),
        idAreaCatalog: String(area.idAreaCatalog),
        orderIndex: area.areaOrderIndex ?? (undefined as unknown as number),
        status: "true",
      });
    }
  }, [open, form, area, idLine]);

  const existingIds = new Set(
    existingAreas
      .filter((a) => a.idArea !== area.idArea)
      .map((a) => a.idAreaCatalog)
  );
  const availableAreas = (catalogQuery.data?.data ?? []).filter(
    (catalogArea) =>
      catalogArea.status &&
      (!existingIds.has(catalogArea.id) || catalogArea.id === area.idAreaCatalog)
  );

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateCleaningAreaService(area.idArea, {
        ...(form.formState.dirtyFields.idLine && {
          idLine: Number(data.idLine),
        }),
        ...(form.formState.dirtyFields.idAreaCatalog && {
          idAreaCatalog: Number(data.idAreaCatalog),
        }),
        ...(form.formState.dirtyFields.orderIndex && {
          orderIndex:
            data.orderIndex === undefined || Number.isNaN(data.orderIndex)
              ? null
              : data.orderIndex,
        }),
        ...(form.formState.dirtyFields.status && {
          status: data.status === "true",
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [CLEANING_AREA_BY_LINE_TAG],
      });

      toast.success("Área actualizada exitosamente");
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
            <Button variant="outline" size="sm">
              <SquarePenIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
          Editar Área
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Editar Área de la Línea</DialogTitle>
          <DialogDescription>
            Modifica la línea, el área del catálogo o el estado de esta
            asignación.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <FormField
              control={form.control}
              name="idLine"
              rules={{ required: { value: true, message: "La línea es requerida" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Línea de Producción <RequiredMark /></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione una línea" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(linesQuery.data ?? []).map((line) => (
                        <SelectItem key={line.id} value={String(line.id)}>
                          {line.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="idAreaCatalog"
              rules={{ required: { value: true, message: "El área es requerida" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área <RequiredMark /></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={availableAreas.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            availableAreas.length === 0
                              ? "No hay áreas disponibles"
                              : "Seleccione un área"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableAreas.map((catalogArea) => (
                        <SelectItem key={catalogArea.id} value={String(catalogArea.id)}>
                          {catalogArea.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableAreas.length === 0 && (
                    <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      <TriangleAlertIcon className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>Todas las áreas del catálogo ya están asignadas a esta línea.</span>
                    </div>
                  )}
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

            <FormField
              control={form.control}
              name="status"
              rules={{ required: { value: true, message: "El estado es requerido" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado <RequiredMark /></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
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
                disabled={form.formState.isSubmitting}
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
