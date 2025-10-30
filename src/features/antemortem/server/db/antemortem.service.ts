import { http } from "@/lib/ky";
import { 
  GetAllLinesResponse, 
  LineItem, 
  updateLineIds, 
  mapLineItemToLineaType, 
  LineaType,
  GetCorralDetailsResponse,
  StatusCorralDetail,
  mapStatusCorralToAntemortemRow,
  GetAnimalsByBrandResponse,
  AnimalDetail,
  GetClinicalSignsResponse,
  GetCausesOfDeathResponse,
  GetOpinionsResponse,
  SaveAntemortemRequest,
  SaveAntemortemResponse,
  GetAntemortemByAnimalResponse,
  UpdateAntemortemRequest,
  UpdateAntemortemResponse,
  GetObservationsByStatusCorralResponse
} from "../../domain/line.types";
import { AntemortemRow } from "../../domain";

/**
 * Servicio para obtener todas las líneas disponibles desde la API
 * @returns Promise con la respuesta completa de la API
 */
export const getAllLinesService = async (): Promise<GetAllLinesResponse> => {
  try {
    const response = await http.get("v1/1.0.0/line/all", {
      next: {
        tags: ["antemortem", "lines"],
      }
    }).json<GetAllLinesResponse>();

    // Actualizar los IDs de líneas globalmente cuando se obtienen los datos
    if (response.code === 200 && response.data) {
      updateLineIds(response.data);
    }

    return response;
  } catch (error) {
    console.error('Error fetching all lines:', error);
    throw error;
  }
};

/**
 * Obtiene solo las líneas activas y las mapea a nuestro tipo local
 * @returns Array de líneas activas mapeadas a LineaType
 */
export const getActiveLinesService = async (): Promise<LineaType[]> => {
  try {
    const response = await getAllLinesService();
    
    if (response.code !== 200 || !response.data) {
      return [];
    }

    // Filtrar líneas activas y mapear a nuestro tipo
    const activeLines = response.data
      .filter(line => line.status === true)
      .map(mapLineItemToLineaType);

    // Remover duplicados si los hay
    return [...new Set(activeLines)];
  } catch (error) {
    console.error('Error fetching active lines:', error);
    return [];
  }
};

/**
 * Obtiene los datos completos de las líneas activas
 * @returns Array de LineItem activas
 */
export const getActiveLinesDataService = async (): Promise<LineItem[]> => {
  try {
    const response = await getAllLinesService();
    
    if (response.code !== 200 || !response.data) {
      return [];
    }

    // Filtrar solo líneas activas
    return response.data.filter(line => line.status === true);
  } catch (error) {
    console.error('Error fetching active lines data:', error);
    return [];
  }
};

/**
 * Busca una línea específica por su description
 * @param description - Descripción a buscar (ej: "Bovino", "Porcino", etc.)
 * @returns LineItem encontrada o null
 */
export const getLineByDescriptionService = async (description: string): Promise<LineItem | null> => {
  try {
    const response = await getAllLinesService();
    
    if (response.code !== 200 || !response.data) {
      return null;
    }

    const normalizedDescription = description.toLowerCase();
    return response.data.find(line => 
      line.description?.toLowerCase().includes(normalizedDescription) ||
      line.specie?.description?.toLowerCase().includes(normalizedDescription)
    ) || null;
  } catch (error) {
    console.error(`Error finding line by description '${description}':`, error);
    return null;
  }
};

/**
 * Obtiene los detalles de corrales con observaciones filtrados por fecha y línea
 * @param admissionDate - Fecha de admisión en formato YYYY-MM-DD
 * @param idLine - ID de la línea
 * @returns Promise con los detalles de corrales incluyendo haveObservations
 */
export const getCorralDetailsService = async (
  admissionDate: string, 
  idLine: number
): Promise<GetCorralDetailsResponse> => {
  try {
    const response = await http.get("v1/1.0.0/status-corrals/detail-corrals-observations", {
      searchParams: {
        admissionDate,
        idLine: idLine.toString()
      },
      next: {
        tags: ["antemortem", "corrals", "details"],
      }
    }).json<GetCorralDetailsResponse>();

    return response;
  } catch (error) {
    console.error('Error fetching corral details:', error);
    throw error;
  }
};

/**
 * Obtiene los datos de antemortem mapeados a nuestro formato local
 * @param admissionDate - Fecha de admisión en formato YYYY-MM-DD
 * @param idLine - ID de la línea
 * @returns Array de AntemortemRow
 */
export const getAntemortemDataService = async (
  admissionDate: string, 
  idLine: number
): Promise<AntemortemRow[]> => {
  try {
    const response = await getCorralDetailsService(admissionDate, idLine);
    
    if (response.code !== 200 || !response.data) {
      return [];
    }

    // Mapear cada StatusCorralDetail a AntemortemRow
    return response.data.map(mapStatusCorralToAntemortemRow);
  } catch (error) {
    console.error('Error fetching antemortem data:', error);
    return [];
  }
};

/**
 * Servicio para obtener los animales de una marca específica
 * @param idSettingCertificateBrands - ID del setting certificate brands
 * @returns Promise con los detalles de los animales
 */
export const getAnimalsByBrandService = async (
  idSettingCertificateBrands: number
): Promise<GetAnimalsByBrandResponse> => {
  try {
    const response = await http.get(`v1/1.0.0/detail-specie-cert/by-setting-certificate-brands`, {
      searchParams: {
        idSettingCertificateBrands: idSettingCertificateBrands.toString()
      },
      next: {
        tags: ["antemortem", "animals-by-brand"],
      }
    }).json<GetAnimalsByBrandResponse>();

    return response;
  } catch (error) {
    console.error('Error fetching animals by brand:', error);
    throw error;
  }
};

/**
 * Obtiene los signos clínicos por especie
 * @param idSpecie - ID de la especie
 * @returns Promise con los signos clínicos
 */
export const getClinicalSignsBySpecieService = async (
  idSpecie: number
): Promise<GetClinicalSignsResponse> => {
  try {
    const response = await http.get(`v1/1.0.0/clinical-signs-species/by-specie`, {
      searchParams: {
        idSpecie: idSpecie.toString()
      },
      next: {
        tags: ["antemortem", "clinical-signs"],
      }
    }).json<GetClinicalSignsResponse>();

    return response;
  } catch (error) {
    console.error('Error fetching clinical signs by specie:', error);
    throw error;
  }
};

/**
 * Obtiene todas las causas de muerte disponibles
 * @returns Promise con las causas de muerte
 */
export const getCausesOfDeathService = async (): Promise<GetCausesOfDeathResponse> => {
  try {
    const response = await http.get(`v1/1.0.0/causes-death/all`, {
      next: {
        tags: ["antemortem", "causes-death"],
      }
    }).json<GetCausesOfDeathResponse>();

    return response;
  } catch (error) {
    console.error('Error fetching causes of death:', error);
    throw error;
  }
};

/**
 * Obtiene todas las opiniones/dictámenes disponibles
 * @returns Promise con las opiniones
 */
export const getOpinionsService = async (): Promise<GetOpinionsResponse> => {
  try {
    const response = await http.get(`v1/1.0.0/opinion/all`, {
      next: {
        tags: ["antemortem", "opinions"],
      }
    }).json<GetOpinionsResponse>();

    return response;
  } catch (error) {
    console.error('Error fetching opinions:', error);
    throw error;
  }
};

/**
 * Actualiza el número de argollas para un corral específico
 * @param statusCorralId - ID del status corral a actualizar
 * @param numberRings - Nuevo número de argollas
 * @returns Promise con la respuesta de la API
 */
export const updateArgollasService = async (
  statusCorralId: number,
  numberRings: number
): Promise<{ code: number; message: string; data?: any }> => {
  try {
    const response = await http.patch(`v1/1.0.0/status-corrals/${statusCorralId}`, {
      json: {
        numberRings
      },
      next: {
        tags: ["antemortem", "argollas"],
      }
    }).json<{ code: number; message: string; data?: any }>();

    return response;
  } catch (error) {
    console.error('Error updating argollas:', error);
    throw error;
  }
};

/**
 * Guarda los datos de antemortem para un animal
 * @param antemortemData - Datos del antemortem a guardar
 * @returns Promise con la respuesta de la API
 */
export const saveAntemortemService = async (
  antemortemData: SaveAntemortemRequest
): Promise<SaveAntemortemResponse> => {
  try {
    const response = await http.post(`v1/1.0.0/antemortem`, {
      json: antemortemData,
      next: {
        tags: ["antemortem", "save"],
      }
    }).json<SaveAntemortemResponse>();

    return response;
  } catch (error) {
    console.error('Error saving antemortem data:', error);
    throw error;
  }
};

/**
 * Obtiene los datos de antemortem existentes para un animal específico
 * @param idDetailsSpeciesCertificate - ID del animal (AnimalDetail.id)
 * @returns Promise con los datos de antemortem si existen
 */
export const getAntemortemByAnimalService = async (
  idDetailsSpeciesCertificate: number
): Promise<GetAntemortemByAnimalResponse> => {
  try {
    const response = await http.get(`v1/1.0.0/antemortem/by-detail-specie-certificate`, {
      searchParams: {
        idDetailsSpeciesCertificate: idDetailsSpeciesCertificate.toString()
      },
      next: {
        tags: ["antemortem", "get-by-animal"],
      }
    }).json<GetAntemortemByAnimalResponse>();

    return response;
  } catch (error) {
    console.error('Error fetching antemortem data by animal:', error);
    throw error;
  }
};

/**
 * Actualiza un registro de antemortem existente
 * @param antemortemId - ID del registro de antemortem a actualizar
 * @param updateData - Datos para actualizar el registro
 * @returns Promise con la respuesta de la actualización
 */
export const updateAntemortemService = async (
  antemortemId: number,
  updateData: UpdateAntemortemRequest
): Promise<UpdateAntemortemResponse> => {
  try {
    const response = await http.patch(`v1/1.0.0/antemortem/${antemortemId}`, {
      json: updateData,
      next: {
        tags: ["antemortem", "update"],
      }
    }).json<UpdateAntemortemResponse>();

    return response;
  } catch (error) {
    console.error(`Error updating antemortem record ${antemortemId}:`, error);
    throw error;
  }
};

/**
 * Obtiene las observaciones detalladas por status corral
 * @param admissionDate - Fecha de admisión en formato YYYY-MM-DD
 * @param statusCorralId - ID del status corral
 * @returns Promise con las observaciones de los animales
 */
export const getObservationsByStatusCorralService = async (
  admissionDate: string,
  statusCorralId: number
): Promise<GetObservationsByStatusCorralResponse> => {
  try {
    const response = await http.get(`v1/1.0.0/status-corrals/observations-by-status-corrals`, {
      searchParams: {
        admissionDate,
        id: statusCorralId.toString()
      },
      next: {
        tags: ["antemortem", "observations"],
      }
    }).json<GetObservationsByStatusCorralResponse>();

    return response;
  } catch (error) {
    console.error('Error fetching observations by status corral:', error);
    throw error;
  }
};
