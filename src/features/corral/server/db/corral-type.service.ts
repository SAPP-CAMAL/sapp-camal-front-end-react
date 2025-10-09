import { http } from '@/lib/ky';
import { CorralType } from '@/features/corral/domain';
import { CommonHttpResponse } from '@/features/people/domain';
import { ALL_CORRAL_TYPE_LIST_TAG } from '@/features/corral/constants';

export const getAllCorralType = () => {
	return http
		.get('v1/1.0.0/corral-type/all', {
			next: { tags: [ALL_CORRAL_TYPE_LIST_TAG] },
		})
		.json<CommonHttpResponse<CorralType>>();
};
