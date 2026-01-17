import { AnimalDistributionFilters, getAnimalDistributionReportService } from "../server/db/animal-distribution.service";


export const downloadAnimalDistributionReport = async (filters: AnimalDistributionFilters, type: 'EXCEL' | 'PDF') => {
	try {
		const { blob, filename } = await getAnimalDistributionReportService(filters, type);

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
