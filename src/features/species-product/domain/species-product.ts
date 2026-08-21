import { CommonHttpResponsePagination } from "@/features/people/domain";

export interface SpeciesProduct {
  id: number;
  idSpecies: number;
  idProductType: number;
  productType?: {
    id: number;
    typeName: string;
    code: string;
  };
  productName: string;
  productCode: string;
  idAnimalSex?: number | null;
  displayOrder: number;
  status: boolean;
}

export type SearchParamsSpeciesProduct = {
  page?: number;
  limit?: number;
  productName?: string;
  status?: boolean;
  idSpecies?: number;
};

export type ResponseSpeciesProductPaginated = CommonHttpResponsePagination<SpeciesProduct>;
