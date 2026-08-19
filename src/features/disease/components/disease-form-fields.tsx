"use client";

import { BugIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
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
import { NewDiseaseForm } from "./new-disease";

export function DiseaseFormFields({
  showStatus = false,
}: {
  showStatus?: boolean;
}) {
  const form = useFormContext<NewDiseaseForm>();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <BugIcon /> Información de la Enfermedad
          </CardTitle>
          <CardDescription>
            Define el nombre, código y descripción de la enfermedad.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-2 items-start">
          <FormField
            control={form.control}
            name="names"
            rules={{
              required: {
                value: true,
                message: "El nombre de la enfermedad es requerido",
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
            name="code"
            rules={{
              required: {
                value: true,
                message: "El código de la enfermedad es requerido",
              },
              maxLength: {
                value: 100,
                message: "El código no puede tener más de 100 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código <RequiredMark /></FormLabel>
                <FormControl>
                  <Input {...field} maxLength={100} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            rules={{
              maxLength: {
                value: 500,
                message: "La descripción no puede tener más de 500 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea {...field} maxLength={500} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {showStatus && (
            <FormField
              control={form.control}
              name="status"
              rules={{
                required: {
                  value: true,
                  message: "El estado es requerido",
                },
              }}
              render={({ field }) => (
                <FormItem className="col-span-2">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
