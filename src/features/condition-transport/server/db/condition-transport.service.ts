import { http } from '@/lib/ky';
import { CreateOrUpdateHttpResponse } from '@/features/people/domain';
import { ConditionTransportRequest, ConditionTransportResponse } from '../../domain';

export const saveConditionTransport = (request: ConditionTransportRequest) => {
	return http
		.post('v1/1.0.0/conditions-transport', {
			json: request,
		})
		.json<CreateOrUpdateHttpResponse<ConditionTransportResponse>>();
};

export const updateConditionTransport = (conditionId: string, request: ConditionTransportRequest) => {
	return http
		.patch('v1/1.0.0/conditions-transport/' + conditionId, {
			json: request,
		})
		.json<CreateOrUpdateHttpResponse<ConditionTransportResponse>>();
};
