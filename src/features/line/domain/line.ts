import { CommonHttpResponseSingle } from "@/features/people/domain";

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

export type ResponseLinesAdmin = CommonHttpResponseSingle<Line[]>;
