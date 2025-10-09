import { http } from '@/lib/ky';
import { DISINFECTANT_LIST_TAG } from '@/features/disinfectant/constants';
import { DisinfectantListResponse } from '@/features/disinfectant/domain';

export const getAllDisinfectants = () => {
	return http
		.get('v1/1.0.0/disinfectant/all', {
			next: { tags: [DISINFECTANT_LIST_TAG] },
		})
		.json<DisinfectantListResponse>();
};
