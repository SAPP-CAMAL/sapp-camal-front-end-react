import { cookies } from "next/headers";
import { DashboardClient } from "@/app/dashboard/dashboard-client";
import { getEnvironmentVariableByName } from "@/features/dashboard/server/db/environment-variables.service";
import { fixUtf8 } from "@/lib/utils";

/**
 * Helper para parsear el token de forma segura
 * Intenta parsear como JSON, si falla retorna el valor original
 */
function safeParseToken<T>(token: string): T | string {
  try {
    return JSON.parse(token) as T;
  } catch {
    // Si no es JSON válido, retornar el string original
    return token;
  }
}

export default async function Page() {
  const cookiesStore = await cookies();
  const user = cookiesStore.get("user");
  const userData = user ? JSON.parse(user.value) : null;

  // Obtener imágenes del dashboard desde la API
  let dashboardImages: string[] = [];
  try {
    const imagesResponse = await getEnvironmentVariableByName("DASHBOARD_IMAGES");
    if (imagesResponse.data?.token) {
      const parsed = safeParseToken<string[]>(imagesResponse.data.token);
      dashboardImages = Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error("❌ Error al cargar imágenes del dashboard:", error);
  }

  // Obtener logo del matadero desde la API
  let slaughterhouseLogo: string | null = null;
  try {
    const logoResponse = await getEnvironmentVariableByName("SLAUGHTERHOUSE_LOGO");
    if (logoResponse.data?.token) {
      const parsed = safeParseToken<string>(logoResponse.data.token);
      slaughterhouseLogo = typeof parsed === 'string' ? parsed : null;
    }
  } catch (error) {
    console.error("Error al cargar logo del matadero:", error);
  }

  // Fallback: si por permisos o configuración no viene el logo aún, usar uno local
  if (!slaughterhouseLogo || slaughterhouseLogo.trim() === "") {
    slaughterhouseLogo = "/images/LOGO_VERDE_HORIZONTAL.svg";
  }

  // Convertir URLs a formato de imágenes para el carrusel
  const carouselImages = dashboardImages.map((url, index) => ({
    src: url,
    alt: `SAPP Sistema ${index + 1}`
  }));

  // Si no hay imágenes, usar imágenes por defecto
  const finalImages = carouselImages.length > 0 ? carouselImages : [
    { src: "/images/sapp-fondo-ingreso.svg", alt: "SAPP Sistema 1" },
    { src: "/images/corrals-color.png", alt: "SAPP Sistema 2" },
    { src: "/images/sapp-loggin.png", alt: "SAPP Sistema 3" },
  ];

  return (
    <DashboardClient
      images={finalImages}
      userName={fixUtf8(userData?.user.fullName)}
      userRole={fixUtf8(userData?.activeRole.name)}
      slaughterhouseLogo={slaughterhouseLogo}
    />
  );
}
