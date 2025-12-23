import { http } from "@/lib/ky";

// Mapeo de idSpecies a nombres de especies
const SPECIES_MAP: Record<number, string> = {
  3: "PORCINO",
  4: "BOVINO",
  5: "OVINO/CAPRINO",
};

export interface ManagerReportTotalsResponse {
  code: number;
  message: string;
  data: {
    totals: Array<{
      idSpecies: number;
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
        };
      };
    }>;
  };
}

export interface AnimalIncomeReportData {
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
    BOVINO: number;
    PORCINO: number;
    "OVINO/CAPRINO": number;
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

/**
 * Procesa la respuesta de la API y la transforma al formato esperado por el componente
 */
export const processReportData = (
  response: ManagerReportTotalsResponse,
  startDate: string,
  endDate: string
): ProcessedReportData => {
  const { totals, data } = response.data;

  // Calcular el total general
  const totalQuantity = totals.reduce((acc, item) => acc + item.total, 0);

  // Transformar los totales al formato esperado
  const speciesData: AnimalIncomeReportData[] = totals.map((item) => ({
    species: SPECIES_MAP[item.idSpecies] || `Especie ${item.idSpecies}`,
    quantity: item.total,
    percentage: totalQuantity > 0 ? Number(((item.total / totalQuantity) * 100).toFixed(1)) : 0,
  }));

  // Ordenar por cantidad descendente
  speciesData.sort((a, b) => b.quantity - a.quantity);

  // Generar datos históricos agrupados por mes
  const historyMap = new Map<string, { BOVINO: number; PORCINO: number; "OVINO/CAPRINO": number }>();

  data.forEach((item) => {
    const createdAt = item.detailCertificateBrands.detailsCertificateBrand.createdAt;
    const idSpecies = item.detailCertificateBrands.detailsCertificateBrand.idSpecies;
    const date = new Date(createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!historyMap.has(monthKey)) {
      historyMap.set(monthKey, { BOVINO: 0, PORCINO: 0, "OVINO/CAPRINO": 0 });
    }

    const monthData = historyMap.get(monthKey)!;
    const speciesName = SPECIES_MAP[idSpecies];

    if (speciesName === "BOVINO") {
      monthData.BOVINO += 1;
    } else if (speciesName === "PORCINO") {
      monthData.PORCINO += 1;
    } else if (speciesName === "OVINO/CAPRINO") {
      monthData["OVINO/CAPRINO"] += 1;
    }
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
