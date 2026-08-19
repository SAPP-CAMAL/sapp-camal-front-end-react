"use client";

import { PackageSearch } from "lucide-react";
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
import { useAllSpecies } from "@/features/specie/hooks";
import { getAllAnimalSex } from "@/features/animal-sex/server/db/animal-sex.service";
import { getAllProductTypesService } from "@/features/product-type/server/db/product-type.service";
import { NewSpeciesProductForm } from "./new-species-product";

export function SpeciesProductFormFields() {
  const form = useFormContext<NewSpeciesProductForm>();

  const speciesQuery = useAllSpecies();
  const animalSexQuery = useQuery({
    queryKey: ["animal-sex-list-for-select"],
    queryFn: getAllAnimalSex,
  });
  const productTypeQuery = useQuery({
    queryKey: ["product-type-list-for-select"],
    queryFn: getAllProductTypesService,
  });

  const species = speciesQuery.data?.data ?? [];
  const animalSexes = animalSexQuery.data?.data ?? [];
  const productTypes = productTypeQuery.data?.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <PackageSearch /> Producto por Especie
          </CardTitle>
          <CardDescription>
            Define qué productos existen por especie y sexo de animal.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-2 items-start">
          <FormField
            control={form.control}
            name="idSpecies"
            rules={{
              required: { value: true, message: "La especie es requerida" },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especie *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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
            name="idProductType"
            rules={{
              required: {
                value: true,
                message: "El tipo de producto es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de producto *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {productTypes.map((productType) => (
                      <SelectItem
                        key={productType.id}
                        value={String(productType.id)}
                      >
                        {productType.typeName}
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
            name="idAnimalSex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo del animal</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Todos</SelectItem>
                    {animalSexes.map((animalSex) => (
                      <SelectItem
                        key={animalSex.id}
                        value={String(animalSex.id)}
                      >
                        {animalSex.name}
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
            name="displayOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orden de visualización</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min={1} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productCode"
            rules={{
              required: {
                value: true,
                message: "El código del producto es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código del producto *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productName"
            rules={{
              required: {
                value: true,
                message: "El nombre del producto es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del producto *</FormLabel>
                <FormControl>
                  <Input {...field} />
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
