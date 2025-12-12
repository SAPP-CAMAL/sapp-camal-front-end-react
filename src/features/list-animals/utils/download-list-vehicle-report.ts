import { ListAnimalsFilters } from '../domain';
import { getReportListAnimalsByFiltersService } from '../server/db/list-animals-by-filters.service';

export const downloadListVehicleReport = async (filters: ListAnimalsFilters, type: 'EXCEL' | 'PDF') => {
	try {
		const { blob, filename } = await getReportListAnimalsByFiltersService(filters, type);

		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();

		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	} catch (error) {
		throw 'Error al descargar el reporte';
	}
};
