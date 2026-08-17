"use client";

import { Building2Icon, TriangleAlertIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
import { getActiveCompanyTypesService } from "@/features/company-type/server/db/company-type.service";
import { NewVisitorCompanyForm } from "./new-visitor-company";

export function VisitorCompanyFormFields({ showStatus = false }: { showStatus?: boolean }) {
  const form = useFormContext<NewVisitorCompanyForm>();

  const companyTypesQuery = useQuery({
    queryKey: ["company-type", "all-active"],
    queryFn: getActiveCompanyTypesService,
  });

  const companyTypes = companyTypesQuery.data?.data ?? [];
  const noCompanyTypes = !companyTypesQuery.isLoading && companyTypes.length === 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Building2Icon /> Información de la Empresa Visitante
          </CardTitle>
          <CardDescription>
            Define los datos de la empresa que ingresará como visitante.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 items-start">
          <FormField
            control={form.control}
            name="name"
            rules={{
              required: {
                value: true,
                message: "El nombre de la empresa es requerido",
              },
              maxLength: {
                value: 200,
                message: "El nombre no puede tener más de 200 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem className="col-span-1 sm:col-span-2">
                <FormLabel>Nombre <RequiredMark /></FormLabel>
                <FormControl>
                  <Input {...field} maxLength={200} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ruc"
            rules={{
              required: {
                value: true,
                message: "El RUC es requerido",
              },
              maxLength: {
                value: 15,
                message: "El RUC no puede tener más de 15 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>RUC <RequiredMark /></FormLabel>
                <FormControl>
                  <Input {...field} maxLength={15} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="idCompanyType"
            rules={{
              required: {
                value: true,
                message: "El tipo de empresa es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Empresa <RequiredMark /></FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={noCompanyTypes}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          noCompanyTypes
                            ? "No hay tipos de empresa disponibles"
                            : "Seleccione un tipo de empresa"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companyTypes.map((companyType) => (
                      <SelectItem key={companyType.id} value={String(companyType.id)}>
                        {companyType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {noCompanyTypes && (
                  <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
                    <TriangleAlertIcon className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      No hay tipos de empresa activos. Crea uno primero en la pantalla
                      de Tipos de Empresa.
                    </span>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={20} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            rules={{
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "El correo electrónico no es válido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input {...field} type="email" maxLength={150} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-1 sm:col-span-2">
                <FormLabel>Dirección</FormLabel>
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
              rules={{
                required: {
                  value: true,
                  message: "El estado es requerido",
                },
              }}
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
