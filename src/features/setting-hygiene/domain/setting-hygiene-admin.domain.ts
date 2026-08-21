import { CommonHttpResponsePagination, CommonHttpResponseSingle } from "@/features/people/domain";

export type SettingHygieneAdmin = {
    id: number;
    idEquipment: number;
    status: boolean;
    equipment?: {
        id: number;
        description: string;
        equipmentType?: { id: number; description: string };
    };
}

export type CreateSettingHygieneBody = {
    idEquipment: number;
    status?: boolean;
}

export type SearchParamsSettingHygiene = {
    page?: number;
    limit?: number;
    status?: boolean;
}

export type ResponseSettingHygieneAdminAll = CommonHttpResponseSingle<SettingHygieneAdmin[]>
export type ResponseSettingHygieneAdminPaginated = CommonHttpResponsePagination<SettingHygieneAdmin>

export type EquipmentOption = {
    id: number;
    description: string;
    status: boolean;
    equipmentType?: { id: number; description: string };
}

export type ResponseEquipmentAll = CommonHttpResponseSingle<EquipmentOption[]>
