import { http } from '@/lib/ky';
import { ProductiveStage } from '@/features/productive-stage/domain';
import { CommonHttpResponse, CreateOrUpdateHttpResponse, CommonHttpResponseSingle } from '@/features/people/domain';

export type FairProductiveStage = {
	id: number;
	name: string;
	description: string;
	status: boolean;
};

export const getAllProductiveStages = async () => {
	return http.get('v1/1.0.0/productive-stage/all').json<CommonHttpResponse<ProductiveStage>>();
};

export const getFairProductiveStagesAll = async () => {
	return http.get('v1/1.0.0/fair/productive-stage/all').json<CommonHttpResponse<FairProductiveStage>>();
};

export const getProductiveStagesByIdService = (id: number | string) => {
	return http
		.get('v1/1.0.0/productive-stage', {
			searchParams: { id },
		})
		.json<CreateOrUpdateHttpResponse<ProductiveStage>>();
};

export const getProductiveStagesBySpecie = async (idSpecies: string | number) => {
	return http
		.get('v1/1.0.0/productive-stage/by-specie', {
			searchParams: { idSpecies },
		})
		.json<CommonHttpResponse<ProductiveStage>>();
};

export type CreateProductiveStageRequest = {
	name: string;
	description: string;
	status: boolean;
};

export type ProductiveStageCreated = {
	name: string;
	description: string;
	status: boolean;
	createdAt: string;
	userCreated: number;
	userOrigin: string;
	updatedAt: string | null;
	userUpdated: string | null;
	nroVersion: number;
	id: number;
};

export const createProductiveStage = (body: CreateProductiveStageRequest) => {
	return http
		.post('v1/1.0.0/fair/productive-stage', { json: body })
		.json<CommonHttpResponseSingle<ProductiveStageCreated>>();
};
