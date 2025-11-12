import { http } from '@/lib/ky';
import { CORRAL_BY_TYPE_AND_GROUP_LIST_TAG } from '../../constants';
import { Corral } from '../../domain/corral';
import { CommonHttpResponse, CreateOrUpdateHttpResponse } from '@/features/people/domain';

export const getCorralsByTypeAndGroup = (corralTypeId: string, groupId: string) => {
	return http
		.get('v1/1.0.0/corral-group-detail/corrals/by-group-type', {
			next: { tags: [CORRAL_BY_TYPE_AND_GROUP_LIST_TAG] },
			searchParams: { idCorralType: corralTypeId, idGroup: groupId },
		})
		.json<CommonHttpResponse<Corral>>();
};

export const getCorralById = (id: string | number) => {
	return http.get('v1/1.0.0/corral', { searchParams: { id } }).json<CreateOrUpdateHttpResponse<Corral>>();
};
