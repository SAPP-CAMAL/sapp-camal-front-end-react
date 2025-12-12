import { http } from "@/lib/ky";
import { BiosecurityLineApiResponse, BiosecurityLines, BiosecurityLinesApiResponse } from "../../domain/biosecurityLines.types";
import { CommonHttpResponse } from "@/features/people/domain";

export const getSettingEquipmentsByBiosecurityLineService = async (
  idBiosecurityLine: number
)=> {
  try {
    const response = await http
      .get(
        `v1/1.0.0/setting-equipment-lines/by-biosecurity-line?idBiosecurityLine=${idBiosecurityLine}`
      )
      .json<CommonHttpResponse<BiosecurityLineApiResponse[]>>();

    return response; 
  } catch (error) {
    throw error;
  }
};

export const getAllBiosecurityLinesService = async () => {
  try {
    const response = await http
      .get("v1/1.0.0/biosecurity-lines/all")
      .json<BiosecurityLinesApiResponse>();

    return response;
  } catch (error) {
    throw error;
  }
};
