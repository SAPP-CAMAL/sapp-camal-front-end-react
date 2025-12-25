import { http } from '@/lib/ky';
import { TransportConditionsFilters, PaginatedResponse } from '../../domain';

export async function getTransportConditionsService(
  filters: TransportConditionsFilters
): Promise<PaginatedResponse<any>> {
  try {
    const payload: any = {
      page: filters.page,
      limit: filters.limit,
      startDate: filters.startDate,
      endDate: filters.endDate,
    };

    // Solo agregar filtros opcionales si tienen valor
    if (filters.idSpecie) payload.idSpecie = filters.idSpecie;
    if (filters.code && filters.code.trim()) payload.code = filters.code.trim();
    if (filters.identification && filters.identification.trim()) payload.identification = filters.identification.trim();
    if (filters.plate && filters.plate.trim()) payload.plate = filters.plate.trim();
    if (filters.fullName && filters.fullName.trim()) payload.fullName = filters.fullName.trim();

    const response = await http
      .post('v1/1.0.0/certificate/by-filters-paginated', {
        json: payload,
      })
      .json<any>();

    if (response.code === 200 || response.code === 201) {
      const responseData = response.data || {};
      const items = responseData.items || [];
      const meta = responseData.meta || {};

      return {
        data: items,
        total: meta.totalItems || 0,
        page: meta.currentPage || filters.page,
        limit: meta.itemsPerPage || filters.limit,
        totalPages: meta.totalPages || 0,
      };
    }

    return {
      data: [],
      total: 0,
      page: filters.page,
      limit: filters.limit,
      totalPages: 0,
    };
  } catch (error: any) {
    console.warn('Error al obtener certificados:', error?.message || error);
    return {
      data: [],
      total: 0,
      page: filters.page,
      limit: filters.limit,
      totalPages: 0,
    };
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
    const payload: any = {
      page: filters.page,
      limit: filters.limit,
      startDate: filters.startDate,
      endDate: filters.endDate,
      code: "",
      identification: "",
      plate: "",
      fullName: "",
    };

    // Solo agregar filtros opcionales si tienen valor
    if (filters.idSpecie) payload.idSpecie = filters.idSpecie;
    if (filters.code && filters.code.trim()) payload.code = filters.code.trim();
    if (filters.identification && filters.identification.trim()) payload.identification = filters.identification.trim();
    if (filters.plate && filters.plate.trim()) payload.plate = filters.plate.trim();
    if (filters.fullName && filters.fullName.trim()) payload.fullName = filters.fullName.trim();

    const response = await http.post('v1/1.0.0/certificate/report-by-filters-paginated', {
      searchParams: { typeReport },
      json: payload,
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
