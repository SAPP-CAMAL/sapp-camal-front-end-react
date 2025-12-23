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

export const getConditionTransportByCertificateId = async (certificateId: string): Promise<CreateOrUpdateHttpResponse<Partial<ConditionTransportResponse>>> => {
	try {
		return await http
			.get('v1/1.0.0/conditions-transport/by-certificate-id', {
				searchParams: { certificateId },
			})
			.json<CreateOrUpdateHttpResponse<Partial<ConditionTransportResponse>>>();
	} catch (error: unknown) {
		// Si la API devuelve 400 con "NOT FOUND", retornar objeto vacío
		if (error && typeof error === 'object' && 'response' in error) {
			const httpError = error as { response: Response };
			if (httpError.response?.status === 400) {
				return { data: {}, code: 200, message: 'No records found' };
			}
		}
		throw error;
	}
};

export const updateConditionTransport = (conditionId: string, request: ConditionTransportRequest) => {
	return http
		.patch('v1/1.0.0/conditions-transport/' + conditionId, {
			json: request,
		})
		.json<CreateOrUpdateHttpResponse<ConditionTransportResponse>>();
};
