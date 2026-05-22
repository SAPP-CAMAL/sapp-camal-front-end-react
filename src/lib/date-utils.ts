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
 * Verifica si una fecha es hoy o mañana
 * @param date - Fecha a verificar (puede ser Date o string en formato YYYY-MM-DD)
 * @returns true si la fecha es hoy o mañana, false en caso contrario
 */
export function isTodayOrTomorrow(date: Date | string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const compareDate = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  return compareDate.getTime() === today.getTime() || compareDate.getTime() === tomorrow.getTime();
}

/**
 * Verifica si una fecha es hoy o dentro de los ultimos 3 dias (incluyendo hoy)
 * @param date - Fecha a verificar (puede ser Date o string en formato YYYY-MM-DD)
 * @returns true si la fecha esta dentro de los ultimos 3 dias, false en caso contrario
 */
export function isWithinLastThreeDays(date: Date | string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const compareDate = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - compareDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= 2;
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
