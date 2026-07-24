import { CommonHttpResponse } from "@/features/people/domain";

export type ProductDisease = {
    id: number;
    idProduct: number;
    idDisease: number;
    idDiseaseGroup: number;
    status: boolean;
    product?: {
        id: number;
        description: string;
    };
    disease?: {
        id: number;
        names: string;
    };
    diseaseGroup?: {
        id: number;
        name: string;
    };
}

export type CreateProductDiseaseBody = {
    idProduct: number;
    idDisease: number;
    idDiseaseGroup: number;
}

export type ResponseProductDiseaseService = CommonHttpResponse<ProductDisease>
