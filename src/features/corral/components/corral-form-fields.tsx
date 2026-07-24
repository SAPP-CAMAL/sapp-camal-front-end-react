"use client";

import { HouseIcon } from "lucide-react";
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
import { getCorralTypesAdminService } from "../server/db/corral-type-admin.service";
import { NewCorralForm } from "./new-corral";

export function NewCorralFields({ showStatus = false }: { showStatus?: boolean }) {
  const form = useFormContext<NewCorralForm>();

  const corralTypesQuery = useQuery({
    queryKey: ["corral-types", "all-for-select"],
    queryFn: getCorralTypesAdminService,
  });

  const activeCorralTypes = (corralTypesQuery.data?.data ?? []).filter((t) => t.status);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <HouseIcon /> Información del Corral
          </CardTitle>
          <CardDescription>Define el tipo, nombre y capacidad del corral.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-4 items-start">
          <FormField
            control={form.control}
            name="idCorralType"
            rules={{ required: { value: true, message: "El tipo de corral es requerido" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de corral *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : undefined}
                  disabled={!activeCorralTypes.length}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          activeCorralTypes.length
                            ? "Seleccione un tipo de corral"
                            : "No hay tipos de corral disponibles"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activeCorralTypes.map((corralType) => (
                      <SelectItem key={corralType.id} value={String(corralType.id)}>
                        {corralType.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {!activeCorralTypes.length && !corralTypesQuery.isLoading && (
                  <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
                    No hay tipos de corral activos. Cree o active uno en Tipos de Corral antes de continuar.
                  </div>
                )}
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
                  <Input maxLength={20} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minimumQuantity"
            rules={{ required: { value: true, message: "La cantidad mínima es requerida" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad mínima *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
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
            name="maximumQuantity"
            rules={{ required: { value: true, message: "La cantidad máxima es requerida" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad máxima *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
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
