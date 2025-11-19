import { toast } from 'sonner';
import { getRegisterVehicleByDateReport } from '@/features/vehicles/server/db/detail-register-vehicle.service';

export const handleDownloadRegisterVehicleReport = async (date: string, type: 'EXCEL' | 'PDF') => {
	try {
		const { blob, filename } = await getRegisterVehicleByDateReport(date, type);

		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();

		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);

		toast.success(`Reporte ${type} descargado correctamente`);
	} catch (error) {
		toast.error('Error al descargar el reporte');
	}
};
