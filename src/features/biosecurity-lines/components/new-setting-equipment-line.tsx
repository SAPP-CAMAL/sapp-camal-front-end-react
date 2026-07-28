"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronsUpDown,
  PlusIcon,
  TriangleAlertIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { createSettingEquipmentLineService } from "../server/db/biosecurity-lines.service";
import { getEquipmentsService } from "@/features/equipment/server/db/equipment.service";
import { SETTING_EQUIPMENT_LINES_TAG } from "../constants/biosecurity-lines.constants";
import { SettingEquipmentLine } from "../domain/biosecurity-lines.domain";

const NO_TYPE_GROUP = "SIN TIPO";

type NewSettingEquipmentLineForm = {
  idEquipment: string;
};

export function NewSettingEquipmentLine({
  idBiosecurityLine,
  existingEquipments,
}: {
  idBiosecurityLine: number;
  existingEquipments: SettingEquipmentLine[];
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [itemPickerOpen, setItemPickerOpen] = useState(false);

  const equipmentsQuery = useQuery({
    queryKey: ["equipments"],
    queryFn: getEquipmentsService,
  });

  const defaultValues: NewSettingEquipmentLineForm = { idEquipment: "" };
  const form = useForm<NewSettingEquipmentLineForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form]);

  const existingIds = new Set(existingEquipments.map((e) => e.idEquipment));
  const availableEquipments = (equipmentsQuery.data?.data ?? []).filter(
    (eq) => eq.status && !existingIds.has(eq.id)
  );
  const noAvailableEquipments = !equipmentsQuery.isLoading && availableEquipments.length === 0;

  const groupedEquipments = Object.entries(
    availableEquipments.reduce<Record<string, typeof availableEquipments>>(
      (groups, eq) => {
        const groupName = eq.equipmentType?.description ?? NO_TYPE_GROUP;
        (groups[groupName] ??= []).push(eq);
        return groups;
      },
      {}
    )
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, items]) => ({ type, items }));

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createSettingEquipmentLineService({
        idBiosecurityLine,
        idEquipment: Number(data.idEquipment),
      });

      await queryClient.invalidateQueries({
        queryKey: [SETTING_EQUIPMENT_LINES_TAG, idBiosecurityLine],
      });

      toast.success("Equipo agregado a la línea exitosamente");
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
          Agregar equipo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Agregar Equipo</DialogTitle>
          <DialogDescription>
            Selecciona un equipo del catálogo para asignarlo a esta línea de
            bioseguridad.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
            <FormField
              control={form.control}
              name="idEquipment"
              rules={{ required: { value: true, message: "El equipo es requerido" } }}
              render={({ field }) => {
                const selectedEquipment = availableEquipments.find(
                  (eq) => String(eq.id) === field.value
                );

                return (
                <FormItem className="flex flex-col">
                  <FormLabel>Equipo <RequiredMark /></FormLabel>
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
                          disabled={noAvailableEquipments}
                        >
                          <span className="truncate">
                            {selectedEquipment
                              ? `${selectedEquipment.description}${
                                  selectedEquipment.equipmentType
                                    ? ` (${selectedEquipment.equipmentType.description})`
                                    : ""
                                }`
                              : noAvailableEquipments
                                ? "No hay equipos disponibles"
                                : "Seleccione un equipo"}
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
                          {groupedEquipments.map((group) => (
                            <CommandGroup key={group.type} heading={group.type}>
                              {group.items.map((eq) => (
                                <CommandItem
                                  key={eq.id}
                                  value={eq.description}
                                  onSelect={() => {
                                    field.onChange(String(eq.id));
                                    setItemPickerOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === String(eq.id)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {eq.description}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {noAvailableEquipments && (
                    <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
                      <TriangleAlertIcon className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>
                        No hay equipos disponibles para asignar: todos los equipos activos ya
                        están asignados a esta línea de bioseguridad.
                      </span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
                );
              }}
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
                disabled={form.formState.isSubmitting || availableEquipments.length === 0}
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
