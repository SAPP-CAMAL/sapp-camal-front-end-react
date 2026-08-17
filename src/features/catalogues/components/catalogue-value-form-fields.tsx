"use client";

import { TagIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RequiredMark } from "@/components/ui/required-mark";
import { useFormContext, useWatch } from "react-hook-form";
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
import { getCatalogueTypesService, getCatalogueValuesService } from "../server/db/catalogue-management.service";
import { NewCatalogueValueForm } from "./new-catalogue-value";

export function NewCatalogueValueFields({
  excludeCatalogueId,
  fixedCatalogueTypeId,
  showStatus = false,
}: {
  excludeCatalogueId?: number;
  fixedCatalogueTypeId?: number;
  showStatus?: boolean;
}) {
  const form = useFormContext<NewCatalogueValueForm>();
  const watchedTypeId = useWatch({ control: form.control, name: "catalogueTypeId" });
  const catalogueTypeId = fixedCatalogueTypeId ?? watchedTypeId;

  const typesQuery = useQuery({
    queryKey: ["catalogue-types", "all-for-select"],
    queryFn: getCatalogueTypesService,
    enabled: !fixedCatalogueTypeId,
  });

  const parentValuesQuery = useQuery({
    queryKey: ["catalogue-values", "for-select", catalogueTypeId],
    queryFn: () =>
      getCatalogueValuesService({ page: 1, limit: 100, catalogueTypeId: Number(catalogueTypeId) }),
    enabled: !!catalogueTypeId,
  });

  const parentOptions = (parentValuesQuery.data?.data.items ?? []).filter(
    (value) => value.id !== excludeCatalogueId
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <TagIcon /> Información del Valor
          </CardTitle>
          <CardDescription>
            Define el código, nombre y jerarquía del valor de catálogo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-4 items-start">
          {!fixedCatalogueTypeId && (
            <FormField
              control={form.control}
              name="catalogueTypeId"
              rules={{ required: { value: true, message: "El tipo de catálogo es requerido" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de catálogo <RequiredMark /></FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(typesQuery.data?.data ?? [])
                        .filter((type) => type.status)
                        .map((type) => (
                          <SelectItem key={type.id} value={String(type.id)}>
                            {type.description}
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
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor padre</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                  value={field.value ? String(field.value) : "none"}
                  disabled={!catalogueTypeId}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sin padre (raíz)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Sin padre (raíz)</SelectItem>
                    {parentOptions.map((value) => (
                      <SelectItem key={value.id} value={String(value.id)}>
                        {value.name}
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
            name="name"
            rules={{ required: { value: true, message: "El nombre es requerido" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre <RequiredMark /></FormLabel>
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
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
