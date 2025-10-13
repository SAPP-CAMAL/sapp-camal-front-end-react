import { http } from '@/lib/ky';
import type { CreateOrUpdateHttpResponse } from '@/features/people/domain';
import { ALL_INTRODUCERS_PAGINATED } from '@/features/introducer/constant';
import { IntroducerByIDResponse, IntroducersPaginated, IntroducersPaginatedFilters } from '@/features/introducer/domain';

export const getIntroducersPaginated = (filters: IntroducersPaginatedFilters) => {
	return http
		.post('v1/1.0.0/introducers/search', {
			next: { tags: [ALL_INTRODUCERS_PAGINATED] },
			json: filters,
		})
		.json<IntroducersPaginated>();
};

export const getIntroducerById = (introducerId: string | number) => {
	return http
		.get('v1/1.0.0/introducers', {
			searchParams: { id: introducerId.toString() },
		})
		.json<CreateOrUpdateHttpResponse<IntroducerByIDResponse>>();
};

export const updateIntroducerStatus = (introducerId: string | number, status: boolean) => {
	return http.patch(`v1/1.0.0/introducers/update-status/${introducerId.toString()}/${status}`);
};
