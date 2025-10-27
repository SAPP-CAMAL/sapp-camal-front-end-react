import { http } from "@/lib/ky";
import { HygieneControl, hygieneControlRequest, HygieneControlResponse, MappedHygieneControl } from "../../domain/hygiene-control.types";
import { EquipmentHygieneResponse } from "../../domain/equipment-hygiene-control.types";

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
        detail.settingHygiene.equipment.equipmentType.description;
      const equipmentDescription =
        detail.settingHygiene.equipment.description;

      if (!grouped[equipmentType]) {
        grouped[equipmentType] = [];
      }

      grouped[equipmentType].push(equipmentDescription);
    });

    return {
      id: item.id,
      employeeId: item.idEmployee,
      responsibleId: item.idVeterinarian,
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
  date: string
): Promise<MappedHygieneControl[]> => {
  try {
    const response = await http
      .get(`v1/1.0.0/hygiene-control/by-date-register?dateRegister=${date}`)
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
