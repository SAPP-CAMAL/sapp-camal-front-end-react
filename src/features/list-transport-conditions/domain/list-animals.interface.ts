// Interfaz para filtros de condiciones de transporte
export interface ListAnimalsFilters {
  entryDate: string; // Obligatorio - fecha de ingreso
  code?: string | null; // Opcional - código de certificado
  fullName?: string | null; // Opcional - nombre completo del chofer
  identification?: string | null; // Opcional - identificación
  plate?: string | null; // Opcional - placa del vehículo
  page?: number;
  limit?: number;
}
