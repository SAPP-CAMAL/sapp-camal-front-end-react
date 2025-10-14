"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { forgotPasswordService } from "@/features/security/server/db/security.queries";
import Link from "next/link";

const formSchema = z.object({
  email: z.email(),
});

export default function ForgetPasswordPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Assuming a function to send reset email
      console.log(values);

      await forgotPasswordService(values.email);

      toast.success(
        "Se ha enviado un email para restablecer la contraseña. Por favor revise su correo."
      );
    } catch (error) {
      console.error(
        "Error enviando el enlace de restablecimiento de contraseña",
        error
      );
      toast.error(
        "Error enviando el enlace de restablecimiento de contraseña. Por favor, inténtelo de nuevo."
      );
    }
  }

  return (
    <div className="flex h-screen items-center justify-center px-4">
      <Card className="mx-auto w-96">
        <CardHeader>
          <CardTitle className="text-2xl">Olvidaste tu contraseña?</CardTitle>
          <CardDescription>
            Ingresa tu email y te enviaremos un enlace para restablecer tu
            contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="email">Correo electrónico</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="johndoe@mail.com"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/login"
                    className="h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 bg-primary-foreground text-primary shadow-xs hover:bg-primary/90 flex items-center justify-center border border-primary"
                  ><span className="hover:text-primary-foreground w-full text-center">
                    Cancelar
                  </span>
                  </Link>
                  <Button
                    disabled={form.formState.isSubmitting}
                    type="submit"
                    // className="w-full"
                    >
                    {form.formState.isSubmitting
                      ? "Enviando..."
                      : "Enviar"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
