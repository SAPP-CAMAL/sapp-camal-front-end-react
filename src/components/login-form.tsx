"use client";

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
import { toast } from "sonner";
import { loginAction } from "@/features/security/server/actions/security.actions";
import { useSlaughterhouseInfo } from "@/features/slaughterhouse-info";
import { useEffect } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { location } = useSlaughterhouseInfo(); // Usar location.canton
  const form = useForm({
    defaultValues: {
      showPassword: false,
      identifier: "",
      password: "",
      remember: false,
    },
  });

  // Cargar identificador recordado al montar el componente
  useEffect(() => {
    const savedIdentifier = localStorage.getItem("rememberedIdentifier");
    if (savedIdentifier) {
      form.reset({
        ...form.getValues(),
        identifier: savedIdentifier,
        remember: true,
      });
    }
  }, [form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const identifier = data.identifier?.trim();
      console.log("Attempting login with:", identifier);

      const resp = await loginAction({
        identifier,
        password: data.password,
      });

      console.log("Login response received");

      // Manejar la persistencia del identificador si "Recuérdame" está marcado
      if (data.remember) {
        localStorage.setItem("rememberedIdentifier", identifier);
      } else {
        localStorage.removeItem("rememberedIdentifier");
      }

      const accessToken = resp.data.accessToken;
      const refreshToken = resp.data.refreshToken;
      const userJson = JSON.stringify(resp.data);

      // --- CAMBIO 1: Configuración de cookies más permisiva para evitar bloqueos ---
      // Usamos "Lax" en lugar de "Strict" para asegurar que la cookie viaje en la redirección inmediata.
      const isProduction = typeof window !== "undefined" && !window.location.hostname.includes("localhost");
      const sameSite = "Lax"; 
      const path = "path=/";
      const secure = isProduction ? "; Secure" : "";
      
      // Cookie Store API
      const cookieStore: any = (typeof window !== "undefined")
        ? (window as any).cookieStore
        : undefined;

      if (cookieStore?.set) {
        try {
          await cookieStore.set("accessToken", accessToken, {
            path: "/",
            secure: isProduction,
            sameSite: sameSite,
          });
          await cookieStore.set("refreshToken", refreshToken, {
            path: "/",
            secure: isProduction,
            sameSite: sameSite,
          });
          await cookieStore.set("user", userJson, {
            path: "/",
            secure: isProduction,
            sameSite: sameSite,
          });
        } catch {
          // Fallback manual si falla la API
          document.cookie = `accessToken=${encodeURIComponent(accessToken)}; ${path}; SameSite=${sameSite}${secure}`;
          document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; ${path}; SameSite=${sameSite}${secure}`;
          document.cookie = `user=${encodeURIComponent(userJson)}; ${path}; SameSite=${sameSite}${secure}`;
        }
      } else {
        // Fallback estándar
        document.cookie = `accessToken=${encodeURIComponent(accessToken)}; ${path}; SameSite=${sameSite}${secure}`;
        document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; ${path}; SameSite=${sameSite}${secure}`;
        document.cookie = `user=${encodeURIComponent(userJson)}; ${path}; SameSite=${sameSite}${secure}`;
      }

      // LocalStorage backup
      try {
        window.localStorage.setItem("accessToken", accessToken);
        window.localStorage.setItem("refreshToken", refreshToken);
        window.localStorage.setItem("user", userJson);
        // Limpiar el rol activo para que siempre muestre el primer rol del listado al iniciar sesión
        window.localStorage.removeItem("activeRoleId");
      } catch { /* ignore */ }

      console.log("Tokens stored, redirecting...");
      
      toast.success("Bienvenido");

      // Redirigir al dashboard después de guardar cookies
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);

    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Hubo un error al iniciar sesión. Por favor, intente nuevamente.";
      let errorDescription = "";

      try {
        const statusCode = error?.response?.status;
        
        if (statusCode === 400 || statusCode === 401) {
          errorMessage = "Credenciales incorrectas";
          errorDescription = "El usuario o la contraseña ingresados no son válidos. Verifique sus datos e intente nuevamente.";
        } else if (statusCode === 403) {
          errorMessage = "Acceso denegado";
          errorDescription = "Su cuenta no tiene permisos para acceder. Contacte al administrador.";
        } else if (statusCode === 404) {
          errorMessage = "Usuario no encontrado";
          errorDescription = "No existe una cuenta con ese usuario o correo electrónico.";
        } else if (statusCode === 429) {
          errorMessage = "Demasiados intentos";
          errorDescription = "Ha excedido el límite de intentos. Espere unos minutos antes de intentar nuevamente.";
        } else if (statusCode >= 500) {
          errorMessage = "Error del servidor";
          errorDescription = "El servidor no está disponible en este momento. Intente más tarde.";
        } else if (error?.response) {
          const errorData = await error.response.json();
          errorMessage = errorData?.data || errorMessage;
        } else if (error?.message?.includes("fetch") || error?.message?.includes("network")) {
          errorMessage = "Error de conexión";
          errorDescription = "No se pudo conectar con el servidor. Verifique su conexión a internet.";
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }

      toast.error(errorMessage, {
        description: errorDescription || undefined,
        duration: 5000,
      });
    }
  });

  const showPassword = form.watch("showPassword");

  return (
    <div
      className="h-screen w-screen flex m-0 p-0 overflow-hidden"
      data-login-page
    >
      {/* Left side - Image (70%) */}
      <div className="hidden lg:flex lg:w-[70%] relative bg-white items-center justify-center">
        <Image
          src="/images/sapp-fondo-ingreso.svg"
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
          <div className="flex flex-col items-center mb-4">
            <div className="mb-3 bg-gradient-to-br bg-primary p-2.5 rounded-2xl shadow-lg">
              <Image
                src="/images/sapp-b-vertical.svg"
                alt="SAPP"
                width={50}
                height={50}
                priority
                className="w-[50px] h-[50px]"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <h1 className="text-sm sm:text-base font-bold text-center mb-1 text-black-important leading-tight">
              EMPRESA PÚBLICA MUNICIPAL DE FAENAMIENTO Y CÁRNICOS
            </h1>
            <p className="text-xs text-primary text-center font-bold">
              DE {location.canton}
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
                <TabsContent
                  value="identification"
                  className="space-y-1.5 mt-0"
                >
                  <Label
                    htmlFor="identification"
                    className="text-xs font-medium text-slate-700"
                  >
                    Usuario
                  </Label>
                  <Input
                    id="identification"
                    type="text"
                    disabled={form.formState.isSubmitting}
                    placeholder="Nombre de usuario"
                    maxLength={100}
                    autoComplete="username"
                    required
                    className="h-10 text-sm"
                    {...form.register("identifier")}
                  />
                </TabsContent>
                <TabsContent value="email" className="space-y-1.5 mt-0">
                  <Label
                    htmlFor="email-input"
                    className="text-xs font-medium text-slate-700"
                  >
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
                <Label
                  htmlFor="password"
                  className="text-xs font-medium text-slate-700"
                >
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
                <Checkbox
                  id="remember"
                  className="border-slate-300 h-4 w-4"
                  checked={form.watch("remember")}
                  onCheckedChange={(checked) =>
                    form.setValue("remember", checked as boolean)
                  }
                />
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
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
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