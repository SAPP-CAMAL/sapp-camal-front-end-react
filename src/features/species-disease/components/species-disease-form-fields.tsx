"use client";

import { PawPrintIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { useAllSpecies } from "@/features/specie/hooks";
import { NewSpeciesDiseaseForm } from "./new-species-disease";

export function SpeciesDiseaseFormFields() {
  const form = useFormContext<NewSpeciesDiseaseForm>();
  const { data: speciesResponse } = useAllSpecies();
  const species = speciesResponse?.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <PawPrintIcon /> Especie de la Regla
          </CardTitle>
          <CardDescription>
            Define la especie en la que aplica esta regla producto-enfermedad.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
