import { getStatusCorralsReport, getAntemortemAgrocalidadReport } from '../server/db/antemortem.service';

export const downloadStatusCorralsReport = async (admissionDate: string, idLine: number, type: 'EXCEL' | 'PDF') => {
	try {
		const { blob, filename } = await getStatusCorralsReport(admissionDate, idLine, type);

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

export const downloadAntemortemAgrocalidadReport = async (date: string, idLine: number, type: 'EXCEL' | 'PDF') => {
	try {
		const { blob, filename } = await getAntemortemAgrocalidadReport(date, date, idLine, type);

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
