"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Suspense } from "react";

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
import { useSearchParams } from "next/navigation";
import { resetPasswordService } from "@/features/security/server/db/security.queries";
import { useRouter } from "next/navigation";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(128, "La contraseña no puede exceder 128 caracteres"),
    confirmPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(128, "La contraseña no puede exceder 128 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  if (!token) {
    return (
      <div className="flex h-screen w-full items-center justify-center px-4">
        <Card className="mx-auto w-96">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">
              Token Inválido
            </CardTitle>
            <CardDescription>
              El enlace de restablecimiento de contraseña es inválido o ha
              expirado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/auth/forgot-password")}
              className="w-full"
            >
              Solicitar nuevo enlace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      if (!token) {
      toast.error("No se encontró token");
      return;
    }

      await resetPasswordService({
        token,
        password: values.password,
        passwordConfirmation: values.confirmPassword,
      });

      toast.success("Contraseña restablecida exitosamente");

      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/auth/login");
    } catch (error) {
      console.error("Error al restablecer la contraseña", error);
      toast.error(
        "Error al restablecer la contraseña. Por favor, inténtelo de nuevo."
      );
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="mx-auto w-96">
        <CardHeader>
          <CardTitle className="text-2xl">Restablece tu Contraseña</CardTitle>
          <CardDescription>
            Ingrese su nueva contraseña para restablecer la contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                {/* New Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="password">Nueva Contraseña</FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="password"
                          placeholder="******"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
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
                    ? "Restableciendo..."
                    : "Restablecer Contraseña"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal con Suspense
export default function ResetPasswordPage() {
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
      <ResetPasswordForm />
    </Suspense>
  );
}