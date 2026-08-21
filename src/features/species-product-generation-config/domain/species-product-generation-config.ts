import { CommonHttpResponsePagination } from "@/features/people/domain";

export interface SpeciesProductGenerationConfig {
  id: number;
  idSpecies: number;
  species?: {
    id: number;
    name: string;
  };
  generateProducts: boolean;
  generateSubproducts: boolean;
  status: boolean;
}

export type SearchParamsSpeciesProductGenerationConfig = {
  page?: number;
  limit?: number;
  idSpecies?: number;
  status?: boolean;
};

export type UpdateSpeciesProductGenerationConfigBody = Partial<{
  generateProducts: boolean;
  generateSubproducts: boolean;
  status: boolean;
}>;

export type ResponseSpeciesProductGenerationConfigPaginated =
  CommonHttpResponsePagination<SpeciesProductGenerationConfig>;
