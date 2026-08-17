"use client";

import { BoxesIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { NewCleaningCatalogForm } from "./new-cleaning-catalog";
import { CLEANING_CATALOG_TYPES } from "../domain/cleaning-catalog.domain";

export function CleaningCatalogFormFields({ showStatus = false }: { showStatus?: boolean }) {
  const form = useFormContext<NewCleaningCatalogForm>();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <BoxesIcon /> Información del Ítem de Limpieza
          </CardTitle>
          <CardDescription>
            Define el nombre, tipo y descripción de la estructura, equipo,
            utensilio o material usado en las actas de limpieza y
            desinfección.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            rules={{
              required: {
                value: true,
                message: "El nombre es requerido",
              },
              maxLength: {
                value: 200,
                message: "El nombre no puede tener más de 200 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre <RequiredMark /></FormLabel>
                <FormControl>
                  <Input {...field} maxLength={200} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            rules={{
              required: {
                value: true,
                message: "El tipo es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo <RequiredMark /></FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CLEANING_CATALOG_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
