import { CommonHttpResponsePagination } from "@/features/people/domain";

export interface BedType {
  id:          number;
  description: string;
  status:      boolean;
}

export type SearchParamsBedType = {
  page?: number;
  limit?: number;
  description?: string;
  status?: string;
};

export type ResponseBedTypePaginated = CommonHttpResponsePagination<BedType>;
