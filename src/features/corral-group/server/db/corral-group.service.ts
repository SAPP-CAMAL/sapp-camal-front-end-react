import { http } from '@/lib/ky';
import type { CommonHttpResponse, CreateOrUpdateHttpResponse } from '@/features/people/domain';
import { CORRAL_GROUP_BY_SPECIE_LIST_TAG, CORRAL_GROUP_LIST_TAG } from '@/features/corral-group/constants';
import type { CorralGroupBySpecieResponse, GetAllCorralGroup } from '@/features/corral-group/domain';
import { CorralGroup } from '@/features/corrals/domain';

export const getAllCorralGroup = async () => {
	return http
		.get('v1/1.0.0/corral-group/all', {
			next: { tags: [CORRAL_GROUP_LIST_TAG] },
		})
		.json<CommonHttpResponse<GetAllCorralGroup>>();
};

export const getCorralGroupBySpecie = (specieId: string) => {
	return http
		.get('v1/1.0.0/corral-group/by-specie?idSpecie=' + specieId, {
			next: { tags: [CORRAL_GROUP_BY_SPECIE_LIST_TAG] },
		})
		.json<CommonHttpResponse<CorralGroupBySpecieResponse>>();
};

export const getCorralGroupBySpecieAndType = (specieId: string, typeId: string) => {
	return http
		.get('v1/1.0.0/corral-group/by-specie-corral-type', {
			searchParams: { idSpecie: specieId, idCorralType: typeId },
			next: { tags: [CORRAL_GROUP_BY_SPECIE_LIST_TAG] },
		})
		.json<CommonHttpResponse<CorralGroup & { idFinishType: number }>>();
};

export const getCorralGroupById = (id: string) => {
	return http
		.get('v1/1.0.0/corral-group', {
			searchParams: { id },
		})
		.json<CreateOrUpdateHttpResponse<CorralGroup & { idFinishType?: number }>>();
};
