"use client";

import { Settings2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RequiredMark } from "@/components/ui/required-mark";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { UpdateSpeciesProductGenerationConfigForm } from "./update-species-product-generation-config";

export function SpeciesProductGenerationConfigFormFields() {
  const form = useFormContext<UpdateSpeciesProductGenerationConfigForm>();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Settings2 /> Configuración de Generación
          </CardTitle>
          <CardDescription>
            Define si esta especie genera productos y/o subproductos al
            momento del pesaje.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-x-2 items-start">
          <FormField
            control={form.control}
            name="generateProducts"
            rules={{
              required: {
                value: true,
                message: "Este campo es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Genera Productos <RequiredMark />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Sí</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="generateSubproducts"
            rules={{
              required: {
                value: true,
                message: "Este campo es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Genera Subproductos <RequiredMark />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Sí</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
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
                <FormLabel>
                  Estado <RequiredMark />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
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
        </CardContent>
      </Card>
    </div>
  );
}
