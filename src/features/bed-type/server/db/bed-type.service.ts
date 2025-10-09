import { http } from '@/lib/ky';
import { BedType } from '../../domain';
import { BED_TYPE_LIST_TAG } from '../../constants';
import { CommonHttpResponse } from '@/features/people/domain';

export const getAllBedTypes = () => {
	return http
		.get('v1/1.0.0/bed-type/all', {
			next: { tags: [BED_TYPE_LIST_TAG] },
		})
		.json<CommonHttpResponse<BedType>>();
};
