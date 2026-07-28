"use client";

import { LinkIcon } from "lucide-react";
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
import { useAllSpecies } from "@/features/specie/hooks";
import { NewHookTypeForm } from "./new-hook-type";

export function HookTypeFormFields() {
  const form = useFormContext<NewHookTypeForm>();
  const { data: speciesResponse } = useAllSpecies();
  const species = speciesResponse?.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <LinkIcon /> Información del Tipo de Gancho
          </CardTitle>
          <CardDescription>
            Define el nombre, peso de referencia, especie y descripción del
            tipo de gancho.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-2 items-start">
          <FormField
            control={form.control}
            name="name"
            rules={{
              required: {
                value: true,
                message: "El nombre del tipo de gancho es requerido",
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
          <FormField
            control={form.control}
            name="weight"
            rules={{
              required: {
                value: true,
                message: "El peso de referencia es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso de Referencia <RequiredMark /></FormLabel>
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
            name="idSpecie"
            rules={{
              required: {
                value: true,
                message: "La especie es requerida",
              },
            }}
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Especie <RequiredMark /></FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione una especie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {species.map((specie) => (
                      <SelectItem key={specie.id} value={String(specie.id)}>
                        {specie.name}
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
              <FormItem className="col-span-2">
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea {...field} />
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
