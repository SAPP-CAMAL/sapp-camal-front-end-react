import { http } from '@/lib/ky';
import { TransportConditionsFilters } from '../../domain';

export async function getTransportConditionsService(filters: TransportConditionsFilters): Promise<any[]> {
  try {
    const cleanFilters: any = {
      startDate: filters.startDate,
      endDate: filters.endDate,
    };

    if (filters.specieId) cleanFilters.specieId = filters.specieId;

    const response = await http
      .post('v1/1.0.0/conditions-transport/by-filters', {
        json: cleanFilters,
      })
      .json<any>();

    if (response.code === 200 || response.code === 201) {
      return response.data || [];
    }

    return [];
  } catch (error: any) {
    // Si el endpoint no existe (404) o hay error de servidor, retornar array vacío
    console.warn('Endpoint de condiciones de transporte no disponible:', error?.message || error);
    return [];
  }
}

export function getCurrentDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function downloadTransportConditionsReport(
  filters: TransportConditionsFilters,
  typeReport: 'EXCEL' | 'PDF'
) {
  try {
    const response = await http.post('v1/1.0.0/conditions-transport/report-by-filters', {
      searchParams: { typeReport },
      json: {
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.specieId && { specieId: filters.specieId }),
      },
    });

    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition') || '';
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    const defaultFilename = `Reporte-condiciones-transporte-${filters.startDate}-${filters.endDate}.${typeReport.toLowerCase() === 'excel' ? 'xlsx' : 'pdf'}`;
    const filename = filenameMatch?.[1]?.replace(/['"]/g, '') || defaultFilename;

    return { blob, filename };
  } catch (error) {
    throw error;
  }
}
