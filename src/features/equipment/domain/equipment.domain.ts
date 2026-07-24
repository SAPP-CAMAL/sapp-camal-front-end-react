import { CommonHttpResponse } from "@/features/people/domain";

export type EquipmentType = {
    id: number;
    description: string;
    status: boolean;
}

export type Equipment = {
    id: number;
    idEquipmentType: number;
    description: string;
    status: boolean;
    equipmentType?: EquipmentType;
}

export type CreateEquipmentTypeBody = {
    description: string;
}

export type CreateEquipmentBody = {
    idEquipmentType: number;
    description: string;
}

export type ResponseEquipmentTypesService = CommonHttpResponse<EquipmentType>
export type ResponseEquipmentsService = CommonHttpResponse<Equipment>
