import { http } from "@/lib/ky";
import { ResponseMaterialsOrMethod } from "../../domain/cleaning-dosage.types";

export const getAllMaterialsService = async (): Promise<ResponseMaterialsOrMethod> => {
  try {
    const response = await http
      .get("v1/1.0.0/cleaning-material/all")
      .json<ResponseMaterialsOrMethod>();

    return response;
  } catch (error) {
    throw error;
  }
}; 

export const getAllMethodsService = async (): Promise<ResponseMaterialsOrMethod> => {
  try {
    const response = await http
      .get("v1/1.0.0/cleaning-method/all")
      .json<ResponseMaterialsOrMethod>();

    return response;
  } catch (error) {
    throw error;
  }
}; 