"use client";

import { TruckIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RequiredMark } from "@/components/ui/required-mark";
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
import { useAllOrigins } from "@/features/origin/hooks";
import { ShippingCombobox } from "./shipping-combobox";
import { IntroducerCombobox } from "./introducer-combobox";
import { NewDistributionProductForm } from "./new-distribution-product";

export function DistributionProductFormFields() {
  const form = useFormContext<NewDistributionProductForm>();
  const originsQuery = useAllOrigins();

  const activeOrigins = (originsQuery.data?.data ?? []).filter(
    (o) => o.status
  );

  const withLoad = form.watch("withLoad");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <TruckIcon /> Información del Despacho
          </CardTitle>
          <CardDescription>
            Define el envío, introductor y origen del despacho de productos
            de distribución.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="idShipping"
            rules={{ required: { value: true, message: "El envío es requerido" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Envío <RequiredMark /></FormLabel>
                <FormControl>
                  <ShippingCombobox value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="idIntroducer"
            rules={{ required: { value: true, message: "El introductor es requerido" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Introductor <RequiredMark /></FormLabel>
                <FormControl>
                  <IntroducerCombobox
                    value={field.value}
                    onChange={(introducer) => field.onChange(introducer.id)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="idOrigin"
            rules={{ required: { value: true, message: "El origen es requerido" } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origen <RequiredMark /></FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  value={field.value ? String(field.value) : ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un origen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activeOrigins.map((origin) => (
                      <SelectItem key={origin.id} value={String(origin.id)}>
                        {origin.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              rules={{ required: { value: true, message: "La hora de inicio es requerida" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora de inicio <RequiredMark /></FormLabel>
                  <FormControl>
                    <Input {...field} type="time" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora de fin</FormLabel>
                  <FormControl>
                    <Input {...field} type="time" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="withLoad"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">¿Hubo carga?</FormLabel>
              </FormItem>
            )}
          />

          {withLoad && (
            <FormField
              control={form.control}
              name="detailLoad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalle de la carga</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="commentary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comentario</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
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
