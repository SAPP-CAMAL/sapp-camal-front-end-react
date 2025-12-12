import { useQuery } from "@tanstack/react-query";
import { getEnvironmentVariableByName } from "../server/db/environment-variables.service";

/**
 * Hook para obtener una variable de entorno por nombre
 */
export function useEnvironmentVariable(name: string) {
  return useQuery({
    queryKey: ["environment-variable", name],
    queryFn: () => getEnvironmentVariableByName(name),
    staleTime: 1000 * 60 * 60, // 1 hora - las variables no cambian frecuentemente
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
    enabled: !!name, // Solo ejecutar si hay nombre
  });
}

/**
 * Hook para obtener las imágenes del dashboard
 */
export function useDashboardImages() {
  const { data, ...rest } = useEnvironmentVariable("DASHBOARD_IMAGES");
  
  // Parsear el token JSON para obtener el array de URLs
  const images = data?.data?.token 
    ? JSON.parse(data.data.token) as string[]
    : [];

  return {
    ...rest,
    images,
    data,
  };
}

/**
 * Hook para obtener el logo del matadero
 */
export function useSlaughterhouseLogo() {
  const { data, ...rest } = useEnvironmentVariable("SLAUGHTERHOUSE_LOGO");
  
  // Parsear el token JSON para obtener la URL del logo
  const logoUrl = data?.data?.token 
    ? JSON.parse(data.data.token) as string
    : null;

  return {
    ...rest,
    logoUrl,
    data,
  };
}
