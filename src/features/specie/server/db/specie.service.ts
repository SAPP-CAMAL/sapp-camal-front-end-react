import { http } from '@/lib/ky';
import { Specie } from '@/features/specie/domain';
import { CommonHttpResponse } from '@/features/people/domain';

export const getAllSpecies = async () => {
	return http.get('v1/1.0.0/specie/all').json<CommonHttpResponse<Specie>>();
};
