"use client";

import { ScaleIcon } from "lucide-react";
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
import { getProductsService } from "@/features/product/server/db/product.service";
import { PRODUCT_TAG } from "@/features/product/constants/product.constants";
import { NewAvgOrgansSpeciesForm } from "./new-avg-organs-species";

export function AvgOrgansSpeciesFormFields({
  showStatus = false,
}: {
  showStatus?: boolean;
}) {
  const form = useFormContext<NewAvgOrgansSpeciesForm>();
  const { data: speciesResponse } = useAllSpecies();
  const { data: productsResponse } = useQuery({
    queryKey: [PRODUCT_TAG],
    queryFn: getProductsService,
  });

  const species = speciesResponse?.data ?? [];
  const products = productsResponse?.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <ScaleIcon /> Peso Promedio de Órgano por Especie
          </CardTitle>
          <CardDescription>
            Define el peso de referencia esperado para un producto/órgano en
            una especie, usado en control de calidad postmortem.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-2 items-start">
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
                <FormLabel>Especie <RequiredMark /></FormLabel>
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
            name="idProduct"
            rules={{
              required: {
                value: true,
                message: "El producto es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Producto <RequiredMark /></FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un producto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={String(product.id)}>
                        {product.description}
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
            name="avgWeight"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Peso Promedio (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : e.target.valueAsNumber
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
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
                <FormItem className="col-span-2">
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
