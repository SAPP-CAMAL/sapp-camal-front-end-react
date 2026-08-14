import { CommonHttpResponsePagination } from "@/features/people/domain";

export interface ArrivalConditions {
  id:          number;
  description: string;
  status:      boolean;
}

export type SearchParamsArrivalConditions = {
  page?: number;
  limit?: number;
  description?: string;
  status?: string;
};

export type ResponseArrivalConditionsPaginated = CommonHttpResponsePagination<ArrivalConditions>;
