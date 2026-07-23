"use client";

import { ListTreeIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { getModulesService } from "@/features/modules/server/db/modules.service";
import { getMenusAdminService } from "../server/db/menus.service";
import { NewMenuForm } from "./new-menu";

export function NewMenuFields({
  excludeMenuId,
  fixedModuleId,
}: {
  excludeMenuId?: number;
  fixedModuleId?: number;
}) {
  const form = useFormContext<NewMenuForm>();
  const watchedModuleId = useWatch({ control: form.control, name: "moduleId" });
  const moduleId = fixedModuleId ?? watchedModuleId;

  const modulesQuery = useQuery({
    queryKey: ["modules", "all-for-select"],
    queryFn: () => getModulesService({ page: 1, limit: 100 }),
  });

  const parentMenusQuery = useQuery({
    queryKey: ["menus-admin", "for-select", moduleId],
    queryFn: () =>
      getMenusAdminService({ page: 1, limit: 100, moduleId: Number(moduleId) }),
    enabled: !!moduleId,
  });

  const parentOptions = (parentMenusQuery.data?.data.items ?? []).filter(
    (menu) => menu.id !== excludeMenuId
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <ListTreeIcon /> Información del Menú
          </CardTitle>
          <CardDescription>
            Define a qué módulo pertenece, su jerarquía y su ruta.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-4 items-start">
          {!fixedModuleId && (
            <FormField
              control={form.control}
              name="moduleId"
              rules={{ required: { value: true, message: "El módulo es requerido" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Módulo *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione un módulo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(modulesQuery.data?.data.items ?? []).map((module) => (
                        <SelectItem key={module.id} value={String(module.id)}>
                          {module.name}
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
                <FormLabel>Menú padre</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? null : Number(value))
                  }
                  value={field.value ? String(field.value) : "none"}
                  disabled={!moduleId}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sin padre (raíz)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Sin padre (raíz)</SelectItem>
                    {parentOptions.map((menu) => (
                      <SelectItem key={menu.id} value={String(menu.id)}>
                        {menu.menuName}
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
            name="menuName"
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
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icono (lucide-react)</FormLabel>
                <FormControl>
                  <Input placeholder="ej. layout-grid" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ruta (URL)</FormLabel>
                <FormControl>
                  <Input placeholder="/dashboard/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sequence"
            rules={{ required: { value: true, message: "El orden es requerido" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orden (sequence) *</FormLabel>
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
        </CardContent>
      </Card>
    </div>
  );
}
