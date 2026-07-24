import { CommonHttpResponseSingle } from "@/features/people/domain";

export type SpecieAdmin = {
    id: number;
    name: string;
    code: string;
    description?: string | null;
    status: boolean;
};

export type CreateSpecieBody = {
    name: string;
    code: string;
    description?: string;
    status?: boolean;
};

export type ResponseSpeciesAdmin = CommonHttpResponseSingle<SpecieAdmin[]>;
