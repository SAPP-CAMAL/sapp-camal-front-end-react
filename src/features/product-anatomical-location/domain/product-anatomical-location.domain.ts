import { CommonHttpResponse } from "@/features/people/domain";

export type ProductAnatomicalLocation = {
    id: number;
    idProduct: number;
    code: string;
    name: string;
    bodyRegion: string | null;
    status: boolean;
}

export type CreateProductAnatomicalLocationBody = {
    idProduct: number;
    code: string;
    name: string;
    bodyRegion?: string;
}

export type ResponseProductAnatomicalLocationService = CommonHttpResponse<ProductAnatomicalLocation>
