"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { loginAction } from "@/features/security/server/actions/security.actions";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      showPassword: false,
      identifier: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const resp = await loginAction({
        identifier: data.identifier,
        password: data.password,
      });

      await Promise.all([
        window.cookieStore.set("accessToken", resp.data.accessToken),
        window.cookieStore.set("refreshToken", resp.data.refreshToken),
        window.cookieStore.set("user", JSON.stringify(resp.data)),
      ]);

      router.push("/dashboard/people");
    } catch {
      alert("Hubo un error al iniciar sesión");
    }
  });

  const showPassword = form.watch("showPassword");

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="">
        <CardHeader>
          <CardDescription className="flex justify-center">
            <Image
              src="/images/GAMDR_escudo azul.png"
              alt="GAMDR"
              width={124}
              height={124}
            />
          </CardDescription>
          <CardTitle className="text-2xl text-center">
            CAMAL MUNICIPAL DE RIOBAMBA
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Tabs defaultValue="identification">
                  <TabsList className="mb-4">
                    <TabsTrigger
                      value="identification"
                      disabled={form.formState.isSubmitting}
                    >
                      Identificación
                    </TabsTrigger>
                    <TabsTrigger
                      value="email"
                      disabled={form.formState.isSubmitting}
                    >
                      Correo Electrónico
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="identification" className="grid gap-3">
                    <Label htmlFor="email">Identificación</Label>
                    <Input
                      id="email"
                      type="text"
                      disabled={form.formState.isSubmitting}
                      placeholder="Ingrese su identificación"
                      maxLength={10}
                      required
                      {...form.register("identifier")}
                    />
                  </TabsContent>
                  <TabsContent value="email" className="grid gap-3">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      disabled={form.formState.isSubmitting}
                      placeholder="Ingrese su correo electrónico"
                      maxLength={100}
                      required
                      {...form.register("identifier")}
                    />
                  </TabsContent>
                </Tabs>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="flex gap-x-2">
                  <Input
                    id="password"
                    {...form.register("password")}
                    type={showPassword ? "text" : "password"}
                    disabled={form.formState.isSubmitting}
                    required
                  />
                  <Button
                    type="button"
                    onClick={() => form.setValue("showPassword", !showPassword)}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </Button>
                </div>
              </div>
              <div>
                <Label>
                  Recordarme
                  <Checkbox />
                </Label>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  className="w-full disabled:opacity-60"
                  disabled={
                    form.formState.isSubmitting || !form.formState.isDirty
                  }
                >
                  {form.formState.isSubmitting
                    ? "Iniciando..."
                    : "Inciar Sesión"}
                </Button>
                {/* <Button variant="outline" className="w-full">
                  Login with Google
                </Button> */}
              </div>
            </div>
            {/* <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div> */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
