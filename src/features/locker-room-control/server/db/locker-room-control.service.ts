import { http } from "@/lib/ky";
import { LockerRoomControl, LockerRoomControlRequest, LockerRoomControlResponse, MappedLockerRoomControl } from "../../domain/locker-room-control.types";

export const saveLockerRoomControlService = async (
  request: LockerRoomControlRequest
): Promise<LockerRoomControlResponse> => {
  try {
    const response = await http
      .post("v1/1.0.0/locker-room-control", {
        json: request,
      })
      .json<LockerRoomControlResponse>();

    return response;
  } catch (error) {
    throw error;
  }
};

export const getAllLockerRoomControlService = async (): Promise<LockerRoomControlResponse> => {
  try {
    const response = await http
      .get("v1/1.0.0/locker-room-control/all")
      .json<LockerRoomControlResponse>();

    return response;
  } catch (error) {
    throw error;
  }
};

export const mapLockerRoomControlResponse = (
  data: LockerRoomControl[]
): MappedLockerRoomControl[] => {
  return data.map(item => {
    const groupedEquipment = item.detailsLocker.reduce((acc, detail) => {
      // Normalizar la clave a mayúsculas y quitar espacios extra
      const type = detail.equipment.equipmentType.description.toUpperCase().trim();
      if (!acc[type]) acc[type] = [];
      acc[type].push(detail.equipment.description);
      return acc;
    }, {} as Record<string, string[]>);

    console.log('🔍 Claves de equipamiento agrupado:', Object.keys(groupedEquipment));

    return {
      id:item.id,
      employeeId: item.idEmployee,
      responsibleId: item.idResponsible,
      timeRegister: item.timeRegister,
      employeeFullName: item.employeeFullName,
      responsibleFullName: item.responsibleFullName,
      observations: item.observationsLocker.map(o => o.observationName),
      detailsLockerGrouped: groupedEquipment,
      biosecurityLine:item.detailsLocker[0]?.biosecurityLine.id,
      observationsLocker:item.observationsLocker,

    };
  });
};

export const getLockerRoomControlByDateService = async (options: {
  startDate: string,
  endDate: string,
  idLine:number
}): Promise<MappedLockerRoomControl[]> => {
  try {
    const response = await http
      .get(`v1/1.0.0/locker-room-control/by-date-register`, {
        searchParams: options
      })
      .json<LockerRoomControlResponse>();

    // Mapeas solo el array que viene en data
    return mapLockerRoomControlResponse(response.data ?? []);
  } catch (error) {
    throw error;
  }
};

export function updateLockerRoomControlService(id: number,body:LockerRoomControlRequest): Promise<LockerRoomControlResponse> {
  return http.patch(`v1/1.0.0/locker-room-control/${id}`,
        { json: body }
    ).json()
}


export const removeLockerRoomControlById = (id: number) => {
	return http
		.delete(`v1/1.0.0/locker-room-control/${id.toString()}`);
};
