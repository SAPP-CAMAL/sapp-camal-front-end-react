import { CommonHttpResponse } from "@/features/people/domain";

export type CleaningAreaStructureItem = {
    id: number;
    idCatalog: number;
    catalogName: string;
    catalogType?: string | null;
    orderIndex?: number | null;
    status: boolean;
}

export type CleaningAreaGrouped = {
    idArea: number;
    idAreaCatalog: number;
    areaCatalogName: string;
    areaCatalogDescription?: string | null;
    areaOrderIndex?: number | null;
    structures: CleaningAreaStructureItem[];
}

export type ResponseCleaningAreasByLineService = CommonHttpResponse<CleaningAreaGrouped>

export type CreateCleaningAreaBody = {
    idLine: number;
    idAreaCatalog: number;
    orderIndex?: number | null;
}

export type CreateCleaningAreaStructureBody = {
    idArea: number;
    idCatalog: number;
    orderIndex?: number | null;
}

export type UpdateCleaningAreaBody = {
    idLine?: number;
    idAreaCatalog?: number;
    orderIndex?: number | null;
    status?: boolean;
}
