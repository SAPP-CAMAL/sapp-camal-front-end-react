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
 * Verifica si una fecha es editable: mañana, hoy, o dentro de los 2 dias anteriores.
 * Rango permitido: desde hace 2 dias hasta mañana (inclusive).
 * @param date - Fecha a verificar (puede ser Date o string en formato YYYY-MM-DD)
 * @returns true si la fecha esta dentro del rango permitido, false en caso contrario
 */
export function isWithinLastThreeDays(date: Date | string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Forzar parseo en zona horaria local agregando 'T00:00:00' a strings planos YYYY-MM-DD
  const compareDate = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  // diffDays > 0  → fecha pasada  (ej: ayer = 1, hace 2 días = 2)
  // diffDays = 0  → hoy
  // diffDays < 0  → fecha futura  (ej: mañana = -1)
  const diffMs = today.getTime() - compareDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays >= -1 && diffDays <= 2;
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
