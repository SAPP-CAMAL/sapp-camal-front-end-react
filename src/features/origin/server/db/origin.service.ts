import { http } from '@/lib/ky';
import { Origin } from '@/features/origin/domain';
import { CommonHttpResponse } from '@/features/people/domain';
import { ORIGIN_LIST_TAG } from '@/features/origin/constants';

export const getAllOrigins = async () => {
	return http
		.get('v1/1.0.0/origin/all', {
			next: { tags: [ORIGIN_LIST_TAG] },
		})
		.json<CommonHttpResponse<Origin>>();
};
