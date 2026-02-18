/**
 * Tipos para unidades de medida
 */

export interface UnitMeasure {
  id: number;
  code: string;
  name: string;
  symbol: string;
  description: string;
  status: boolean;
}

export interface GetUnitMeasuresApiResponse {
  code: number;
  message: string;
  data: UnitMeasure[];
}

/**
 * Filtros para el reporte de rendimiento
 */
export interface PerformanceReportFilters {
  idWeighingStage: number;
  idSpecie: number;
  startDate: string;
  endDate: string;
  brandName: string; // Obligatorio
  totalAnimalsWeight: number;
  measureUnit: string;
  typeReport: "PDF"; // Solo PDF
}
