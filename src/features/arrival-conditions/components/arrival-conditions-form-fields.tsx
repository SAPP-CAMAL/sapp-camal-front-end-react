"use client";

import { ClipboardCheckIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewArrivalConditionForm } from "./new-arrival-condition";

export function ArrivalConditionsFormFields({ showStatus = false }: { showStatus?: boolean }) {
  const form = useFormContext<NewArrivalConditionForm>();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <ClipboardCheckIcon /> Información de la Condición de Llegada
          </CardTitle>
          <CardDescription>
            Define el nombre de la condición de llegada usada en las
            condiciones de transporte del certificado.
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
                value: 50,
                message: "La descripción no puede tener más de 50 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción <RequiredMark /></FormLabel>
                <FormControl>
                  <Input {...field} maxLength={50} />
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
                <FormItem className="mt-4">
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
