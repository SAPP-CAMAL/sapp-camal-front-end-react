import { http } from "@/lib/ky";
import { ListAnimalsFilters } from "../../domain/list-animals.interface";

// Servicio para obtener certificados de transporte por filtros
export async function getListAnimalsByFiltersService(
  filters: ListAnimalsFilters
): Promise<any[]> {
  try {
    console.log('Enviando filtros a la API:', filters);

    // Construir el objeto de filtros, eliminando valores null/undefined
    const cleanFilters: any = {
      entryDate: filters.entryDate, // Siempre obligatorio
    };

    // Agregar filtros opcionales solo si tienen valor
    if (filters.code) cleanFilters.code = filters.code;
    if (filters.fullName) cleanFilters.fullName = filters.fullName;
    if (filters.identification) cleanFilters.identification = filters.identification;
    if (filters.plate) cleanFilters.plate = filters.plate;

    const response = await http.post(
      "v1/1.0.0/certificate/by-filters",
      {
        json: cleanFilters
      }
    ).json<any>();

    console.log('Respuesta de la API:', response);

    if (response.code === 200 || response.code === 201) {
      return response.data; 
    }

    throw new Error(response.message || 'Error al obtener los certificados');
  } catch (error) {
    console.error('Error en getListAnimalsByFiltersService:', error);
    throw error;
  }
}

// Función para obtener la fecha actual en formato YYYY-MM-DD
export function getCurrentDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
