import { http } from "@/lib/ky";
import type { GetUnitMeasuresApiResponse, PerformanceReportFilters } from "../../domain";

/**
 * Servicio para obtener todas las unidades de medida
 */
export async function getUnitMeasures(): Promise<GetUnitMeasuresApiResponse> {
  const response = await http
    .get("v1/1.0.0/unit-measure/all")
    .json<GetUnitMeasuresApiResponse>();

  return response;
}

/**
 * Servicio para generar el reporte de rendimiento
 */
export async function generateProductivityReport(
  filters: PerformanceReportFilters
): Promise<{ blob: Blob; filename: string }> {
  const body = {
    idWeighingStage: filters.idWeighingStage,
    idSpecie: filters.idSpecie,
    startDate: filters.startDate,
    endDate: filters.endDate,
    brandName: filters.brandName.trim(),
    totalAnimalsWeight: filters.totalAnimalsWeight,
    measureUnit: filters.measureUnit,
    typeReport: filters.typeReport,
  };

  const response = await http.post(
    "v1/1.0.0/detail-animal-weighing/productivity-report",
    { json: body }
  );

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition") || "";

  let date = filters.startDate;
  if (filters.startDate !== filters.endDate) {
    date = `${filters.startDate}-a-${filters.endDate}`;
  }

  const extension = filters.typeReport === "PDF" ? "pdf" : "xlsx";
  const filenameMatch = contentDisposition.match(
    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
  );
  const defaultFilename = `Reporte-Rendimiento-${date}.${extension}`;
  const filename =
    filenameMatch?.[1]?.replace(/['"]/g, "") || defaultFilename;

  return { blob, filename };
}
