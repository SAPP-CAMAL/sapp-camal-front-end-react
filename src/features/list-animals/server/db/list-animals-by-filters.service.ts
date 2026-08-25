import { http } from '@/lib/ky';
import { ListAnimalsFilters, SettingCertBrandByFilters } from '@/features/list-animals/domain';
import { CommonHttpResponse } from '@/features/people/domain';

// Servicio para obtener animales por filtros
export async function getListAnimalsByFiltersService(filters: ListAnimalsFilters): Promise<SettingCertBrandByFilters[]> {
	try {
		const response = await http.post('v1/1.0.0/setting-cert-brand/by-filters', { json: filters }).json<CommonHttpResponse<SettingCertBrandByFilters>>();

		if (response.code === 201) {
			return response.data;
		}

		throw new Error(response.message || 'Error al obtener los animales');
	} catch (error) {
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

export async function getReportListAnimalsByFiltersService(filters: ListAnimalsFilters, typeReport: 'EXCEL' | 'PDF') {
	const response = await http.post('v1/1.0.0/setting-cert-brand/report-by-filters', {
		searchParams: { typeReport },
		json: filters,
	});

	const blob = await response.blob();
	const contentType = response.headers.get('content-type') || '';
	const contentDisposition = response.headers.get('content-disposition') || '';

	const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
	const defaultFilename = `Reporte-de-animales-${filters.startDate}-${filters.endDate}.${typeReport.toLowerCase() === 'excel' ? 'xlsx' : 'pdf'}`;
	const filename = filenameMatch?.[1]?.replace(/['"]/g, '') || defaultFilename;

	return { blob, filename, contentType };
}
