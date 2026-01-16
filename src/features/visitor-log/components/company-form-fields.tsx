"use client";

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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCompanyTypes } from "@/features/catalogues/hooks/use-catalogue";
import { validateDocumentTypeService } from "@/features/people/server/db/people.service";

export function NewCompanyFields() {
  const companyTypes = useCompanyTypes();

  const form = useFormContext();

  return (
    <>
      <FormField
        control={form.control}
        name="type"
        rules={{
          required: {
            value: true,
            message: "El tipo de empresa es requerida",
          },
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Empresa *</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione el tipo de empresa" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {companyTypes.data?.data?.map((companyType, index) => (
                  <SelectItem key={index} value={String(companyType.id)}>
                    {companyType.name}
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
        name="identification"
        rules={{
          required: {
            value: true,
            message: "El número de documento es requerido",
          },
          validate: {
            validateDocumentTypeService: async (value) => {
              if (value.length !== 13)
                return "El número de documento debe tener 13 caracteres";

              try {
                await validateDocumentTypeService("RUCN", value);
                return true;
              } catch (error: any) {
                const { data } = await error.response.json();
                return data;
              }
            },
          },
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Documento *</FormLabel>
            <FormControl>
              <Input {...field} className="border-gray-200" />
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
            message: "El campo nombre de la empresa es requerido",
          },
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de la Empresa *</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teléfono</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>Dirección</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
