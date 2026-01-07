import { http } from "@/lib/ky";
import ky from 'ky';
import {
  ResponseLine,
  LineaType,
  getLineaIdFromType,
  ResponseCorralGroup,
  ResponseCorralGroups,
  CorralGroup,
  ResponseCorrales,
  ApiCorral,
  StatusCorralByAdmission,
  BrandDetail,
  ResponseBrandDetails
} from "@/features/corrals/domain";

// Obtener la URL base de la API desde las variables de entorno
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://sapp-riobamba.com";

// Create a silent HTTP client for brand details that won't log errors
const silentHttp = ky.create({
  prefixUrl: API_BASE_URL,
  credentials: "include",
  retry: 0,
  hooks: {
    beforeRequest: [
      async request => {
        const token = await window.cookieStore.get("accessToken")
        if (token) {
          request.headers.set("Authorization", `Bearer ${token.value}`)
        }
      }
    ],
    afterResponse: [
      (request, options, response) => {
        if (response.status === 401) {
          window.location.href = "/auth/login"
        }
        // Don't do anything else - suppress error logging
        return response
      }
    ]
  }
});

export function getLineService(id: number): Promise<ResponseLine> {
  return http.get("v1/1.0.0/line", {
    searchParams: {
      id: id.toString()
    },
    next: {
      tags: ["corrals", "lines"],
    }
  }).json<ResponseLine>();
}

export async function getLineByTypeService(lineaType: LineaType): Promise<ResponseLine> {
  try {
    // Get the correct ID for the line type
    const targetId = getLineaIdFromType(lineaType);

    // Try to get all lines first
    const response = await http.get("v1/1.0.0/line/all", {
      next: {
        tags: ["corrals", "lines"],
      }
    }).json<{ code: number; message: string; data: any[] }>();

    if (response.code !== 200 || !response.data || response.data.length === 0) {
      // Fallback to direct ID query
      return getLineService(targetId);
    }

    // Filter active lines
    const activeLines = response.data.filter((line: any) => line.status === true);

    if (activeLines.length === 0) {
      // Fallback to direct ID query
      return getLineService(targetId);
    }

    // PRIORITY 1: Find by exact ID match (most reliable)
    const lineById = activeLines.find((line: any) => line.id === targetId);

    if (lineById) {
      return {
        code: 200,
        message: "Success",
        data: lineById
      };
    }

    // PRIORITY 2: If ID not found, try by specie ID
    const specieId = targetId; // In this system, line ID = specie ID
    const lineBySpecieId = activeLines.find((line: any) => line.idSpecie === specieId);

    if (lineBySpecieId) {
      return {
        code: 200,
        message: "Success",
        data: lineBySpecieId
      };
    }

    // PRIORITY 3: Search by text as last resort
    let searchTerm: string;
    switch (lineaType) {
      case "bovinos":
        searchTerm = "bovino";
        break;
      case "porcinos":
        searchTerm = "porcino";
        break;
      case "ovinos-caprinos":
        searchTerm = "ovino";
        break;
      default:
        searchTerm = "bovino";
    }

    const matchingLine = activeLines.find((line: any) => {
      const description = (line.description || '').toLowerCase();
      const name = (line.name || '').toLowerCase();
      const specieName = (line.specie?.name || '').toLowerCase();
      const specieDescription = (line.specie?.description || '').toLowerCase();

      return description.includes(searchTerm) ||
             name.includes(searchTerm) ||
             specieName.includes(searchTerm) ||
             specieDescription.includes(searchTerm);
    });

    if (matchingLine) {
      return {
        code: 200,
        message: "Success",
        data: matchingLine
      };
    }

    // FINAL FALLBACK: Use direct ID query
    return getLineService(targetId);

  } catch (error) {
    console.error(`Error fetching line for type ${lineaType}:`, error);
    // Fallback to old method
    try {
      const id = getLineaIdFromType(lineaType);
      return await getLineService(id);
    } catch (fallbackError) {
      // Return a minimal valid response to prevent crashes
      return {
        code: 200,
        message: "Fallback response",
        data: {
          id: getLineaIdFromType(lineaType),
          name: lineaType,
          description: lineaType.charAt(0).toUpperCase() + lineaType.slice(1),
          status: true,
          idSpecie: getLineaIdFromType(lineaType),
          specie: {
            id: getLineaIdFromType(lineaType),
            name: lineaType,
            description: lineaType,
            status: true
          }
        }
      };
    }
  }
}

export function getCorralGroupService(id: number): Promise<ResponseCorralGroup> {
  return http.get("v1/1.0.0/corral-group", {
    searchParams: {
      id: id.toString()
    },
    next: {
      tags: ["corrals", "groups"],
    }
  }).json<ResponseCorralGroup>();
}

export async function getAllCorralGroupsService(): Promise<CorralGroup[]> {
  try {
    // First, try to get all groups from a dedicated endpoint
    const response = await http.get("v1/1.0.0/corral-group/all", {
      next: {
        tags: ["corrals", "groups"],
      }
    }).json<ResponseCorralGroups>();

    return response.data || [];
  } catch (error) {
    console.log("Dedicated /all endpoint not available, falling back to individual requests");

    // Fallback: Get groups by making requests with pagination or range
    // This is a more scalable approach than hardcoded IDs
    const maxGroupId = 50; // Reasonable upper bound
    const groupPromises: Promise<CorralGroup | null>[] = [];

    for (let id = 1; id <= maxGroupId; id++) {
      groupPromises.push(
        getCorralGroupService(id)
          .then(response => response.data)
          .catch(() => null) // Group doesn't exist, ignore
      );
    }

    const results = await Promise.all(groupPromises);
    return results.filter((group): group is CorralGroup => group !== null);
  }
}

export function getCorralesByGroupService(groupId: number, date?: Date): Promise<ResponseCorrales> {
  const searchParams: Record<string, string> = {
    idGroup: groupId.toString()
  };

  // Add date parameter if provided
  if (date) {
    // Usar zona horaria local para evitar desfases de día
    searchParams.date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; // Format as YYYY-MM-DD
  }

  return http.get("v1/1.0.0/corral-group-detail/corrals/by-group", {
    searchParams,
    next: {
      tags: ["corrales"],
    }
  }).json<ResponseCorrales>();
}

// New function to get corral counts by group
export async function getCorralCountsByLineService(lineId: number, date?: Date): Promise<{
  depilados: number;
  chamuscados: number;
  mercado: number;
  guayaquil: number;
}> {
  try {
    // Get all groups for the line
    const allGroups = await getAllCorralGroupsService();
    const lineGroups = allGroups.filter(group => group.idLine === lineId);

    const counts = {
      depilados: 0,
      chamuscados: 0,
      mercado: 0,
      guayaquil: 0,
    };

    // Get counts for each group type
    for (const group of lineGroups) {
      try {
        const response = await getCorralesByGroupService(group.id, date);
        const validCorrals = response.data?.filter(corral => corral !== null) || [];
        const count = validCorrals.length;

        const groupName = group.name.toLowerCase();
        if (groupName.includes('depilado')) {
          counts.depilados = count;
        } else if (groupName.includes('chamuscado')) {
          counts.chamuscados = count;
        } else if (groupName.includes('mercado')) {
          counts.mercado = count;
        } else if (groupName.includes('guayaquil')) {
          counts.guayaquil = count;
        }
      } catch (error) {
        console.error(`Error getting count for group ${group.id}:`, error);
      }
    }

    console.log(`Corral counts for line ${lineId} on date ${date?.toISOString()}:`, counts);
    return counts;
  } catch (error) {
    console.error('Error getting corral counts:', error);
    return {
      depilados: 0,
      chamuscados: 0,
      mercado: 0,
      guayaquil: 0,
    };
  }
}

// Returns total animals for a line and admission date
export async function getTotalAnimalsByLineService(idLine: number, admissionDate: Date | string): Promise<number> {
  const dateStr = typeof admissionDate === "string" ? admissionDate : `${admissionDate.getFullYear()}-${String(admissionDate.getMonth() + 1).padStart(2, '0')}-${String(admissionDate.getDate()).padStart(2, '0')}`;
  const res = await http
    .get("v1/1.0.0/status-corrals/total-by-line", {
      searchParams: {
        admissionDate: dateStr,
        idLine: idLine.toString(),
      },
      next: {
        tags: ["corrals", "totals"],
      },
    })
    .json<{ code: number; message: string; data: number }>();
  return typeof res.data === "number" ? res.data : 0;
}

// ---- New: Status by admission date ----

export async function getStatusCorralsByAdmissionDateService(
  admissionDate: Date | string
): Promise<StatusCorralByAdmission[]> {
  const dateStr = typeof admissionDate === "string" ? admissionDate : `${admissionDate.getFullYear()}-${String(admissionDate.getMonth() + 1).padStart(2, '0')}-${String(admissionDate.getDate()).padStart(2, '0')}`;
  const res = await http
    .get("v1/1.0.0/status-corrals/by-admission-date", {
      searchParams: { admissionDate: dateStr },
      next: { tags: ["corrals", "status-by-date"] },
    })
    .json<{ code: number; message: string; data: StatusCorralByAdmission[] }>();
  return Array.isArray(res.data) ? res.data : [];
}

// ---- New: Brand details service ----

export async function getBrandDetailsByGroupService(
  admissionDate: Date | string,
  idGroup: number
): Promise<BrandDetail[]> {
  try {
    const dateStr = typeof admissionDate === "string" ? admissionDate : `${admissionDate.getFullYear()}-${String(admissionDate.getMonth() + 1).padStart(2, '0')}-${String(admissionDate.getDate()).padStart(2, '0')}`;

    const res = await silentHttp
      .get("v1/1.0.0/setting-cert-brand/detail-corrals", {
        searchParams: {
          admissionDate: dateStr,
          idGroup: idGroup.toString()
        },
        timeout: 5000, // Reduced timeout to fail faster
      })
      .json<ResponseBrandDetails>();

    // Handle various response formats
    if (!res || res.code === 404 || res.code === 204 || res.code === 500) {
      return [];
    }

    if (res.code !== 200) {
      return [];
    }

    return Array.isArray(res.data) ? res.data : [];
  } catch (error: any) {
    // Handle all errors silently - no console messages
    return [];
  }
}

// ---- Optimized: Get all brand details for a line using multiple group calls ----

export async function getBrandDetailsByLineService(
  admissionDate: Date | string,
  idLine: number
): Promise<BrandDetail[]> {
  // Since the bulk endpoint doesn't exist, directly use the fallback approach
  return getBrandDetailsByLineServiceFallback(admissionDate, idLine);
}

// ---- Fallback: Individual group calls (used when bulk endpoint is not available) ----

export async function getBrandDetailsByLineServiceFallback(
  admissionDate: Date | string,
  idLine: number
): Promise<BrandDetail[]> {
  try {
    // Get all groups for the line
    const allGroups = await getAllCorralGroupsService();
    const lineGroups = allGroups.filter(group => group.idLine === idLine);

    if (lineGroups.length === 0) {
      return [];
    }

    // Use Promise.allSettled to avoid failing if some groups have no data
    const brandPromises = lineGroups.map(group =>
      getBrandDetailsByGroupService(admissionDate, group.id)
        .catch(() => []) // Return empty array on error
    );

    const results = await Promise.allSettled(brandPromises);

    // Flatten all successful results
    const allBrands: BrandDetail[] = [];
    results.forEach(result => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        allBrands.push(...result.value);
      }
    });

    return allBrands;
  } catch (error: any) {
    // Handle all errors silently
    return [];
  }
}

export async function closeCorralByStatusIdService(statusRecordId: number, close: boolean): Promise<{ code: number; message: string; data: any } | null> {
  try {
    const response = await http.patch(`v1/1.0.0/status-corrals/closeCorral/${statusRecordId}`, {
      json: { closeCorral: close },
      next: { tags: ["corrals", "status-close"] }
    }).json<{ code: number; message: string; data: any }>();
    return response;
  } catch (error) {
    console.error('Error closing corral status:', error);
    return null;
  }
}

export async function generateSpecieCodesService(lineId: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await http.post(
      `v1/1.0.0/detail-specie-cert/execute?lineId=${lineId}`
    ).json();
    return { success: true, message: 'Códigos generados exitosamente' };
  } catch (error) {
    console.error('Error generating specie codes:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al generar códigos'
    };
  }
}
