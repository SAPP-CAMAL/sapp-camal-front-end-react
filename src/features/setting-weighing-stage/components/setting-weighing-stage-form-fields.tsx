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
import { getWeighingStagesService } from "@/features/weighing-stage/server/db/weighing-stage.service";
import { NewSettingWeighingStageForm } from "./new-setting-weighing-stage";

export function SettingWeighingStageFormFields({
  excludedIds = [],
}: {
  excludedIds?: number[];
}) {
  const form = useFormContext<NewSettingWeighingStageForm>();

  const stagesQuery = useQuery({
    queryKey: ["weighing-stages"],
    queryFn: getWeighingStagesService,
  });

  const excluded = new Set(excludedIds);
  const availableStages = (stagesQuery.data?.data ?? []).filter(
    (stage) => stage.status && !excluded.has(stage.id)
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <ScaleIcon /> Etapa de Pesaje Habilitada
          </CardTitle>
          <CardDescription>
            Selecciona la etapa de pesaje y define una descripción opcional
            para el flujo de distribución.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="idWeighingStage"
            rules={{ required: { value: true, message: "La etapa de pesaje es requerida" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etapa de Pesaje *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione una etapa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableStages.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">
                        No hay etapas disponibles
                      </div>
                    ) : (
                      availableStages.map((stage) => (
                        <SelectItem key={stage.id} value={String(stage.id)}>
                          {stage.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={200} />
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
