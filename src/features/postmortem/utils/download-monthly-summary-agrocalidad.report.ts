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
	} catch (error: any) {
		if (error?.response) {
			const errorData = await error.response.json().catch(() => null);
			const backendMessage =
				errorData?.message || errorData?.data || errorData?.error;

			if (typeof backendMessage === 'string' && backendMessage.trim()) {
				throw new Error(backendMessage);
			}
		}

		if (error instanceof Error) {
			throw error;
		}

		throw new Error('Error al descargar el reporte');
	}
};
