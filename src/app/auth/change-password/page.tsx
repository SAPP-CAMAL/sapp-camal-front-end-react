"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Suspense } from "react";
import { ShieldAlertIcon } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { useSearchParams, useRouter } from "next/navigation";
import { completeMandatoryPasswordChangeService } from "@/features/security/server/db/security.queries";
import { getApiErrorMessage } from "@/lib/error-handler";

const formSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(128, "La contraseña no puede exceder 128 caracteres"),
    confirmPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(128, "La contraseña no puede exceder 128 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

function ChangePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  if (!token) {
    return (
      <div className="flex h-screen w-full items-center justify-center px-4">
        <Card className="mx-auto w-96">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">
              Enlace inválido
            </CardTitle>
            <CardDescription>
              No se encontró el token de cambio de contraseña. Vuelva a
              iniciar sesión.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/auth/login")} className="w-full">
              Ir a iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await completeMandatoryPasswordChangeService({
        token: token as string,
        newPassword: values.newPassword,
        passwordConfirmation: values.confirmPassword,
      });

      toast.success("Contraseña actualizada correctamente");

      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/auth/login");
    } catch (error) {
      const message = await getApiErrorMessage(error);
      toast.error(message || "No se pudo actualizar la contraseña. Intente nuevamente.");
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="mx-auto w-96">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <ShieldAlertIcon className="h-5 w-5" />
            <CardTitle className="text-2xl">Actualiza tu contraseña</CardTitle>
          </div>
          <CardDescription>
            Por seguridad debe establecer una nueva contraseña antes de
            continuar. No puede ser igual a ninguna de sus últimas 3
            contraseñas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="newPassword">Nueva Contraseña</FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="newPassword"
                          placeholder="******"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="confirmPassword">
                        Confirmar Contraseña
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="confirmPassword"
                          placeholder="******"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? "Actualizando..."
                    : "Actualizar Contraseña"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center px-4">
          <Card className="mx-auto w-96 animate-pulse">
            <CardHeader>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ChangePasswordForm />
    </Suspense>
  );
}
