import { http } from '@/lib/ky';
import { ListAnimalsFilters } from '../../domain/list-animals.interface';
import { ConditionTransportListFilters } from '../../domain';

// Servicio para obtener certificados de transporte por filtros
export async function getListAnimalsByFiltersService(filters: ListAnimalsFilters): Promise<any[]> {
	try {
		// Construir el objeto de filtros, eliminando valores null/undefined
		const cleanFilters: any = {
			entryDate: filters.entryDate, // Siempre obligatorio
		};

		// Agregar filtros opcionales solo si tienen valor
		if (filters.code) cleanFilters.code = filters.code;
		if (filters.fullName) cleanFilters.fullName = filters.fullName;
		if (filters.identification) cleanFilters.identification = filters.identification;
		if (filters.plate) cleanFilters.plate = filters.plate;

		const response = await http
			.post('v1/1.0.0/certificate/by-filters', {
				json: cleanFilters,
			})
			.json<any>();

		if (response.code === 200 || response.code === 201) {
			return response.data;
		}

		throw new Error(response.message || 'Error al obtener los certificados');
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

export async function getConditionTransportByFiltersService(filters: ConditionTransportListFilters, typeReport: 'EXCEL' | 'PDF') {
	try {
		const response = await http.post('v1/1.0.0/certificate/report-by-filters', {
			searchParams: { typeReport },
			json: {
				entryDate: filters.entryDate,
				...(filters.code && { code: filters.code }),
				...(filters.fullName && { fullName: filters.fullName }),
				...(filters.identification && { identification: filters.identification }),
				...(filters.plate && { plate: filters.plate }),
			},
		});

		const blob = await response.blob();
		const contentType = response.headers.get('content-type') || '';
		const contentDisposition = response.headers.get('content-disposition') || '';

		const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
		const defaultFilename = `Reporte-condiciones-transporte-${filters.entryDate}.${typeReport.toLowerCase() === 'excel' ? 'xlsx' : 'pdf'}`;
		const filename = filenameMatch?.[1]?.replace(/['"]/g, '') || defaultFilename;

		return { blob, filename, contentType };
	} catch (error) {
		throw error;
	}
}
