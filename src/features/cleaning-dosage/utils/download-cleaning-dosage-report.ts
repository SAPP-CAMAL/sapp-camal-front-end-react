import { getCleaningDosageReport } from '../server/db/cleaning-dosage.service';

export const downloadCleaningDosageReport = async (startDate: string, endDate: string, type: 'EXCEL' | 'PDF') => {
	try {
		const { blob, filename } = await getCleaningDosageReport(startDate, endDate, type);

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
