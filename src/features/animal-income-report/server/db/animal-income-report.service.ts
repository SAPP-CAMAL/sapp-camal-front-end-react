import { http } from "@/lib/ky";

const normalizeSpeciesName = (name?: string | null) =>
  (name ?? "").trim().replace(/\s+/g, " ").toUpperCase();

export interface ManagerReportTotalsResponse {
  code: number;
  message: string;
  data: {
    totals: Array<{
      idSpecies: number;
      name?: string | null;
      total: number;
    }>;
    data: Array<{
      id: number;
      code: string;
      detailCertificateBrands: {
        id: number;
        detailsCertificateBrand: {
          createdAt: string;
          id: number;
          idSpecies: number;
          species?: {
            id: number;
            name: string;
          };
        };
      };
    }>;
  };
}

export interface AnimalIncomeReportData {
  idSpecies: number;
  species: string;
  quantity: number;
  percentage: number;
}

export interface ProcessedReportData {
  startDate: string;
  endDate: string;
  data: AnimalIncomeReportData[];
  total: {
    quantity: number;
  };
  historyData: Array<{
    date: string;
    [species: string]: string | number;
  }>;
}

/**
 * Obtiene los totales del reporte de ingresos de animales
 */
export const getManagerReportTotals = async (
  startDate: string,
  endDate: string
): Promise<ManagerReportTotalsResponse> => {
  try {
    const response = await http
      .get("v1/1.0.0/detail-specie-cert/manager-report-totals", {
        searchParams: {
          startDate,
          endDate,
        },
      })
      .json<ManagerReportTotalsResponse>();

    return response;
  } catch (error) {
    console.error("Error fetching manager report totals:", error);
    throw error;
  }
};

export interface YearlyAnimalAuditingReportFile {
  blob: Blob;
  filename: string;
  contentType: string;
}

export const getYearlyAnimalAuditingReport = async (
  year: number | string
): Promise<YearlyAnimalAuditingReportFile> => {
  const response = await http.get("v1/1.0.0/setting-cert-brand/yearly-animal-auditing-report", {
    searchParams: {
      year: year.toString(),
    },
  });

  const blob = await response.blob();
  const contentType = response.headers.get("content-type") || "";
  const contentDisposition = response.headers.get("content-disposition") || "";
  const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  const extension = contentType.includes("pdf")
    ? "pdf"
    : contentType.includes("spreadsheet") || contentType.includes("excel")
      ? "xlsx"
      : "xlsx";
  const filename = filenameMatch?.[1]?.replace(/["']/g, "") || `reporte-faenamiento-${year}.${extension}`;

  return { blob, filename, contentType };
};

/**
 * Procesa la respuesta de la API y la transforma al formato esperado por el componente
 */
export const processReportData = (
  response: ManagerReportTotalsResponse,
  startDate: string,
  endDate: string
): ProcessedReportData => {
  const { totals, data } = response.data;
  const speciesById = new Map<number, string>(
    totals.map((item) => [item.idSpecies, normalizeSpeciesName(item.name)])
  );

  const getSpeciesName = (idSpecies: number, fallbackName?: string) => {
    if (fallbackName) return normalizeSpeciesName(fallbackName);
    return speciesById.get(idSpecies) || `ESPECIE ${idSpecies}`;
  };

  // Calcular el total general
  const totalQuantity = totals.reduce((acc, item) => acc + item.total, 0);

  // Transformar los totales al formato esperado
  const speciesData: AnimalIncomeReportData[] = totals.map((item) => ({
    idSpecies: item.idSpecies,
    species: getSpeciesName(item.idSpecies, item.name),
    quantity: item.total,
    percentage: totalQuantity > 0 ? Number(((item.total / totalQuantity) * 100).toFixed(1)) : 0,
  }));

  // Ordenar por cantidad descendente
  speciesData.sort((a, b) => b.quantity - a.quantity);

  // Generar datos históricos agrupados por mes
  const historyMap = new Map<string, Record<string, number>>();

  data.forEach((item) => {
    const createdAt = item.detailCertificateBrands.detailsCertificateBrand.createdAt;
    const detailSpecie = item.detailCertificateBrands.detailsCertificateBrand;
    const idSpecies = detailSpecie.idSpecies;
    const detailSpeciesName = detailSpecie.species?.name;
    const date = new Date(createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!historyMap.has(monthKey)) {
      historyMap.set(monthKey, {});
    }

    const monthData = historyMap.get(monthKey)!;
    const speciesName = getSpeciesName(idSpecies, detailSpeciesName);
    monthData[speciesName] = (monthData[speciesName] || 0) + 1;
  });

  // Convertir el mapa a array y ordenar por fecha
  const historyData = Array.from(historyMap.entries())
    .map(([date, counts]) => ({
      date,
      ...counts,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    startDate,
    endDate,
    data: speciesData,
    total: {
      quantity: totalQuantity,
    },
    historyData,
  };
};


// Tipos para el reporte detallado por especie
export interface ManagerReportRequest {
  startDate: string;
  endDate: string;
  idSpecie: number;
  page: number;
  limit: number;
}

export interface ManagerReportItem {
  id: number;
  code: string;
  detailCertificateBrands: {
    id: number;
    productiveStage: {
      id: number;
      name: string;
    };
    detailsCertificateBrand: {
      createdAt: string;
      id: number;
      brand: {
        id: number;
        name: string;
        introducer: {
          id: number;
          user: {
            id: number;
            person: {
              id: number;
              fullName: string;
            };
          };
        };
      };
    };
  };
}

export interface ManagerReportResponse {
  code: number;
  message: string;
  data: {
    items: ManagerReportItem[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  };
}

/**
 * Obtiene el reporte detallado por especie con paginación
 */
export const getManagerReport = async (
  request: ManagerReportRequest
): Promise<ManagerReportResponse> => {
  try {
    const response = await http
      .post("v1/1.0.0/detail-specie-cert/manager-report", {
        json: request,
      })
      .json<ManagerReportResponse>();

    return response;
  } catch (error) {
    console.error("Error fetching manager report:", error);
    throw error;
  }
};
