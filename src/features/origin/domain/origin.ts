import { CommonHttpResponsePagination } from "@/features/people/domain";

export interface Origin {
	id: number;
	description: string;
	status: boolean;
}

export type SearchParamsOrigin = {
	page?: number;
	limit?: number;
	description?: string;
};

export type ResponseOriginPaginated = CommonHttpResponsePagination<Origin>;
