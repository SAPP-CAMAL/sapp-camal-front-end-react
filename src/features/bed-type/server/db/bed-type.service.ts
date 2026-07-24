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

export const createBedType = (body: { description: string }) => {
	return http.post('v1/1.0.0/bed-type', { json: body }).json();
};

export const updateBedType = (id: number, body: Partial<{ description: string; status: boolean }>) => {
	return http.patch(`v1/1.0.0/bed-type/${id}`, { json: body }).json();
};

export const deleteBedType = (id: number) => {
	return http.delete(`v1/1.0.0/bed-type/${id}`).json();
};
