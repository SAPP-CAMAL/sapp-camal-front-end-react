import { http } from "@/lib/ky";
import { ListAnimalsFilters } from "@/features/list-animals/domain";

// Servicio para obtener animales por filtros
export async function getListAnimalsByFiltersService(
  filters: ListAnimalsFilters
): Promise<any[]> {
  try {
    console.log('Enviando filtros a la API:', filters);

    const response = await http.post(
      "v1/1.0.0/setting-cert-brand/by-filters",
      {
        json: filters
      }
    ).json<any>();

    console.log('Respuesta de la API:', response);

    if (response.code === 201) {
      return response.data; // Retorna los datos tal cual vienen de la API
    }

    throw new Error(response.message || 'Error al obtener los animales');
  } catch (error) {
    console.error('Error en getListAnimalsByFiltersService:', error);
    throw error;
  }
}

// Función para obtener la fecha actual en formato YYYY-MM-DD en zona horaria local
// Evita problemas de desfase de día causados por conversión a UTC
export function getCurrentDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
