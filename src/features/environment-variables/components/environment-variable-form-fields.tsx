"use client";

import { useState } from "react";
import { KeyRound, EyeIcon, EyeOffIcon } from "lucide-react";
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
import { NewEnvironmentVariableForm } from "./new-environment-variable";

export function EnvironmentVariableFormFields() {
  const form = useFormContext<NewEnvironmentVariableForm>();
  const [showToken, setShowToken] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <KeyRound /> Variable de Entorno
          </CardTitle>
          <CardDescription>
            Configuración técnica sensible (API keys, tokens de
            integraciones externas). El valor se oculta por defecto.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-2 items-start">
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
                  <Input {...field} placeholder="Ej. SLAUGHTERHOUSE_LOGO" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="typeData"
            rules={{
              required: {
                value: true,
                message: "El tipo de dato es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de dato *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ej. string" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="token"
            rules={{
              required: {
                value: true,
                message: "El valor es requerido",
              },
            }}
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Valor *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showToken ? "text" : "password"}
                      autoComplete="off"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowToken((prev) => !prev)}
                      tabIndex={-1}
                    >
                      {showToken ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
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
