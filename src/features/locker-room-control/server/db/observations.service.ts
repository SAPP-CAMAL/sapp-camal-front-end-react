import { http } from "@/lib/ky";
import { ResponseObservations } from "../../domain/observations.types";

export const getAllObservationsService = async (): Promise<ResponseObservations> => {
  try {
    const response = await http
      .get("v1/1.0.0/observations/all")
      .json<ResponseObservations>();

    return response;
  } catch (error) {
    throw error;
  }
}; 