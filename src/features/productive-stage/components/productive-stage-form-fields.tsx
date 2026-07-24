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
import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
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
import { useAllSpecies } from "@/features/specie/hooks";
import { getAllAnimalSex } from "@/features/animal-sex/server/db/animal-sex.service";
import { NewProductiveStageForm } from "./new-productive-stage";

export function ProductiveStageFormFields() {
  const form = useFormContext<NewProductiveStageForm>();
  const { data: speciesResponse } = useAllSpecies();
  const { data: animalSexResponse } = useQuery({
    queryKey: ["animal-sex-list-for-select"],
    queryFn: getAllAnimalSex,
  });

  const species = speciesResponse?.data ?? [];
  const animalSexes = animalSexResponse?.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <LayersIcon /> Información de la Etapa Productiva
          </CardTitle>
          <CardDescription>
            Define el nombre, código, especie y sexo del animal para esta
            etapa productiva.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-2 items-start">
          <FormField
            control={form.control}
            name="name"
            rules={{
              required: {
                value: true,
                message: "El nombre de la etapa productiva es requerido",
              },
              maxLength: {
                value: 50,
                message: "El nombre no puede tener más de 50 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
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
                message: "El código de la etapa productiva es requerido",
              },
              maxLength: {
                value: 100,
                message: "El código no puede tener más de 100 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código *</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={100} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="idSpecies"
            rules={{
              required: {
                value: true,
                message: "La especie es requerida",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especie *</FormLabel>
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
            name="idAnimalSex"
            rules={{
              required: {
                value: true,
                message: "El sexo del animal es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo del Animal *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un sexo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {animalSexes.map((animalSex) => (
                      <SelectItem
                        key={animalSex.id}
                        value={String(animalSex.id)}
                      >
                        {animalSex.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
