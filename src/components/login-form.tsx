"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
      console.log("Attempting login with:", data.identifier);

      const resp = await loginAction({
        identifier: data.identifier,
        password: data.password,
      });

      console.log("Login response received");

      await Promise.all([
        window.cookieStore.set("accessToken", resp.data.accessToken),
        window.cookieStore.set("refreshToken", resp.data.refreshToken),
        window.cookieStore.set("user", JSON.stringify(resp.data)),
      ]);

      console.log("Tokens stored, redirecting...");

      router.push("/dashboard/people");
    } catch (error) {
      console.error("Login error:", error);
      alert("Hubo un error al iniciar sesión");
    }
  });

  const showPassword = form.watch("showPassword");

  return (
    <div className="h-screen w-screen flex m-0 p-0 overflow-hidden" data-login-page>
      {/* Left side - Image (70%) */}
      <div className="hidden lg:flex lg:w-[70%] relative bg-white items-center justify-center">
        <Image
          src="/images/sapp-loggin.png"
          alt="SAPP Login"
          width={1200}
          height={1200}
          priority
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right side - Form with gradient background (30%) */}
      <div className="w-full lg:w-[30%] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 xl:p-10 bg-gradient-to-br from-[#0ea38d] via-[#0d9179] to-[#0b7f68] overflow-y-auto">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 sm:p-7 lg:p-8">
            {/* Header with logo */}
            <div className="flex flex-col items-center mb-6">
              <div className="mb-4 bg-gradient-to-br bg-primary p-3 rounded-2xl shadow-lg">
                <Image
                  src="/images/sapp-b-vertical.png"
                  alt="SAPP"
                  width={60}
                  height={60}
                  priority
                  className="w-[60px] h-[60px]"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-center text-slate-800 mb-1">
                CAMAL MUNICIPAL
              </h1>
              <p className="text-xs text-primary text-center font-bold">
                DE RIOBAMBA
              </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Tabs for identification/email */}
              <div className="space-y-2">
                <Tabs defaultValue="identification">
                  <TabsList className="grid w-full grid-cols-2 mb-3 h-9">
                    <TabsTrigger
                      value="identification"
                      disabled={form.formState.isSubmitting}
                      className="text-xs"
                    >
                      Identificación
                    </TabsTrigger>
                    <TabsTrigger
                      value="email"
                      disabled={form.formState.isSubmitting}
                      className="text-xs"
                    >
                      Correo
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="identification" className="space-y-1.5 mt-0">
                    <Label htmlFor="identification" className="text-xs font-medium text-slate-700">
                      Usuario
                    </Label>
                    <Input
                      id="identification"
                      type="text"
                      disabled={form.formState.isSubmitting}
                      placeholder="A0401300033"
                      maxLength={10}
                      autoComplete="username"
                      required
                      className="h-10 text-sm"
                      {...form.register("identifier")}
                    />
                  </TabsContent>
                  <TabsContent value="email" className="space-y-1.5 mt-0">
                    <Label htmlFor="email-input" className="text-xs font-medium text-slate-700">
                      Correo Electrónico
                    </Label>
                    <Input
                      id="email-input"
                      type="email"
                      disabled={form.formState.isSubmitting}
                      placeholder="usuario@ejemplo.com"
                      maxLength={100}
                      autoComplete="email"
                      required
                      className="h-10 text-sm"
                      {...form.register("identifier")}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-slate-700">
                    Contraseña
                  </Label>
                </div>
                <div className="flex items-center">
                  <Input
                    id="password"
                    {...form.register("password")}
                    type={showPassword ? "text" : "password"}
                    disabled={form.formState.isSubmitting}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-10 text-sm w-full"
                    required
                  />
                  <button
                    type="button"
                    className="h-10 w-10 flex items-center justify-center hover:bg-transparent transition-colors focus:outline-none"
                    onClick={() => form.setValue("showPassword", !showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4 text-slate-500" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>


              <div className="flex items-center justify-between pt-2">
                {/* Remember me checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="border-slate-300 h-4 w-4" />
                  <Label
                    htmlFor="remember"
                    className="text-xs font-normal text-slate-600 cursor-pointer"
                    >
                    Recuérdame
                  </Label>
                </div>
                 <Link
                    href="/auth/forgot-password"
                    className="text-[10px] text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full h-11 text-sm text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 mt-5"
                disabled={
                  form.formState.isSubmitting || !form.formState.isDirty
                }
              >
                {form.formState.isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Iniciando...
                  </span>
                ) : (
                  "INGRESAR"
                )}
              </Button>

              {/* Registration link */}
              {/* <div className="text-center pt-3">
                <p className="text-xs text-slate-600">
                  ¿Deseas registrarte?{" "}
                  <Link
                    href="#"
                    className="font-medium text-primary hover:underline"
                  >
                    Registrarte
                  </Link>
                </p>
              </div> */}
            </form>
          </div>
        </div>
    </div>
  );
}
