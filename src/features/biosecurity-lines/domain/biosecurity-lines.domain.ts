import { CommonHttpResponse, CommonHttpResponsePagination } from "@/features/people/domain";
import { Equipment } from "@/features/equipment/domain/equipment.domain";

export type BiosecurityLine = {
    id: number;
    idLine: number;
    name: string;
    status: boolean;
}

export type SettingEquipmentLine = {
    id: number;
    idBiosecurityLine: number;
    idEquipment: number;
    status: boolean;
    equipment?: Equipment;
}

export type CreateBiosecurityLineBody = {
    idLine: number;
    name: string;
}

export type CreateSettingEquipmentLineBody = {
    idBiosecurityLine: number;
    idEquipment: number;
}

export type SearchParamsBiosecurityLines = {
    page?: number;
    limit?: number;
    name?: string;
    idLine?: number;
    status?: boolean;
}

export type ResponseBiosecurityLinesService = CommonHttpResponse<BiosecurityLine>
export type ResponseBiosecurityLinesPaginated = CommonHttpResponsePagination<BiosecurityLine>
export type ResponseSettingEquipmentLinesService = CommonHttpResponse<SettingEquipmentLine>
