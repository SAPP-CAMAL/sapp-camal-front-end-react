"use client";

import { ShirtIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getEquipmentTypesService } from "../server/db/equipment.service";
import { EQUIPMENT_TYPES_TAG } from "../constants/equipment.constants";
import { NewEquipmentForm } from "./new-equipment";

export function EquipmentFormFields() {
  const form = useFormContext<NewEquipmentForm>();

  const typesQuery = useQuery({
    queryKey: [EQUIPMENT_TYPES_TAG],
    queryFn: getEquipmentTypesService,
  });

  const activeTypes = (typesQuery.data?.data ?? []).filter((t) => t.status);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <ShirtIcon /> Información del Equipo
          </CardTitle>
          <CardDescription>
            Define el tipo y la descripción del equipo de bioseguridad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="idEquipmentType"
            rules={{ required: { value: true, message: "El tipo es requerido" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Equipo *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activeTypes.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.description}
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
            name="description"
            rules={{
              required: {
                value: true,
                message: "La descripción es requerida",
              },
              maxLength: {
                value: 100,
                message: "La descripción no puede tener más de 100 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción *</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={100} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
