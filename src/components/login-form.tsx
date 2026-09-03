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
import { revalidatePathAction } from "@/features/security/server/actions/revalidate.action";
import { useSlaughterhouseInfo } from "@/features/slaughterhouse-info";
import { useEffect, useState } from "react";

function getLoginErrorMessage(statusCode: number | undefined, fallbackMessage: string) {
  if (statusCode === 400 || statusCode === 401) {
    // El backend ya distingue credenciales inválidas de usuario/persona
    // inactivos con mensajes propios (ver AuthService.login) — mostrar ese
    // mensaje real en vez de pisarlo con uno genérico.
    return {
      errorMessage: fallbackMessage || "Credenciales incorrectas",
      errorDescription: "",
    };
  }
  if (statusCode === 403) {
    return {
      errorMessage: "Acceso denegado",
      errorDescription: "Su cuenta no tiene permisos para acceder. Contacte al administrador.",
    };
  }
  if (statusCode === 404) {
    return {
      errorMessage: "Usuario no encontrado",
      errorDescription: "No existe una cuenta con ese usuario o correo electrónico.",
    };
  }
  if (statusCode === 429) {
    return {
      errorMessage: "Demasiados intentos",
      errorDescription: "Ha excedido el límite de intentos. Espere unos minutos antes de intentar nuevamente.",
    };
  }
  if (statusCode !== undefined && statusCode >= 500) {
    return {
      errorMessage: "Error del servidor",
      errorDescription: "El servidor no está disponible en este momento. Intente más tarde.",
    };
  }
  return { errorMessage: fallbackMessage, errorDescription: "" };
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { location } = useSlaughterhouseInfo(); // Usar location.canton
  // Se mantiene aparte de form.formState.isSubmitting porque ese flag se
  // apaga en cuanto onSubmit resuelve; queremos seguir bloqueando el botón
  // durante la espera previa a la redirección al dashboard.
  const [isRedirecting, setIsRedirecting] = useState(false);
  const form = useForm({
    defaultValues: {
      showPassword: false,
      identifier_ls: "",
      password_ls: "",
      identifier_pt: "",
      password_pt: "",
      remember: false,
    },
  });

  // Cargar identificador recordado al montar el componente
  useEffect(() => {
    const savedIdentifier = localStorage.getItem("rememberedIdentifier");
    if (savedIdentifier) {
      form.reset({
        ...form.getValues(),
        identifier_ls: savedIdentifier,
        identifier_pt: savedIdentifier,
        remember: true,
      });
    }
  }, [form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const identifierRaw = data.identifier_ls || data.identifier_pt;
      const passwordRaw = data.password_ls || data.password_pt;
      const identifier = identifierRaw?.trim(); 
      const resp = await loginAction({
        identifier,
        password: passwordRaw,
      });

      if (!resp.data?.accessToken) {
        const { errorMessage, errorDescription } = getLoginErrorMessage(
          resp.code,
          resp.message || "Hubo un error al iniciar sesión. Por favor, intente nuevamente."
        );
        toast.error(errorMessage, {
          description: errorDescription || undefined,
          duration: 5000,
        });
        return;
      }

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
        window.localStorage.removeItem("activeRoleName");
        window.dispatchEvent(new CustomEvent("active-role-changed", { detail: { id: null, name: null } }));
      } catch { /* ignore */ }

      toast.success("Bienvenido");

      // Invalida el router cache de Next para /dashboard: si el usuario navega dentro de la
      // misma pestaña (logout -> login sin recarga completa), evita que se reutilice el layout
      // con los menús del login/rol anterior. type "layout" es necesario porque el fetch de
      // menús vive en el layout compartido (src/app/dashboard/layout.tsx), no en la página.
      await revalidatePathAction("/dashboard", "layout");

      // Mantener el formulario bloqueado (spinner "Redirigiendo...") durante
      // la breve espera antes de navegar, en vez de reactivarlo y permitir
      // un segundo intento de login mientras la redirección está en curso.
      setIsRedirecting(true);
      await new Promise((resolve) => setTimeout(resolve, 150));
      router.push("/dashboard");
      router.refresh();

    } catch (error) {
      // loginAction ya no lanza excepciones para errores HTTP (400/401/etc) —
      // esas se manejan arriba con el resultado devuelto. Este catch solo
      // atrapa fallos inesperados del lado cliente (ej. no se pudo invocar
      // la Server Action por un corte de conexión con el propio servidor Next.js).
      console.error("Login error:", error);

      const message = error instanceof Error ? error.message : undefined;
      const isNetworkError = message?.toLowerCase().includes("fetch") || message?.toLowerCase().includes("network");

      const { errorMessage, errorDescription } = isNetworkError
        ? {
            errorMessage: "Error de conexión",
            errorDescription: "No se pudo conectar con el servidor. Verifique su conexión a internet.",
          }
        : getLoginErrorMessage(undefined, "Hubo un error al iniciar sesión. Por favor, intente nuevamente.");

      toast.error(errorMessage, {
        description: errorDescription || undefined,
        duration: 5000,
      });
    }
  });

  const showPassword = form.watch("showPassword");

  return (
    <div
      className="h-full w-full flex m-0 p-0 landscape:fixed landscape:inset-0"
      data-login-page
    >
      <style jsx global>{`
        /* Base: allow scrolling on small screens (portrait/mobile) */
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          scrollbar-width: none !important; /* Firefox */
        }
        ::-webkit-scrollbar {
          display: none !important; /* Safari and Chrome */
        }
        /* Only lock overflow for landscape / larger viewports where the fixed layout is used */
        @media (orientation: landscape) and (min-width: 768px) {
          html, body {
            overflow: hidden !important;
            height: 100% !important;
            width: 100% !important;
          }
        }
        @keyframes softHalo {
          0%, 100% {
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.25), 0 0 24px rgba(255, 255, 255, 0.18);
          }
          50% {
            text-shadow: 0 0 14px rgba(255, 255, 255, 0.4), 0 0 36px rgba(255, 255, 255, 0.22);
          }
        }
        .mobile-hero-title {
          animation: softHalo 3.6s ease-in-out infinite;
        }
      `}</style>
      {/* =====================================================
          LANDSCAPE LAYOUT (lg+): imagen izquierda 70% | form derecha 30%
          ===================================================== */}

      {/* Left side - Image (70%) — solo landscape */}
      <div className="hidden landscape:flex landscape:w-[70%] relative bg-white items-center justify-center">
        <Image
          src="/images/sapp-fondo-ingreso.webp"
          alt="SAPP Login"
          width={1200}
          height={1200}
          priority
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right side - Form — landscape */}
      <div className="hidden landscape:flex landscape:w-[30%] flex-col justify-center items-center p-4 xl:p-8 2xl:p-10 bg-gradient-to-br from-[#0ea38d] via-[#0d9179] to-[#0b7f68] overflow-hidden">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 xl:p-8">
          {/* Header with logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="mb-4 bg-primary p-3 rounded-2xl shadow-lg">
              <Image
                src="/images/sapp-b-vertical.svg"
                alt="SAPP"
                width={60}
                height={60}
                priority
                className="w-[60px] h-[60px]"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <h1 className="text-xl font-bold text-center mb-1">
              EMPRESA PÚBLICA MUNICIPAL DE FAENAMIENTO
            </h1>
            <p className="text-xs text-primary text-center font-bold">
              DEL CANTÓN {location.canton}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Tabs defaultValue="identification">
                <TabsList className="grid w-full grid-cols-2 mb-3 h-9">
                  <TabsTrigger value="identification" disabled={form.formState.isSubmitting || isRedirecting} className="text-xs">
                    Identificación
                  </TabsTrigger>
                  <TabsTrigger value="email" disabled={form.formState.isSubmitting || isRedirecting} className="text-xs">
                    Correo
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="identification" className="space-y-1.5 mt-0">
                  <Label htmlFor="identification-ls" className="text-xs font-medium text-slate-700">Usuario</Label>
                  <Input id="identification-ls" type="text" disabled={form.formState.isSubmitting || isRedirecting} placeholder="Nombre de usuario" maxLength={100} autoComplete="username" required className="h-10 text-sm" {...form.register("identifier_ls")} />
                </TabsContent>
                <TabsContent value="email" className="space-y-1.5 mt-0">
                  <Label htmlFor="email-input-ls" className="text-xs font-medium text-slate-700">Correo Electrónico</Label>
                  <Input id="email-input-ls" type="email" disabled={form.formState.isSubmitting || isRedirecting} placeholder="usuario@ejemplo.com" maxLength={100} autoComplete="email" required className="h-10 text-sm" {...form.register("identifier_ls")} />
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password-ls" className="text-xs font-medium text-slate-700">Contraseña</Label>
              <div className="flex items-center">
                <Input id="password-ls" {...form.register("password_ls")} type={showPassword ? "text" : "password"} disabled={form.formState.isSubmitting || isRedirecting} autoComplete="current-password" placeholder="••••••••" className="h-10 text-sm w-full" required />
                <button type="button" className="h-10 w-10 flex items-center justify-center hover:bg-transparent transition-colors focus:outline-none" onClick={() => form.setValue("showPassword", !showPassword)}>
                  {showPassword ? <EyeOffIcon className="h-4 w-4 text-slate-500" /> : <EyeIcon className="h-4 w-4 text-slate-500" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-ls" className="border-slate-300 h-4 w-4" checked={form.watch("remember")} onCheckedChange={(checked) => form.setValue("remember", checked as boolean)} />
                <Label htmlFor="remember-ls" className="text-xs font-normal text-slate-600 cursor-pointer">Recuérdame</Label>
              </div>
              <Link href="/auth/forgot-password" className="text-[10px] text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
            </div>

            <Button type="submit" className="w-full h-11 text-sm text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 mt-5" disabled={form.formState.isSubmitting || isRedirecting || !form.formState.isDirty}>
              {isRedirecting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Redirigiendo...
                </span>
              ) : form.formState.isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Iniciando...
                </span>
              ) : "INGRESAR"}
            </Button>
          </form>
        </div>
      </div>

      {/* =====================================================
          PORTRAIT LAYOUT: imagen arriba | form abajo
          Diseño táctil — pantalla vertical NUC touchscreen
          ===================================================== */}
      <div
        className="flex landscape:hidden w-full min-h-screen flex-col overflow-y-auto bg-gradient-to-b from-[#0b7f68] via-[#0d9179] to-[#0ea38d]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >

        {/* Nuevo hero móvil: imagen con badge centrado y título dentro del overlay */}
        <div className="relative w-full flex-shrink-0" style={{ height: "42%" }}>
          <Image
            src="/images/sapp-fondo-ingreso.webp"
            alt="SAPP Login"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b7f6822] via-[#0b7f6866] to-[#0b7f68ee]" />

          <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-8">
            <div className="mobile-hero-title text-center text-white">
              <div className="text-base sm:text-lg font-bold tracking-wide leading-snug">EMPRESA PÚBLICA MUNICIPAL</div>
              <div className="text-sm font-semibold mt-1 tracking-wide">DE FAENAMIENTO</div>
              <div className="text-xs text-white/90 mt-1 uppercase tracking-[0.2em]">DEL CANTÓN {location.canton}</div>
            </div>
          </div>
        </div>

        {/* Sección inferior con el formulario */}
        <div className="flex-1 flex flex-col items-center justify-start px-6 pt-6 pb-28">

          

          {/* Tarjeta del formulario */}
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl py-10 px-8 border border-white/30">

            {/* Divider label */}
            <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">
              Iniciar Sesión
            </p>

            <form onSubmit={onSubmit} className="space-y-7">
              {/* Tabs */}
              <div>
                <Tabs defaultValue="identification">
                  <TabsList className="grid w-full grid-cols-2 mb-4 h-11">
                    <TabsTrigger value="identification" disabled={form.formState.isSubmitting || isRedirecting} className="text-sm font-medium">
                      Identificación
                    </TabsTrigger>
                    <TabsTrigger value="email" disabled={form.formState.isSubmitting || isRedirecting} className="text-sm font-medium">
                      Correo
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="identification" className="space-y-2 mt-0">
                    <Label htmlFor="identification-pt" className="text-sm font-semibold text-slate-600">
                      Usuario
                    </Label>
                    <Input
                      id="identification-pt"
                      type="text"
                      disabled={form.formState.isSubmitting || isRedirecting}
                      placeholder="Nombre de usuario"
                      maxLength={100}
                      autoComplete="username"
                      required
                      className="h-14 text-base rounded-2xl border-slate-200 focus:border-primary px-4"
                      {...form.register("identifier_pt")}
                    />
                  </TabsContent>
                  <TabsContent value="email" className="space-y-2 mt-0">
                    <Label htmlFor="email-input-pt" className="text-sm font-semibold text-slate-600">
                      Correo Electrónico
                    </Label>
                    <Input
                      id="email-input-pt"
                      type="email"
                      disabled={form.formState.isSubmitting || isRedirecting}
                      placeholder="usuario@ejemplo.com"
                      maxLength={100}
                      autoComplete="email"
                      required
                      className="h-14 text-base rounded-2xl border-slate-200 focus:border-primary px-4"
                      {...form.register("identifier_pt")}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password-pt" className="text-sm font-semibold text-slate-600">
                  Contraseña
                </Label>
                <div className="flex items-center rounded-2xl border border-slate-200 overflow-hidden focus-within:border-primary transition-colors">
                  <Input
                    id="password-pt"
                    {...form.register("password_pt")}
                    type={showPassword ? "text" : "password"}
                    disabled={form.formState.isSubmitting || isRedirecting}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-14 text-base flex-1 border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 rounded-none"
                    required
                  />
                  <button
                    type="button"
                    className="h-14 w-14 flex items-center justify-center text-slate-400 hover:text-primary transition-colors focus:outline-none flex-shrink-0"
                    onClick={() => form.setValue("showPassword", !showPassword)}
                  >
                    {showPassword ? <EyeOffIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
                  </button>
                </div>
              </div>

              {/* Recuérdame + Olvidaste */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="remember-pt"
                    className="border-slate-300 h-5 w-5"
                    checked={form.watch("remember")}
                    onCheckedChange={(checked) => form.setValue("remember", checked as boolean)}
                  />
                  <Label htmlFor="remember-pt" className="text-sm font-medium text-slate-600 cursor-pointer">
                    Recuérdame
                  </Label>
                </div>
                <Link href="/auth/forgot-password" className="text-xs text-primary font-medium hover:underline whitespace-nowrap">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón ingresar — grande y táctil.
                  Va en flujo normal: no puede usar `fixed` porque la tarjeta contenedora
                  tiene `backdrop-blur-sm`, y un ancestro con backdrop-filter se vuelve el
                  contenedor de referencia de los descendientes `fixed` (igual que
                  `filter`/`transform`), anclando el botón al pie de la tarjeta —
                  encima de "¿Olvidaste tu contraseña?" — en vez de a la pantalla. */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-14 text-base text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-200 disabled:opacity-60 rounded-2xl tracking-widest"
                  disabled={form.formState.isSubmitting || isRedirecting || !form.formState.isDirty}
                >
                  {isRedirecting ? (
                    <span className="flex items-center gap-3">
                      <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Redirigiendo...
                    </span>
                  ) : form.formState.isSubmitting ? (
                    <span className="flex items-center gap-3">
                      <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Iniciando sesión...
                    </span>
                  ) : (
                    "INGRESAR"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Footer branding */}
          <p className="text-white/80 text-sm font-medium mt-8 text-center px-4 leading-relaxed drop-shadow-sm">
            © {new Date().getFullYear()} SAPP - Sistema de Automatización de Procesos Productivos
          </p>
        </div>
      </div>
    </div>
  );
}