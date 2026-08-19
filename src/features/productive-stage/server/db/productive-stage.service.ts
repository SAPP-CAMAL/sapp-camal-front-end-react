import { http } from '@/lib/ky';
import { CreateProductiveStageBody, ProductiveStage, SearchParamsProductiveStage } from '@/features/productive-stage/domain';
import { CommonHttpResponse, CommonHttpResponsePagination, CreateOrUpdateHttpResponse } from '@/features/people/domain';

export const getAllProductiveStages = async () => {
	return http.get('v1/1.0.0/productive-stage/all').json<CommonHttpResponse<ProductiveStage>>();
};

export const getProductiveStagesPaginatedService = (searchParams: SearchParamsProductiveStage) => {
	return http
		.get('v1/1.0.0/productive-stage/list', { searchParams })
		.json<CommonHttpResponsePagination<ProductiveStage>>();
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

export const createProductiveStageService = (body: CreateProductiveStageBody) => {
	return http.post('v1/1.0.0/productive-stage', { json: body }).json();
};

export const updateProductiveStageService = (id: number, body: Partial<CreateProductiveStageBody>) => {
	return http.patch(`v1/1.0.0/productive-stage/${id}`, { json: body }).json();
};

export const deleteProductiveStageService = (id: number) => {
	return http.delete(`v1/1.0.0/productive-stage/${id}`).json();
};

export const deleteProductiveStagePermanentlyService = (id: number) => {
	return http.delete(`v1/1.0.0/productive-stage/${id}/permanent`).json();
};
