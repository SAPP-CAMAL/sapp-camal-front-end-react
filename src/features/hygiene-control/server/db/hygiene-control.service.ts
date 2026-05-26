import { http } from "@/lib/ky";
import {
  HygieneControl,
  hygieneControlRequest,
  HygieneControlResponse,
  MappedHygieneControl,
} from "../../domain/hygiene-control.types";
import { EquipmentHygieneResponse } from "../../domain/equipment-hygiene-control.types";
import { mapCategoryKey } from "../../lib/normalize-category-key";

export const saveHygieneControlService = async (
  request: hygieneControlRequest
): Promise<HygieneControlResponse> => {
  try {
    const response = await http
      .post("v1/1.0.0/hygiene-control", {
        json: request,
      })
      .json<HygieneControlResponse>();

    return response;
  } catch (error) {
    throw error;
  }
};


export const mapHygieneControlData = (
  data: HygieneControl[]
): MappedHygieneControl[] => {
  return data.map((item) => {
    const grouped: Record<string, string[]> = {};

    item.detailsHygiene.forEach((detail: any) => {
      const equipmentType =
        detail.settingHygiene?.equipment?.equipmentType?.description ?? "";
      const equipmentDescription =
        detail.settingHygiene?.equipment?.description ?? "";
      const normalizedType = mapCategoryKey(equipmentType);

      if (!grouped[normalizedType]) {
        grouped[normalizedType] = [];
      }

      if (equipmentDescription) {
        grouped[normalizedType].push(equipmentDescription);
      }
    });

    const resolvedLineId =
      item.idLine ??
      item.idBiosecurityLine ??
      item.biosecurityLines?.idLine ??
      item.biosecurityLines?.id;

    return {
      id: item.id,
      employeeId: item.idEmployee,
      responsibleId: item.idVeterinarian,
      idLine: resolvedLineId,
      employeeFullName: item.employee.person.fullName ?? "—",
      responsibleFullName: item.veterinarian.user.person.fullName ?? "—",
      timeRegister: item.createdAt,
      commentary: item.commentary,
      detailsHygiene: item.detailsHygiene,
      detailsHygieneGrouped: grouped,
    };
  });
};




export const getHygieneControlByDateService = async (
rangeDate: {  startDate: string, endDate: string, idLine?: number}
): Promise<MappedHygieneControl[]> => {
  try {
    const response = await http
      .get(`v1/1.0.0/hygiene-control/by-date-register`, {
        searchParams: {
          startDate: rangeDate.startDate,
          endDate: rangeDate.endDate,
          ...(rangeDate.idLine
            ? { idBiosecurityLine: rangeDate.idLine.toString() }
            : {}),
        }
      })
      .json<HygieneControlResponse>();
    return mapHygieneControlData(response.data ?? []);
  } catch (error) {
    throw error;
  }
};

export function updateHygieneControlService(id: number,body:hygieneControlRequest): Promise<HygieneControlResponse> {
  return http.patch(`v1/1.0.0/hygiene-control/${id}`,
        { json: body }
    ).json()
}


export const removeHigieneControlById = (id: number) => {
	return http
		.delete(`v1/1.0.0/hygiene-control/${id.toString()}`);
};


export const getAllEquipmentHygieneControlService = async () => {
  const response = await http
    .get("v1/1.0.0/equipment/hygiene-control/all")
    .json<EquipmentHygieneResponse>();
  return response;
};
