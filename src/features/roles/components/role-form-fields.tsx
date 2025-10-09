"use client";

import { UsersIcon } from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { NewRoleForm } from "./new-role";

export function NewRoleFields({ isUpdate = false }: { isUpdate?: boolean }) {
  const form = useFormContext<NewRoleForm>();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <UsersIcon /> Información Básica
          </CardTitle>
          <CardDescription>
            Define el nombre y descripción del nuevo rol del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-2 items-start">
          <FormField
            control={form.control}
            name="name"
            rules={{
              required: {
                value: true,
                message: "El nombre del rol es requerido",
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
            name="description"
            rules={{
              required: {
                value: true,
                message: "La descripción del es requerida",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción del rol *</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <UsersIcon /> Información Básica
          </CardTitle>
          <CardDescription>
            Define el nombre y descripción del nuevo rol del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
          {form.formState.isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <p>Cargando...</p>
            </div>
          ) : (
            form.formState?.defaultValues?.modules?.map((module) => (
              <Accordion
                key={module?.id}
                type="single"
                collapsible
                className="border rounded-lg px-4"
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger>{module?.name}</AccordionTrigger>
                  <AccordionContent>
                    {module?.menus?.map((menu) => {
                      return (
                        <div key={menu?.id}>
                          {menu?.menuName}
                          <div className="space-y-2 mt-2">
                            {menu?.administrationMenuChildren?.map(
                              (menuChild) => {
                                return (
                                  <div
                                    key={menuChild?.id}
                                    className="rounded-md flex items-center justify-between border px-4 py-4"
                                  >
                                    <div>{menuChild?.menuName}</div>
                                    <div className="flex gap-x-2">
                                      {menuChild?.permissions?.map(
                                        (permision) => (
                                          <div key={permision?.id}>
                                            <Label>
                                              <Checkbox />
                                              {permision?.name}
                                            </Label>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
