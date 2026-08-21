"use client";

import { MapPinIcon } from "lucide-react";
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
import { NewProductAnatomicalLocationForm } from "./new-product-anatomical-location";

export function ProductAnatomicalLocationFormFields() {
  const form = useFormContext<NewProductAnatomicalLocationForm>();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <MapPinIcon /> Ubicación Anatómica
          </CardTitle>
          <CardDescription>
            Define el código, nombre y región corporal de la ubicación
            anatómica.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-2 items-start">
          <FormField
            control={form.control}
            name="code"
            rules={{
              required: {
                value: true,
                message: "El código de la ubicación es requerido",
              },
              maxLength: {
                value: 10,
                message: "El código no puede tener más de 10 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código *</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={10} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            rules={{
              required: {
                value: true,
                message: "El nombre de la ubicación es requerido",
              },
              maxLength: {
                value: 100,
                message: "El nombre no puede tener más de 100 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={100} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bodyRegion"
            rules={{
              maxLength: {
                value: 50,
                message: "La región corporal no puede tener más de 50 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Región Corporal</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={50} />
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
