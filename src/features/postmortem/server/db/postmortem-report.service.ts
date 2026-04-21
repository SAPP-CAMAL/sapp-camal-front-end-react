import { http } from "@/lib/ky";

export interface PostmortemReportFilters {
  startDate: string;
  endDate: string;
  idSpecies: number;
}

export interface DailyConfiscationReportFilters {
  date: string;
  idSpecies: number;
  typeReport: "EXCEL" | "PDF";
}

export interface MonthlyConfiscationReportFilters {
  date: string; // formato YYYY-MM
  idSpecies: number;
}

/**
 * Descarga el reporte general de inspección postmortem
 */
export const downloadPostmortemGeneralReport = async (
  filters: PostmortemReportFilters
): Promise<void> => {
  try {
    const response = await http.get(
      "v1/1.0.0/setting-cert-brand/postmortem-inspection-report/by-filters",
      {
        searchParams: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          idSpecies: filters.idSpecies.toString(),
        },
      }
    );

    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition") || "";
    
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    const defaultFilename = `Reporte-Postmortem-${filters.startDate}.xlsx`;
    const filename = filenameMatch?.[1]?.replace(/['"]/g, "") || defaultFilename;

    // Crear link de descarga
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
};


/**
 * Descarga el reporte diario de decomisos
 */
export const downloadDailyConfiscationReport = async (
  filters: DailyConfiscationReportFilters
): Promise<void> => {
  try {
    const response = await http.get(
      "v1/1.0.0/setting-cert-brand/daily-confiscation-report/by-filters",
      {
        searchParams: {
          date: filters.date,
          typeReport: filters.typeReport,
          idSpecies: filters.idSpecies.toString(),
        },
      }
    );

    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition") || "";
    
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    const extension = filters.typeReport === "EXCEL" ? "xlsx" : "pdf";
    const defaultFilename = `Reporte-Diario-Decomisos-${filters.date}.${extension}`;
    const filename = filenameMatch?.[1]?.replace(/['"]/g, "") || defaultFilename;

    // Crear link de descarga
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
};

/**
 * Descarga el reporte mensual de decomisos
 */
export const downloadMonthlyConfiscationReport = async (
  filters: MonthlyConfiscationReportFilters
): Promise<void> => {
  try {
    const response = await http.get(
      "v1/1.0.0/setting-cert-brand/monthly-confiscation-report/by-filters",
      {
        searchParams: {
          date: filters.date,
          idSpecies: filters.idSpecies.toString(),
        },
      }
    );

    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition") || "";
    
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    const defaultFilename = `Reporte-Mensual-Decomisos-${filters.date}.xlsx`;
    const filename = filenameMatch?.[1]?.replace(/['"]/g, "") || defaultFilename;

    // Crear link de descarga
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
};
