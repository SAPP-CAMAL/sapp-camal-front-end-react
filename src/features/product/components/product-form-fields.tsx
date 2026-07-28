"use client";

import { PackageIcon } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { getProductsService } from "../server/db/product.service";
import { PRODUCT_TAG } from "../constants/product.constants";
import { NewProductForm } from "./new-product";

export function ProductFormFields({
  excludeId,
}: {
  excludeId?: number;
}) {
  const form = useFormContext<NewProductForm>();
  const { data: productsResponse } = useQuery({
    queryKey: [PRODUCT_TAG],
    queryFn: getProductsService,
  });
  const parentOptions = (productsResponse?.data ?? []).filter(
    (product) => product.productType && product.id !== excludeId
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <PackageIcon /> Información del Producto
          </CardTitle>
          <CardDescription>
            Define la descripción, código y jerarquía del producto/órgano de
            inspección.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-2 items-start">
          <FormField
            control={form.control}
            name="description"
            rules={{
              required: {
                value: true,
                message: "La descripción del producto es requerida",
              },
              maxLength: {
                value: 100,
                message: "La descripción no puede tener más de 100 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción <RequiredMark /></FormLabel>
                <FormControl>
                  <Input {...field} maxLength={100} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            rules={{
              maxLength: {
                value: 20,
                message: "El código no puede tener más de 20 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={20} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productType"
            rules={{
              required: {
                value: true,
                message: "El tipo de producto es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo <RequiredMark /></FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "true")}
                  value={
                    field.value === undefined ? undefined : String(field.value)
                  }
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Producto</SelectItem>
                    <SelectItem value="false">Sub-producto</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Producto Padre</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? undefined : Number(value))
                  }
                  value={field.value ? String(field.value) : "none"}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sin padre (raíz)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Sin padre (raíz)</SelectItem>
                    {parentOptions.map((product) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
