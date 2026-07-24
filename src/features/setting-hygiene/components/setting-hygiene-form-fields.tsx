"use client";

import { ShieldCheckIcon, TriangleAlertIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getEquipmentAllService } from "../server/db/setting-hygiene-admin.service";
import { EquipmentOption } from "../domain/setting-hygiene-admin.domain";
import { NewSettingHygieneForm } from "./new-setting-hygiene";

function groupEquipmentByType(equipment: EquipmentOption[]) {
  const groups = new Map<string, EquipmentOption[]>();

  equipment.forEach((item) => {
    const typeName = item.equipmentType?.description ?? "Sin tipo";
    if (!groups.has(typeName)) groups.set(typeName, []);
    groups.get(typeName)!.push(item);
  });

  return Array.from(groups.entries());
}

export function NewSettingHygieneFields({
  showStatus = false,
  excludeEquipmentIds = [],
}: {
  showStatus?: boolean;
  excludeEquipmentIds?: number[];
}) {
  const form = useFormContext<NewSettingHygieneForm>();

  const equipmentQuery = useQuery({
    queryKey: ["equipment", "all-for-select"],
    queryFn: getEquipmentAllService,
  });

  const excludedSet = new Set(excludeEquipmentIds);
  const availableEquipment = (equipmentQuery.data?.data ?? []).filter(
    (e) => e.status && !excludedSet.has(e.id)
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <ShieldCheckIcon /> Configuración de Higiene por Equipo
          </CardTitle>
          <CardDescription>Selecciona el equipo que requiere control de higiene.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-x-2 gap-y-4 items-start">
          <FormField
            control={form.control}
            name="idEquipment"
            rules={{ required: { value: true, message: "El equipo es requerido" } }}
            render={({ field }) => {
              const selectedEquipment = (equipmentQuery.data?.data ?? []).find(
                (e) => e.id === field.value
              );

              return (
              <FormItem>
                <FormLabel>Equipo *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : undefined}
                  disabled={!availableEquipment.length}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          availableEquipment.length
                            ? "Seleccione un equipo"
                            : "No hay equipos disponibles"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groupEquipmentByType(availableEquipment).map(([typeName, items], index) => (
                      <SelectGroup key={typeName}>
                        {index > 0 && <SelectSeparator />}
                        <SelectLabel>{typeName}</SelectLabel>
                        {items.map((equipment) => (
                          <SelectItem key={equipment.id} value={String(equipment.id)}>
                            {equipment.description}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                {selectedEquipment?.equipmentType && (
                  <p className="text-sm text-gray-500">
                    Tipo de equipo: {selectedEquipment.equipmentType.description}
                  </p>
                )}
                <FormMessage />
                {!availableEquipment.length && !equipmentQuery.isLoading && (
                  <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
                    <TriangleAlertIcon className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      No hay equipos disponibles: todos los equipos activos ya tienen una
                      configuración de higiene, o no hay equipos activos registrados.
                    </span>
                  </div>
                )}
              </FormItem>
              );
            }}
          />

          {showStatus && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
