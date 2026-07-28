"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, PlusIcon } from "lucide-react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createCleaningAreaStructureService } from "../server/db/cleaning-area.service";
import { getCleaningCatalogService } from "@/features/cleaning-catalog/server/db/cleaning-catalog.service";
import { CLEANING_AREA_BY_LINE_TAG } from "../constants/cleaning-area.constants";
import { CleaningAreaStructureItem } from "../domain/cleaning-area.domain";
import { CLEANING_CATALOG_TYPES } from "@/features/cleaning-catalog/domain/cleaning-catalog.domain";

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
  const [itemPickerOpen, setItemPickerOpen] = useState(false);

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

  const normalizedType = (type?: string | null) =>
    (type ?? "").toUpperCase().trim();

  const groupedItems = [
    ...CLEANING_CATALOG_TYPES,
    "OTROS" as const,
  ]
    .map((type) => ({
      type,
      items: availableItems.filter((item) =>
        type === "OTROS"
          ? !CLEANING_CATALOG_TYPES.includes(
              normalizedType(item.type) as (typeof CLEANING_CATALOG_TYPES)[number]
            )
          : normalizedType(item.type) === type
      ),
    }))
    .filter((group) => group.items.length > 0);

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
              render={({ field }) => {
                const selectedItem = availableItems.find(
                  (item) => String(item.id) === field.value
                );

                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Estructura/Material <RequiredMark /></FormLabel>
                    <Popover
                      open={itemPickerOpen}
                      onOpenChange={setItemPickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={itemPickerOpen}
                            className="w-full justify-between font-normal"
                            disabled={availableItems.length === 0}
                          >
                            <span className="truncate">
                              {selectedItem
                                ? `${selectedItem.name}${
                                    selectedItem.type
                                      ? ` (${selectedItem.type})`
                                      : ""
                                  }`
                                : availableItems.length === 0
                                  ? "No hay ítems disponibles"
                                  : "Seleccione un ítem"}
                            </span>
                            <ChevronsUpDown className="opacity-50 shrink-0" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar por nombre..." />
                          <CommandList>
                            <CommandEmpty>Sin resultados.</CommandEmpty>
                            {groupedItems.map((group) => (
                              <CommandGroup
                                key={group.type}
                                heading={group.type}
                              >
                                {group.items.map((item) => (
                                  <CommandItem
                                    key={item.id}
                                    value={item.name}
                                    onSelect={() => {
                                      field.onChange(String(item.id));
                                      setItemPickerOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === String(item.id)
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {item.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
