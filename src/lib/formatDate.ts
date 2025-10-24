export const formatDate = (isoDate: string) => {
	const date = new Date(isoDate);
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = date.getFullYear();

	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');

	return {
		date: `${day}/${month}/${year}`,
		hours: `${hours}:${minutes}`,
	};
};

/**
 * Obtiene la fecha actual en formato yyyy-MM-dd en la zona horaria local
 * sin conversiones a UTC que puedan causar desfases de día.
 * 
 * Esta función es especialmente importante para Ecuador (UTC-5) donde
 * las conversiones automáticas a UTC pueden causar que después de las 19:00
 * se muestre el día siguiente.
 * 
 * @param date - Fecha a formatear (por defecto: fecha actual)
 * @returns String en formato yyyy-MM-dd en zona horaria local
 */
export const getLocalDateString = (date: Date = new Date()): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	
	return `${year}-${month}-${day}`;
};

/**
 * Convierte un string de fecha yyyy-MM-dd a un objeto Date en zona horaria local
 * sin conversiones a UTC.
 * 
 * @param dateString - String en formato yyyy-MM-dd
 * @returns Date object en zona horaria local
 */
export const parseLocalDateString = (dateString: string): Date => {
	const [year, month, day] = dateString.split('-').map(Number);
	return new Date(year, month - 1, day);
};
