"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Mail, CheckCircle2, Loader2 } from "lucide-react";

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
  email: z.email("Por favor, introduzca un correo electrónico válido."),
});

export default function ForgetPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await forgotPasswordService(values.email);
      setSentEmail(values.email);
      setEmailSent(true);
      toast.success("Correo enviado exitosamente");
    } catch (error) {
      console.error(
        "Error enviando el enlace de restablecimiento de contraseña",
        error
      );
      toast.error(
        "Error enviando el enlace. Por favor, inténtelo de nuevo."
      );
    }
  }

  const handleResend = async () => {
    try {
      await forgotPasswordService(sentEmail);
      toast.success("Correo reenviado exitosamente");
    } catch (error) {
      toast.error("Error al reenviar el correo");
    }
  };

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-background to-muted/30">
        <Card className="mx-auto w-full max-w-md shadow-lg border-0 bg-card/95 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-semibold">
              ¡Revisa tu correo!
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Hemos enviado las instrucciones para restablecer tu contraseña a:
            </CardDescription>
            <p className="font-medium text-primary mt-1">{sentEmail}</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <p>
                Si no ves el correo en tu bandeja de entrada, revisa la carpeta
                de spam o correo no deseado.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={handleResend}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Reenviar correo
              </Button>
              <Link href="/auth/login" className="w-full">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-background to-muted/30">
      <Card className="mx-auto w-full max-w-md shadow-lg border-0 bg-card/95 backdrop-blur">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold">
            ¿Olvidaste tu contraseña?
          </CardTitle>
          <CardDescription className="text-base mt-2">
            No te preocupes, ingresa tu correo electrónico y te enviaremos un
            enlace para restablecerla.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="ejemplo@correo.com"
                          type="email"
                          autoComplete="email"
                          className="pl-10 h-11"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3">
                <Button
                  disabled={form.formState.isSubmitting}
                  type="submit"
                  className="w-full h-11"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar enlace"
                  )}
                </Button>
                <Link href="/auth/login" className="w-full">
                  <Button variant="ghost" className="w-full" type="button">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al inicio de sesión
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
