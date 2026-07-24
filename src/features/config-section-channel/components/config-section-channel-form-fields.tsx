"use client";

import { RectangleHorizontalIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewConfigSectionChannelForm } from "./new-config-section-channel";

export function ConfigSectionChannelFormFields() {
  const form = useFormContext<NewConfigSectionChannelForm>();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <RectangleHorizontalIcon /> Información de la Sección
          </CardTitle>
          <CardDescription>
            Define el código, orden y descripción de la sección del canal.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-2 items-start">
          <FormField
            control={form.control}
            name="sectionCode"
            rules={{
              required: {
                value: true,
                message: "El código de la sección es requerido",
              },
              maxLength: {
                value: 5,
                message: "El código no puede tener más de 5 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código *</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="orderNumber"
            rules={{
              required: {
                value: true,
                message: "El número de orden es requerido",
              },
              min: {
                value: 1,
                message: "El número de orden debe ser al menos 1",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Orden *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea {...field} />
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
