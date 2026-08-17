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
import { NewOpinionForm } from "./new-opinion";

export function OpinionFormFields({ showStatus = false }: { showStatus?: boolean }) {
  const form = useFormContext<NewOpinionForm>();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <ClipboardCheckIcon /> Información de la Opinión
          </CardTitle>
          <CardDescription>
            Define el código y nombre de la opinión/dictamen veterinario.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-2 items-start">
          <FormField
            control={form.control}
            name="code"
            rules={{
              required: {
                value: true,
                message: "El código de la opinión es requerido",
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
            name="name"
            rules={{
              required: {
                value: true,
                message: "El nombre de la opinión es requerido",
              },
              maxLength: {
                value: 100,
                message: "El nombre no puede tener más de 100 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre <RequiredMark /></FormLabel>
                <FormControl>
                  <Input {...field} maxLength={100} />
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
