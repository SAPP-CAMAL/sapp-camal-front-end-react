"use client";

import { ActivitySquareIcon } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CLINICAL_SIGNS_GROUP_OPTIONS } from "../domain/clinical-signs.domain";
import { NewClinicalSignForm } from "./new-clinical-signs";

export function ClinicalSignsFormFields({
  showStatus = false,
}: {
  showStatus?: boolean;
}) {
  const form = useFormContext<NewClinicalSignForm>();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <ActivitySquareIcon /> Información del Signo Clínico
          </CardTitle>
          <CardDescription>
            Define la descripción y el grupo de afección del signo clínico.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-2 items-start">
          <FormField
            control={form.control}
            name="description"
            rules={{
              required: {
                value: true,
                message: "La descripción del signo clínico es requerida",
              },
              maxLength: {
                value: 20,
                message: "La descripción no puede tener más de 20 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción <RequiredMark /></FormLabel>
                <FormControl>
                  <Input {...field} maxLength={20} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="groupSign"
            rules={{
              required: {
                value: true,
                message: "El grupo del signo clínico es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grupo <RequiredMark /></FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un grupo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CLINICAL_SIGNS_GROUP_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
