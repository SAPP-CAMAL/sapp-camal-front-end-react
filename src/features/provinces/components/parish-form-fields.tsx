"use client";

import { LandPlotIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { getCantonsAdminService } from "../server/db/locations-admin.service";
import { NewParishForm } from "./new-parish";

export function NewParishFields({
  showStatus = false,
  fixedCantonId,
}: {
  showStatus?: boolean;
  fixedCantonId?: number;
}) {
  const form = useFormContext<NewParishForm>();

  const cantonsQuery = useQuery({
    queryKey: ["cantons-admin", "all-for-select"],
    queryFn: () => getCantonsAdminService({ page: 1, limit: 300 }),
    enabled: !fixedCantonId,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <LandPlotIcon /> Información Básica
          </CardTitle>
          <CardDescription>Define el cantón, código y nombre de la parroquia.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-4 items-start">
          {!fixedCantonId && (
            <FormField
              control={form.control}
              name="cantonId"
              rules={{ required: { value: true, message: "El cantón es requerido" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantón *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione un cantón" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(cantonsQuery.data?.data.items ?? []).map((canton) => (
                        <SelectItem key={canton.id} value={String(canton.id)}>
                          {canton.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="code"
            rules={{ required: { value: true, message: "El código es requerido" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código *</FormLabel>
                <FormControl>
                  <Input {...field} />
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
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
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
