"use client";

import { LayoutGridIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { getBodyPartsService } from "@/features/body-parts/server/db/body-parts.service";
import { BODY_PARTS_TAG } from "@/features/body-parts/constants/body-parts.constants";
import { NewSettingSignsBodyForm } from "./new-setting-signs-body";

export function SettingSignsBodyFormFields() {
  const form = useFormContext<NewSettingSignsBodyForm>();
  const { data: bodyPartsResponse } = useQuery({
    queryKey: [BODY_PARTS_TAG],
    queryFn: getBodyPartsService,
  });
  const bodyParts = bodyPartsResponse?.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <LayoutGridIcon /> Parte del Cuerpo del Signo Clínico
          </CardTitle>
          <CardDescription>
            Define la parte del cuerpo en la que se detecta este signo
            clínico.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-x-2 items-start">
          <FormField
            control={form.control}
            name="idBodyParts"
            rules={{
              required: {
                value: true,
                message: "La parte del cuerpo es requerida",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parte del Cuerpo *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione una parte del cuerpo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bodyParts.map((bodyPart) => (
                      <SelectItem key={bodyPart.id} value={String(bodyPart.id)}>
                        {bodyPart.description}
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
