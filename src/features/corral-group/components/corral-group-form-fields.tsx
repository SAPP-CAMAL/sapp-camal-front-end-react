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
import { Textarea } from "@/components/ui/textarea";
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
import { getFinishTypesAllService, getLinesAllService } from "../server/db/corral-group-admin.service";
import { NewCorralGroupForm } from "./new-corral-group";

export function NewCorralGroupFields({ showStatus = false }: { showStatus?: boolean }) {
  const form = useFormContext<NewCorralGroupForm>();

  const linesQuery = useQuery({
    queryKey: ["lines", "all-for-select"],
    queryFn: getLinesAllService,
  });

  const finishTypesQuery = useQuery({
    queryKey: ["finish-types", "all-for-select"],
    queryFn: getFinishTypesAllService,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <LayersIcon /> Información del Grupo
          </CardTitle>
          <CardDescription>Define la línea, tipo de acabado, nombre y orden del grupo de corrales.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-4 items-start">
          <FormField
            control={form.control}
            name="idLine"
            rules={{ required: { value: true, message: "La línea es requerida" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Línea *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione una línea" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(linesQuery.data?.data ?? []).map((line) => (
                      <SelectItem key={line.id} value={String(line.id)}>
                        {line.specie ? `${line.name} (${line.specie.name})` : line.name}
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
            name="idFinishType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de acabado</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                  value={field.value ? String(field.value) : "none"}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un tipo de acabado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Sin tipo de acabado</SelectItem>
                    {(finishTypesQuery.data?.data ?? [])
                      .filter((finishType) => finishType.status)
                      .map((finishType) => (
                        <SelectItem key={finishType.id} value={String(finishType.id)}>
                          {finishType.name}
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
            name="name"
            rules={{ required: { value: true, message: "El nombre es requerido" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="order"
            rules={{ required: { value: true, message: "El orden es requerido" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orden *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showStatus && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
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
