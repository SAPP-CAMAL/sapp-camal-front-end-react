"use client";

import { HardHatIcon } from "lucide-react";
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
import { NewEquipmentTypeForm } from "./new-equipment-type";

export function EquipmentTypeFormFields() {
  const form = useFormContext<NewEquipmentTypeForm>();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <HardHatIcon /> Información del Tipo de Equipo
          </CardTitle>
          <CardDescription>
            Define el nombre del tipo de equipo de bioseguridad (ej. vestuario
            y lencería, equipo de protección).
          </CardDescription>
        </CardHeader>
        <CardContent>
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
