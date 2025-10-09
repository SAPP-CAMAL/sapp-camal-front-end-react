import { http } from '@/lib/ky';
import { ArrivalConditions } from '../../domain';
import { ARRIVAL_CONDITIONS_LIST_TAG } from '../../constants';
import { CommonHttpResponse } from '@/features/people/domain';

export const getAllArrivalConditions = () => {
	return http
		.get('v1/1.0.0/conditions-arrival/all', {
			next: { tags: [ARRIVAL_CONDITIONS_LIST_TAG] },
		})
		.json<CommonHttpResponse<ArrivalConditions>>();
};
