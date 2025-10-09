import { http } from '@/lib/ky';
import { CommonHttpResponse } from '@/features/people/domain';
import { ProductiveStage } from '@/features/productive-stage/domain';

export const getAllProductiveStages = async () => {
	return http.get('v1/1.0.0/productive-stage/all').json<CommonHttpResponse<ProductiveStage>>();
};

export const getProductiveStagesBySpecie = async (idSpecies: string | number) => {
	return http
		.get('v1/1.0.0/productive-stage/by-specie', {
			searchParams: { idSpecies },
		})
		.json<CommonHttpResponse<ProductiveStage>>();
};
