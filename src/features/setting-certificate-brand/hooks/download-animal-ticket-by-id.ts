import { getAnimalTicketById } from '../server/db/setting-cert-brand.service';

export const downloadAnimalTicketById = async (idSettingCertificateBrand: number | string) => {
	try {
		const { blob, filename } = await getAnimalTicketById(idSettingCertificateBrand);

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
