import { CommonHttpResponsePagination } from "@/features/people/domain";

export interface Line {
  id:          number;
  name:        string;
  description: string;
  status:      boolean;
  idSpecie?:    number;
  specie?: { id: number; name: string };
}

export type CreateLineBody = {
  name: string;
  idSpecie: number;
  description?: string;
  status?: boolean;
};

export type SearchParamsLine = {
  page?: number;
  limit?: number;
  name?: string;
  status?: string;
};

export type ResponseLinesAdmin = CommonHttpResponsePagination<Line>;
