"use client";

import { Factory } from "lucide-react";
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
import { NewSlaughterhouseForm } from "./new-slaughterhouse";

export function SlaughterhouseFormFields() {
  const form = useFormContext<NewSlaughterhouseForm>();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Factory /> Información del Camal
          </CardTitle>
          <CardDescription>
            Datos institucionales base del camal.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-2 items-start">
          <FormField
            control={form.control}
            name="code"
            rules={{
              required: {
                value: true,
                message: "El código es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código *</FormLabel>
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
            rules={{
              required: {
                value: true,
                message: "El nombre es requerido",
              },
            }}
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
            name="enablingCode"
            rules={{
              required: {
                value: true,
                message: "El código habilitante es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Código habilitante *</FormLabel>
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
            rules={{
              required: {
                value: true,
                message: "La descripción es requerida",
              },
            }}
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Descripción *</FormLabel>
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
