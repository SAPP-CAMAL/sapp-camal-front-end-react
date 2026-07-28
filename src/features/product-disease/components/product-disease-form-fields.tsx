"use client";

import { LinkIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { getProductsService } from "@/features/product/server/db/product.service";
import { PRODUCT_TAG } from "@/features/product/constants/product.constants";
import { getDiseasesService } from "@/features/disease/server/db/disease.service";
import { DISEASE_TAG } from "@/features/disease/constants/disease.constants";
import { getDiseaseGroupsService } from "@/features/disease-group/server/db/disease-group.service";
import { DISEASE_GROUP_TAG } from "@/features/disease-group/constants/disease-group.constants";
import { NewProductDiseaseForm } from "./new-product-disease";

export function ProductDiseaseFormFields() {
  const form = useFormContext<NewProductDiseaseForm>();

  const { data: productsResponse } = useQuery({
    queryKey: [PRODUCT_TAG],
    queryFn: getProductsService,
  });
  const { data: diseasesResponse } = useQuery({
    queryKey: [DISEASE_TAG],
    queryFn: getDiseasesService,
  });
  const { data: diseaseGroupsResponse } = useQuery({
    queryKey: [DISEASE_GROUP_TAG],
    queryFn: getDiseaseGroupsService,
  });

  const products = productsResponse?.data ?? [];
  const diseases = diseasesResponse?.data ?? [];
  const diseaseGroups = diseaseGroupsResponse?.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <LinkIcon /> Regla Producto - Enfermedad
          </CardTitle>
          <CardDescription>
            Define qué enfermedad puede afectar a qué producto/órgano, y a
            qué grupo de enfermedad pertenece.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-x-2 items-start">
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
            name="idDisease"
            rules={{
              required: {
                value: true,
                message: "La enfermedad es requerida",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enfermedad <RequiredMark /></FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione una enfermedad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {diseases.map((disease) => (
                      <SelectItem key={disease.id} value={String(disease.id)}>
                        {disease.names}
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
            name="idDiseaseGroup"
            rules={{
              required: {
                value: true,
                message: "El grupo de enfermedad es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grupo de Enfermedad <RequiredMark /></FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un grupo de enfermedad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {diseaseGroups.map((diseaseGroup) => (
                      <SelectItem
                        key={diseaseGroup.id}
                        value={String(diseaseGroup.id)}
                      >
                        {diseaseGroup.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
