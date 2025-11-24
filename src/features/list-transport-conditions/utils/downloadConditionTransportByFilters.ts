import { ConditionTransportListFilters } from '../domain';
import { getConditionTransportByFiltersService } from '../server/db/list-animals-by-filters.service';

export const downloadConditionTransportByFilters = async (filters: ConditionTransportListFilters, type: 'EXCEL' | 'PDF') => {
	try {
		const { blob, filename } = await getConditionTransportByFiltersService(filters, type);

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
