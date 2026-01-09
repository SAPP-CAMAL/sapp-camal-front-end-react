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
