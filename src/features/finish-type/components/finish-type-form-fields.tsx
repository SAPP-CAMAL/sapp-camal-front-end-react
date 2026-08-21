"use client";

import { SparklesIcon } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { getSpeciesAllService } from "../server/db/finish-type-admin.service";
import { NewFinishTypeForm } from "./new-finish-type";

export function NewFinishTypeFields({ showStatus = false }: { showStatus?: boolean }) {
  const form = useFormContext<NewFinishTypeForm>();

  const speciesQuery = useQuery({
    queryKey: ["species", "all-for-select"],
    queryFn: getSpeciesAllService,
  });

  const activeSpecies = (speciesQuery.data?.data ?? []).filter((s) => s.status);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <SparklesIcon /> Tipo de Acabado
          </CardTitle>
          <CardDescription>Define la especie, código y nombre del tipo de acabado.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-4 items-start">
          <FormField
            control={form.control}
            name="idSpecie"
            rules={{ required: { value: true, message: "La especie es requerida" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especie <RequiredMark /></FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : undefined}
                  disabled={!activeSpecies.length}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          activeSpecies.length
                            ? "Seleccione una especie"
                            : "No hay especies disponibles"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activeSpecies.map((specie) => (
                      <SelectItem key={specie.id} value={String(specie.id)}>
                        {specie.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {!activeSpecies.length && !speciesQuery.isLoading && (
                  <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
                    No hay especies activas registradas.
                  </div>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            rules={{ required: { value: true, message: "El código es requerido" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código <RequiredMark /></FormLabel>
                <FormControl>
                  <Input maxLength={100} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            rules={{ required: { value: true, message: "El nombre es requerido" } }}
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Nombre <RequiredMark /></FormLabel>
                <FormControl>
                  <Input maxLength={50} {...field} />
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
