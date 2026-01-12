import { http } from "@/lib/ky";
import { CleaningDosage, CleaningDosageRequest, CleaningDosageResponse } from "../../domain/cleaning-dosage.types";


export const saveCleaningDosageService = async (
  request: CleaningDosageRequest
): Promise<CleaningDosageResponse> => {
  try {
    const response = await http
      .post("v1/1.0.0/cleaning-dosage", {
        json: request,
      })
      .json<CleaningDosageResponse>();

    return response;
  } catch (error) {
    throw error;
  }
};



export const getCleaningDosageByDateService = async (
  options: { startDate: string; endDate: string }
): Promise<CleaningDosage[]> => {
  try {
    const response = await http
      .get(`v1/1.0.0/cleaning-dosage/by-date-register`, {
        searchParams: options
      })
      .json<CleaningDosageResponse>();

    return response.data;
  } catch (error) {
    throw error;
  }
};


export function updateCleaningDosageService(id: number,body:CleaningDosageRequest): Promise<CleaningDosageResponse> {
  return http.patch(`v1/1.0.0/cleaning-dosage/${id}`,
        { json: body }
    ).json()
}


export const removeCleaningDosageById = (id: number) => {
	return http
		.delete(`v1/1.0.0/cleaning-dosage/${id.toString()}`);
};


/**
 * @param startDate - Fecha de inicio en formato YYYY-MM-DD
 * @param endDate - Fecha de fin en formato YYYY-MM-DD
 * @param typeReport - Tipo de reporte: 'EXCEL' o 'PDF'
 * @returns Promise con el blob y nombre del archivo
 */
export const getCleaningDosageReport = async (
  startDate: string,
  endDate: string,
  reportType: 'EXCEL' | 'PDF'
) => {
  try {
    const response = await http.get('v1/1.0.0/cleaning-dosage/by-date-register-report', {
      searchParams: { startDate, endDate, reportType },
    });

    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || '';
    const contentDisposition = response.headers.get('content-disposition') || '';

    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    const defaultFilename = `Reporte-dosificacion-limpieza-${startDate}.${reportType.toLowerCase() === 'excel' ? 'xlsx' : 'pdf'}`;
    const filename = filenameMatch?.[1]?.replace(/['"]/g, '') || defaultFilename;

    return { blob, filename, contentType };
  } catch (error) {
    throw error;
  }
};
