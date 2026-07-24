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

export const createArrivalCondition = (body: { description: string }) => {
	return http.post('v1/1.0.0/conditions-arrival', { json: body }).json();
};

export const updateArrivalCondition = (id: number, body: Partial<{ description: string; status: boolean }>) => {
	return http.patch(`v1/1.0.0/conditions-arrival/${id}`, { json: body }).json();
};

export const deleteArrivalCondition = (id: number) => {
	return http.delete(`v1/1.0.0/conditions-arrival/${id}`).json();
};
