import { CommonHttpResponsePagination } from "@/features/people/domain";

export interface ProductType {
  id: number;
  typeName: string;
  code: string;
  description?: string | null;
  status: boolean;
}

export type SearchParamsProductType = {
  page?: number;
  limit?: number;
  typeName?: string;
  status?: boolean;
};

export type ResponseProductTypePaginated = CommonHttpResponsePagination<ProductType>;
