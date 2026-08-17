import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";

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
    status?: boolean;
}

export type CreateEquipmentBody = {
    idEquipmentType: number;
    description: string;
    status?: boolean;
}

export type SearchParamsEquipmentType = {
    page?: number;
    limit?: number;
    description?: string;
    status?: boolean;
}

export type SearchParamsEquipment = {
    page?: number;
    limit?: number;
    description?: string;
    idEquipmentType?: number;
    status?: boolean;
}

export type ResponseEquipmentTypesService = CommonHttpResponse<EquipmentType>
export type ResponseEquipmentsService = CommonHttpResponse<Equipment>
export type ResponseEquipmentTypesPaginated = CommonHttpResponsePagination<EquipmentType>
export type ResponseEquipmentsPaginated = CommonHttpResponsePagination<Equipment>
