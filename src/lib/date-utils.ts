/**
 * Utilidades para manejo de fechas
 */

/**
 * Verifica si una fecha es la fecha actual (hoy)
 * @param date - Fecha a verificar (puede ser Date o string en formato YYYY-MM-DD)
 * @returns true si la fecha es hoy, false en caso contrario
 */
export function isToday(date: Date | string): boolean {
  const today = new Date();
  const compareDate = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  
  return (
    compareDate.getFullYear() === today.getFullYear() &&
    compareDate.getMonth() === today.getMonth() &&
    compareDate.getDate() === today.getDate()
  );
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (zona horaria local)
 * @returns Fecha actual en formato string
 */
export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Verifica si una fecha es anterior a hoy
 * @param date - Fecha a verificar (puede ser Date o string en formato YYYY-MM-DD)
 * @returns true si la fecha es anterior a hoy, false en caso contrario
 */
export function isPastDate(date: Date | string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const compareDate = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  return compareDate < today;
}
