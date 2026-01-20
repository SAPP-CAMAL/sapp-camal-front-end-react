import { getMonthlySummaryAgrocalidadReport } from '../server/db/postmortem.service';

export const downloadMonthlySummaryAgrocalidadReport = async (monthDate: string) => {
	try {
		const { blob, filename } = await getMonthlySummaryAgrocalidadReport(monthDate);

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
