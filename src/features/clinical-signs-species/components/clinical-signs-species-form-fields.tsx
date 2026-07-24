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
import { Textarea } from "@/components/ui/textarea";
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
import { NewClinicalSignsSpeciesForm } from "./new-clinical-signs-species";

export function ClinicalSignsSpeciesFormFields() {
  const form = useFormContext<NewClinicalSignsSpeciesForm>();
  const { data: speciesResponse } = useAllSpecies();
  const species = speciesResponse?.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <PawPrintIcon /> Especie del Signo Clínico
          </CardTitle>
          <CardDescription>
            Define la especie en la que aplica este signo clínico y detalles
            adicionales.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-x-2 items-start">
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
            name="details"
            rules={{
              maxLength: {
                value: 200,
                message: "Los detalles no pueden tener más de 200 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detalles</FormLabel>
                <FormControl>
                  <Textarea {...field} maxLength={200} />
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
