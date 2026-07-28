"use client";

import { LayersIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RequiredMark } from "@/components/ui/required-mark";
import { useFormContext } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewDiseaseGroupForm } from "./new-disease-group";

export function DiseaseGroupFormFields() {
  const form = useFormContext<NewDiseaseGroupForm>();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <LayersIcon /> Información del Grupo de Enfermedad
          </CardTitle>
          <CardDescription>
            Define el nombre, número y código del grupo de enfermedad.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-2 items-start">
          <FormField
            control={form.control}
            name="name"
            rules={{
              required: {
                value: true,
                message: "El nombre del grupo de enfermedad es requerido",
              },
              maxLength: {
                value: 50,
                message: "El nombre no puede tener más de 50 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre <RequiredMark /></FormLabel>
                <FormControl>
                  <Input {...field} maxLength={50} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="groupNumber"
            rules={{
              required: {
                value: true,
                message: "El número de grupo es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Grupo <RequiredMark /></FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            rules={{
              required: {
                value: true,
                message: "El código del grupo de enfermedad es requerido",
              },
              maxLength: {
                value: 100,
                message: "El código no puede tener más de 100 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Código <RequiredMark /></FormLabel>
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
