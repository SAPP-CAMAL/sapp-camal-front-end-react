"use client";

import { FolderTreeIcon } from "lucide-react";
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
import { NewCatalogueTypeForm } from "./new-catalogue-type";

export function NewCatalogueTypeFields({
  showStatus = false,
}: {
  showStatus?: boolean;
}) {
  const form = useFormContext<NewCatalogueTypeForm>();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <FolderTreeIcon /> Información Básica
          </CardTitle>
          <CardDescription>
            Define el código y descripción del tipo de catálogo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-4 items-start">
          <FormField
            control={form.control}
            name="code"
            rules={{ required: { value: true, message: "El código es requerido" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código <RequiredMark /></FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            rules={{ required: { value: true, message: "La descripción es requerida" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción <RequiredMark /></FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {showStatus && (
            <FormField
              control={form.control}
              name="status"
              rules={{ required: { value: true, message: "El estado es requerido" } }}
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
