import { CommonHttpResponseSingle } from "@/features/people/domain";

export type CorralGroupAdmin = {
    id: number;
    name: string;
    description?: string;
    idLine: number;
    idFinishType?: number;
    order: number;
    status: boolean;
    line?: { id: number; name: string; specie?: { id: number; name: string } };
    finishType?: { id: number; name: string };
}

export type CreateCorralGroupBody = {
    name: string;
    description?: string;
    idLine: number;
    idFinishType?: number | null;
    order: number;
    status?: boolean;
}

export type CorralGroupDetail = {
    id: number;
    corralId: number;
    groupId: number;
    status: boolean;
    corral?: { id: number; name: string };
}

export type CreateCorralGroupDetailBody = {
    corralId: number;
    groupId: number;
    status?: boolean;
}

export type CorralOption = {
    id: number;
    name: string;
    status: boolean;
}

export type ResponseCorralGroupsAll = CommonHttpResponseSingle<CorralGroupAdmin[]>
export type ResponseCorralGroupDetailsAll = CommonHttpResponseSingle<CorralGroupDetail[]>
export type ResponseCorralsAll = CommonHttpResponseSingle<CorralOption[]>
export type ResponseLinesAll = CommonHttpResponseSingle<{ id: number; name: string; status: boolean; specie?: { id: number; name: string } }[]>
export type ResponseFinishTypesAll = CommonHttpResponseSingle<{ id: number; name: string; status: boolean }[]>
