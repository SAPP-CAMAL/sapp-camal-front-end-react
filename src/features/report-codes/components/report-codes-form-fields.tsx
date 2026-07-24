"use client";

import { FileTextIcon } from "lucide-react";
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
import { NewReportCodeForm } from "./new-report-code";

export function ReportCodesFormFields() {
  const form = useFormContext<NewReportCodeForm>();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <FileTextIcon /> Información del Código de Reporte
          </CardTitle>
          <CardDescription>
            Define el código maestro y la versión del reporte. Este código es
            usado por las plantillas de reporte y las actas de limpieza y
            desinfección.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            rules={{
              required: {
                value: true,
                message: "El código de reporte es requerido",
              },
              maxLength: {
                value: 100,
                message: "El código no puede tener más de 100 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código *</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={100} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="version"
            rules={{
              maxLength: {
                value: 10,
                message: "La versión no puede tener más de 10 caracteres",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Versión</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={10} placeholder="Ej. 1.0" />
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
