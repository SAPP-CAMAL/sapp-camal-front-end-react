import { http } from "@/lib/ky";
import type {
  SavePostmortemRequest,
  SavePostmortemResponse,
  GetPostmortemByBrandResponse,
  GetPostmortemByFiltersRequest,
  GetPostmortemByFiltersResponse,
} from "../../domain/save-postmortem.types";

/**
 * Guarda los datos de postmortem (productos y/o subproductos)
 */
export const savePostmortemService = async (
  request: SavePostmortemRequest
): Promise<SavePostmortemResponse> => {
  try {
    const response = await http
      .post("v1/1.0.0/postmortem", {
        json: request,
      })
      .json<SavePostmortemResponse>();

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Actualiza los datos de postmortem existentes
 */
export const updatePostmortemService = async (
  id: number,
  request: Omit<SavePostmortemRequest, "idDetailsSpeciesCertificate">
): Promise<SavePostmortemResponse> => {
  try {
    const response = await http
      .patch(`v1/1.0.0/postmortem/${id}`, {
        json: request,
      })
      .json<SavePostmortemResponse>();

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene los datos guardados de postmortem por marca
 */
export const getPostmortemByBrandService = async (
  idSettingCertificateBrands: number
): Promise<GetPostmortemByBrandResponse> => {
  try {
    const response = await http
      .get("v1/1.0.0/postmortem/by-setting-certificate-brand", {
        searchParams: {
          idSettingCertificateBrands: idSettingCertificateBrands.toString(),
        },
        next: {
          tags: ["postmortem", "by-brand"],
        },
      })
      .json<GetPostmortemByBrandResponse>();

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene los datos de postmortem filtrados por fecha y especie
 */
export const getPostmortemByFiltersService = async (
  request: GetPostmortemByFiltersRequest
): Promise<GetPostmortemByFiltersResponse> => {
  try {
    const response = await http
      .post("v1/1.0.0/postmortem/by-filters", {
        json: request,
        next: {
          tags: ["postmortem", "by-filters"],
        },
      })
      .json<GetPostmortemByFiltersResponse>();

    return response;
  } catch (error) {
    throw error;
  }
};
