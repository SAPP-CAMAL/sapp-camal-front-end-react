import { http } from '@/lib/ky';
import { Origin, ResponseOriginPaginated, SearchParamsOrigin } from '@/features/origin/domain';
import { CommonHttpResponse } from '@/features/people/domain';
import { ORIGIN_LIST_TAG } from '@/features/origin/constants';

export function getOriginsPaginatedService(searchParams: SearchParamsOrigin): Promise<ResponseOriginPaginated> {
	return http.get('v1/1.0.0/origin/list', { searchParams }).json();
}

export const getAllOrigins = async (): Promise<CommonHttpResponse<Origin>> => {
	try {
		return await http
			.get('v1/1.0.0/origin/all', {
				next: { tags: [ORIGIN_LIST_TAG] },
			})
			.json<CommonHttpResponse<Origin>>();
	} catch (error: unknown) {
		// Si hay error, retornar array vacío para evitar que la UI falle
		if (error && typeof error === 'object' && 'response' in error) {
			const httpError = error as { response: Response };
			if (httpError.response?.status === 400 || httpError.response?.status === 404) {
				return { data: [] as Origin[], code: 200, message: 'No records found' };
			}
		}
		throw error;
	}
};

export type CreateOriginBody = {
	description: string;
	status?: boolean;
};

export type UpdateOriginBody = Partial<CreateOriginBody>;

export function createOriginService(body: CreateOriginBody) {
	return http.post('v1/1.0.0/origin', { json: body }).json();
}

export function updateOriginService(id: number, body: UpdateOriginBody) {
	return http.patch(`v1/1.0.0/origin/${id}`, { json: body }).json();
}

export function deleteOriginService(id: number) {
	return http.delete(`v1/1.0.0/origin/${id}`);
}

export function deleteOriginPermanentlyService(id: number) {
	return http.delete(`v1/1.0.0/origin/${id}/permanent`);
}
